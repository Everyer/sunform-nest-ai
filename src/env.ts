// 必须在任何业务模块 import 之前执行：
// 1. 加载 .env 到 process.env
// 2. 校验启动必需的环境变量
//
// 注意：本文件不能 import 任何 src/ 下的业务模块（会形成循环依赖或加载顺序问题）

import * as dotenv from 'dotenv';
// override: true —— .env 永远覆盖 shell 里的同名变量
// 原因：开发者 shell 里常 export 一堆 AI/OpenAI key（给 Claude Code / Codex CLI 用），
//       变量名很容易跟本项目冲突（如 AI_AGENT_*、OPENAI_*）。
//       不开 override 会让 shell 里的旧值"偷走"项目配置，调试极痛苦。
dotenv.config({ override: true });

const required = ['JWT_SECRET', 'DATABASE_HOST', 'DATABASE_PASSWORD'] as const;
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `缺少必需的环境变量: ${missing.join(', ')}。请检查 .env 文件或参考 .env.example`,
  );
}
