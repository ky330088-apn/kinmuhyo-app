@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ====================================
echo   勤務表アプリ を起動しています...
echo ====================================

:: node_modules がなければ自動インストール
if not exist "backend\node_modules" (
  echo [準備中] バックエンドのパッケージをインストール中...
  cd backend && npm install && cd ..
)
if not exist "frontend\node_modules" (
  echo [準備中] フロントエンドのパッケージをインストール中...
  cd frontend && npm install && cd ..
)

:: バックエンド起動（別ウィンドウ）
start "勤務表アプリ - バックエンド" cmd /k "cd /d "%~dp0backend" && echo バックエンドを起動中... && node server.js"

:: 少し待ってからフロントエンド起動（別ウィンドウ）
timeout /t 2 /nobreak > nul
start "勤務表アプリ - フロントエンド" cmd /k "cd /d "%~dp0frontend" && echo フロントエンドを起動中... && npm run dev"

:: 少し待ってからブラウザを開く
timeout /t 4 /nobreak > nul
echo ブラウザを開いています...
start "" "http://localhost:5173"

echo.
echo ✅ 起動完了！ブラウザが開きます。
echo 終了するときは2つの黒い画面を閉じてください。
