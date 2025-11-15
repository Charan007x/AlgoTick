# 🔍 DEBUGGING GUIDE - OAuth & JWT Issues

## ✅ Latest Fixes Deployed:

1. **Better OAuth Callback** - Now verifies token before redirecting
2. **Enhanced Logging** - Console logs show exactly what's happening
3. **CORS Improvements** - Better origin handling
4. **Token Verification** - Fetches user data to ensure token works

---

## 🧪 How to Test (Step-by-Step):

### 1. **Wait for Deployments**
- Render backend: ~3 minutes
- Vercel frontend: ~2 minutes (auto-deploys from GitHub)

### 2. **Clear Everything**
Open browser console (F12) and run:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 3. **Test Regular Signup/Login**
1. Go to: `https://algotick.vercel.app`
2. Click "Get Started"
3. Fill in email, username, password
4. Click Sign Up
5. **Watch console** - Should see:
   - `API Request: POST /auth/signup`
   - `API Response: POST /auth/signup`
   - `AuthContext - Checking auth, token exists: true`
   - `AuthContext - User authenticated: [username]`
6. Should redirect to dashboard ✅

### 4. **Test Google OAuth**
1. Log out first
2. Go to `/login`
3. Click "Continue with Google"
4. Select Google account
5. **Watch console** - Should see:
   - `OAuth Callback - Token: Received`
   - `Token stored in localStorage`
   - `User data fetched: { ... }`
   - `Redirecting to dashboard...`
   - `AuthContext - User authenticated: [username]`
6. Should redirect to dashboard ✅

---

## 🐛 If OAuth Still Redirects to Login:

### Check Console Logs:
Look for these specific errors:

**1. "No token in OAuth callback"**
- **Cause:** Backend not sending token in URL
- **Fix:** Check Render backend logs for errors
- **Check:** Is `FRONTEND_URL` set in Render?

**2. "Token verification failed"**
- **Cause:** Token is invalid or expired
- **Fix:** Check `JWT_SECRET` matches between dev and production
- **Check:** Is `JWT_SECRET` set in Render?

**3. "CORS blocked"**
- **Cause:** Vercel URL not in allowed origins
- **Fix:** Check `FRONTEND_URL` in Render environment variables
- **Check:** Must be exact: `https://algotick.vercel.app` (no trailing slash)

**4. "Auth check failed: 401"**
- **Cause:** Token not being sent with request
- **Fix:** Check if token is in localStorage
- **Run:** `localStorage.getItem('token')` in console

---

## 📋 Environment Variable Checklist:

### Render Backend (Must Have):
```
✅ NODE_ENV=production
✅ MONGODB_URI=[your-mongodb-connection]
✅ JWT_SECRET=[your-jwt-secret]
✅ SESSION_SECRET=[your-session-secret]
✅ GOOGLE_CLIENT_ID=[your-google-client-id]
✅ GOOGLE_CLIENT_SECRET=[your-google-client-secret]
✅ GOOGLE_CALLBACK_URL=https://algotick.onrender.com/api/auth/google/callback
✅ FRONTEND_URL=https://algotick.vercel.app
✅ LANDING_URL=https://algotick.vercel.app
```

### Vercel Frontend (Must Have):
```
✅ REACT_APP_API_URL=https://algotick.onrender.com/api
✅ REACT_APP_GOOGLE_CLIENT_ID=[your-google-client-id]
```

---

## 🔍 Advanced Debugging:

### Check Backend is Responding:
```bash
curl https://algotick.onrender.com/api
# Should return: {"message":"LeetCode Tracker API"}
```

### Check Token is Valid:
In browser console after login:
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Try to fetch user data
fetch('https://algotick.onrender.com/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('User:', d));
```

### Check CORS Headers:
In Network tab, look for response headers:
```
Access-Control-Allow-Origin: https://algotick.vercel.app
Access-Control-Allow-Credentials: true
```

---

## 🎯 Expected Console Output (OAuth Success):

```
OAuth Callback - Token: Received
Token stored in localStorage
API Request: GET /auth/me
User data fetched: { id: "...", username: "...", email: "..." }
Redirecting to dashboard...
AuthContext - Checking auth, token exists: true
AuthContext - Fetching user data...
AuthContext - User authenticated: username
```

---

## 📞 Still Not Working?

Send me:
1. **Browser console output** (full log from OAuth attempt)
2. **Network tab** (showing /auth/google and /oauth-callback requests)
3. **Render backend logs** (latest 50 lines)
4. **Screenshot** of Render environment variables (hide secrets!)

I'll pinpoint the exact issue! 🔧
