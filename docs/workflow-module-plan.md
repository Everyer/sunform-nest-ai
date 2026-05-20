# 流程模块架构设计

## 一、概述

在现有 NestJS + Vue3 后台管理系统基础上，新增**流程引擎模块**。复用现有组织架构（用户/角色/部门）、低代码设计器（Sunform）的表单能力，实现业务流程的定义、审批、追踪。

### 核心原则

- **表单与流程解耦**：表单由 Sunform 设计器生成，流程负责流转和权限控制
- **一张实例表**：不按表单类型建实体表，采用 JSON 列存储业务数据
- **节点字段权限可配置**：每个审批节点独立控制字段的可编辑/只读/隐藏
- **AI 辅助**：AI 辅助生成流程定义、字段权限配置，不替代核心架构

---

## 二、技术选型

### 后端

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | NestJS | 已有 |
| ORM | Sequelize + MySQL | 已有 |
| 缓存 | Redis (cache-manager) | 已有 |
| 流程定义格式 | 自研 JSON 结构 | 不引入 BPMN 引擎，现阶段不需要 |

### 前端

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | Vue 3 + Naive UI | 已有 |
| 组件库 | Naive UI 2.x | 已有 |
| 状态管理 | Pinia | 已有 |
| **流程图渲染** | **@vue-flow/core** | 基于 React Flow 的 Vue 3 移植，API 成熟，样式美观 |
| 图标 | @vicons/ionicons5 | 已有 |
| 样式 | TailwindCSS 4.x | 已有 |

#### 为什么选 @vue-flow/core

| 候选方案 | 问题 |
|---|---|
| bpmn-js | 太重，500KB+，BPMN 2.0 规范约束太大，定制样式困难 |
| logicflow | 国内场景多但文档质量一般，社区活跃度下降 |
| **@vue-flow/core** | 轻量(80KB)，TS 友好，节点/边/连接点完全可定制，动画流畅，文档好 |

---

## 三、数据库设计

### 3.1 表结构总览

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  flow_templates         流程模板（定义流程结构）                    │
│  flow_template_nodes    模板节点（审批节点、条件分支等）             │
│  flow_template_edges    模板连线（节点之间的连线）                   │
│                                                                  │
│  flow_form_defs         表单定义（关联 Sunform 页面 + 字段配置）      │
│  flow_form_fields       表单字段配置                               │
│                                                                  │
│  flow_instances         流程实例（运行时）                          │
│  flow_instance_nodes    实例节点（当前状态、处理人、审批意见）         │
│  flow_instance_data     实例表单数据（JSON）                        │
│                                                                  │
│  flow_node_permissions  节点字段权限配置                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.2 详细表结构

#### flow_templates — 流程模板

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| name | VARCHAR(100) | 流程名称，如"请假审批" |
| code | VARCHAR(50) UNIQUE | 流程编码，如"leave_approval" |
| category | VARCHAR(50) | 分类：行政/财务/人事/其他 |
| description | TEXT | 流程说明 |
| form_def_id | UUID FK | 关联的表单定义 |
| status | TINYINT | 0=草稿 1=已发布 2=已停用 |
| version | INT DEFAULT 1 | 版本号 |
| config | JSON | 扩展配置（超时自动处理、催办规则等） |
| created_by | VARCHAR(50) | 创建人 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### flow_template_nodes — 模板节点

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| template_id | UUID FK | 所属模板 |
| name | VARCHAR(100) | 节点名称，如"主管审批" |
| type | VARCHAR(30) | 节点类型：start/approve/condition/end |
| assignee_type | VARCHAR(30) | 审批人类型：指定人/指定角色/发起人上级/自定义 |
| assignee_value | JSON | 审批人配置值 |
| position_x | FLOAT | 画布 X 坐标 |
| position_y | FLOAT | 画布 Y 坐标 |
| config | JSON | 节点配置（多人审批时：会签/或签、超时时间等） |
| order | INT | 排序 |

**节点类型枚举：**
```
start      — 发起节点（申请人填写表单）
approve    — 审批节点
condition  — 条件分支（金额 > 5000 走总监审批，否则走主管审批）
end        — 结束节点
```

**审批人类型枚举：**
```
specified_user    — 指定人（如：张三）
specified_role    — 指定角色（如：部门经理角色）
superior          — 发起人的直属上级
superior_level    — 发起人的第N级上级
custom            — 自定义（动态脚本）
```

