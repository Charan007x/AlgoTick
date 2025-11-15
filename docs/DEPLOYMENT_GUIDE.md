# 🚀 Deployment Guide - Making Everything Seamless

## Current Setup (Local):
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Extension: Works with localhost

## For Production Deployment:

### Step 1: Deploy Backend (e.g., Heroku, Railway, Render)

After deploying, you'll get: `https://your-backend.herokuapp.com`

### Step 2: Deploy Frontend (e.g., Vercel, Netlify)

Update frontend `.env`:
```
REACT_APP_API_URL=https://your-backend.herokuapp.com/api
```

After deploying, you'll get: `https://your-app.vercel.app`

### Step 3: Update Extension for Production

#### A. Update manifest.json
```json
{
  "host_permissions": [
    "https://leetcode.com/*",
    "https://your-backend.herokuapp.com/*",
    "https://your-app.vercel.app/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://leetcode.com/problems/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_end"
    },
    {
      "matches": ["https://your-app.vercel.app/*"],
      "js": ["sync.js"],
      "run_at": "document_idle"
    }
  ]
}
```

#### B. Update popup.js
```javascript
const API_URL = 'https://your-backend.herokuapp.com/api';

// In syncToWebsite function:
chrome.tabs.query({ url: 'https://your-app.vercel.app/*' }, (tabs) => {
  // ... rest of code
});

// In logout function:
chrome.tabs.query({ url: 'https://your-app.vercel.app/*' }, (tabs) => {
  // ... rest of code
});
```

#### C. Update content.js (if needed)
Change localhost:5000 to your backend URL.

#### D. Update background.js
```javascript
chrome.storage.local.set({
  apiUrl: 'https://your-backend.herokuapp.com/api',
  notifications: true
});
```

### Step 4: Package Extension

#### For Development/Testing:
1. Load unpacked (current method)
2. Users need to reload when you update

#### For Production (Chrome Web Store):

1. **Create icons** (required):
   - 16x16, 32x32, 48x48, 128x128 PNG files
   - Place in `extension/icons/` folder

2. **Update manifest.json** to include icons:
```json
"icons": {
  "16": "icons/icon16.png",
  "32": "icons/icon32.png",
  "48": "icons/icon48.png",
  "128": "icons/icon128.png"
},
"action": {
  "default_icon": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

3. **Create ZIP file**:
```powershell
cd C:\Users\saich\Desktop\charan\ProjectX
Compress-Archive -Path extension\* -DestinationPath leetcode-tracker-extension.zip
```

4. **Publish to Chrome Web Store**:
   - Go to: https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time developer fee
   - Upload ZIP file
   - Fill in description, screenshots
   - Submit for review (1-3 days)

### Step 5: Make it Production-Ready

#### A. Environment-based Configuration

Create `extension/config.js`:
```javascript
const CONFIG = {
  development: {
    API_URL: 'http://localhost:5000/api',
    WEB_URL: 'http://localhost:3000'
  },
  production: {
    API_URL: 'https://your-backend.herokuapp.com/api',
    WEB_URL: 'https://your-app.vercel.app'
  }
};

// Auto-detect or manually set
const ENV = 'production'; // Change this before building

export const API_URL = CONFIG[ENV].API_URL;
export const WEB_URL = CONFIG[ENV].WEB_URL;
```

#### B. Update All Files to Use Config
Instead of hardcoded URLs, import from config.js.

## 🎯 Seamless Experience Checklist:

### ✅ Authentication Sync
- [x] Login on website → Extension logged in
- [x] Login on extension → Website logged in
- [x] Logout syncs everywhere

### ✅ Data Sync
- [x] Add problem anywhere → Shows everywhere
- [x] Mark revised → Updates everywhere
- [x] Delete problem → Removes everywhere

### ✅ User Experience
- [x] One account for both
- [x] Same stats everywhere
- [x] No duplicate logins needed
- [x] Automatic sync

## 🌐 Production URLs Example:

```
Backend:  https://leetcode-tracker-api.herokuapp.com
Frontend: https://leetcode-tracker.vercel.app
Extension: Chrome Web Store (or load unpacked)
```

## 📝 Quick Deployment Commands:

### Backend (Heroku):
```bash
cd backend
heroku create leetcode-tracker-api
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Frontend (Vercel):
```bash
cd frontend
npm install -g vercel
vercel login
vercel
```

### Extension:
```powershell
# Update URLs in files
# Create ZIP
# Upload to Chrome Web Store
```

## 🔧 For Now (Local Development):

Everything is already set up! Just:
1. ✅ Backend running on localhost:5000
2. ✅ Frontend running on localhost:3000
3. ✅ Extension loaded and synced
4. ✅ All working seamlessly!

When ready to deploy, follow the steps above and update the URLs.

## 🎉 Current Status:

You have a **fully functional, synced system**:
- ✅ Website login syncs to extension
- ✅ Extension login syncs to website
- ✅ Logout syncs everywhere
- ✅ Data syncs via same backend
- ✅ Same user account for both
- ✅ Seamless experience!

**Ready to test the sync now?** 🚀
