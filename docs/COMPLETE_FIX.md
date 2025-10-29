# 🚨 COMPLETE FIX GUIDE

## Your URLs:
- **Frontend:** `https://algotick.vercel.app`
- **Backend:** `https://algotick.onrender.com`
- **Google Client ID:** `[Your Google OAuth Client ID]`
- **Google Client Secret:** `[Your Google OAuth Client Secret]`

---

## 🎯 STEP 1: Fix Google Cloud Console (CRITICAL!)

Go to: https://console.cloud.google.com/apis/credentials

### Find Your OAuth 2.0 Client ID:
Look for your Google OAuth 2.0 Client ID (ends with `.apps.googleusercontent.com`)

Click on it to edit.

### Set EXACT Values (Copy-Paste):

#### Authorized JavaScript origins:
```
https://algotick.vercel.app
https://algotick.onrender.com
```

#### Authorized redirect URIs (ADD THIS EXACT LINE):
```
https://algotick.onrender.com/api/auth/google/callback
```

**CRITICAL:** 
- Must be EXACT: `https://algotick.onrender.com/api/auth/google/callback`
- NO trailing slash
- YES `/api/` in the path
- Click **SAVE** and wait 5 minutes for changes to propagate

---

## 🎯 STEP 2: Update Render Backend Environment Variables

Go to: https://dashboard.render.com/

Find your backend service → **Environment** tab

### Update/Add These Variables (EXACT VALUES):

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-mongodb-uri
JWT_SECRET=[your-jwt-secret-from-backend-.env]
SESSION_SECRET=[your-session-secret-from-backend-.env]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
GOOGLE_CALLBACK_URL=https://algotick.onrender.com/api/auth/google/callback
FRONTEND_URL=https://algotick.vercel.app
LANDING_URL=https://algotick.vercel.app
```

**Click Save Changes** (backend will redeploy, takes ~3 minutes)

---

## 🎯 STEP 3: Verify Vercel Environment Variables

Go to: https://vercel.com/dashboard

Find your **algotick** project → **Settings** → **Environment Variables**

### Make Sure You Have (EXACT VALUES):

```
REACT_APP_API_URL=https://algotick.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=[your-google-client-id].apps.googleusercontent.com
```

If you just added these, go to **Deployments** → Click **•••** → **Redeploy**

---

## 🎯 STEP 4: Wait for Deployments

1. **Render Backend:** Wait ~3 minutes for redeploy
   - Check the "Events" tab to see when it's live
   - Should say "Deploy live"

2. **Vercel Frontend:** Auto-deploys when you push to GitHub
   - Check Deployments tab
   - Should show "Ready" status

---

## ✅ Test Checklist

### Test Regular Login (JWT):
1. Go to: `https://algotick.vercel.app`
2. Click **"Get Started"**
3. Sign up with email/password
4. Should redirect to dashboard ✅

### Test Google OAuth:
1. Go to: `https://algotick.vercel.app/login`
2. Click **"Continue with Google"**
3. Should see Google login screen (not policy error) ✅
4. After Google login → Should redirect to dashboard ✅

---

## 🐛 Common Issues & Fixes

### "App doesn't comply with Google's OAuth 2.0 policy"
**Cause:** Redirect URI not registered in Google Console  
**Fix:** Double-check Step 1 - EXACT URI: `https://algotick.onrender.com/api/auth/google/callback`

### "redirect_uri_mismatch"
**Cause:** Redirect URI doesn't match Google Console  
**Fix:** 
- Check for trailing slashes (shouldn't have any)
- Make sure it's `https://` not `http://`
- Check spelling of `algotick.onrender.com`

### Regular login/signup not working
**Cause:** Wrong API URL or backend not responding  
**Fix:**
- Check `REACT_APP_API_URL` in Vercel
- Should be: `https://algotick.onrender.com/api`
- Note the `/api` at the end
- Check Render backend logs for errors

### Backend returns 401 or CORS errors
**Cause:** Missing environment variables in Render  
**Fix:**
- Check `FRONTEND_URL` is set: `https://algotick.vercel.app`
- Check `JWT_SECRET` is set
- Redeploy backend after adding variables

---

## 📝 Quick Verification Commands

### Check if backend is live:
Open: `https://algotick.onrender.com/api`
- Should see: `{"message":"LeetCode Tracker API"}`

### Check frontend can reach backend:
1. Go to: `https://algotick.vercel.app`
2. Open browser console (F12)
3. Try to sign up
4. Check Network tab for API calls
5. Should see calls to `https://algotick.onrender.com/api`

---

## 🎯 Most Important Steps

1. **Google Console:** Add EXACT redirect URI
2. **Render Backend:** Update ALL environment variables
3. **Wait 5-10 minutes** for Google OAuth changes to propagate
4. **Test both regular login AND Google OAuth**

---

## 📞 Still Not Working?

Send me:
1. Screenshot of Google Console redirect URIs
2. Screenshot of Render environment variables (hide secrets!)
3. Browser console errors when trying to login
4. Network tab showing API requests

I'll diagnose the exact issue! 🔧