#### flow_template_edges — 模板连线

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| template_id | UUID FK | 所属模板 |
| source_node_id | UUID FK | 起始节点 |
| target_node_id | UUID FK | 目标节点 |
| label | VARCHAR(50) | 连线标签，如"同意"/"驳回" |
| condition | JSON | 条件表达式（仅条件节点的出线） |
| order | INT | 排序 |

#### flow_form_defs — 表单定义

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| name | VARCHAR(100) | 表单名称，如"请假单" |
| code | VARCHAR(50) UNIQUE | 表单编码 |
| sunform_page_id | VARCHAR(50) | 关联的 Sunform 设计器页面 ID |
| description | TEXT | 表单描述 |
| config | JSON | 表单扩展配置（提交后回调、数据校验规则等） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

> Sunform 设计器生成的页面本身已包含完整组件树和样式。flow_form_defs 只记录"这个流程用哪个页面"，不重复存表单结构。

#### flow_form_fields — 表单字段配置

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| form_def_id | UUID FK | 所属表单定义 |
| field_key | VARCHAR(50) | 字段标识，对应 Sunform 组件 field |
| field_label | VARCHAR(100) | 字段显示名 |
| field_type | VARCHAR(30) | 字段类型：input/select/date/textarea/upload 等 |
| options | JSON | 选项（select/radio 等使用） |
| default_value | JSON | 默认值 |
| required | TINYINT(1) | 是否必填 |
| sort_order | INT | 排序 |

> 这张表的作用：提取出"表单有哪些字段"，方便流程节点配权限（勾选字段、设只读/可编辑）。字段数据从 Sunform 页面组件树中自动解析，也可手动维护。

#### flow_instances — 流程实例

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| template_id | UUID FK | 流程模板 |
| template_version | INT | 发起时的模板版本号 |
| form_def_id | UUID FK | 表单定义 |
| title | VARCHAR(200) | 实例标题，如"张三的请假申请-20260115" |
| status | VARCHAR(20) | 状态：draft/running/approved/rejected/cancelled |
| initiator | VARCHAR(50) | 发起人 username |
| initiator_dept | VARCHAR(50) | 发起人部门 |
| current_node_ids | JSON | 当前活跃节点 ID 数组（支持并行审批） |
| priority | TINYINT DEFAULT 0 | 优先级：0=普通 1=紧急 2=特急 |
| due_date | DATETIME | 截止日期 |
| finished_at | DATETIME | 完成时间 |
| created_at | DATETIME | 发起时间 |
| updated_at | DATETIME | 更新时间 |

#### flow_instance_nodes — 实例节点

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| instance_id | UUID FK | 流程实例 |
| template_node_id | UUID FK | 对应模板节点 |
| node_name | VARCHAR(100) | 节点名称（快照） |
| node_type | VARCHAR(30) | 节点类型（快照） |
| status | VARCHAR(20) | 状态：pending/processing/approved/rejected/transferred/cancelled |
| assignee | VARCHAR(50) | 审批人 username |
| assignee_name | VARCHAR(50) | 审批人姓名 |
| comment | TEXT | 审批意见 |
| attachments | JSON | 附件列表 |
| started_at | DATETIME | 开始处理时间 |
| finished_at | DATETIME | 处理完成时间 |
| duration_seconds | INT | 处理耗时（秒） |
| created_at | DATETIME | 创建时间 |

#### flow_instance_data — 实例表单数据

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| instance_id | UUID FK | 流程实例（唯一） |
| node_id | UUID FK | 流程节点（每节点一条记录，可追踪数据变更历史） |
| data | JSON | 表单字段值 `{"leaveType":"年假","days":3,...}` |
| data_version | INT | 数据版本号 |
| created_at | DATETIME | 提交时间 |

> 每个节点完成时写入一条记录。可以追溯"主管审批时数据是什么样的"、"HR确认时改了什么"。

#### flow_node_permissions — 节点字段权限

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | 主键 |
| template_id | UUID FK | 流程模板 |
| node_id | UUID FK | 模板节点 |
| field_key | VARCHAR(50) | 字段标识 |
| permission | VARCHAR(20) | 权限：editable / readonly / hidden |
| created_at | DATETIME | 创建时间 |

### 3.3 数据流示意

