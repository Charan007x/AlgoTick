# Kill any existing node processes
Write-Host "Stopping any existing servers..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Starting AlgoTick Development Servers" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Get the script directory
$projectRoot = $PSScriptRoot

# Start Landing Page
Write-Host "[1/3] Starting Landing Page (Port 3001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\landing'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Backend
Write-Host "[2/3] Starting Backend (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; node server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "[3/3] Starting Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "ALL SERVERS STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nLanding:  http://localhost:3001" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000`n" -ForegroundColor White
Write-Host "Three PowerShell windows have opened." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers.`n" -ForegroundColor Yellow
