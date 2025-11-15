# 🚀 Pre-Deployment Checklist

Complete this checklist before deploying to production.

## 📝 Code Preparation

### Backend
- [ ] Remove all `console.log` statements (or use proper logging library)
- [ ] Ensure all API endpoints have proper error handling
- [ ] Verify CORS configuration includes production URLs
- [ ] Check rate limiting is configured
- [ ] Verify JWT secret is strong (32+ characters)
- [ ] Test MongoDB connection with production URI
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Remove any hardcoded development URLs

### Frontend
- [ ] Update API URL to use environment variable
- [ ] Remove console.log statements
- [ ] Test build: `npm run build`
- [ ] Verify no hardcoded localhost URLs
- [ ] Check all images have alt text (accessibility)
- [ ] Test mobile responsiveness
- [ ] Verify environment variables are used correctly
- [ ] Check bundle size (should be < 500KB gzipped)

### Landing Page
- [ ] Replace all localhost URLs with environment variables
- [ ] Test build: `npm run build`
- [ ] Verify all links work
- [ ] Check mobile responsiveness
- [ ] Test all animations
- [ ] Optimize images (if any)

## 🔐 Security Checklist

- [ ] Generate strong JWT_SECRET (use `openssl rand -base64 32`)
- [ ] Generate strong SESSION_SECRET
- [ ] MongoDB password is strong and URL-encoded
- [ ] Google OAuth credentials updated with production URLs
- [ ] CORS only allows specific origins (not *)
- [ ] Rate limiting enabled on API routes
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection headers configured
- [ ] HTTPS enforced

## 🌐 Service Setup

### MongoDB Atlas
- [ ] Account created
- [ ] Cluster created (M0 free tier)
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for Render)
- [ ] Connection string copied
- [ ] Database name added to connection string
- [ ] Test connection from local machine

### Google OAuth
- [ ] Production URLs added to authorized JavaScript origins
- [ ] Production callback URLs added to authorized redirect URIs
- [ ] Client ID and Secret saved securely
- [ ] Consent screen configured
- [ ] Logo and app info updated

### Render (Backend)
- [ ] Account created
- [ ] GitHub repository connected
- [ ] Service name chosen
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `node server.js`
- [ ] All environment variables added
- [ ] Instance type selected (Free tier)
- [ ] Region selected

### Vercel (Frontend)
- [ ] Account created
- [ ] GitHub repository connected
- [ ] Service name chosen
- [ ] Root directory set to `frontend`
- [ ] Framework preset: Create React App
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`
- [ ] Environment variables added
- [ ] Deploy triggered

### Vercel (Landing)
- [ ] New project created
- [ ] Same GitHub repository connected
- [ ] Service name chosen (different from frontend)
- [ ] Root directory set to `landing`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added
- [ ] Deploy triggered

## 🧪 Testing Checklist

### Pre-Deployment Testing (Local)
- [ ] All pages load without errors
- [ ] Sign up works
- [ ] Login works
- [ ] Google OAuth works
- [ ] Dashboard displays correctly
- [ ] Add question works
- [ ] Delete question works
- [ ] Mark as revised works
- [ ] LeetCode verification works
- [ ] Custom lists work
- [ ] Settings save correctly
- [ ] Activity heatmap displays
- [ ] Mobile responsive

### Post-Deployment Testing (Production)
- [ ] Landing page loads
- [ ] Landing page links to frontend
- [ ] Frontend loads without errors
- [ ] Sign up with email works
- [ ] Login with email works
- [ ] Google OAuth signup works
- [ ] Google OAuth login works
- [ ] Dashboard loads with correct stats
- [ ] Add question from URL works
- [ ] LeetCode verification works
- [ ] Custom lists functionality works
- [ ] Settings page works
- [ ] All animations work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Fast load times (< 3s)

## 📊 Monitoring Setup

- [ ] Render logs accessible
- [ ] Vercel deployment logs checked
- [ ] MongoDB Atlas monitoring configured
- [ ] Error tracking considered (Sentry, LogRocket)
- [ ] Analytics considered (Google Analytics, Plausible)
- [ ] Uptime monitoring considered (UptimeRobot)

## 📱 Performance Checklist

- [ ] Lighthouse score > 90 for performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading where applicable
- [ ] Bundle size reasonable
- [ ] API response times < 1s
- [ ] Database queries optimized
- [ ] Proper indexing in MongoDB

## 📝 Documentation

- [ ] README.md updated with production URLs
- [ ] Environment variables documented
- [ ] API documentation complete
- [ ] Deployment guide reviewed
- [ ] Troubleshooting guide available

## 🎯 Final Steps

- [ ] Push latest code to GitHub
- [ ] Verify all branches are merged
- [ ] Tag release version (optional)
- [ ] Monitor first deployments
- [ ] Test in incognito/private window
- [ ] Test from different browsers
- [ ] Test from mobile device
- [ ] Share with test users
- [ ] Monitor for errors
- [ ] Be ready to rollback if needed

## ✅ DEPLOYMENT CHECKLIST - UPDATED

## 🎯 STEP 1: Google Cloud Console

https://console.cloud.google.com/apis/credentials

1. Find your OAuth 2.0 Client ID
2. Click to edit

### Add These EXACT URLs:

**Authorized JavaScript origins:**
- `https://algotick.vercel.app`
- `https://algotick.onrender.com`

