# Google OAuth Setup Guide

## Overview
This guide will walk you through setting up Google OAuth authentication for the AlgoTick application.

## Prerequisites
- A Google account
- Access to Google Cloud Console

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name: "AlgoTick" (or your preferred name)
5. Click "Create"

---

## Step 2: Enable Google+ API

1. In the Google Cloud Console, select your project
2. Go to "APIs & Services" > "Library"
3. Search for "Google+ API"
4. Click on it and press "Enable"

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Click "Configure Consent Screen"
   - Choose "External" (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: "AlgoTick"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip "Scopes" for now (or add email and profile scopes)
   - Add test users if in testing mode
   - Click "Save and Continue"

4. Back to "Create OAuth client ID":
   - Application type: "Web application"
   - Name: "AlgoTick Web Client"
   
5. Add Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:5000
   ```

6. Add Authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback
   ```

7. Click "Create"

8. **IMPORTANT**: Copy the Client ID and Client Secret that appear

---

## Step 4: Update Backend Environment Variables

1. Open or create `.env` file in the `backend` folder
2. Add the following environment variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/leetcode-tracker

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-from-step-3
GOOGLE_CLIENT_SECRET=your-client-secret-from-step-3
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Node Environment
NODE_ENV=development
```

3. Replace the placeholder values:
   - `GOOGLE_CLIENT_ID`: Paste your Client ID from Step 3
   - `GOOGLE_CLIENT_SECRET`: Paste your Client Secret from Step 3
   - `JWT_SECRET`: Generate a random string (at least 32 characters)
   - `SESSION_SECRET`: Generate another random string

---

## Step 5: Generate Secure Secrets (Optional but Recommended)

You can generate secure random secrets using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this command twice to generate:
1. `JWT_SECRET`
2. `SESSION_SECRET`

---

## Step 6: Update for Production

When deploying to production, update these settings:

### In Google Cloud Console:
1. Go to your OAuth credentials
2. Add your production URLs to:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google/callback`

### In your `.env` file:
```env
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

### Update Frontend URLs:
In `backend/routes/auth.js`, update the redirect URLs:
```javascript
// Change from localhost to your domain
failureRedirect: 'https://yourdomain.com/login?error=oauth_failed'
res.redirect(`https://yourdomain.com/oauth-callback?token=${token}`);
```

In `frontend/src/pages/Login.js` and `Signup.js`:
```javascript
// Change from localhost to your domain
window.location.href = 'https://yourdomain.com/api/auth/google'
```

---

## Step 7: Test OAuth Flow

1. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000/login`

4. Click "Continue with Google"

5. You should be redirected to Google's login page

6. After signing in, you should be redirected back to the dashboard

---

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Check that the redirect URI in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`
- No trailing slashes
- Check for http vs https

### Error: "Access blocked: This app's request is invalid"
- Make sure you've configured the OAuth consent screen
- Add your email as a test user if the app is in testing mode

### Backend connection errors
- Verify all environment variables are set correctly
- Check MongoDB is running
- Restart the backend server after updating `.env`

### Frontend not redirecting
- Check browser console for errors
- Verify the callback URL matches in both backend and Google Console
- Clear browser cookies and try again

---

## Security Best Practices

1. **Never commit `.env` files to Git**
   - Add `.env` to `.gitignore`
   - Example `.gitignore` entry: `.env`

2. **Use strong secrets in production**
   - Generate cryptographically secure random strings
   - Never use default or example secrets

3. **Enable HTTPS in production**
   - OAuth tokens should only be transmitted over HTTPS
   - Use services like Let's Encrypt for free SSL certificates

4. **Verify the OAuth consent screen**
   - Add privacy policy and terms of service URLs
   - Request only necessary scopes (profile and email)

5. **Rate limiting**
   - Implement rate limiting on auth endpoints
   - Protect against brute force attacks

---

## OAuth Flow Diagram

```
User clicks "Continue with Google"
         ↓
Frontend redirects to: http://localhost:5000/api/auth/google
         ↓
Backend (Passport) redirects to Google
         ↓
User logs in with Google
         ↓
Google redirects back to: http://localhost:5000/api/auth/google/callback
         ↓
Backend validates with Google
         ↓
Backend creates/finds user in database
         ↓
Backend generates JWT token
         ↓
Backend redirects to: http://localhost:3000/oauth-callback?token=<jwt>
         ↓
Frontend extracts token from URL
         ↓
Frontend stores token in localStorage
         ↓
Frontend redirects to Dashboard
         ↓
User is logged in!
```

---

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google OAuth Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the browser console and backend logs for errors
4. Ensure MongoDB is running
5. Make sure all URLs match exactly (no trailing slashes)

---

## Files Modified for OAuth

### Backend:
- `backend/models/User.js` - Added googleId, provider, avatar fields
- `backend/config/passport.js` - New file with Google strategy
- `backend/routes/auth.js` - Added /google and /google/callback routes
- `backend/server.js` - Added session and passport middleware
- `backend/.env` - Added Google OAuth credentials

### Frontend:
- `frontend/src/pages/Login.js` - Added "Continue with Google" button
- `frontend/src/pages/Signup.js` - Added "Continue with Google" button
- `frontend/src/pages/OAuthCallback.js` - New file to handle OAuth redirect
- `frontend/src/App.js` - Added /oauth-callback route

---

**Ready to authenticate!** 🚀
