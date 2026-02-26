# 🚀 AlgoTick Deployment Guide

## Overview
AlgoTick consists of three separate applications:
1. **Backend** (Node.js/Express) - API server
2. **Frontend** (React) - Main dashboard application
3. **Landing** (React/Vite) - Marketing/landing page

---

## ✅ Pre-Deployment Checklist

### ALL FIXES COMPLETED ✓
- [x] All hardcoded localhost URLs replaced with environment variables
- [x] .env.example files created for all apps
- [x] Production build scripts added
- [x] Sensitive console.logs removed
- [x] .gitignore properly configured

---

## 🔧 Backend Deployment (Render/Railway/Heroku)

### 1. Platform Setup
Choose a platform:
- **Render** (Recommended - Free tier available)
- **Railway** (Free $5 credit/month)
- **Heroku** (Paid plans only)

### 2. Environment Variables
Set these in your platform's environment variables panel:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@algotick.uvsno9t.mongodb.net/?appName=AlgoTick
JWT_SECRET=<generate-strong-random-string-64-chars>
SESSION_SECRET=<generate-strong-random-string-64-chars>
FRONTEND_URL=https://your-frontend-url.vercel.app
LANDING_URL=https://your-landing-url.vercel.app
GEMINI_API_KEY=<your-gemini-api-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://your-backend-url.com/api/auth/google/callback
```

### 3. Generate Strong Secrets
Use this command to generate strong secrets:
```bash
# On Mac/Linux
openssl rand -base64 48

# On Windows (PowerShell)
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. Build Command
```bash
npm install
```

### 5. Start Command
```bash
npm start
```

### 6. MongoDB Atlas Setup
1. Go to MongoDB Atlas
2. Update password to something stronger than "admin"
3. Add deployment IP to allowed IP addresses
4. Update MONGODB_URI in environment variables

---

## 🎨 Frontend Deployment (Vercel)

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `frontend` directory as root

### 2. Build Settings
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3. Environment Variables
Add in Vercel dashboard:
```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 4. Deploy
Click "Deploy" and wait for build to complete.

---

## 🌟 Landing Page Deployment (Vercel)

### 1. Connect to Vercel
1. Create a new project in Vercel
2. Import your GitHub repository
3. Select the `landing` directory as root

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables
Add in Vercel dashboard:
```env
VITE_APP_URL=https://your-frontend-url.vercel.app
```

### 4. Deploy
Click "Deploy" and wait for build to complete.

---

## 🔐 Google OAuth Setup (Optional)

If you want to enable Google login:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-backend-url.com/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for development)
6. Copy Client ID and Secret to environment variables

---

## 📝 Post-Deployment Steps

### 1. Update CORS Origins
Make sure backend has correct frontend/landing URLs in environment variables.

### 2. Test All Features
- [ ] User signup/login
- [ ] LeetCode OAuth
- [ ] Google OAuth (if enabled)
- [ ] Dashboard loading
- [ ] Question tracking
- [ ] Custom lists
- [ ] Notes with PDF upload
- [ ] Notifications
- [ ] Admin dashboard
- [ ] User management
- [ ] AI Coach

### 3. Create Admin Account
SSH into your backend or use platform console:
```bash
node update-admin.js
```

### 4. Test Health Endpoints
- Backend: `https://your-backend-url.com/health`
- Backend API: `https://your-backend-url.com/api/health`

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend
- Check REACT_APP_API_URL is set correctly
- Check CORS origins in backend .env
- Check backend is deployed and healthy

### OAuth Not Working
- Check callback URLs match in Google Console
- Check GOOGLE_CALLBACK_URL in backend .env
- Check credentials are correct

### MongoDB Connection Failed
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for all)
- Check MONGODB_URI format
- Check password doesn't contain special characters that need URL encoding

### Build Failures
- Check all dependencies are in package.json
- Check Node version compatibility (16+ recommended)
- Check build logs for specific errors

---

## 📊 Monitoring

### Health Check URLs
Set up monitoring with services like:
- UptimeRobot
- Pingdom
- Better Uptime

Monitor these endpoints:
- Backend: `https://your-backend-url.com/health`
- Frontend: `https://your-frontend-url.vercel.app`
- Landing: `https://your-landing-url.vercel.app`

---

## 🔄 CI/CD

### Automatic Deployments
Both Vercel and Render support automatic deployments from Git:
- **Main branch** → Production
- **Preview branches** → Preview deployments

### Manual Deployment
```bash
# Build all locally to test
npm run build:all

# Or individually
npm run build:frontend
npm run build:landing
```

---

## 📈 Performance Optimization

### Frontend
- Build generates optimized static files
- Vercel provides CDN and caching
- Images are optimized by default

### Backend
- Use connection pooling for MongoDB
- Enable compression middleware (already configured)
- Monitor response times

---

## 🎉 You're Done!

Your AlgoTick application is now live! Share your links:
- Landing Page: `https://your-landing-url.vercel.app`
- App: `https://your-frontend-url.vercel.app`
- API: `https://your-backend-url.com`

---

## 📞 Need Help?

Common issues and solutions:
1. **CORS errors**: Update FRONTEND_URL and LANDING_URL in backend
2. **OAuth fails**: Check callback URLs match exactly
3. **MongoDB timeout**: Whitelist deployment IPs
4. **Build fails**: Check Node version and dependencies

---

*Last updated: February 2026*
