-- ============================================================================
-- sunform-nest-ai 初始化种子数据
--
-- 前置条件：表结构已由 Sequelize sync({ force: true }) 创建（实体即真相）。
-- 本文件只负责写入初始数据：
--   - 1 个部门 "总公司"
--   - 1 个岗位 "超级管理员"
--   - 1 个员工 admin_001
--   - 1 个用户 admin / 123456（MD5 哈希）
--   - 1 个角色 "超级管理员"（dataScope=4，全部数据）
--   - 18 条菜单：4 个父级 + 14 个叶子（系统 7 + 工作流 3 + 知识库 2 + 打印 2）
--   - 14 个叶子菜单全部挂到超管角色上（4 个父级仅作分组容器）
--   - 角色-菜单 / 用户-角色关联
--
-- 全部使用固定 UUID，保证外键一致 & 多次执行幂等（通过 db-init.ts 的 force sync）。
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. 部门 departments
-- ---------------------------------------------------------------------------
INSERT INTO departments (id, pid, "departmentName", leader, status, sort, remark, "createdAt", "updatedAt")
VALUES ('11111111-1111-4111-8111-111111111111', NULL, '总公司', 'admin', TRUE, 0, '系统初始化部门', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 2. 岗位 posts
-- ---------------------------------------------------------------------------
INSERT INTO posts (id, "postName", "postCode", sort, status, remark, "createdAt", "updatedAt")
VALUES ('22222222-2222-4222-8222-222222222222', '超级管理员', 'super_admin', 0, TRUE, '系统初始化岗位', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 3. 员工 staffs
-- ---------------------------------------------------------------------------
INSERT INTO staffs (id, "deptId", "postId", "staffName", "staffCode", mobile, gender, email, "idCard", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '超级管理员',
  'admin_001',
  '13800138000',
  '1',
  'admin@example.com',
  '110101199001011234',
  TRUE,
  0,
  '系统初始化员工',
  NOW(),
  NOW()
);

-- ---------------------------------------------------------------------------
-- 4. 角色 roles
--   dataScope：0=本人 1=本部门及以下 2=本部门 3=自定义 4=全部
-- ---------------------------------------------------------------------------
INSERT INTO roles (id, "roleName", "roleKey", "dataScope", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '44444444-4444-4444-8444-444444444444',
  '超级管理员',
  '["admin"]'::jsonb,
  '4',
  TRUE,
  0,
  '系统内置超管角色，拥有全部数据权限',
  NOW(),
  NOW()
);

-- ---------------------------------------------------------------------------
-- 5. 菜单 menus
--   先插入父级，再插入子级（pid 引用父级 id）
--   顶级菜单 sort: 0=系统管理 1=工作流 2=知识库 3=打印
-- ---------------------------------------------------------------------------

-- 5.1 一级菜单：系统管理
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '55555555-0000-4000-8000-000000000001',
  NULL,
  '系统管理',
  'system',
  TRUE,
  'menu',
  'SettingsOutline',
  '/system',
  NULL,
  NULL,
  TRUE,
  0,
  NULL,
  NOW(),
  NOW()
);

-- 5.2 系统管理子菜单
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES
  ('55555555-0000-4000-8000-000000000002', '55555555-0000-4000-8000-000000000001', '用户管理', 'system:user', TRUE, 'menu', 'PeopleOutline',         '/system/user',       'system/user/index',       NULL, TRUE, 1, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000003', '55555555-0000-4000-8000-000000000001', '角色管理', 'system:role', TRUE, 'menu', 'ShieldCheckmarkOutline','/system/role',       'system/role/index',       NULL, TRUE, 2, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000004', '55555555-0000-4000-8000-000000000001', '菜单管理', 'system:menu', TRUE, 'menu', 'MenuOutline',           '/system/menu',       'system/menu/index',       NULL, TRUE, 3, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000005', '55555555-0000-4000-8000-000000000001', '部门管理', 'system:dept', TRUE, 'menu', 'BusinessOutline',       '/system/department', 'system/department/index', NULL, TRUE, 4, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000006', '55555555-0000-4000-8000-000000000001', '员工管理', 'system:staff',TRUE, 'menu', 'PersonAddOutline',      '/system/staff',      'system/staff/index',      NULL, TRUE, 5, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000007', '55555555-0000-4000-8000-000000000001', '字典管理', 'system:dict', TRUE, 'menu', 'BookOutline',           '/system/dict',       'system/dict/index',       NULL, TRUE, 6, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000008', '55555555-0000-4000-8000-000000000001', '岗位管理', 'system:post', TRUE, 'menu', 'BadgeOutline',          '/system/post',       'system/post/index',       NULL, TRUE, 7, NULL, NOW(), NOW());

-- 5.3 一级菜单：工作流
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '55555555-0000-4000-8000-000000000010',
  NULL,
  '工作流',
  'workflow',
  TRUE,
  'menu',
  'GitNetworkOutline',
  '/workflow',
  NULL,
  NULL,
  TRUE,
  1,
  NULL,
  NOW(),
  NOW()
);