```
1. 创建模板
   配置流程 → 绑定表单 → 配置节点字段权限
          ↓
2. 发起流程
   用户填写表单 → 创建 instance + instance_data → 进入第一个审批节点
          ↓
3. 审批流转
   审批人打开 → 根据 node_permissions 控制字段状态
            → 填写审批意见 → 提交
            → 写入 instance_data（新版本）
            → 更新 instance_node 状态
            → 推进到下一节点（或结束）
```

---

## 四、模块结构

### 4.1 后端

```
src/modules/workflow/
├── workflow.module.ts              # 模块注册
│
├── controllers/
│   ├── template.controller.ts      # 流程模板 CRUD + 发布/停用
│   ├── form-def.controller.ts      # 表单定义 CRUD
│   ├── instance.controller.ts      # 流程实例：发起/审批/撤回/催办
│   └── task.controller.ts          # 待办/已办/抄送
│
├── services/
│   ├── template.service.ts         # 模板管理
│   ├── form-def.service.ts         # 表单定义管理
│   ├── instance.service.ts         # 实例创建与流转核心逻辑
│   ├── task.service.ts             # 待办已办查询
│   └── node-executor.service.ts    # 节点执行器（审批人解析、条件判断）
│
├── dto/
│   ├── create-template.dto.ts
│   ├── create-form-def.dto.ts
│   ├── start-instance.dto.ts       # 发起流程 DTO
│   ├── approve-task.dto.ts         # 审批操作 DTO
│   └── ...
│
├── entities/
│   ├── flow-template.entity.ts
│   ├── flow-template-node.entity.ts
│   ├── flow-template-edge.entity.ts
│   ├── flow-form-def.entity.ts
│   ├── flow-form-field.entity.ts
│   ├── flow-instance.entity.ts
│   ├── flow-instance-node.entity.ts
│   ├── flow-instance-data.entity.ts
│   └── flow-node-permission.entity.ts
│
└── constants/
    └── workflow.constants.ts       # 枚举、状态机定义
```

### 4.2 前端

```
front_end/src/
├── views/workflow/
│   ├── template/                   # 流程模板管理
│   │   ├── index.vue              # 模板列表
│   │   └── editor.vue             # 模板编辑器（核心：流程图画布）
│   │
│   ├── form-def/                   # 表单定义
│   │   └── index.vue              # 表单列表 + 字段配置
│   │
│   ├── instance/                   # 流程实例
│   │   ├── index.vue              # 我发起的
│   │   └── detail.vue             # 实例详情（流程图 + 审批记录 + 表单）
│   │
│   └── task/                       # 任务
│       ├── todo.vue               # 待办
│       └── done.vue               # 已办
│
├── api/workflow/
│   ├── template.js
│   ├── form-def.js
│   ├── instance.js
│   └── task.js
│
├── store/
│   └── useWorkflowStore.js        # 流程相关状态
│
├── components/workflow/
│   ├── FlowCanvas.vue             # 流程图编辑器（基于 @vue-flow/core）
│   ├── FlowViewer.vue             # 流程图只读查看器（流程跟踪用）
│   ├── FlowNode.vue               # 自定义节点
│   ├── NodeConfigDrawer.vue       # 节点配置抽屉
│   ├── FieldPermissionPanel.vue   # 字段权限配置面板
│   ├── FormRenderer.vue           # 统一表单渲染器（复用 Sunform 渲染能力）
│   └── ApprovalTimeline.vue       # 审批时间轴
│
└── router/
    └── (在 generateRoutes 中动态注入，或在 routes.js 中静态配置)
```

---

## 五、核心页面设计

### 5.1 流程模板编辑器（核心页面）

