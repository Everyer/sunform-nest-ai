import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const uuidv4 = generateUUID;

// Helper: upsert a record, returning its ID (reuses existing ID on re-run)
async function upsert(sequelize, table, lookupCol, lookupVal, insertCols, insertVals) {
  const [rows] = await sequelize.query(
    `SELECT id FROM ${table} WHERE ${lookupCol} = '${lookupVal}' LIMIT 1`
  );
  if (rows.length > 0) {
    await sequelize.query(
      `UPDATE ${table} SET ${insertCols.map((c, i) => `${c} = '${insertVals[i]}'`).join(', ')}, updatedAt = NOW() WHERE id = '${rows[0].id}'`
    );
    return rows[0].id;
  }
  const id = uuidv4();
  await sequelize.query(
    `INSERT INTO ${table} (id, ${lookupCol}, ${insertCols.join(', ')}, createdAt, updatedAt) VALUES ('${id}', '${lookupVal}', ${insertVals.map(v => `'${v}'`).join(', ')}, NOW(), NOW())`
  );
  return id;
}

async function initAdmin() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    logging: console.log,
  });

  try {
    console.log('🚀 开始初始化超级管理员数据...\n');

    // 1. 部门
    const deptId = await upsert(sequelize, 'departments', 'departmentName', '总公司',
      ['status', 'sort'], ['1', '0']);
    console.log('✅ 部门');

    // 2. 岗位
    const postId = await upsert(sequelize, 'posts', 'postCode', 'super_admin',
      ['postName', 'status', 'sort'], ['超级管理员', '1', '0']);
    console.log('✅ 岗位');

    // 3. 员工
    const staffId = await upsert(sequelize, 'staffs', 'staffCode', 'admin_001',
      ['deptId', 'postId', 'staffName', 'mobile', 'gender', 'idCard', 'status', 'sort'],
      [deptId, postId, '超级管理员', '13800138000', '1', '110101199001011234', '1', '0']);
    console.log('✅ 员工');

    // 4. 角色
    const roleId = await upsert(sequelize, 'roles', 'roleName', '超级管理员',
      ['roleKey', 'dataScope', 'status', 'sort'],
      ['["admin"]', '4', '1', '0']);
    console.log('✅ 角色');

    // 5. 菜单
    interface MenuDef { code: string; name: string; pidCode?: string; path: string; component: string | null; icon: string; sort: number; _id?: string }
    const menuDefs: MenuDef[] = [
      { code: 'system', name: '系统管理', path: '/system', component: null, icon: 'SettingsOutline', sort: 0 },
      { code: 'system:user', name: '用户管理', pidCode: 'system', path: '/system/user', component: 'system/user/index', icon: 'PeopleOutline', sort: 1 },
      { code: 'system:role', name: '角色管理', pidCode: 'system', path: '/system/role', component: 'system/role/index', icon: 'ShieldCheckmarkOutline', sort: 2 },
      { code: 'system:menu', name: '菜单管理', pidCode: 'system', path: '/system/menu', component: 'system/menu/index', icon: 'MenuOutline', sort: 3 },
      { code: 'system:dept', name: '部门管理', pidCode: 'system', path: '/system/department', component: 'system/department/index', icon: 'BusinessOutline', sort: 4 },
      { code: 'system:staff', name: '员工管理', pidCode: 'system', path: '/system/staff', component: 'system/staff/index', icon: 'PersonAddOutline', sort: 5 },
      { code: 'system:dict', name: '字典管理', pidCode: 'system', path: '/system/dict', component: 'system/dict/index', icon: 'BookOutline', sort: 6 },
      { code: 'system:post', name: '岗位管理', pidCode: 'system', path: '/system/post', component: 'system/post/index', icon: 'BadgeOutline', sort: 7 },
    ];

    // First pass: create all menus without pid (to avoid FK issues)
    for (const m of menuDefs) {
      const id = await upsert(sequelize, 'menus', 'code', m.code,
        ['name', 'isNav', 'type', 'icon', 'path', 'component', 'status', 'sort'],
        [m.name, '1', 'menu', m.icon, m.path, m.component || '', '1', String(m.sort)]);
      m._id = id;
      console.log('  ' + (m.pidCode ? '📄' : '📁') + ' ' + m.name + ' [' + m.code + ']');
    }

    // Second pass: set pid for child menus
    for (const m of menuDefs) {
      if (m.pidCode) {
        const parent = menuDefs.find(p => p.code === m.pidCode)!;
        await sequelize.query(`UPDATE menus SET pid = '${parent._id}' WHERE id = '${m._id}'`);
      }
    }
    console.log('✅ 菜单创建成功（共 ' + menuDefs.length + ' 条）');

    // 6. 角色-菜单关联
    for (const m of menuDefs) {
      await sequelize.query(`
        INSERT IGNORE INTO rolemenus (roleId, menuId, createdAt, updatedAt)
        VALUES ('${roleId}', '${m._id}', NOW(), NOW())
      `);
    }
    console.log('✅ 角色菜单关联');

    // 7. 用户
    const passwordMd5 = 'e10adc3949ba59abbe56e057f20f883e'; // 123456
    const userId = await upsert(sequelize, 'users', 'username', 'admin',
      ['password', 'staffId', 'deptId', 'status', 'sort'],
      [passwordMd5, staffId, deptId, '1', '0']);
    console.log('✅ 用户 (账号: admin, 密码: 123456)');

    // 8. 用户-角色关联
    await sequelize.query(`
      INSERT IGNORE INTO userroles (userId, roleId, createdAt, updatedAt)
      VALUES ('${userId}', '${roleId}', NOW(), NOW())
    `);
    console.log('✅ 用户角色关联');

    console.log('\n🎉 初始化完成！现在可以使用 admin / 123456 登录系统。');

    // Clean up duplicate roles (previous runs might have created extras)
    await sequelize.query(`
      DELETE r FROM roles r
      WHERE r.roleName = '超级管理员' AND r.id != '${roleId}'
    `);
    // Clean up duplicate user-role links
    await sequelize.query(`
      DELETE ur FROM userroles ur WHERE ur.userId = '${userId}' AND ur.roleId != '${roleId}'
    `);

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await sequelize.close();
  }
}

initAdmin();
