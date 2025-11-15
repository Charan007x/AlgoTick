# 🚀 SINGLE DEPLOYMENT GUIDE - AlgoTick

## ✅ Your Backend: `https://algotick.onrender.com`

---

## 🎯 DEPLOY TO VERCEL (One Project Only!)

### Configuration:

```
Project Name: algotick
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: build
Install Command: npm ci
```

### Environment Variables (Add These 2):

```
Name: REACT_APP_API_URL
Value: https://algotick.onrender.com/api

Name: REACT_APP_GOOGLE_CLIENT_ID
Value: [Get from your backend/.env file]
```

**That's it!** No separate landing deployment needed!

---

## 📝 What Changed?

✅ **Merged landing page INTO frontend**
- Landing page is now at `/` (root)
- Dashboard at `/dashboard` (after login)
- Single unified React app

✅ **Removed REACT_APP_LANDING_URL**
- Not needed anymore!
- Everything is in one deployment

✅ **Updated routing**
- `/` → Landing page
- `/login` → Login
- `/signup` → Signup
- `/dashboard` → Dashboard (protected)

---

## 🔧 Update Render Backend

Go to your backend on Render and set:

```
FRONTEND_URL = https://algotick.vercel.app
LANDING_URL = https://algotick.vercel.app (same as frontend!)
```

**Note:** Both URLs are the same now since it's one deployment!

---

## 🔑 Update Google OAuth

### Authorized JavaScript Origins:
```
https://algotick.vercel.app
https://algotick.onrender.com
```

### Authorized Redirect URIs:
```
https://algotick.onrender.com/api/auth/google/callback
https://algotick.vercel.app/oauth-callback
```

---

## ✅ Deployment Steps

### 1. Deploy to Vercel
- Import AlgoTick repository
- Configure as shown above
- Add 2 environment variables
- Deploy!

### 2. Copy Your URL
- Example: `https://algotick.vercel.app` (or custom domain)

### 3. Update Backend (Render)
- Add `FRONTEND_URL` and `LANDING_URL` (both same URL)
- Save changes

### 4. Update Google OAuth
- Add origins and redirect URIs as shown above

---

## 🎉 Test It!

1. Visit: `https://algotick.vercel.app` (your URL)
2. Should see landing page
3. Click "Get Started" → Goes to `/signup`
4. Sign up → Gets redirected to `/dashboard`
5. Try Google OAuth
6. Test adding questions

---

## 📊 What You'll Have

**Single URL:** `https://algotick.vercel.app`

**Routes:**
- `/` - Landing page (public)
- `/login` - Login page (public)
- `/signup` - Signup page (public)
- `/dashboard` - Dashboard (protected)
- `/lists` - Custom lists (protected)
- `/settings` - Settings (protected)

**Much simpler!** ✨

---

## 🐛 Troubleshooting

### If you see blank page:
- Check browser console for errors
- Verify environment variables are set
- Try clearing cache and hard reload

### If login doesn't work:
- Check `REACT_APP_API_URL` is correct
- Should be: `https://algotick.onrender.com/api`
- Note the `/api` at the end!

### If OAuth fails:
- Double-check Google Console redirect URIs
- Make sure backend `FRONTEND_URL` is set
- Check backend logs in Render

---

## 📝 Copy-Paste Values

For **Vercel** Environment Variables:
```
REACT_APP_API_URL=https://algotick.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=[your-google-client-id]
```

For **Render** Backend:
```
FRONTEND_URL=https://algotick.vercel.app
LANDING_URL=https://algotick.vercel.app
```

For **Google Console** Authorized Origins:
```
https://algotick.vercel.app
https://algotick.onrender.com
```

For **Google Console** Redirect URIs:
```
https://algotick.onrender.com/api/auth/google/callback
https://algotick.vercel.app/oauth-callback
```

---

## 🚀 Ready to Deploy!

Everything is production-ready. Just deploy to Vercel and you're live! 🎉