```
┌──────────────────────────────────────────────────────────────┐
│  ← 返回列表    请假审批 [草稿]    保存草稿   发布              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │    [发起人]  ───→  [主管审批]  ───→  [总监审批]    │   │
│   │                                                   │   │
│   │                             ───→  [HR确认]        │   │
│   │                                                     │   │
│   │  ← @vue-flow/core 画布 →                            │   │
│   │                                                     │   │
│   │  左侧工具栏：                            放大/缩小   │   │
│   │  □ 审批节点                               自适应    │   │
│   │  ◆ 条件分支                                         │   │
│   │  ◇ 结束节点                                         │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
│   选中节点后右侧显示配置面板                                    │
├──────────────────────────────────────────────────────────────┤
│  右侧面板：[基础信息] [审批人设置] [字段权限] [高级]            │
│                                                              │
│  基础信息：                                                   │
│    节点名称：[主管审批        ]                               │
│    节点类型：审批节点                                          │
│                                                              │
│  审批人设置：                                                  │
│    类型：[发起人直属上级  ▾]                                   │
│    多人审批：[无 ▾]  (无/会签/或签/依次审批)                    │
│    无审批人时：[跳过  ▾]                                      │
│                                                              │
│  字段权限：                                                    │
│    ┌──────────────┬──────────┬──────────┬──────────┐         │
│    │ 字段          │ 可编辑    │ 只读      │ 隐藏      │         │
│    ├──────────────┼──────────┼──────────┼──────────┤         │
│    │ 请假类型      │    ○     │    ●     │    ○     │         │
│    │ 开始时间      │    ○     │    ●     │    ○     │         │
│    │ 天数          │    ○     │    ●     │    ○     │         │
│    │ 事由          │    ○     │    ●     │    ○     │         │
│    │ 审批意见      │    ●     │    ○     │    ○     │         │
│    └──────────────┴──────────┴──────────┴──────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 发起流程

```
┌──────────────────────────────────────────────┐
│  发起流程                                     │
│                                              │
│  选择流程：[请假审批 ▾]                        │
│                                              │
│  实例标题：[张三的年假申请                   ]  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  (Sunform 生成的表单页面嵌入到这里)     │    │
│  │                                      │    │
│  │  申请人：张三 (自动)                   │    │
│  │  部门：技术部 (自动)                   │    │
│  │  请假类型：[年假 ▾]                    │    │
│  │  开始时间：[2026-03-15]              │    │
│  │  结束时间：[2026-03-17]              │    │
│  │  天数：3 (自动计算)                    │    │
│  │  事由：[回家探亲                     ]  │    │
│  │                                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  附件：[选择文件]  (选填)                      │
│                                              │
│  [保存草稿]  [提交申请]                        │
└──────────────────────────────────────────────┘
```

### 5.3 审批处理

```
┌──────────────────────────────────────────────┐
│  审批处理 — 请假审批                           │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  流程图 (FlowViewer)                  │    │
│  │  发起人(●) ─→ 主管审批(● ←当前) ─→ 总监  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  表单内容 (根据节点权限只读/可编辑)      │    │
│  │                                      │    │
│  │  申请人：张三 (只读，灰色)              │    │
│  │  请假类型：年假 (只读)                  │    │
│  │  开始时间：2026-03-15 (只读)          │    │
│  │  天数：3 (只读)                        │    │
│  │  事由：回家探亲 (只读)                  │    │
│  │  审批意见：[同意，批准休假            ]  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │  审批历史                             │    │
│  │  ○ 张三 发起 2026-03-14 10:30        │    │
│  │  ● 李四(主管) — 待审批                │    │
│  │  ○ 王五(总监) — 等待中                │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  [驳回]  [转交]  [同意]                       │
└──────────────────────────────────────────────┘
```

### 5.4 待办列表

```
┌──────────────────────────────────────────────────────────────┐
│  我的待办                                     共 12 条         │
│                                                              │
│  筛选：流程类型 [全部 ▾]  优先级 [全部 ▾]  时间 [近30天 ▾]     │
│                                                              │
│  ┌─────┬──────────┬──────────────┬──────────┬────────────┐  │
│  │ 优先级│ 流程标题   │ 流程类型      │ 当前节点  │ 发起时间     │  │
│  ├─────┼──────────┼──────────────┼──────────┼────────────┤  │
│  │ 🔴   │ 张三的年假  │ 请假审批 (行政) │ 主管审批  │ 2026-03-14 │  │
│  │     │ 项目采购    │ 采购审批 (财务) │ 部门审批  │ 2026-03-13 │  │
│  │ 🔴   │ 李四的报销  │ 报销审批 (财务) │ 财务审批  │ 2026-03-12 │  │
│  │     │ 王五的加班  │ 加班审批 (行政) │ HR确认   │ 2026-03-11 │  │
│  └─────┴──────────┴──────────────┴──────────┴────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 六、状态机设计

### 6.1 流程实例状态

