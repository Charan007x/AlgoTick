# LeetCode Revision Tracker - Quick Setup Guide

Write-Host "🚀 LeetCode Revision Tracker Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
}

Write-Host ""

# Check if MongoDB is installed
Write-Host "Checking MongoDB installation..." -ForegroundColor Yellow
$mongoVersion = mongo --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  MongoDB not found. Please ensure MongoDB is installed and running." -ForegroundColor Yellow
    Write-Host "   Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
} else {
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Cyan
Set-Location ../frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan

# Check if .env exists in backend, if not copy from example
if (!(Test-Path "backend/.env")) {
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "✅ Created backend/.env file (please update with your settings)" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend/.env already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Update backend/.env with your MongoDB URI and JWT secret" -ForegroundColor White
Write-Host "2. Make sure MongoDB is running" -ForegroundColor White
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "The app will open at http://localhost:3000" -ForegroundColor Green
Write-Host "API will run at http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Happy Coding! 🎉" -ForegroundColor Cyan
