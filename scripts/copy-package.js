const fs = require('fs');
const path = require('path');

// 读取原始 package.json
const originalPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// 创建生产环境的 package.json
const prodPackage = {
  name: originalPackage.name,
  version: originalPackage.version,
  description: originalPackage.description,
  author: originalPackage.author,
  license: originalPackage.license,
  main: "main.js",
  scripts: {
    "start": "node main.js",
    "start:prod": "NODE_ENV=production node main.js"
  },
  dependencies: originalPackage.dependencies,
  // 不包含 devDependencies，因为生产环境不需要
};

// 确保 dist 目录存在
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// 写入生产环境的 package.json
fs.writeFileSync(
  path.join('dist', 'package.json'),
  JSON.stringify(prodPackage, null, 2)
);

console.log('✅ 生产环境 package.json 已创建');

// 复制 .env 文件
if (fs.existsSync('.env')) {
  fs.copyFileSync('.env', path.join('dist', '.env'));
  console.log('✅ .env 文件已复制');
}

// 递归复制目录函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制 public 目录
if (fs.existsSync('public')) {
  copyDir('public', path.join('dist', 'public'));
  console.log('✅ public 目录已复制');
}

// 复制 skills 目录
if (fs.existsSync('src/modules/agent/skills')) {
  copyDir('src/modules/agent/skills', path.join('dist', 'modules', 'agent', 'skills'));
  console.log('✅ skills 目录已复制');
}

// 也创建一个启动脚本
const startScript = `#!/bin/bash
# 生产环境启动脚本

echo "🚀 启动 Nest.js 应用..."
echo "📍 当前目录: $(pwd)"
echo "📦 Node.js 版本: $(node --version)"
echo "📦 NPM 版本: $(npm --version)"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    echo "📦 安装生产依赖..."
    npm install --only=production
fi

# 启动应用
echo "🎯 启动应用..."
NODE_ENV=production node main.js
`;

const startScriptWin = `@echo off
chcp 65001 >nul 2>&1
title SunForm-NestAI Server

REM ============================================================
REM 关闭 Windows CMD "快速编辑模式" (Quick Edit Mode)
REM 解决：AI 流式输出时点击控制台导致进程冻结的问题
REM ============================================================
powershell -NoProfile -Command "$k32 = Add-Type -MemberDefinition '[DllImport(\\\"kernel32.dll\\\", SetLastError=true)] public static extern IntPtr GetStdHandle(int h); [DllImport(\\\"kernel32.dll\\\", SetLastError=true)] public static extern bool GetConsoleMode(IntPtr h, out uint m); [DllImport(\\\"kernel32.dll\\\", SetLastError=true)] public static extern bool SetConsoleMode(IntPtr h, uint m);' -Name 'K32' -Namespace 'Win32' -PassThru; $hnd = $k32::GetStdHandle(-10); [uint32]$mode = 0; $k32::GetConsoleMode($hnd, [ref]$mode) | Out-Null; $mode = $mode -band (-bnot 0x0040); $k32::SetConsoleMode($hnd, $mode) | Out-Null; Write-Host '[OK] Quick Edit Mode disabled'" 2>nul

REM 生产环境启动脚本 (Windows)
echo.
echo ========================================
echo   SunForm-NestAI Production Server
echo ========================================

echo Node.js version:
node --version
echo NPM version:
npm --version

REM 检查依赖是否已安装
if not exist "node_modules" (
    echo Installing production dependencies...
    npm install --only=production
)

REM 启动应用
echo Starting application...
set NODE_ENV=production
node main.js
`;

fs.writeFileSync(path.join('dist', 'start.sh'), startScript);
fs.writeFileSync(path.join('dist', 'start.bat'), startScriptWin);

// 使 shell 脚本可执行 (Unix/macOS)
if (process.platform !== 'win32') {
  fs.chmodSync(path.join('dist', 'start.sh'), '755');
}

console.log('✅ 启动脚本已创建: start.sh (Unix/macOS) 和 start.bat (Windows)');

// 创建 README 文件
const deployReadme = `# 生产环境部署说明

## 目录结构
\`\`\`
dist/
├── main.js              # 应用入口文件
├── package.json         # 生产环境依赖配置
├── .env                 # 环境变量配置
├── start.sh             # Unix/macOS 启动脚本
├── start.bat            # Windows 启动脚本
├── public/              # 静态资源目录
│   ├── h5/             # H5 应用页面
│   └── README.md       # 静态资源说明
└── ... (其他编译文件)

\`\`\`

## 部署步骤

### 1. 上传文件
将整个 \`dist\` 目录上传到服务器

### 2. 安装依赖
\`\`\`bash
cd dist
npm install --only=production
\`\`\`

### 3. 配置环境变量
编辑 \`.env\` 文件，设置正确的数据库和 Redis 连接信息

### 4. 启动应用

**Unix/macOS:**
\`\`\`bash
./start.sh
# 或者
npm start
# 或者
node main.js
\`\`\`

**Windows:**
\`\`\`cmd
start.bat
REM 或者
npm start
REM 或者
node main.js
\`\`\`

### 5. 使用 PM2 管理进程 (推荐)
\`\`\`bash
npm install -g pm2
pm2 start main.js --name "nest-app"
pm2 startup
pm2 save
\`\`\`

## 访问地址

- **API 文档**: http://your-server:9527/doc.html
- **H5 应用**: http://your-server:9527/static/h5/index.html
- **API 接口**: http://your-server:9527/adminApi/*

## 环境变量说明

在 \`.env\` 文件中配置以下变量：

\`\`\`env
# 应用配置
PORT=9527
NODE_ENV=production

# 数据库配置
DATABASE_HOST=your-db-host
DATABASE_PORT=3306
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database

# Redis 配置
REDIS_HOST=your-redis-host
REDIS_PORT=6379
\`\`\`

## 故障排除

1. **端口被占用**: 修改 \`.env\` 文件中的 \`PORT\` 值
2. **数据库连接失败**: 检查数据库配置和网络连接
3. **静态资源无法访问**: 确认 \`public\` 目录存在且有读取权限
4. **依赖安装失败**: 使用 \`npm cache clean --force\` 清理缓存后重试
`;

fs.writeFileSync(path.join('dist', 'DEPLOY.md'), deployReadme);
console.log('✅ 部署说明文档已创建: DEPLOY.md');

console.log('\n🎉 构建完成！dist 目录现在是一个完全自包含的部署包');
console.log('📋 下一步：');
console.log('  1. cd dist');
console.log('  2. npm install --only=production');
console.log('  3. 编辑 .env 文件配置环境变量');
console.log('  4. npm start 或 ./start.sh 启动应用'); 