-- 5.4 工作流子菜单
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES
  ('55555555-0000-4000-8000-000000000011', '55555555-0000-4000-8000-000000000010', '流程模板', 'workflow:template',  TRUE, 'menu', 'DocumentTextOutline', '/workflow/template',  'workflow/template/index',  NULL, TRUE, 1, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000012', '55555555-0000-4000-8000-000000000010', '我的流程', 'workflow:instance',  TRUE, 'menu', 'PlayOutline',         '/workflow/instance',  'workflow/instance/index',  NULL, TRUE, 2, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000013', '55555555-0000-4000-8000-000000000010', '待办任务', 'workflow:task',      TRUE, 'menu', 'CheckboxOutline',     '/workflow/task',      'workflow/task/index',      NULL, TRUE, 3, NULL, NOW(), NOW());

-- 5.5 一级菜单：知识库
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '55555555-0000-4000-8000-000000000020',
  NULL,
  '知识库',
  'knowledge',
  TRUE,
  'menu',
  'BookmarksOutline',
  '/knowledge',
  NULL,
  NULL,
  TRUE,
  2,
  NULL,
  NOW(),
  NOW()
);

-- 5.6 知识库子菜单
--   - knowledge:base  → 知识库中心（list 视图，点进去弹 modal 看某 base 的文档）
--   - knowledge:documents → 独立"文档管理"页（看所有 base 下的所有文档，含 baseName 字段，支持搜索/删除）
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES
  ('55555555-0000-4000-8000-000000000021', '55555555-0000-4000-8000-000000000020', '知识库管理', 'knowledge:base',      TRUE, 'menu', 'LibraryOutline',   '/knowledge',           'modules/knowledge/index',       NULL, TRUE, 1, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000022', '55555555-0000-4000-8000-000000000020', '文档管理',   'knowledge:documents', TRUE, 'menu', 'DocumentsOutline', '/knowledge/documents', 'modules/knowledge/documents-list', NULL, TRUE, 2, NULL, NOW(), NOW());

-- 5.7 一级菜单：打印
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '55555555-0000-4000-8000-000000000030',
  NULL,
  '打印',
  'print',
  TRUE,
  'menu',
  'PrintOutline',
  '/print',
  NULL,
  NULL,
  TRUE,
  3,
  NULL,
  NOW(),
  NOW()
);

