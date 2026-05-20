<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🚀 企业级 RBAC 后台基础框架 (NestJS + Vue3 + Naive UI)

本项目是一个基于 **NestJS** + **Vue3** 构建的现代化、高效且可扩展的企业级后台管理系统。系统内置了完整的 RBAC（基于角色的访问控制）权限管理体系，并集成了 JWT 认证、Swagger/Knife4j 接口文档、Redis 缓存、动态菜单路由等核心功能。

## 📁 项目结构

```
nest-test/
├── src/                          # 后端 NestJS 源码
│   ├── common/                   # 公共基类（BaseEntity, BaseDto, 拦截器, 过滤器）
│   ├── system/                   # 系统核心层（RBAC）
│   │   ├── auth/                 #   权限认证 (JWT 登录/鉴权)
│   │   ├── user/                 #   用户管理
│   │   ├── role/                 #   角色管理（角色-菜单-部门关联）
│   │   ├── menu/                 #   菜单管理（树形结构，支持菜单/按钮类型）
│   │   ├── department/           #   部门管理（树形组织架构）
│   │   ├── post/                 #   岗位管理
│   │   ├── staff/                #   员工管理
│   │   └── dict/                 #   字典管理（动态配置）
│   ├── modules/                  # 业务拓展层
│   │   ├── ai/                   #   AI 聊天 (SiliconFlow/Coze)
│   │   ├── lowcode/              #   低代码平台 (项目/页面/组件管理)
│   │   ├── wechat/               #   微信公众号集成
│   │   ├── onboarding/           #   入职管理
│   │   └── user-survey/          #   用户问卷调研
│   └── util/                     # 工具模块
├── scripts/                      # 脚本
│   ├── init-admin.ts            # 初始化超级管理员数据
│   └── sync-db.ts               # 数据库迁移脚本
├── public/                       # 静态资源
├── front_end/                    # 前端 Vue3 项目
│   └── src/
│       ├── api/                  #   API 接口层（axios 封装）
│       ├── components/           #   公共组件（SyTable/SyForm/SyCard）
│       ├── layout/               #   布局组件（侧边栏/顶栏/标签页）
│       ├── router/               #   路由配置（守卫/动态路由）
│       ├── store/                #   Pinia 状态管理
│       ├── utils/                #   工具函数
│       └── views/                #   页面
│           ├── login/            #     登录页
│           ├── dashboard/        #     工作台
│           ├── system/           #     系统管理页面
│           │   ├── user/         #       用户管理
│           │   ├── role/         #       角色管理
│           │   ├── menu/         #       菜单管理
│           │   ├── department/   #       部门管理
│           │   ├── staff/        #       员工管理
│           │   └── dict/         #       字典管理
│           └── error/            #     404页面
├── .env                          # 环境变量
└── package.json
```

## 🛠 核心技术栈

### 后端
| 技术 | 说明 |
|------|------|
| **NestJS 11** | Node.js 企业级框架 |
| **TypeScript** | 类型安全的开发语言 |
| **Sequelize + MySQL** | ORM + 关系型数据库 |
| **Redis** | 缓存（cache-manager-redis-store） |
| **JWT + Passport** | 身份认证与鉴权 |
| **Swagger + Knife4j** | API 文档自动生成 |

### 前端
| 技术 | 说明 |
|------|------|
| **Vue 3** | Composition API |
| **Naive UI** | 现代化 Vue3 组件库 |
| **Pinia** | 状态管理 |
| **Vue Router 4** | 路由管理（动态路由） |
| **Axios** | HTTP 请求库 |
| **Tailwind CSS** | 原子化 CSS 框架 |
| **Ionicons5** | 图标库 |

## 🚀 快速开始

### 1. 环境准备
- Node.js >= 18
- MySQL >= 8.0
- Redis

