# 🔧 EXACT STEPS TO DEBUG - NO MISTAKES

## Part 1: Reload Extension with Debug Logging

1. Open new tab: `chrome://extensions/`
2. Find: "LeetCode Revision Tracker"
3. Click: **Reload button** (↻ circular arrow icon)
4. ✅ Extension reloaded with debug logging enabled

## Part 2: Login and Check Console

### Step A: Open Popup Inspector
1. **Right-click** the extension icon (in toolbar)
2. Click: **"Inspect popup"** 
3. DevTools window opens
4. Click: **Console** tab
5. Keep this window OPEN

### Step B: Login
1. In the popup window (NOT DevTools), enter:
   - Email: (your email)
   - Password: (your password)
2. Click: **Login**

### Step C: Check Console Output
Look at the Console tab in DevTools. You should see:

**✅ SUCCESS looks like:**
```
Attempting login...
Login successful, saving token...
Token and user saved to chrome.storage.local
Verification - Token in storage: Yes
```

**❌ FAILURE looks like:**
```
Login error: [some error]
```
OR
```
Verification - Token in storage: No
```

### 👉 STOP HERE and tell me what you see in the console!

---

## Part 3: Verify Storage (ONLY if login succeeded)

In the popup DevTools **Console** tab, paste this EXACTLY and press Enter:

```javascript
chrome.storage.local.get(['token', 'user'], (result) => {
  console.log('=== STORAGE CHECK ===');
  console.log('Token:', result.token ? '✅ EXISTS (length: ' + result.token.length + ')' : '❌ MISSING');
  console.log('User:', result.user ? '✅ EXISTS (' + result.user.email + ')' : '❌ MISSING');
});
```

**Expected Output:**
```
=== STORAGE CHECK ===
Token: ✅ EXISTS (length: 180)
User: ✅ EXISTS (your@email.com)
```

### 👉 Tell me what this outputs!

---

## Part 4: Test Storage Access on LeetCode Page

1. Open: https://leetcode.com/problems/two-sum/
2. Press: **F12** (opens DevTools)
3. Click: **Console** tab
4. Paste this and press Enter:

```javascript
chrome.storage.local.get(['token'], (result) => {
  console.log('=== CONTENT SCRIPT STORAGE CHECK ===');
  console.log('Token:', result.token ? '✅ Can access token' : '❌ Cannot access token');
});
```

**Expected Output:**
```
=== CONTENT SCRIPT STORAGE CHECK ===
Token: ✅ Can access token
```

### 👉 Tell me what this outputs!

---

## Part 5: Click Button and Check Console

1. Still on LeetCode page with Console open (F12)
2. Find: "Add to Tracker" button (top-right of page)
3. Click: the button
4. Look at Console

**✅ SUCCESS looks like:**
```
Token from storage: Token exists
Token found, sending request to backend...
```

**❌ FAILURE looks like:**
```
No token in storage. User needs to login.
```

### 👉 Tell me what this outputs!

---

## 🎯 Alternative Test: Use Test Page

1. Open file: `extension/test-storage.html` in browser
2. Click: "Check Storage" button
3. See what it says

---

## 📋 What I Need From You

**After following the steps above, tell me:**

1. **Part 2 - Login Console Output:** (copy/paste what you see)
2. **Part 3 - Storage Check Output:** (copy/paste)
3. **Part 4 - Content Script Check Output:** (copy/paste)
4. **Part 5 - Button Click Output:** (copy/paste)

**Also answer:**
- Did you see "Login successful" message in popup?
- Did popup switch from login form to dashboard?
- Can you see your username in popup after login?

---

## 🔍 Quick Backend Check

In a new terminal, run:

```powershell
cd C:\Users\saich\Desktop\charan\ProjectX\backend
npm start
```

Make sure you see:
```
✅ Server running on port 5000
✅ MongoDB connected successfully
```

---

**Follow these steps EXACTLY and share the outputs. Then I can pinpoint the exact issue!** 🎯