-- 5.8 打印子菜单
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES
  ('55555555-0000-4000-8000-000000000031', '55555555-0000-4000-8000-000000000030', '打印模板', 'print:list',    TRUE, 'menu', 'PrintOutline',     '/print/list',    'print/list',    NULL, TRUE, 1, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000032', '55555555-0000-4000-8000-000000000030', '设计器',   'print:designer',TRUE, 'menu', 'ConstructOutline', '/print/designer','print/index',   NULL, TRUE, 2, NULL, NOW(), NOW());

-- 5.9 一级菜单：在线 Office
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES (
  '55555555-0000-4000-8000-000000000040',
  NULL,
  '在线 Office',
  'office',
  TRUE,
  'menu',
  'DocumentTextOutline',
  '/office',
  NULL,
  NULL,
  TRUE,
  4,
  '常规文档在线预览与协作',
  NOW(),
  NOW()
);

-- 5.10 在线 Office 子菜单
INSERT INTO menus (id, pid, name, code, "isNav", type, icon, path, component, "lowCodeCode", status, sort, remark, "createdAt", "updatedAt")
VALUES
  ('55555555-0000-4000-8000-000000000041', '55555555-0000-4000-8000-000000000040', '在线 Excel', 'office:excel', TRUE, 'menu', 'GridOutline', '/office/excel', 'excel/index', NULL, TRUE, 1, NULL, NOW(), NOW()),
  ('55555555-0000-4000-8000-000000000042', '55555555-0000-4000-8000-000000000040', '常规文档预览', 'office:preview', TRUE, 'menu', 'EyeOutline', '/office/preview', 'office/preview', NULL, TRUE, 2, NULL, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- 6. 角色-菜单关联 rolemenus
--   把超管角色和所有叶子菜单关联起来
-- ---------------------------------------------------------------------------
INSERT INTO rolemenus ("roleId", "menuId", "createdAt", "updatedAt")
SELECT '44444444-4444-4444-8444-444444444444', id, NOW(), NOW()
FROM menus
WHERE code LIKE 'system%' OR code LIKE 'workflow%' OR code LIKE 'knowledge%' OR code LIKE 'print%' OR code LIKE 'office%';

-- ---------------------------------------------------------------------------
-- 7. 用户 users
--   密码：123456 → MD5 → e10adc3949ba59abbe56e057f20f883e
-- ---------------------------------------------------------------------------
INSERT INTO users (id, username, password, "staffId", "deptId", "dataScope", sort, status, remark, "createdAt", "updatedAt")
VALUES (
  '66666666-6666-4666-8666-666666666666',
  'admin',
  'e10adc3949ba59abbe56e057f20f883e',
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  '4',
  0,
  TRUE,
  '系统内置超管账号',
  NOW(),
  NOW()
);

-- ---------------------------------------------------------------------------
-- 8. 用户-角色关联 userroles
-- ---------------------------------------------------------------------------
INSERT INTO userroles ("userId", "roleId", "createdAt", "updatedAt")
VALUES (
  '66666666-6666-4666-8666-666666666666',
  '44444444-4444-4444-8444-444444444444',
  NOW(),
  NOW()
);

-- ---------------------------------------------------------------------------
-- 9. 测试员 A & B（默认测试账号,用于 IM 端到端联调）
--   - 账号: testa / testb
--   - 密码: 123456（MD5 同 admin）
--   - 复用现成的"总公司"部门、"超级管理员"岗位、"超级管理员"角色
--   - UUID：
--     - 测试员 A: 员工 3333…3335 / 用户 6666…6668
--     - 测试员 B: 员工 3333…3334 / 用户 6666…6667
-- ---------------------------------------------------------------------------

-- 9.1 员工 测试员A 与 测试员B
INSERT INTO staffs (id, "deptId", "postId", "staffName", "staffCode", mobile, gender, email, "idCard", status, sort, remark, "createdAt", "updatedAt")
VALUES 
(
  '33333333-3333-4333-8333-333333333335',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '测试员A',
  'tester_a',
  '13800138001',
  '1',
  'testa@example.com',
  '110101199001011235',
  TRUE,
  1,
  'IM 端到端联调默认测试账号A',
  NOW(),
  NOW()
),
(
  '33333333-3333-4333-8333-333333333334',
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '测试员B',
  'tester_b',
  '13800138002',
  '1',
  'testb@example.com',
  '110101199001011236',
  TRUE,
  2,
  'IM 端到端联调默认测试账号B',
  NOW(),
  NOW()
);

-- 9.2 用户 testa 与 testb
INSERT INTO users (id, username, password, "staffId", "deptId", "dataScope", sort, status, remark, "createdAt", "updatedAt")
VALUES 
(
  '66666666-6666-4666-8666-666666666668',
  'testa',
  'e10adc3949ba59abbe56e057f20f883e',
  '33333333-3333-4333-8333-333333333335',
  '11111111-1111-4111-8111-111111111111',
  '4',
  1,
  TRUE,
  'IM 端到端联调默认测试账号A（与 admin 同权限）',
  NOW(),
  NOW()
),
(
  '66666666-6666-4666-8666-666666666667',
  'testb',
  'e10adc3949ba59abbe56e057f20f883e',
  '33333333-3333-4333-8333-333333333334',
  '11111111-1111-4111-8111-111111111111',
  '4',
  2,
  TRUE,
  'IM 端到端联调默认测试账号B（与 admin 同权限）',
  NOW(),
  NOW()
);

-- 9.3 用户-角色关联
INSERT INTO userroles ("userId", "roleId", "createdAt", "updatedAt")
VALUES 
(
  '66666666-6666-4666-8666-666666666668',
  '44444444-4444-4444-8444-444444444444',
  NOW(),
  NOW()
),
(
  '66666666-6666-4666-8666-666666666667',
  '44444444-4444-4444-8444-444444444444',
  NOW(),
  NOW()
);

-- ============================================================================
-- 完成。访问前端登录页，使用：
--   账号：admin / 123456    （系统内置超管）
--   账号：testa / 123456    （IM 联调账号A）
--   账号：testb / 123456    （IM 联调账号B）
-- 生产环境请立即修改密码！
-- ============================================================================