### 2. 项目配置
```bash
cp .env.example .env
```
编辑 `.env` 文件，配置数据库、Redis、JWT 密钥等：
```env
PORT=9528
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=sunyan_nest
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### 3. 安装依赖 & 初始化
```bash
# 后端
npm install

# 前端
cd front_end && npm install && cd ..
```

### 4. 初始化数据库
首次使用时，需要同步表结构并创建超级管理员：
```bash
# 方式一：设置 DB_SYNC=true 启动项目自动同步
DB_SYNC=true npm run start:dev

# 方式二：运行同步脚本
npm run sync:db
```

### 5. 初始化管理员账号
```bash
npx ts-node scripts/init-admin.ts
```
初始化后默认账号：**admin / 123456**

### 6. 启动项目
```bash
# 启动后端 (端口 9528)
npm run start:dev

# 启动前端 (端口 3000)
cd front_end && npm run dev
```

### 7. 访问系统
- **前端页面**：http://localhost:3000
- **API 文档 (Knife4j)**：http://localhost:9528/doc.html
- **Swagger JSON**：http://localhost:9528/api-json

## 📖 权限体系说明

### 数据模型关系
```
User ──(UserRole)──> Role ──(RoleMenu)──> Menu
                    Role ──(RoleDepartment)──> Department
```

### 权限控制流程
1. 用户登录 → JWT Token 签发（含用户完整信息 + 角色）
2. 前端调用 `/adminApi/menu/findTree` 获取完整菜单树
3. 前端根据用户角色拥有的菜单权限过滤菜单树
4. 过滤后的菜单通过 `router.addRoute()` 动态注册为路由
5. 按钮/组件级权限通过菜单 type=comp 控制

### 数据权限范围
角色支持 5 级数据权限：
| 值 | 说明 |
|----|------|
| 0 | 本人数据 |
| 1 | 本部门及以下 |
| 2 | 本部门 |
| 3 | 自定义部门 |
| 4 | 全部数据 |

## 📡 API 接口总览

所有接口统一前缀：`/adminApi`

**请求方式**：所有业务接口均为 **POST** 请求

**响应格式**：
```json
{
  "code": 200,
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

### 系统管理接口

| 模块 | 接口路径 | 说明 |
|------|----------|------|
| 认证 | `POST /auth/login` | 用户登录（无需Token） |
| 用户 | `POST /user/create, update, page, detail, delete, list` | CRUD |
| 角色 | `POST /role/create, update, page, detail, delete, list` | CRUD + 菜单/部门关联 |
| 菜单 | `POST /menu/create, update, page, detail, delete, list, findTree` | CRUD + 树查询 |
| 部门 | `POST /department/create, update, page, detail, delete, list, findTree` | CRUD + 树查询 |
| 员工 | `POST /staff/create, update, page, detail, delete, list` | CRUD |
| 岗位 | `POST /post/create, update, page, detail, delete, list` | CRUD |
| 字典 | `POST /dict/create, update, page, detail, delete, list, findTree` | CRUD + 树查询 |

### 业务模块接口

| 模块 | 接口路径 | 说明 |
|------|----------|------|
| 入职管理 | `POST /onboarding/create, update, page, detail, delete, list` | CRUD |
| 问卷调研 | `POST /userSurvey/create, update, page, detail, delete, list` | CRUD |
| AI聊天 | `POST /ai/stream, completions` / `GET /ai/models, rules` | AI 对话 |
| 微信公众号 | `POST /wechat/*` | 微信集成 |
| 低代码 | `POST /project/*, /page/*, /component/*, /config/*` | 低代码平台 |

## 🔧 常用命令

```bash
# 后端
npm run start:dev          # 开发模式启动
npm run build              # 构建生产版本
npm run start:prod         # 生产模式启动
npm run lint               # ESLint 检查
npm run test               # 运行测试

# 前端
cd front_end
npm run dev                # 开发服务器
npm run build              # 生产构建
npm run preview            # 预览构建结果
```

## 📄 许可证

本项目采用 [MIT License](LICENSE)。
