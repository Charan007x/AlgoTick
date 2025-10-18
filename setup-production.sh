#!/bin/bash

# AlgoTick Production Setup Script
# Run this once before deploying to set up everything automatically

echo "🚀 AlgoTick Production Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Get backend URL
echo -e "${YELLOW}Step 1: Backend URL${NC}"
read -p "Enter your Render backend URL (e.g., https://algotick-backend.onrender.com): " BACKEND_URL

# Step 2: Get Google Client ID
echo -e "${YELLOW}Step 2: Google OAuth${NC}"
read -p "Enter your Google Client ID: " GOOGLE_CLIENT_ID

# Step 3: Get frontend URL
echo -e "${YELLOW}Step 3: Frontend URL${NC}"
read -p "Enter your Vercel frontend URL (e.g., https://algotick.vercel.app): " FRONTEND_URL

# Step 4: Get landing URL
echo -e "${YELLOW}Step 4: Landing URL${NC}"
read -p "Enter your Vercel landing URL (e.g., https://algotick-landing.vercel.app): " LANDING_URL

# Create .env.production for frontend
echo -e "${GREEN}Creating frontend/.env.production...${NC}"
cat > frontend/.env.production << EOF
REACT_APP_API_URL=${BACKEND_URL}/api
REACT_APP_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
EOF

# Create .env.production for landing
echo -e "${GREEN}Creating landing/.env.production...${NC}"
cat > landing/.env.production << EOF
VITE_APP_URL=${FRONTEND_URL}
EOF

# Display backend environment variables
echo -e "${GREEN}Backend Environment Variables (Copy to Render):${NC}"
echo "================================================"
echo "NODE_ENV=production"
echo "MONGODB_URI=<your-mongodb-connection-string>"
echo "JWT_SECRET=<generate-with: openssl rand -base64 32>"
echo "SESSION_SECRET=<generate-with: openssl rand -base64 32>"
echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}"
echo "GOOGLE_CLIENT_SECRET=<your-google-secret>"
echo "FRONTEND_URL=${FRONTEND_URL}"
echo "LANDING_URL=${LANDING_URL}"
echo "================================================"
echo ""

# Display summary
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the backend environment variables to Render"
echo "2. Push your code: git add . && git commit -m 'Production config' && git push"
echo "3. Vercel will auto-deploy with the .env.production files"
echo ""
echo -e "${YELLOW}Google OAuth URLs to add:${NC}"
echo "Authorized JavaScript origins:"
echo "  - ${FRONTEND_URL}"
echo "  - ${LANDING_URL}"
echo ""
echo "Authorized redirect URIs:"
echo "  - ${BACKEND_URL}/api/auth/google/callback"
echo "  - ${FRONTEND_URL}/oauth/callback"
