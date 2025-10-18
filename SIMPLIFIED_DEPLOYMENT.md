# 🚀 SIMPLIFIED DEPLOYMENT - Single Frontend

## Your Backend URL: `https://algotick.onrender.com`

---

## 📦 DEPLOY ONLY ONE FRONTEND (Not Two!)

You're right - we don't need separate deployments! Deploy **ONE** Vercel project that includes both landing and app.

---

## 🎯 OPTION 1: Deploy Landing as Main (Recommended)

The landing page (`landing/`) built with Vite is your main entry point.

### Vercel Configuration:

```
Project Name: algotick
Framework Preset: Vite
Root Directory: landing
Build Command: npm ci && npm run build
Output Directory: dist
```

### Environment Variables:

```
VITE_APP_URL = https://algotick.vercel.app
VITE_API_URL = https://algotick.onrender.com/api
```

**Issue:** But the React app (`frontend/`) has all the dashboard logic...

---

## 🎯 OPTION 2: Merge Landing into Frontend (Better!)

Let me merge the landing page INTO the frontend app so you have ONE unified deployment.

### This means:
- ✅ Single Vercel deployment
- ✅ Landing page at `/` (root)
- ✅ Login/Signup at `/login` and `/signup`
- ✅ Dashboard at `/dashboard` (after login)
- ✅ One codebase, one deployment, no confusion!

**Should I merge the landing page into the frontend app?** This is the cleanest solution!

---

## 📋 If Yes, Here's What I'll Do:

1. Move landing page components into `frontend/src/pages/Landing.js`
2. Update routing so `/` shows landing page
3. Remove the separate `landing/` folder deployment
4. One Vercel deployment with these values:

```
Project Name: algotick
Framework: Create React App
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: build

Environment Variables:
REACT_APP_API_URL = https://algotick.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID = your-google-client-id
```

---

## 🤔 Which Option Do You Want?

**A) Keep them separate** - Deploy landing separately (2 Vercel projects)  
**B) Merge into one** - Move landing into frontend (1 Vercel project) ✨ **RECOMMENDED**

Let me know and I'll set it up immediately!

---

## 📝 Meanwhile, Update Backend Right Now:

Since you have your backend URL, update these in Render:

```
FRONTEND_URL = https://algotick.vercel.app (will be your only URL)
LANDING_URL = https://algotick.vercel.app (same URL!)
```

This way backend redirects always go to the same place! 🎯
