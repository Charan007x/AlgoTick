# ⚡ Quick Production Deployment Guide

Get AlgoTick live in 30 minutes!

## 🎯 What You'll Deploy

- **Landing Page** → Vercel (Free)
- **Frontend App** → Vercel (Free)
- **Backend API** → Render (Free)
- **Database** → MongoDB Atlas (Free)

**Total Cost: $0/month** 💰

---

## 📦 Step-by-Step (30 minutes)

### Step 1: MongoDB Atlas (5 min)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Login
3. Create FREE cluster
4. Create database user (save password!)
5. Allow all IPs (0.0.0.0/0)
6. Get connection string
7. Replace `<password>` and add `/algotick`

**Save this:** 
```
mongodb+srv://user:PASS@cluster.xxxxx.mongodb.net/algotick?retryWrites=true&w=majority
```

---

### Step 2: Google OAuth (5 min)

1. [console.cloud.google.com](https://console.cloud.google.com/)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. **Authorized JavaScript origins:**
   ```
   https://your-frontend.vercel.app
   ```
5. **Authorized redirect URIs:**
   ```
   https://your-backend.onrender.com/api/auth/google/callback
   https://your-frontend.vercel.app/oauth/callback
   ```
6. Save Client ID and Secret

---

### Step 3: Backend on Render (10 min)

1. [dashboard.render.com](https://dashboard.render.com/)
2. New → Web Service
3. Connect GitHub repo
4. **Settings:**
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `node server.js`
   - Free tier

5. **Environment Variables:** (click Advanced)
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongo-connection-string
   JWT_SECRET=generate-32-char-secret
   SESSION_SECRET=generate-32-char-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   FRONTEND_URL=https://your-app.vercel.app
   LANDING_URL=https://your-landing.vercel.app
   ```

   **Generate secrets:**
   ```bash
   openssl rand -base64 32
   ```

6. Click "Create Web Service"
7. Wait ~3 min for deploy
8. **Save your URL:** `https://your-backend.onrender.com`

---

### Step 4: Frontend on Vercel (5 min)

1. [vercel.com/dashboard](https://vercel.com/dashboard)
2. New Project → Import Git Repository
3. **Settings:**
   - Root Directory: `frontend`
   - Framework: Create React App
   - Build: `npm run build`
   - Output: `build`

4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   ```

5. Deploy!
6. **Save your URL:** `https://your-app.vercel.app`

---

### Step 5: Landing on Vercel (5 min)

1. Vercel Dashboard → New Project
2. **Same repo**, different root directory
3. **Settings:**
   - Root Directory: `landing`
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`

4. **Environment Variables:**
   ```
   VITE_APP_URL=https://your-app.vercel.app
   ```

5. Deploy!
6. **Save your URL:** `https://your-landing.vercel.app`

---

### Step 6: Update Google OAuth (2 min)

Go back to Google Cloud Console and update with your **actual URLs**:

**Authorized origins:**
```
https://your-app.vercel.app
https://your-landing.vercel.app
```

**Authorized redirects:**
```
https://your-backend.onrender.com/api/auth/google/callback
https://your-app.vercel.app/oauth/callback
```

---

### Step 7: Update Render Environment (2 min)

Update these in Render with your **actual Vercel URLs**:
```
FRONTEND_URL=https://your-app.vercel.app
LANDING_URL=https://your-landing.vercel.app
```

Then **redeploy** the backend.

---

## ✅ Test Your Deployment

1. Visit your landing page
2. Click "Get Started"
3. Sign up with email
4. Login works?
5. Add a question
6. Try Google OAuth
7. Check mobile view

**All working? 🎉 YOU'RE LIVE!**

---

## 🐛 Common Issues

### Backend not connecting to MongoDB
- Check connection string format
- Verify password is URL-encoded
- Confirm IP whitelist has 0.0.0.0/0

### CORS errors
- Verify FRONTEND_URL and LANDING_URL in Render
- Check no trailing slashes
- Redeploy backend after URL changes

### Google OAuth fails
- Confirm all URLs added to Google Console
- No http:// in production (must be https://)
- Client IDs match in frontend and backend

### Render service sleeping
- Free tier sleeps after 15 min
- First request takes ~30 seconds
- This is normal on free tier

---

## 📝 Your Production URLs

Fill these in:

**Landing:** ___________________________________

**Frontend:** ___________________________________

**Backend:** ___________________________________

---

## 🚀 Next Steps

- [ ] Share your landing page link
- [ ] Monitor Render logs for errors
- [ ] Set up custom domain (optional)
- [ ] Add analytics
- [ ] Invite beta users
- [ ] Celebrate! 🎉

---

**Need help?** Check `PRODUCTION_DEPLOYMENT.md` for detailed guide.

**All set!** Your app is live and ready for users! 🌟
