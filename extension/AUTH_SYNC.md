# 🔄 Authentication Sync Between Website & Extension

## ✅ What's New:

Your website (localhost:3000) and extension now **automatically sync authentication**!

## 🎯 How It Works:

### Scenario 1: Login via Website
1. Go to http://localhost:3000
2. Login with email + password
3. ✨ **Extension automatically gets logged in!**
4. Click extension icon → Already logged in!

### Scenario 2: Login via Extension
1. Click extension icon
2. Login with email + password
3. ✨ **Website automatically gets logged in!**
4. Open localhost:3000 → Already logged in!

### Scenario 3: Logout
- Logout from either place
- ✨ **Both get logged out automatically!**

## 🔧 How It's Implemented:

### sync.js (runs on localhost:3000)
- Monitors website's localStorage
- When you login on website → Syncs token to extension
- When you logout on website → Clears extension auth
- Runs every 5 seconds to keep in sync

### popup.js (extension)
- When you login via extension → Syncs token to website
- When you logout via extension → Clears website auth
- Sends message to all open localhost:3000 tabs

## 🧪 Test the Sync:

### Test 1: Website → Extension
```
1. Open http://localhost:3000
2. Login with credentials
3. Click extension icon
4. ✅ Should be already logged in!
```

### Test 2: Extension → Website
```
1. Click extension icon
2. Login with credentials
3. Open http://localhost:3000
4. ✅ Should be already logged in!
```

### Test 3: Logout Sync
```
1. Be logged in on both
2. Logout from website
3. Click extension icon
4. ✅ Should be logged out!
```

## 📋 What Gets Synced:

- ✅ JWT Token
- ✅ User information (email, username, id)
- ✅ Login state
- ✅ Logout state

## 🌐 For Production Deployment:

When you deploy, just update:

### In extension/manifest.json:
```json
"host_permissions": [
  "https://leetcode.com/*",
  "https://your-backend.com/*",
  "https://your-frontend.com/*"  // Your deployed website
],

"content_scripts": [
  {
    "matches": ["https://your-frontend.com/*"],
    "js": ["sync.js"],
    "run_at": "document_idle"
  }
]
```

### In extension/popup.js:
```javascript
const API_URL = 'https://your-backend.com/api';

// Update syncToWebsite function
chrome.tabs.query({ url: 'https://your-frontend.com/*' }, (tabs) => {
  // ... sync code
});
```

### In extension/sync.js:
No changes needed! It automatically works with the deployed URL.

## 🎉 Benefits:

1. **Seamless Experience**: Login once, use everywhere
2. **No Confusion**: Always in sync
3. **Better UX**: Users don't need to login twice
4. **Production Ready**: Easy to update URLs for deployment

## 🔍 How to Verify Sync:

Open browser console (F12) on localhost:3000:
- Look for: `✅ Auth synced from website to extension`
- Or: `✅ Received auth from extension`
- Or: `🔓 Cleared website auth from extension logout`

These messages confirm the sync is working!

## 🚀 Try It Now:

1. **Reload extension**: `chrome://extensions/` → Reload
2. **Test website login**: http://localhost:3000 → Login → Check extension
3. **Test extension login**: Extension icon → Login → Check website
4. **Test logout**: Logout from either → Check both

Everything stays in sync automatically! 🎊