```
                    ┌──────────┐
                    │  draft   │  ← 保存草稿
                    │  草稿    │
                    └────┬─────┘
                         │ 提交申请
                         ▼
                    ┌──────────┐
          ┌─────────│ running  │──────────┐
          │         │  审批中   │          │
          │         └────┬─────┘          │
          │              │                │
          │    ┌─────────┼─────────┐      │
          │    ▼         ▼         ▼      │
          │ ┌──────┐ ┌──────┐ ┌──────┐   │
          │ │通过节点│ │驳回节点│ │撤回  │   │
          │ └──┬───┘ └──┬───┘ └──┬───┘   │
          │    │ 下一节点 │       │       │
          │    │ 存在      │       │       │
          │    ▼         │       │       │
          │ (继续流转)    │       │       │
          │    │         │       │       │
          └────┘         │       │       │
                         ▼       │       │
                    ┌──────────┐ │       │
                    │ rejected │◀┘       │
                    │  已驳回   │         │
                    └──────────┘         │
                                         ▼
                                    ┌──────────┐
                                    │cancelled │
                                    │  已撤回   │
                                    └──────────┘

    最后一个节点通过
         ↓
    ┌──────────┐
    │ approved │
    │  已通过   │
    └──────────┘
```

### 6.2 审批操作

```
审批操作：
  agree      — 同意，推进到下一节点
  reject     — 驳回，退回到上一节点（或发起人）
  transfer   — 转交，把当前任务转给另一个人
  add_sign   — 加签，增加审批人
  withdraw   — 撤回，发起人撤回（仅 pending 状态的节点可撤回）

驳回策略（节点级别配置）：
  back_to_start    — 退回到发起人
  back_to_prev     — 退回到上一节点
  back_to_node     — 退回到指定节点
```

---

## 七、核心流程时序

### 7.1 发起流程

```
发起人              前端             后端                   数据库
  │                  │                │                      │
  │  选择流程+填表单  │                │                      │
  │─────────────────→│                │                      │
  │                  │  POST /workflow │                      │
  │                  │  /instance/start│                      │
  │                  │───────────────→│                      │
  │                  │                │ 1. 读模板定义         │
  │                  │                │─────────────────────→│
  │                  │                │ 2. 创建 flow_instance │
  │                  │                │─────────────────────→│
  │                  │                │ 3. 写入 instance_data │
  │                  │                │─────────────────────→│
  │                  │                │ 4. 解析第一个节点的审批人│
  │                  │                │ 5. 创建 instance_node  │
  │                  │                │─────────────────────→│
  │                  │                │ 6. 推送到消息队列     │
  │                  │   返回实例ID    │                      │
  │                  │←───────────────│                      │
  │  跳转到发起列表   │                │                      │
  │←─────────────────│                │                      │
```

### 7.2 审批处理

```
审批人              前端             后端                   数据库
  │                  │                │                      │
  │  打开待办         │                │                      │
  │─────────────────→│                │                      │
  │                  │  GET /task/     │                      │
  │                  │  :id/detail     │                      │
  │                  │───────────────→│                      │
  │                  │                │ 1. 读实例数据          │
  │                  │                │ 2. 读节点权限配置       │
  │                  │                │─────────────────────→│
  │                  │  返回表单+权限   │                      │
  │                  │←───────────────│                      │
  │                  │                │                      │
  │  查看表单(按权限)  │                │                      │
  │  填写审批意见      │                │                      │
  │─────────────────→│                │                      │
  │                  │  POST /task/    │                      │
  │                  │  :id/approve    │                      │
  │                  │───────────────→│                      │
  │                  │                │ 1. 校验审批人身份       │
  │                  │                │ 2. 更新 instance_node  │
  │                  │                │    (status + comment)  │
  │                  │                │ 3. 写入 instance_data  │
  │                  │                │    (新版本数据快照)     │
  │                  │                │ 4. 判断下一节点         │
  │                  │                │    ├─ 有下一节点 →      │
  │                  │                │    │  创建新 node       │
  │                  │                │    └─ 无下一节点 →      │
  │                  │                │      更新实例为 completed│
  │                  │                │ 5. 推送通知            │
  │                  │   返回结果      │                      │
  │                  │←───────────────│                      │
```

---

## 八、AI 生成能力

AI 不参与核心运行时，只辅助**创建阶段**：

### 8.1 AI 生成流程模板

```
用户输入：
"请假审批流程：员工发起 → 主管审批（金额<=3天）→ 超过3天需要总监审批 → HR确认归档"

AI 输出：
{
  "nodes": [
    { "name": "发起人", "type": "start" },
    { "name": "主管审批", "type": "approve", "assigneeType": "superior" },
    { "name": "总监审批", "type": "approve", "assigneeType": "superior_level", "level": 2 },
    { "name": "HR确认", "type": "approve", "assigneeType": "specified_role", "roleKey": "hr" }
  ],
  "edges": [
    { "from": "发起人", "to": "主管审批" },
    { "from": "主管审批", "to": "总监审批", "condition": "days > 3" },
    { "from": "主管审批", "to": "HR确认", "condition": "days <= 3" },
    { "from": "总监审批", "to": "HR确认" }
  ]
}
```

