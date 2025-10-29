# 🔧 FIX GOOGLE OAUTH - Error 400: redirect_uri_mismatch

## Your URLs:
- **Frontend:** `https://algotick.vercel.app/`
- **Backend:** `https://algotick.onrender.com`
- **Google Client ID:** `184058169141-6vbpr1u8j61hivob7pq6hn5m51jdpefs.apps.googleusercontent.com`

---

## 🎯 STEP 1: Update Google Cloud Console

Go to: https://console.cloud.google.com/apis/credentials

### Find Your OAuth Client ID:
`184058169141-6vbpr1u8j61hivob7pq6hn5m51jdpefs.apps.googleusercontent.com`

Click on it to edit.

### Add These EXACT URLs:

#### Authorized JavaScript origins:
```
https://algotick.vercel.app
https://algotick.onrender.com
```

**IMPORTANT:** 
- ✅ No trailing slash: `https://algotick.vercel.app` (correct)
- ❌ With trailing slash: `https://algotick.vercel.app/` (wrong)

#### Authorized redirect URIs:
```
https://algotick.onrender.com/api/auth/google/callback
https://algotick.vercel.app/oauth-callback
```

**Click SAVE!**

---

## 🎯 STEP 2: Update Render Backend Environment Variables

Go to: https://dashboard.render.com/

Find your backend service → **Environment** tab

### Add/Update These Variables:

```
GOOGLE_CALLBACK_URL = https://algotick.onrender.com/api/auth/google/callback
FRONTEND_URL = https://algotick.vercel.app
LANDING_URL = https://algotick.vercel.app
```

**IMPORTANT:** No trailing slashes!

Click **Save Changes** (backend will auto-redeploy)

---

## 🎯 STEP 3: Verify Vercel Environment Variables

Go to: https://vercel.com/dashboard

Find your **algotick** project → **Settings** → **Environment Variables**

### Make Sure You Have:

```
REACT_APP_API_URL = https://algotick.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID = 184058169141-6vbpr1u8j61hivob7pq6hn5m51jdpefs.apps.googleusercontent.com
```

If not set, add them and **Redeploy**!

---

## ✅ Test Again

1. Wait 2-3 minutes for backend to redeploy on Render
2. Go to: `https://algotick.vercel.app`
3. Click **"Sign In"** or **"Get Started"**
4. Click **"Continue with Google"**
5. Should redirect to Google OAuth ✅
6. After login, should redirect back to your dashboard ✅

---

## 🐛 Still Not Working?

### Check These Common Issues:

1. **Trailing Slashes**
   - ❌ `https://algotick.vercel.app/` (with slash)
   - ✅ `https://algotick.vercel.app` (no slash)

2. **Missing `/api` in Callback URL**
   - ❌ `https://algotick.onrender.com/auth/google/callback`
   - ✅ `https://algotick.onrender.com/api/auth/google/callback`

3. **Google OAuth Client Not Saved**
   - Make sure you clicked **SAVE** in Google Console
   - Changes can take 5-10 minutes to propagate

4. **Backend Not Redeployed**
   - After changing env vars in Render, it auto-redeploys
   - Check the "Events" tab to see if it's still deploying

---

## 📋 Quick Copy-Paste

### For Google Console - Authorized JavaScript Origins:
```
https://algotick.vercel.app
https://algotick.onrender.com
```

### For Google Console - Authorized Redirect URIs:
```
https://algotick.onrender.com/api/auth/google/callback
https://algotick.vercel.app/oauth-callback
```

### For Render Backend:
```
GOOGLE_CALLBACK_URL=https://algotick.onrender.com/api/auth/google/callback
FRONTEND_URL=https://algotick.vercel.app
LANDING_URL=https://algotick.vercel.app
```

### For Vercel:
```
REACT_APP_API_URL=https://algotick.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=184058169141-6vbpr1u8j61hivob7pq6hn5m51jdpefs.apps.googleusercontent.com
```

---

## 🎉 After This, OAuth Will Work!

The `redirect_uri_mismatch` error happens when:
- Google Console URIs don't match what your backend is sending
- Backend doesn't have correct `GOOGLE_CALLBACK_URL`
- Frontend redirects to wrong URL

**Following the steps above will fix all of these!** ✅
