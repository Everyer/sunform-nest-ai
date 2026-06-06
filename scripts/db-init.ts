/**
 * 一键初始化数据库：
 *   1. DROP SCHEMA public CASCADE; CREATE SCHEMA public  → 干净环境
 *   2. CREATE EXTENSION IF NOT EXISTS vector            → pgvector 扩展
 *   3. Sequelize.sync()                                  → 按实体建表（实体即真相）
 *   4. 执行 db/seed.sql                                  → 写入超管 / 角色 / 菜单初始数据
 *
 * 默认账号：admin / 123456（生产环境请立即修改）
 *
 * 使用：
 *   npm run db:init
 */

// 必须最早：加载 .env
// override: true —— .env 永远压过 shell 里的同名变量，避免被外部 AI/Database key 污染
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

// 必须在加载任何 entity 之前注册 pgvector 类型
const SequelizeObj = require('sequelize');
const pgvector = require('pgvector/sequelize');
pgvector.registerTypes(SequelizeObj);

import { Sequelize, Model } from 'sequelize-typescript';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { sync as globSync } from 'glob';

const required = ['DATABASE_HOST', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'DATABASE_NAME'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`❌ 缺少必需的环境变量: ${missing.join(', ')}。请检查 .env 文件。`);
  process.exit(1);
}

async function resetSchema() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
  await client.connect();

  console.log('🗑️  DROP SCHEMA public CASCADE ...');
  await client.query(`
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO ${process.env.DATABASE_USERNAME};
    GRANT ALL ON SCHEMA public TO public;
    COMMENT ON SCHEMA public IS 'standard public schema';
  `);

  console.log('🧩 CREATE EXTENSION IF NOT EXISTS vector ...');
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  } catch (e: any) {
    console.error('⚠️  无法启用 pgvector 扩展，请先在数据库安装 pgvector：');
    console.error('    https://github.com/pgvector/pgvector#installation');
    console.error('    错误信息:', e.message);
    throw e;
  }

  await client.end();
}

function loadAllEntities(): any[] {
  const cwd = process.cwd();
  const files = globSync('src/**/*.entity.ts', { cwd, absolute: true });
  const models: any[] = [];

  for (const file of files) {
    // 跳过抽象基类（仅 src/common/base*.entity.ts，不能误伤 knowledge-base.entity.ts）
    if (/[\\/]common[\\/]base(\.hasuser)?\.entity\.ts$/.test(file)) continue;

    const mod = require(file);
    for (const key of Object.keys(mod)) {
      const exp = mod[key];
      if (
        typeof exp === 'function' &&
        exp.prototype instanceof Model &&
        exp !== Model
      ) {
        models.push(exp);
      }
    }
  }

  return models;
}

async function syncTables(models: any[]) {
  console.log(`📦 加载实体：${models.length} 个`);

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    models,
    logging: false,
    define: {
      underscored: false,
      freezeTableName: true,
    },
  });

  console.log('🔨 Sequelize.sync() 建表 ...');
  await sequelize.sync({ force: true });

  return sequelize;
}

async function runSeed(sequelize: Sequelize) {
  const seedPath = path.join(process.cwd(), 'db', 'seed.sql');
  if (!fs.existsSync(seedPath)) {
    console.error(`❌ 找不到种子文件：${seedPath}`);
    process.exit(1);
  }
  const sql = fs.readFileSync(seedPath, 'utf-8');
  console.log('🌱 执行 db/seed.sql ...');
  await sequelize.query(sql);
}

async function main() {
  console.log('🚀 开始初始化数据库\n');
  console.log(`   主机: ${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT || 5432}`);
  console.log(`   数据库: ${process.env.DATABASE_NAME}`);
  console.log(`   用户名: ${process.env.DATABASE_USERNAME}\n`);

  await resetSchema();
  const models = loadAllEntities();
  const sequelize = await syncTables(models);

  try {
    await runSeed(sequelize);
  } finally {
    await sequelize.close();
  }

  console.log('\n✅ 初始化完成！');
  console.log('   登录账号：admin');
  console.log('   登录密码：123456');
  console.log('   ⚠️  生产环境请立即修改密码！');
}

main().catch((err) => {
  console.error('\n❌ 初始化失败：', err);
  process.exit(1);
});