**Authorized redirect URIs:**
- `https://algotick.onrender.com/api/auth/google/callback`

**Click SAVE** ✅

---

## 🎯 STEP 2: Render Backend

https://dashboard.render.com/

1. Find your backend service
2. Click **Environment** tab
3. Add/Update these variables:

```
GOOGLE_CALLBACK_URL = https://algotick.onrender.com/api/auth/google/callback
FRONTEND_URL = https://algotick.vercel.app
LANDING_URL = https://algotick.vercel.app
```

**Plus your existing:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`
- `SESSION_SECRET`
- `MONGODB_URI`
- `NODE_ENV=production`

**Click Save Changes** ✅

---

## 🎯 STEP 3: Vercel Frontend

https://vercel.com/dashboard

1. Find your **algotick** project
2. Go to **Settings** → **Environment Variables**
3. Make sure you have:

```
REACT_APP_API_URL = https://algotick.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID = [your-client-id]
```

4. Go to **Deployments** tab
5. Click **•••** on latest → **Redeploy**

---

## 🎯 STEP 4: Wait & Test

1. Wait 5 minutes for changes to propagate
2. Go to `https://algotick.vercel.app`
3. Test signup/login
4. Test Google OAuth

---

## 🐛 Quick Debug

### If Google OAuth shows policy error:
- Double-check redirect URI in Google Console
- Must be EXACT: `https://algotick.onrender.com/api/auth/google/callback`
- Wait 5-10 minutes after saving

### If regular login doesn't work:
- Check `REACT_APP_API_URL` in Vercel
- Check browser console for errors
- Check Render logs for backend errors

### If redirects to login after OAuth:
- Vercel needs to redeploy with latest code
- Check browser console for token errors

---

## 📝 Your Environment Variables Summary

### Render Backend (9 variables):
1. `NODE_ENV=production`
2. `MONGODB_URI=...`
3. `JWT_SECRET=...`
4. `SESSION_SECRET=...`
5. `GOOGLE_CLIENT_ID=...`
6. `GOOGLE_CLIENT_SECRET=...`
7. `GOOGLE_CALLBACK_URL=https://algotick.onrender.com/api/auth/google/callback`
8. `FRONTEND_URL=https://algotick.vercel.app`
9. `LANDING_URL=https://algotick.vercel.app`

### Vercel Frontend (2 variables):
1. `REACT_APP_API_URL=https://algotick.onrender.com/api`
2. `REACT_APP_GOOGLE_CLIENT_ID=...`

---

## ✅ All Routes Are Production-Ready!

✅ Frontend uses `REACT_APP_API_URL` for all API calls  
✅ Backend uses `FRONTEND_URL` for redirects  
✅ Backend uses `GOOGLE_CALLBACK_URL` for OAuth  
✅ No hardcoded localhost URLs in production  

**Follow the 4 steps above and everything will work!** 🚀

**Ready for Production?**
- All critical items checked: YES / NO
- No known critical bugs: YES / NO
- Performance acceptable: YES / NO
- Security measures in place: YES / NO

**If all YES → DEPLOY! 🚀**

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Backend (Render)**: 
   - Redeploy previous version
   - Check logs for errors
   - Verify environment variables

2. **Frontend/Landing (Vercel)**:
   - Revert to previous deployment in Vercel dashboard
   - Check deployment logs
   - Clear browser cache

3. **Database**:
   - Restore from backup if needed
   - Check connection string

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Production URLs:**
- Landing: ______________________________
- Frontend: ______________________________
- Backend: ______________________________

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

