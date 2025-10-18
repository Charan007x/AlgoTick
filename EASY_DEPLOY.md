# ⚡ SUPER EASY Deployment Guide

Deploy in 3 simple steps! No configuration needed.

---

## 🎯 Before You Start (5 min)

### 1. Create These Accounts (if you don't have them):
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Database
- [Render](https://render.com) - Backend
- [Vercel](https://vercel.com) - Frontend & Landing
- [Google Cloud Console](https://console.cloud.google.com) - OAuth

---

## 📦 STEP 1: Deploy Backend to Render (5 min)

### A. Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select **"AlgoTick"** repository
4. Fill in:
   ```
   Name: algotick-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: node server.js
   ```
5. Select **Free** instance type

### B. Add Environment Variables
Click **"Advanced"** and add these (one by one):

**Required:**
```
NODE_ENV = production
MONGODB_URI = (Get from MongoDB Atlas - see below)
JWT_SECRET = (Run: openssl rand -base64 32)
SESSION_SECRET = (Run: openssl rand -base64 32)
GOOGLE_CLIENT_ID = (Get from Google Console)
GOOGLE_CLIENT_SECRET = (Get from Google Console)
```

**Will update later:**
```
FRONTEND_URL = https://algotick.vercel.app
LANDING_URL = https://algotick-landing.vercel.app
```

6. Click **"Create Web Service"**
7. **SAVE YOUR URL**: `https://algotick-backend-XXXX.onrender.com`

---

## 📦 STEP 2: Deploy Frontend & Landing to Vercel (10 min)

### A. Deploy Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import **AlgoTick** repository
4. Configure:
   ```
   Project Name: algotick
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm ci && npm run build
   Output Directory: build
   ```
5. Click **"Environment Variables"** and add:
   ```
   REACT_APP_API_URL = https://your-render-backend-url.onrender.com/api
   REACT_APP_LANDING_URL = https://algotick-landing.vercel.app
   REACT_APP_GOOGLE_CLIENT_ID = your-google-client-id
   ```
6. Click **"Deploy"**
7. **SAVE YOUR URL**: `https://algotick.vercel.app`

### B. Deploy Landing Page
1. Still in Vercel → Click **"Add New..."** → **"Project"**
2. Import **AlgoTick** repository again (same repo, different config)
3. Configure:
   ```
   Project Name: algotick-landing
   Framework Preset: Vite
   Root Directory: landing
   Build Command: npm ci && npm run build
   Output Directory: dist
   ```
4. Click **"Environment Variables"** and add:
   ```
   VITE_APP_URL = https://algotick.vercel.app
   ```
5. Click **"Deploy"**
6. **SAVE YOUR URL**: `https://algotick-landing.vercel.app`

---

## 📦 STEP 3: Final Configuration (5 min)

### A. Update Render Backend URLs
1. Go back to [Render Dashboard](https://dashboard.render.com/)
2. Click your **algotick-backend** service
3. Go to **"Environment"** tab
4. Update these two variables with your ACTUAL Vercel URLs:
   ```
   FRONTEND_URL = https://algotick.vercel.app
   LANDING_URL = https://algotick-landing.vercel.app
   ```
5. Click **"Save Changes"**
6. Backend will auto-redeploy

### B. Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials → Click your OAuth Client
3. Add to **Authorized JavaScript origins**:
   ```
   https://algotick.vercel.app
   https://algotick-landing.vercel.app
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://your-backend.onrender.com/api/auth/google/callback
   https://algotick.vercel.app/oauth/callback
   ```
5. Click **"Save"**

---

## ✅ TEST IT!

1. Visit your landing page: `https://algotick-landing.vercel.app`
2. Click **"Get Started"**
3. Sign up with email
4. Add a question
5. Try Google OAuth

**All working? 🎉 YOU'RE LIVE!**

---

## 🔧 MongoDB Atlas Setup (if needed)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create **FREE M0 Cluster**
3. Create Database User:
   - Username: `algotick-user`
   - Password: (Generate strong password - SAVE IT!)
4. Network Access → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
5. Database → **Connect** → **Connect your application**
6. Copy connection string:
   ```
   mongodb+srv://algotick-user:<password>@cluster.xxxxx.mongodb.net/
   ```
7. Replace `<password>` and add database name:
   ```
   mongodb+srv://algotick-user:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/algotick?retryWrites=true&w=majority
   ```
8. Use this as your `MONGODB_URI` in Render

---

## 🐛 Common Issues

### "API URL not set" or "Redirecting to localhost"
**Solution:** 
1. Go to Vercel → Your frontend project → Settings → Environment Variables
2. Verify `REACT_APP_API_URL` is set correctly
3. **IMPORTANT:** Redeploy after adding/changing env variables
4. Go to Deployments → Click "..." → **Redeploy**

### CORS Errors
**Solution:**
1. Check Render backend logs
2. Verify `FRONTEND_URL` and `LANDING_URL` are set in Render
3. Make sure URLs have NO trailing slash
4. Redeploy backend

### Backend "Service Unavailable"
**Solution:**
- Render free tier sleeps after 15 min inactivity
- First request takes ~30 seconds to wake up
- This is normal - wait and retry

---

## 📝 Your Production URLs

**Landing:** `https://algotick-landing.vercel.app`

**Frontend:** `https://algotick.vercel.app`

**Backend:** `https://algotick-backend-XXXX.onrender.com`

---

## 🎯 That's It!

Three deploys, done! Now go share your app with the world! 🚀

**Need detailed docs?** Check `PRODUCTION_DEPLOYMENT.md`
