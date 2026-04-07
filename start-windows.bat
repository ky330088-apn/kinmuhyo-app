@echo off
chcp 65001 > nul
powershell -ExecutionPolicy Bypass -File "%~dp0start-windows.ps1"
if %errorlevel% neq 0 (
  echo.
  echo エラーが発生しました。
  pause
)
