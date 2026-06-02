/**
 * Windows 控制台 Quick Edit Mode 修复工具
 * 
 * 问题：Windows CMD 默认开启 "快速编辑模式"(Quick Edit Mode)，
 *       当用户点击控制台窗口任何位置时，CMD 进入"选择模式"，
 *       此时所有 stdout/stderr 输出被操作系统级别挂起阻塞。
 *       对于 Node.js SSE 流式响应场景，这会导致整个 HTTP 管道冻结。
 * 
 * 解决：在 Node.js 启动时，通过 child_process 调用 PowerShell 
 *       使用 Win32 Kernel32 API 关闭当前控制台的 Quick Edit Mode。
 * 
 * 调用方式：在 main.ts 启动前 require 此模块即可
 */

function disableQuickEditMode() {
  if (process.platform !== 'win32') return;

  try {
    const { execSync } = require('child_process');
    
    // 通过 PowerShell 调用 Kernel32.dll API 禁用 Quick Edit Mode (0x0040)
    const psScript = `
      $k32 = Add-Type -MemberDefinition '
        [DllImport("kernel32.dll", SetLastError=true)]
        public static extern IntPtr GetStdHandle(int h);
        [DllImport("kernel32.dll", SetLastError=true)]
        public static extern bool GetConsoleMode(IntPtr h, out uint m);
        [DllImport("kernel32.dll", SetLastError=true)]
        public static extern bool SetConsoleMode(IntPtr h, uint m);
      ' -Name 'K32' -Namespace 'Win32' -PassThru;
      $hnd = $k32::GetStdHandle(-10);
      [uint32]$mode = 0;
      $k32::GetConsoleMode($hnd, [ref]$mode) | Out-Null;
      $newMode = $mode -band (-bnot 0x0040);
      $k32::SetConsoleMode($hnd, $newMode) | Out-Null;
      Write-Output 'OK';
    `.replace(/\n/g, ' ');

    const result = execSync(`powershell -NoProfile -Command "${psScript}"`, {
      timeout: 5000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (result.trim() === 'OK') {
      console.log('✅ [Windows] Quick Edit Mode 已禁用 - 控制台点击不再冻结输出');
    }
  } catch (err) {
    // 非 Windows 环境或无 PowerShell 时静默失败，不影响正常启动
    console.warn('⚠️  [Windows] 无法自动禁用 Quick Edit Mode，如遇控制台冻结请手动关闭');
    console.warn('    方法：右键控制台标题栏 → 属性 → 取消勾选"快速编辑模式"');
  }
}

module.exports = { disableQuickEditMode };
