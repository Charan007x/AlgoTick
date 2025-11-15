# 🚀 Production Deployment Guide

Complete guide to deploy AlgoTick to production using Vercel, Render, and MongoDB Atlas.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works)
- Render account (free tier works)
- MongoDB Atlas account (free tier works)
- Google OAuth credentials (production URLs)

---

## 1️⃣ MongoDB Atlas Setup

### Step 1: Create Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in or create account
3. Click **"Build a Database"**
4. Choose **FREE** tier (M0 Sandbox)
5. Select a cloud provider and region (choose closest to your users)
6. Name your cluster: `algotick-cluster`
7. Click **"Create"**

### Step 2: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `algotick-user`
5. Generate a **strong password** (save this!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### Step 3: Configure Network Access
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is needed for Render to connect
4. Click **"Confirm"**

### Step 4: Get Connection String
1. Go to **Database** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://algotick-user:<password>@algotick-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANT**: Replace `<password>` with your actual password
6. Add database name: Change to `/algotick?retryWrites=true&w=majority`

**Final format:**
```
mongodb+srv://algotick-user:YOUR_PASSWORD@algotick-cluster.xxxxx.mongodb.net/algotick?retryWrites=true&w=majority
```

---

## 2️⃣ Backend Deployment (Render)

### Step 1: Prepare Backend
1. Ensure `backend/package.json` has proper start script ✅ (already configured)
2. Create `backend/.gitignore` if not exists

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 3: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your repository: `cookin_smthing`
5. Configure:
   - **Name**: `algotick-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`

### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://algotick-user:YOUR_PASSWORD@algotick-cluster.xxxxx.mongodb.net/algotick?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars-long
SESSION_SECRET=your-super-secure-session-secret-min-32-chars
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://algotick.vercel.app
LANDING_URL=https://algotick-landing.vercel.app
```

**⚠️ IMPORTANT:** 
- Generate secure secrets: Use `openssl rand -base64 32` or similar
- Update Google OAuth credentials with production URLs (see step 3)

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for build to complete (~2-3 minutes)
3. Copy your backend URL: `https://algotick-backend.onrender.com`

### Step 6: Test Backend
Visit: `https://algotick-backend.onrender.com/api/health`

Should return:
```json
{
  "status": "OK",
  "mongodb": "Connected",
  "timestamp": "..."
}
```

---

## 3️⃣ Google OAuth Setup (Production)

### Update OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add **Authorized JavaScript origins**:
   ```
   https://algotick.vercel.app
   https://algotick-landing.vercel.app
   ```
6. Add **Authorized redirect URIs**:
   ```
   https://algotick.vercel.app/oauth/callback
   https://algotick-backend.onrender.com/api/auth/google/callback
   ```
7. Click **"Save"**

---

## 4️⃣ Frontend Deployment (Vercel)

### Step 1: Create Environment Variables File
Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://algotick-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your-production-google-client-id
```

### Step 2: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3: Add Environment Variables
In Vercel project settings → **Environment Variables**:

```
REACT_APP_API_URL=https://algotick-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your-production-google-client-id
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment (~2 minutes)
3. Your app will be live at: `https://algotick.vercel.app` (or custom domain)

### Step 5: Configure Custom Domain (Optional)
1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## 5️⃣ Landing Page Deployment (Vercel)

### Step 1: Create Environment File
Create `landing/.env.production`:

```env
VITE_APP_URL=https://algotick.vercel.app
```

### Step 2: Deploy on Vercel
1. Vercel Dashboard → **"Add New..."** → **"Project"**
2. Import same GitHub repository
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `landing`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables
```
VITE_APP_URL=https://algotick.vercel.app
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Your landing page will be live at: `https://algotick-landing.vercel.app`

### Step 5: Update Landing Page Links
The landing page links to localhost URLs. We need to update them:

Edit `landing/src/App.jsx` - Replace all `http://localhost:3000` with your Vercel frontend URL.

---

## 6️⃣ Final Configuration Updates

### Update Backend CORS
Ensure `backend/server.js` has production URLs in CORS:

```javascript
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    process.env.LANDING_URL,
    'https://algotick.vercel.app',
    'https://algotick-landing.vercel.app'
  ],
  credentials: true
};
```

### Update Frontend API Calls
Ensure `frontend/src/services/api.js` uses environment variable:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

---

## 7️⃣ Post-Deployment Checklist

### Test All Features
- [ ] Landing page loads correctly
- [ ] Landing page links to frontend
- [ ] Frontend loads without errors
- [ ] Sign up with email/password works
- [ ] Login with email/password works
- [ ] Google OAuth login works
- [ ] Google OAuth signup works
- [ ] Dashboard loads with stats
- [ ] Add question functionality works
- [ ] LeetCode verification works
- [ ] Custom lists functionality works
- [ ] Settings page works
- [ ] Activity heatmap displays correctly
- [ ] Mobile responsive design works
- [ ] Animations work smoothly

### Monitor Services
- [ ] Check Render logs for backend errors
- [ ] Check Vercel deployment logs
- [ ] Monitor MongoDB Atlas metrics
- [ ] Check Google Cloud Console for OAuth issues

### Performance Checks
- [ ] Backend response time < 1s
- [ ] Frontend loads < 3s
- [ ] No console errors
- [ ] All animations smooth (60fps)

---

## 8️⃣ Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FRONTEND_URL=https://algotick.vercel.app
LANDING_URL=https://algotick-landing.vercel.app
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://algotick-backend.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=...
```

### Landing (Vercel)
```env
VITE_APP_URL=https://algotick.vercel.app
```

---

## 9️⃣ Common Issues & Solutions

### Issue: Backend not connecting to MongoDB
**Solution**: 
- Verify MongoDB connection string
- Check if IP whitelist includes 0.0.0.0/0
- Ensure password doesn't contain special characters (URL encode if needed)

### Issue: CORS errors in browser
**Solution**: 
- Verify CORS origins in backend include your Vercel URLs
- Check credentials: true in both frontend and backend
- Ensure no trailing slashes in URLs

### Issue: Google OAuth not working
**Solution**: 
- Verify all redirect URIs are added in Google Cloud Console
- Check GOOGLE_CLIENT_ID matches in both frontend and backend
- Ensure authorized origins include your Vercel domains

### Issue: Render free tier sleeps
**Solution**: 
- Free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier for 24/7 uptime
- Or use a cron job to ping your backend every 10 minutes

### Issue: Environment variables not updating
**Solution**: 
- Redeploy after changing environment variables
- Clear browser cache
- Check if you're using production environment

---

## 🔟 Production URLs

After deployment, your application will be accessible at:

- **Landing Page**: `https://algotick-landing.vercel.app`
- **Main App**: `https://algotick.vercel.app`
- **Backend API**: `https://algotick-backend.onrender.com`

---

## 🎯 Maintenance

### Update Deployment
```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main
```

- **Vercel**: Auto-deploys on push to main
- **Render**: Auto-deploys on push to main

### Monitor Costs
- MongoDB Atlas: Free tier = 512MB storage
- Render: Free tier = 750 hours/month (enough for 1 service)
- Vercel: Free tier = 100GB bandwidth/month

### Backup Database
```bash
# Install MongoDB tools
# Export database
mongodump --uri="mongodb+srv://..." --out=backup

# Import database
mongorestore --uri="mongodb+srv://..." backup/
```

---

## ✅ Success!

Your AlgoTick application is now live in production! 🎉

**Next Steps:**
1. Share your landing page URL
2. Monitor user feedback
3. Check analytics
4. Iterate and improve

---

**Need Help?** Check the troubleshooting section or review service logs.

**Happy Deploying! 🚀**
