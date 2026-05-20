import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL 数据库连接配置
const pgConfig = {
  host: process.env.DATABASE_HOST || '150.158.93.154',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '8uYabCRurjW2iXRH9IMZ',
  database: process.env.DATABASE_NAME || 'postgres',
};

// JSON 文件所在的源目录
const sourceDir = '/Volumes/杂七杂八/mysql 导出';

// 安全的日期解析器（能够识别 "14/5/2026 07:34:14" 或标准 ISO 日期）
function parseDateString(dateStr: any): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // 1. 尝试使用默认 JS 解析（例如 ISO 字符串）
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  
  // 2. 尝试手动解析 "D/M/YYYY H:m:s" 格式
  const parts = dateStr.trim().split(' ');
  const dateParts = parts[0].split('/');
  if (dateParts.length === 3) {
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // 月份从 0 开始
    const year = parseInt(dateParts[2], 10);
    
    let hour = 0, minute = 0, second = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(':');
      hour = parseInt(timeParts[0], 10) || 0;
      minute = parseInt(timeParts[1], 10) || 0;
      second = parseInt(timeParts[2], 10) || 0;
    }
    
    const d = new Date(year, month, day, hour, minute, second);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }
  
  return null;
}

// 智能的值类型安全转换器
function castValue(val: any, datatype: string): any {
  if (val === undefined || val === null) {
    return null;
  }

  // 1. 处理 PostgreSQL 的 BOOLEAN
  if (datatype === 'boolean') {
    if (val === 1 || val === '1' || val === true || val === 'true') return true;
    if (val === 0 || val === '0' || val === false || val === 'false') return false;
    return !!val;
  }

  // 2. 处理 PostgreSQL 的 JSONB/JSON
  if (datatype === 'jsonb' || datatype === 'json') {
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        return trimmed; // 已经是 JSON 格式的字符串，直接原样返回
      }
      return JSON.stringify(val); // 否则转换为 JSON 格式
    }
    return JSON.stringify(val); // 对象或数组等，统一序列化为 JSON 字符串
  }

  // 3. 处理 PostgreSQL 的 TIMESTAMP
  if (datatype.includes('timestamp') || datatype.includes('date')) {
    return parseDateString(val);
  }

  // 4. 处理整数/小整数类型
  if (datatype === 'integer' || datatype === 'smallint' || datatype === 'bigint') {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? null : parsed;
  }

  // 5. 其他类型（如 string, text, uuid）保持原样
  return val;
}

async function startMigration() {
  console.log('🚀 开始导入 MySQL JSON 数据至 PostgreSQL 数据库...');
  console.log(`📂 源目录: ${sourceDir}`);
  console.log(`🔗 目标数据库: ${pgConfig.host}:${pgConfig.port}/${pgConfig.database}`);

  const client = new Client(pgConfig);
  try {
    await client.connect();
    console.log('✅ 数据库连接成功！');

    // 1. 获取 PostgreSQL 当前所有的表和字段类型元数据
    const metaRes = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public';
    `);

    // 构建表元数据字典
    const schemaMeta: { [table: string]: { [col: string]: string } } = {};
    for (const row of metaRes.rows) {
      const table = row.table_name;
      const col = row.column_name;
      const type = row.data_type.toLowerCase();
      if (!schemaMeta[table]) {
        schemaMeta[table] = {};
      }
      schemaMeta[table][col] = type;
    }

    // 2. 读取源目录下的所有 .json 文件
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`找不到源文件目录: ${sourceDir}`);
    }

    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));
    
    // 定义推荐的导入顺序，确保主表数据在外键表之前导入
    const importOrder = [
      'departments', 'dicts', 'menus', 'posts', 'roles', 'users',
      'flow_templates', 'flow_form_defs', 'flow_form_fields',
      'flow_template_nodes', 'flow_template_edges', 'flow_node_permissions',
      'flow_instances', 'flow_instance_nodes', 'flow_instance_data',
      'roledepartments', 'rolemenus', 'userroles', 'staffs',
      'usersurveys', 'onboardings'
    ];

    const sortedFiles = files.sort((a, b) => {
      const nameA = path.basename(a, '.json');
      const nameB = path.basename(b, '.json');
      let idxA = importOrder.indexOf(nameA);
      let idxB = importOrder.indexOf(nameB);
      if (idxA === -1) idxA = 999;
      if (idxB === -1) idxB = 999;
      return idxA - idxB;
    });

    console.log(`📂 找到 ${sortedFiles.length} 个 JSON 导出文件，已按依赖关系排序，准备迁移...\n`);

    // 3. 按表逐个导入数据
    for (const file of sortedFiles) {
      const tableName = path.basename(file, '.json');
      const filePath = path.join(sourceDir, file);

      // 验证 PostgreSQL 中是否有对应的表
      if (!schemaMeta[tableName]) {
        console.warn(`⚠️  PG 数据库中未找到同名表 "${tableName}"，已跳过文件: ${file}`);
        continue;
      }

      // 读取文件内容并解析为行数据
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const rows = JSON.parse(fileContent);

      if (!Array.isArray(rows) || rows.length === 0) {
        console.log(`ℹ️  表 "${tableName}" 无数据，跳过导入`);
        continue;
      }

      console.log(`⏳ 正在导入表 "${tableName}" (${rows.length} 条记录)...`);

      // 4. 禁用触发器和外键约束，防止插入冲突或顺序报错
      await client.query(`ALTER TABLE "${tableName}" DISABLE TRIGGER ALL;`);

      // 清空可能残留的老测试数据以防止主键/唯一索引冲突
      await client.query(`DELETE FROM "${tableName}";`);

      try {
        const tableCols = schemaMeta[tableName];
        
        for (const rowObj of rows) {
          // 过滤掉 JSON 中存在但 PG 表字段中没有的多余字段，防止插入报错
          const validKeys = Object.keys(rowObj).filter(key => tableCols[key] !== undefined);
          const columnsList = validKeys.map(k => `"${k}"`).join(', ');
          const valuesList = validKeys.map((_, idx) => `$${idx + 1}`).join(', ');

          const queryText = `INSERT INTO "${tableName}" (${columnsList}) VALUES (${valuesList})`;
          const queryParams = validKeys.map(k => {
            const val = rowObj[k];
            const type = tableCols[k];
            return castValue(val, type);
          });

          await client.query(queryText, queryParams);
        }

        console.log(`   🎉 表 "${tableName}" 成功导入 ${rows.length} 条记录！`);
      } catch (err: any) {
        console.error(`❌ 导入表 "${tableName}" 时发生错误:`, err.message);
      } finally {
        // 5. 重新启用触发器和约束
        await client.query(`ALTER TABLE "${tableName}" ENABLE TRIGGER ALL;`);
      }
    }

    console.log('\n🌟 所有数据表均已同步导入完成！数据完美迁移成功！');

  } catch (err: any) {
    console.error('❌ 数据导入脚本执行异常:', err);
  } finally {
    await client.end();
    console.log('👋 优雅关闭数据库连接。');
  }
}

startMigration();
