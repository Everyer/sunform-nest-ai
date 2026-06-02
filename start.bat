@echo off
chcp 65001 >nul 2>&1
title SunForm-NestAI Server

:: ============================================================
:: 关闭 Windows CMD "快速编辑模式" (Quick Edit Mode)
:: 解决：AI 流式输出时点击控制台窗口导致进程冻结的问题
:: 原理：Quick Edit 开启时，点击控制台会进入"选择模式"，
::       阻塞所有 stdout/stderr 输出，导致 Node.js SSE 流卡死
:: ============================================================
:: 通过 PowerShell 调用 Win32 API 禁用 Quick Edit Mode
powershell -Command "$h = [Microsoft.Win32.SafeHandles.SafeFileHandle]::new([System.Runtime.InteropServices.Marshal]::AllocHGlobal(0), $true); try { $k32 = Add-Type -MemberDefinition '[DllImport(\"kernel32.dll\", SetLastError=true)] public static extern IntPtr GetStdHandle(int h); [DllImport(\"kernel32.dll\", SetLastError=true)] public static extern bool GetConsoleMode(IntPtr h, out uint m); [DllImport(\"kernel32.dll\", SetLastError=true)] public static extern bool SetConsoleMode(IntPtr h, uint m);' -Name 'K32' -Namespace 'Win32' -PassThru; $hnd = $k32::GetStdHandle(-10); [uint32]$mode = 0; $k32::GetConsoleMode($hnd, [ref]$mode) | Out-Null; $mode = $mode -band (-bnot 0x0040); $k32::SetConsoleMode($hnd, $mode) | Out-Null; Write-Host '[OK] Quick Edit Mode disabled - console will not freeze on click' } catch { Write-Host '[WARN] Could not disable Quick Edit Mode' }" 2>nul

echo.
echo ========================================
echo   SunForm-NestAI Production Server
echo ========================================
echo.

:: 启动 Node.js 服务
node ./main.js
