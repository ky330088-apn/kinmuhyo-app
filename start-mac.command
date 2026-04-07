#!/bin/bash

# スクリプトのあるフォルダに移動
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================"
echo "  勤務表アプリ を起動しています..."
echo "======================================"

# node_modules がなければ自動インストール
if [ ! -d "$DIR/backend/node_modules" ]; then
  echo "[準備中] バックエンドのパッケージをインストール中..."
  cd "$DIR/backend" && npm install
fi

if [ ! -d "$DIR/frontend/node_modules" ]; then
  echo "[準備中] フロントエンドのパッケージをインストール中..."
  cd "$DIR/frontend" && npm install
fi

# バックエンドを新しいターミナルウィンドウで起動
osascript <<EOF
tell application "Terminal"
    do script "echo '=== バックエンド ===' && cd '$DIR/backend' && node server.js"
    activate
end tell
EOF

# 2秒待つ
sleep 2

# フロントエンドを新しいターミナルウィンドウで起動
osascript <<EOF
tell application "Terminal"
    do script "echo '=== フロントエンド ===' && cd '$DIR/frontend' && npm run dev"
end tell
EOF

# 4秒待ってからブラウザを開く
sleep 4
echo "ブラウザを開いています..."
open "http://localhost:5173"

echo ""
echo "✅ 起動完了！"
echo "終了するときは2つのターミナル画面で Ctrl+C を押してください。"
