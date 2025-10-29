# 🎯 Production Deployment - What's Your Backend URL?

## Quick Start

**I need ONE piece of information from you:**

### What's your Render backend URL?
```
Example: https://algotick-backend-xyz123.onrender.com
```

Once you provide this, I'll give you the EXACT values to paste into Vercel!

---

## 🚀 Then Deploy in 3 Steps:

### STEP 1: Deploy Frontend on Vercel
1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import **AlgoTick** repository
4. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `build`

5. **Add these 3 Environment Variables**:
   ```
   REACT_APP_API_URL = [I'll give you the exact value]
   REACT_APP_LANDING_URL = [I'll give you the exact value]
   REACT_APP_GOOGLE_CLIENT_ID = [From your backend/.env]
   ```

6. Click **"Deploy"**

---

### STEP 2: Deploy Landing on Vercel
1. Click **"Add New..."** → **"Project"** again
2. Import **AlgoTick** repository (same repo!)
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `landing`
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist`

4. **Add 1 Environment Variable**:
   ```
   VITE_APP_URL = [Your frontend URL from Step 1]
   ```

5. Click **"Deploy"**

---

### STEP 3: Update Backend on Render
1. Go to: https://dashboard.render.com/
2. Click your backend service
3. **Environment** tab → Add:
   ```
   FRONTEND_URL = [Your frontend URL from Step 1]
   LANDING_URL = [Your landing URL from Step 2]
   ```

4. Save (auto-redeploys)

---

## ✅ What I've Fixed

### Backend (server.js, routes/auth.js)
- ✅ Removed ALL hardcoded localhost URLs
- ✅ Now uses `process.env.FRONTEND_URL` and `LANDING_URL`
- ✅ CORS configured with environment variables
- ✅ OAuth redirects use environment variables

### Frontend (All components)
- ✅ Removed hardcoded localhost URLs
- ✅ All API calls use `process.env.REACT_APP_API_URL`
- ✅ All redirects use `process.env.REACT_APP_LANDING_URL`
- ✅ OAuth uses environment-aware URLs

### Landing Page
- ✅ Already using `VITE_APP_URL` environment variable
- ✅ No hardcoded URLs

---

## 🎉 Ready to Deploy!

**Tell me your Render backend URL and I'll give you the exact environment variable values!**

Format: `https://your-backend-name.onrender.com`
