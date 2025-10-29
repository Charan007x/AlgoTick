# 🎯 VERCEL DEPLOYMENT - COPY & PASTE VALUES

## What I Need From You:
**Your Render Backend URL:** ___________________________

---

## 📋 Step-by-Step Deployment

### 1️⃣ DEPLOY FRONTEND (algotick)

**Vercel Configuration:**
```
Project Name: algotick
Framework: Create React App
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: build
```

**Environment Variables to Add:**

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://YOUR-BACKEND.onrender.com/api` |
| `REACT_APP_LANDING_URL` | `https://algotick-landing.vercel.app` |
| `REACT_APP_GOOGLE_CLIENT_ID` | *(from backend/.env)* |

**Your Frontend URL:** ___________________________

---

### 2️⃣ DEPLOY LANDING (algotick-landing)

**Vercel Configuration:**
```
Project Name: algotick-landing
Framework: Vite
Root Directory: landing
Build Command: npm ci && npm run build
Output Directory: dist
```

**Environment Variables to Add:**

| Name | Value |
|------|-------|
| `VITE_APP_URL` | `https://algotick.vercel.app` *(your frontend URL)* |

**Your Landing URL:** ___________________________

---

### 3️⃣ UPDATE RENDER BACKEND

**Add/Update These Variables:**

| Name | Value |
|------|-------|
| `FRONTEND_URL` | `https://algotick.vercel.app` |
| `LANDING_URL` | `https://algotick-landing.vercel.app` |

---

### 4️⃣ UPDATE GOOGLE OAUTH

**Authorized JavaScript Origins:**
```
https://algotick.vercel.app
https://algotick-landing.vercel.app
https://your-backend.onrender.com
```

**Authorized Redirect URIs:**
```
https://your-backend.onrender.com/api/auth/google/callback
https://algotick.vercel.app/oauth-callback
```

---

## ✅ Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Landing deployed on Vercel
- [ ] Backend environment variables updated
- [ ] Google OAuth URIs updated
- [ ] Tested signup/login
- [ ] Tested Google OAuth
- [ ] Tested add question
- [ ] Tested LeetCode stats

---

## 🐛 If Something Goes Wrong

**"Failed to fetch" error:**
- Check CORS: Verify `FRONTEND_URL` and `LANDING_URL` in Render
- No trailing slashes in URLs!

**"Redirecting to localhost":**
- This should NOT happen (we fixed all hardcoded URLs)
- Check Vercel env variables are set
- Redeploy without cache

**Google OAuth fails:**
- Double-check all URLs in Google Console
- Make sure redirect URIs match exactly

---

## 📝 Notes

✅ **ALL hardcoded localhost URLs removed**
✅ **Backend uses environment variables**
✅ **Frontend uses environment variables**
✅ **Landing uses environment variables**
✅ **CORS properly configured**
✅ **OAuth redirects properly configured**

**Everything is production-ready!** Just add the environment variables and deploy! 🚀
