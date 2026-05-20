Role: 你是一个资深的 NodeJS/TypeScript 全栈专家，精通 NestJS 框架、Sequelize ORM 以及 PostgreSQL (含 pgvector 扩展)。
Task: 我现在有一个基于 NestJS + Sequelize + MySQL 的 Web 后端项目。我需要你协助我将底层的数据库完全无缝迁移至 PostgreSQL，并集成 pgvector 扩展，以便后续开发 AI 知识库的向量检索功能。
Requirements:
	1.	迁移过程中，保持现有的业务逻辑和 Model 结构不变，仅做方言（Dialect）和驱动的替换。
	2.	严格注意 MySQL 与 PostgreSQL 在大小写敏感度、特定字段类型（如 JSON 到 JSONB）上的差异。
	3.	规范化代码，遵循 NestJS 的模块化（Module/Service/Controller）设计范式。
请按照以下制定的【5步演进计划】逐步协助我修改代码。每一步完成后，请提示我进行本地测试，确认无误后再进入下一步。
📅 数据库迁移与 AI 升级 5 步计划
Phase 1: 环境准备与驱动替换（基础铺垫）
•	目标： 卸载 MySQL 驱动，安装 PostgreSQL 驱动及 pgvector 拓展库。
•	AI 任务：
	1.	提示我执行终端命令，安装 pg、pg-hstore、pgvector 依赖及 @types/pg 开发依赖。
	2.	检查 package.json，确保 mysql2 依赖被成功移除。
Phase 2: 配置层重构（连接切换）
•	目标： 修改 NestJS 的全局数据库连接配置，从 MySQL 方言切换至 PostgreSQL。
•	AI 任务：
	1.	找到项目中的数据库配置文件（如 app.module.ts 或专门的 database.module.ts）。
	2.	将 SequelizeModule.forRoot 中的 dialect 改为 'postgres'，端口改为 5432，超级用户改为 'postgres'。
	3.	核心代码植入： 在 Sequelize 初始化逻辑中，引入并执行 const pgvector = require('pgvector/sequelize'); pgvector.register(Sequelize);，确保 ORM 运行时支持向量类型。
Phase 3: Model 层检查与优化（踩坑修复）
•	目标： 遍历现有 Sequelize Models，修复大小写敏感问题，优化数据类型。
•	AI 任务：
	1.	大小写核查： 检查所有 @Table 装饰器。由于 PostgreSQL 默认小写且对大小写敏感，帮我显式指定小写的 tableName（例如：tableName: 'user_infos'），避免迁移后因表名大写导致找不到表。
	2.	类型升级： 找出所有 DataType.JSON 字段，将其平替升级为更高效的 DataType.JSONB。
	3.	自增主键确认： 确保 autoIncrement: true 正常映射为 PG 的 SERIAL 机制。
Phase 4: 原生 SQL 查询排查（语法兼容）
•	目标： 修复项目中所有通过 sequelize.query() 编写的原始 SQL 语句。
•	AI 任务：
	1.	全局搜索项目中的 sequelize.query 关键词。
	2.	将 MySQL 特有的反引号（`）包裹的表名/字段名，全部替换为 PostgreSQL 兼容的双引号（"），或者直接去掉（在没有大写字母和保留字的情况下）。
	3.	检查是否有 MySQL 特有的时间或字符串函数，将其重写为标准 SQL 或 PG 兼容语法。
Phase 5: 新增 AI 知识库向量模块（功能扩展）
•	目标： 在 PG 跑通后，新建一个用于存储文档切片和向量检索的 Module。
•	AI 任务：
	1.	创建 DocumentChunk Model：
•	包含 id, documentId（关联外键）, content (TEXT 类型，存原文)。
•	包含 embedding 字段，类型定义为 DataType.VECTOR(1536)（以 1536 维为例）。
	2.	编写检索 Service：
•	提供一个 searchSimilarChunks(queryEmbedding: number[], limit: number) 方法。
•	使用 pgvector.l2Distance 或 cosineDistance 结合 Sequelize 的 order 语法，实现本地高效的向量相似度 Top-N 检索。