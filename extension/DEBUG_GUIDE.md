# 🔍 DETAILED TROUBLESHOOTING GUIDE

## Step-by-Step Diagnosis

### Step 1: Reload Extension with Debug Logging

1. Go to `chrome://extensions/`
2. Find "LeetCode Revision Tracker"
3. Click **Reload** (↻ icon)

### Step 2: Open Popup and Inspect It

1. **Right-click** on the extension icon
2. Select **"Inspect popup"** (NOT just "Inspect")
3. A DevTools window will open
4. Click on the **Console** tab
5. Keep this window open

### Step 3: Login and Watch Console

In the popup (not the DevTools):
1. Enter your email
2. Enter your password
3. Click "Login"

In the DevTools Console, you should see:
```
✅ Attempting login...
✅ Login successful, saving token...
✅ Token and user saved to chrome.storage.local
✅ Verification - Token in storage: Yes
```

**If you see these ✅ messages, login worked!**

**If you see errors ❌, share them with me.**

### Step 4: Check Storage Directly

In the popup DevTools Console, paste this and press Enter:

```javascript
chrome.storage.local.get(['token', 'user'], (result) => {
  console.log('=== STORAGE CHECK ===');
  console.log('Token:', result.token ? '✅ EXISTS' : '❌ MISSING');
  console.log('User:', result.user ? '✅ EXISTS' : '❌ MISSING');
  if (result.token) {
    console.log('Token length:', result.token.length);
    console.log('Token preview:', result.token.substring(0, 20) + '...');
  }
  if (result.user) {
    console.log('User email:', result.user.email);
    console.log('Username:', result.user.username);
  }
});
```

**Expected output:**
```
=== STORAGE CHECK ===
Token: ✅ EXISTS
User: ✅ EXISTS
Token length: 180 (or similar)
Token preview: eyJhbGciOiJIUzI1NiIs...
User email: your@email.com
Username: yourname
```

### Step 5: Go to LeetCode and Check Console

1. Open https://leetcode.com/problems/two-sum/
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for: `LeetCode Tracker extension loaded!`

**If you see this ✅ = Content script loaded**

### Step 6: Click "Add to Tracker" Button

1. Click the button on the LeetCode page
2. Watch the Console

You should see:
```
✅ Token from storage: Token exists
✅ Token found, sending request to backend...
```

**If you see:**
```
❌ No token in storage. User needs to login.
```

This means the content script cannot access the token!

### Step 7: Test Storage Access from Content Script

On the LeetCode page, open Console (F12) and run:

```javascript
chrome.storage.local.get(['token'], (result) => {
  console.log('Content script storage check:');
  console.log('Token:', result.token ? '✅ EXISTS' : '❌ MISSING');
});
```

## 🐛 Common Issues & Fixes

### Issue 1: Token saves in popup but not visible to content script

**Cause:** Storage permission issue or context mismatch

**Fix:**
```javascript
// In popup DevTools Console, run:
chrome.storage.local.set({ 
  token: 'test123', 
  testTime: Date.now() 
}, () => {
  console.log('Test data saved');
});

// Then on LeetCode page Console, run:
chrome.storage.local.get(['token', 'testTime'], (result) => {
  console.log('Can content script see it?', result);
});
```

If content script can't see `testTime`, there's a storage isolation issue.

### Issue 2: Login appears successful but token not saved

**Check in popup DevTools Console:**
```javascript
// Try saving manually
chrome.storage.local.set({ manualTest: 'hello' }, () => {
  console.log('Set callback fired');
  chrome.storage.local.get(['manualTest'], (r) => {
    console.log('Retrieved:', r);
  });
});
```

### Issue 3: Backend not receiving token

**In LeetCode page Console after clicking button:**
```javascript
// Check what's being sent
fetch('http://localhost:5000/api/questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({ url: 'two-sum' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Replace `YOUR_TOKEN_HERE` with the actual token from storage.

## 🎯 Quick Diagnostic Commands

### Check Extension Manifest Permissions
```javascript
// In popup DevTools
chrome.permissions.getAll((permissions) => {
  console.log('Extension permissions:', permissions);
});
```

Should include: `storage`, `activeTab`, `tabs`

### Check Backend is Running
```javascript
// In any console
fetch('http://localhost:5000/api/auth/me')
  .then(r => console.log('Backend status:', r.status))
  .catch(e => console.error('Backend not reachable:', e));
```

Should return 401 (Unauthorized) - that's OK, means backend is running.

### Force Logout and Re-login
```javascript
// In popup DevTools
chrome.storage.local.clear(() => {
  console.log('Storage cleared. Now login again.');
});
```

## 📋 Checklist

Run through this checklist:

1. [ ] Backend running on port 5000?
   - Terminal shows "Server running on port 5000"
   
2. [ ] Extension loaded and enabled?
   - Green toggle in chrome://extensions/
   
3. [ ] Popup opens when clicking icon?
   - Shows login form or dashboard
   
4. [ ] Can login successfully?
   - No errors in popup console
   
5. [ ] Token saved in storage?
   - Run storage check command
   
6. [ ] Content script loaded on LeetCode?
   - See "extension loaded!" in page console
   
7. [ ] Content script can access storage?
   - Run storage check from page console
   
8. [ ] Button appears on page?
   - "Add to Tracker" visible top-right

## 🆘 Share These If Still Not Working

If still having issues, share these outputs:

1. **Popup Console after login** (screenshot or text)
2. **Storage check output** (from popup DevTools)
3. **LeetCode page console** (when clicking button)
4. **Content script storage check** (from LeetCode page)
5. **Backend terminal output** (any errors?)

## 🔧 Nuclear Option: Complete Reset

If nothing works:

```bash
1. Close all browser tabs
2. Go to chrome://extensions/
3. Remove extension (trash icon)
4. Restart browser
5. Go to chrome://extensions/
6. Load unpacked again
7. Open popup → Login
8. Test on fresh LeetCode tab
```

---

**Run through these steps and let me know what you find!**
