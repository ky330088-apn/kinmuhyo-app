# Kinmuhyo App Launcher (Windows)
$root        = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir  = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host ""
Write-Host "=========================================="
Write-Host "  Starting Kinmuhyo App..."
Write-Host "=========================================="
Write-Host ""

# Check Node.js
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "[ERROR] Node.js not found." -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org and restart your PC." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}
$nodeVer = & node --version
Write-Host "Node.js $nodeVer found." -ForegroundColor Green
Write-Host ""

# Start backend
Write-Host "[1/3] Starting backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  Set-Location '$backendDir';
  Write-Host '=== Backend ===' -ForegroundColor Cyan;
  node server.js
"

Write-Host "      Waiting 3 seconds..."
Start-Sleep -Seconds 3

# Start frontend
Write-Host "[2/3] Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
  Set-Location '$frontendDir';
  Write-Host '=== Frontend ===' -ForegroundColor Cyan;
  npm run dev
"

Write-Host "      Waiting 6 seconds..."
Start-Sleep -Seconds 6

# Open browser
Write-Host "[3/3] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=========================================="
Write-Host "  Ready! Browser should open now."
Write-Host "=========================================="
Write-Host ""
Write-Host "To stop: close the two PowerShell windows."
Write-Host ""
Read-Host "Press Enter to close this window"
