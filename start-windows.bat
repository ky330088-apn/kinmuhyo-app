@echo off
chcp 65001 > nul
echo 勤務表アプリを起動しています...
node "%~dp0start.js"
if %errorlevel% neq 0 (
  echo.
  echo エラーが発生しました。Node.js がインストールされているか確認してください。
  pause
)
