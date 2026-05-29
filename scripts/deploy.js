/**
 * 一键构建部署包
 * 执行流程：前端构建 → 拷贝到 public/admin/ → 后端构建 → 打包到 dist/
 * 用法：node scripts/deploy.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT, 'front_end');
const PUBLIC_ADMIN = path.join(ROOT, 'public', 'admin');
const DIST = path.join(ROOT, 'dist');

function log(msg) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${msg}`);
  console.log(`${'='.repeat(50)}`);
}

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// 递归删除目录
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

try {
  // ===== 1. 构建前端 =====
  log('1/4  构建前端 (Vue + Vite)');
  run('npm run build', FRONTEND_DIR);

  // ===== 2. 清空并拷贝前端产物到 public/admin/ =====
  log('2/4  拷贝前端产物到 public/admin/');
  removeDir(PUBLIC_ADMIN);
  const frontendDist = path.join(FRONTEND_DIR, 'dist');
  if (!fs.existsSync(frontendDist)) {
    throw new Error('前端构建产物 dist/ 不存在');
  }
  fs.cpSync(frontendDist, PUBLIC_ADMIN, { recursive: true });
  console.log(`  ✅ ${frontendDist} → ${PUBLIC_ADMIN}`);

  // ===== 3. 构建后端 =====
  log('3/4  构建后端 (NestJS)');
  run('npx nest build', ROOT);

  // ===== 4. 打包部署产物到 dist/ =====
  log('4/4  组装部署包 (dist/)');
  run('npm run copy:package', ROOT);

  // ===== 完成 =====
  console.log(`\n${'='.repeat(50)}`);
  console.log('  🎉  构建完成！部署包位于 dist/');
  console.log(`${'='.repeat(50)}`);
  console.log(`
  📋 部署步骤：
  1. 上传 dist/ 目录到服务器
  2. cd dist && npm install
  3. 编辑 .env 配置生产环境变量
  4. node main.js 或 ./start.sh
`);
} catch (err) {
  console.error('\n❌ 构建失败:', err.message);
  process.exit(1);
}
