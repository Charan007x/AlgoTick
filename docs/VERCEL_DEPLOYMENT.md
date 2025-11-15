# 🚀 Vercel Deployment Guide - Fresh Start

Since you're creating a **NEW** Vercel deployment (no existing frontend link), follow this guide.

---

## ✅ Prerequisites

You already have:
- ✅ Backend deployed on Render: `https://your-backend.onrender.com`
- ✅ MongoDB Atlas database configured
- ✅ Google OAuth credentials

---

## 📦 STEP 1: Deploy Frontend to Vercel (5 min)

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New..."** → **"Project"**

2. **Import Repository**
   - Select your **AlgoTick** repository from GitHub
   - Click **"Import"**

3. **Configure Project**
   ```
   Project Name: algotick
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm ci && npm run build
   Output Directory: build
   Install Command: npm ci
   ```

4. **Add Environment Variables** (Click "Environment Variables" section)
   
   Add these **THREE** variables:
   
   ```
   Name: REACT_APP_API_URL
   Value: https://your-backend.onrender.com/api
   Environment: Production
   
   Name: REACT_APP_LANDING_URL
   Value: https://algotick-landing.vercel.app
   Environment: Production
   
   Name: REACT_APP_GOOGLE_CLIENT_ID
   Value: your-google-oauth-client-id.apps.googleusercontent.com
   Environment: Production
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete
   - **COPY YOUR URL**: `https://algotick-XXXX.vercel.app` or custom domain

---

## 📦 STEP 2: Deploy Landing Page to Vercel (5 min)

1. **Create Another Project**
   - Still in Vercel Dashboard
   - Click **"Add New..."** → **"Project"**
   - Import **AlgoTick** repository again (yes, same repo!)

2. **Configure Project**
   ```
   Project Name: algotick-landing
   Framework Preset: Vite
   Root Directory: landing
   Build Command: npm ci && npm run build
   Output Directory: dist
   Install Command: npm ci
   ```

3. **Add Environment Variable**
   ```
   Name: VITE_APP_URL
   Value: https://algotick-XXXX.vercel.app (your frontend URL from Step 1)
   Environment: Production
   ```

4. **Deploy**
   - Click **"Deploy"**
   - **COPY YOUR URL**: `https://algotick-landing-XXXX.vercel.app`

---

## 📦 STEP 3: Update Backend Environment Variables (2 min)

Now that you have both Vercel URLs, update your Render backend:

1. **Go to Render Dashboard**
   - https://dashboard.render.com/
   - Click your **backend service**

2. **Update Environment Variables**
   - Go to **"Environment"** tab
   - Click **"Add Environment Variable"** or edit existing ones:
   
   ```
   FRONTEND_URL = https://algotick-XXXX.vercel.app
   LANDING_URL = https://algotick-landing-XXXX.vercel.app
   ```

3. **Save and Redeploy**
   - Click **"Save Changes"**
   - Backend will automatically redeploy (takes ~2 min)

---

## 📦 STEP 4: Update Google OAuth (2 min)

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/
   - Navigate to: **APIs & Services** → **Credentials**
   - Click your **OAuth 2.0 Client ID**

2. **Add Authorized JavaScript Origins**
   ```
   https://algotick-XXXX.vercel.app
   https://algotick-landing-XXXX.vercel.app
   https://your-backend.onrender.com
   ```

3. **Add Authorized Redirect URIs**
   ```
   https://your-backend.onrender.com/api/auth/google/callback
   https://algotick-XXXX.vercel.app/oauth-callback
   ```

4. **Save**

---

## ✅ STEP 5: Update Frontend Landing URL (1 min)

After landing is deployed, update the frontend environment variable:

1. **Go to Vercel Dashboard**
   - Select your **algotick** (frontend) project
   - Go to **Settings** → **Environment Variables**

2. **Update REACT_APP_LANDING_URL**
   - Change from placeholder to actual landing URL:
   ```
   REACT_APP_LANDING_URL = https://algotick-landing-XXXX.vercel.app
   ```

3. **Redeploy**
   - Go to **Deployments** tab
   - Click the **•••** (three dots) on latest deployment
   - Click **"Redeploy"**
   - **Uncheck** "Use existing Build Cache"
   - Click **"Redeploy"**

---

## 🎯 Test Your Deployment

1. **Visit Landing Page**: `https://algotick-landing-XXXX.vercel.app`
   - Should load without errors
   - "Get Started" button should redirect to frontend

2. **Visit Frontend**: `https://algotick-XXXX.vercel.app`
   - Should redirect to landing if not logged in
   - Try signing up with email

3. **Test Google OAuth**
   - Click "Continue with Google"
   - Should redirect to Google login
   - After login, should return to dashboard

4. **Test Features**
   - Add a question
   - Mark as completed
   - Check activity heatmap
   - Test LeetCode stats in Settings

---

## 🐛 Troubleshooting

### "Failed to fetch" or CORS errors
**Fix:**
- Verify `FRONTEND_URL` and `LANDING_URL` in Render are correct
- Make sure URLs have **NO trailing slash**
- Check Render logs: Dashboard → Logs tab

### Google OAuth fails
**Fix:**
- Verify all URLs in Google Console match exactly
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render
- Make sure redirect URIs include `/api/auth/google/callback`

### "Redirecting to localhost"
**Fix:**
- This should NOT happen anymore (we fixed all hardcoded URLs!)
- If it does, check Vercel environment variables are set
- Force redeploy without cache

### Backend "Service Unavailable"
**Fix:**
- Render free tier sleeps after 15 min inactivity
- First request takes 30-50 seconds to wake up
- Wait and retry

---

## 📝 Your Production URLs Checklist

After deployment, you should have:

- ✅ Landing: `https://algotick-landing-XXXX.vercel.app`
- ✅ Frontend: `https://algotick-XXXX.vercel.app`
- ✅ Backend: `https://your-backend.onrender.com`

---

## 🎉 You're Live!

Your app is now fully deployed and production-ready!

**Next Steps:**
1. Share your landing page link
2. Monitor Vercel Analytics
3. Check Render logs for any issues
4. Set up custom domain (optional)

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

**Need help?** Check the troubleshooting section above or open an issue on GitHub.
