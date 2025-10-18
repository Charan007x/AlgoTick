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

## ✅ Go/No-Go Decision

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