### 8.2 AI 生成字段权限配置

```
用户输入：
"主管审批节点：只读所有表单字段，开放审批意见和审批附件"

AI 输出：
{
  "nodeId": "xxx",
  "permissions": [
    { "field": "leaveType", "permission": "readonly" },
    { "field": "startTime", "permission": "readonly" },
    { "field": "comment", "permission": "editable" },
    { "field": "attachments", "permission": "editable" }
  ]
}
```

---

## 九、路由和菜单

```
系统管理
├── 用户
├── 角色
├── ...
└── 流程管理 (NEW)             ← 菜单编码 workflow
    ├── 流程模板                ← /workflow/template
    │   ├── 模板列表            ← /workflow/template
    │   └── 模板编辑器          ← /workflow/template/editor/:id
    ├── 表单定义                ← /workflow/form-def
    ├── 流程实例                ← /workflow/instance
    │   ├── 我发起的            ← /workflow/instance
    │   └── 实例详情            ← /workflow/instance/:id
    └── 我的任务                ← 分待办/已办两个 tab
        ├── 待办               ← /workflow/task/todo
        └── 已办               ← /workflow/task/done
```

---

## 十、实施计划

### 第一阶段：基础数据层（3-5 天）

| 任务 | 内容 |
|---|---|
| 建 entity | 9 个 entity：模板、节点、连线、表单定义、表单字段、实例、实例节点、实例数据、节点权限 |
| 建 module | workflow.module.ts，注册到 AppModule |
| 建 DTO | 各 controller 的入参校验 |
| 模板 CRUD | 模板列表、创建、编辑、删除、发布/停用 |
| 表单定义 CRUD | 表单列表、创建（关联 Sunform 页面）、字段管理 |

### 第二阶段：流程设计器（3-5 天）

| 任务 | 内容 |
|---|---|
| 安装 @vue-flow/core | 前端依赖 |
| FlowCanvas 组件 | 画布渲染、节点拖拽、连线创建 |
| 自定义节点样式 | 开始/审批/条件/结束 四种节点样式 |
| 节点配置面板 | 审批人设置 + 字段权限配置 |
| 模板保存 | 前端画布 → 后端 nodes + edges 持久化 |

### 第三阶段：流程运行时（4-6 天）

| 任务 | 内容 |
|---|---|
| 发起流程 | instance controller + 表单嵌入 + 数据写入 |
| 任务查询 | 待办列表、已办列表、搜索筛选 |
| 审批处理 | 同意/驳回/转交/加签，状态流转 |
| 表单权限渲染 | 根据 node_permissions 控制字段只读/可编辑/隐藏 |
| 审批意见+附件 | 图片/文件上传 |

### 第四阶段：增强功能（3-5 天）

| 任务 | 内容 |
|---|---|
| 流程图查看器 | FlowViewer：实例详情页展示流程进度 |
| 审批时间轴 | 展示每个节点的处理人、意见、耗时 |
| 条件分支 | 支持条件节点的表达式解析 |
| 会签/或签 | 多人审批策略 |
| 催办/超时 | 定时提醒、自动处理 |
| AI 辅助生成 | 自然语言生成流程模板 + 字段权限 |

### 总计预估：13-21 天

---

## 十一、注意事项

1. **表单数据变更追踪**：`flow_instance_data` 每个节点存一份快照，可以完整追溯数据变更历史
2. **模板版本控制**：已发起实例不会受模板修改影响（`flow_instances.template_version` 记录了发起时的版本）
3. **审批人动态解析**：`superior` / `superior_level` 等类型需要调用 Staff 模块查询直属上级关系
4. **并发安全**：同一实例同一节点只能一人处理（乐观锁或悲观锁），分布式环境用 Redis 分布式锁
5. **通知推送**：节点创建时、审批完成时、驳回时，通过系统通知 + 微信推送（复用已有的 WechatModule）
6. **权限校验**：审批操作需校验当前用户是否为当前节点指定的审批人
7. **表单复用**：同一个 Sunform 页面可以被多个流程模板绑定，字段权限各自独立配置
