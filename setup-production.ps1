# AlgoTick Production Setup Script (Windows)
# Run this once before deploying to set up everything automatically

Write-Host "🚀 AlgoTick Production Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get backend URL
Write-Host "Step 1: Backend URL" -ForegroundColor Yellow
$BACKEND_URL = Read-Host "Enter your Render backend URL (e.g., https://algotick-backend.onrender.com)"

# Step 2: Get Google Client ID
Write-Host "Step 2: Google OAuth" -ForegroundColor Yellow
$GOOGLE_CLIENT_ID = Read-Host "Enter your Google Client ID"

# Step 3: Get frontend URL
Write-Host "Step 3: Frontend URL" -ForegroundColor Yellow
$FRONTEND_URL = Read-Host "Enter your Vercel frontend URL (e.g., https://algotick.vercel.app)"

# Step 4: Get landing URL
Write-Host "Step 4: Landing URL" -ForegroundColor Yellow
$LANDING_URL = Read-Host "Enter your Vercel landing URL (e.g., https://algotick-landing.vercel.app)"

# Create .env.production for frontend
Write-Host "Creating frontend/.env.production..." -ForegroundColor Green
@"
REACT_APP_API_URL=$BACKEND_URL/api
REACT_APP_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
"@ | Out-File -FilePath "frontend/.env.production" -Encoding UTF8

# Create .env.production for landing
Write-Host "Creating landing/.env.production..." -ForegroundColor Green
@"
VITE_APP_URL=$FRONTEND_URL
"@ | Out-File -FilePath "landing/.env.production" -Encoding UTF8

# Display backend environment variables
Write-Host "`nBackend Environment Variables (Copy to Render):" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "NODE_ENV=production"
Write-Host "MONGODB_URI=<your-mongodb-connection-string>"
Write-Host "JWT_SECRET=<generate-with: openssl rand -base64 32>"
Write-Host "SESSION_SECRET=<generate-with: openssl rand -base64 32>"
Write-Host "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
Write-Host "GOOGLE_CLIENT_SECRET=<your-google-secret>"
Write-Host "FRONTEND_URL=$FRONTEND_URL"
Write-Host "LANDING_URL=$LANDING_URL"
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Display summary
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Copy the backend environment variables to Render"
Write-Host "2. Push your code: git add . && git commit -m 'Production config' && git push"
Write-Host "3. Vercel will auto-deploy with the .env.production files"
Write-Host ""
Write-Host "Google OAuth URLs to add:" -ForegroundColor Yellow
Write-Host "Authorized JavaScript origins:"
Write-Host "  - $FRONTEND_URL"
Write-Host "  - $LANDING_URL"
Write-Host ""
Write-Host "Authorized redirect URIs:"
Write-Host "  - $BACKEND_URL/api/auth/google/callback"
Write-Host "  - $FRONTEND_URL/oauth/callback"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
