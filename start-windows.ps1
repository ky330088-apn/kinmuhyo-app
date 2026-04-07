# 勤務表アプリ 起動スクリプト (PowerShell)
$root        = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir  = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  勤務表アプリ を起動しています..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Node.js 確認
try {
    $ver = & node --version 2>&1
    Write-Host "Node.js $ver を確認しました" -ForegroundColor Green
} catch {
    Write-Host "[エラー] Node.js が見つかりません。" -ForegroundColor Red
    Write-Host "https://nodejs.org からインストールして、PCを再起動してください。" -ForegroundColor Red
    Read-Host "`nEnterキーで閉じる"
    exit 1
}

Write-Host ""
Write-Host "[1/3] バックエンドを起動中..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  `$host.UI.RawUI.WindowTitle = '勤務表-バックエンド';
  Write-Host '=== バックエンド ===' -ForegroundColor Cyan;
  Set-Location '$backendDir';
  node server.js
"

Write-Host "      3秒待ちます..."
Start-Sleep -Seconds 3

Write-Host "[2/3] フロントエンドを起動中..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  `$host.UI.RawUI.WindowTitle = '勤務表-フロントエンド';
  Write-Host '=== フロントエンド ===' -ForegroundColor Cyan;
  Set-Location '$frontendDir';
  npm run dev
"

Write-Host "      6秒待ちます..."
Start-Sleep -Seconds 6

Write-Host "[3/3] ブラウザを開いています..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  起動完了！ブラウザが開きます。" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "終了するには: 「勤務表-バックエンド」と" -ForegroundColor Gray
Write-Host "             「勤務表-フロントエンド」の" -ForegroundColor Gray
Write-Host "              ウィンドウを閉じてください。" -ForegroundColor Gray
Write-Host ""
Write-Host "このウィンドウは閉じても大丈夫です。" -ForegroundColor Gray
Read-Host "`nEnterキーで閉じる"
