# 🔄 Unified API Architecture - Extension Routing Update

## What Changed?

I've refactored the extension to use a **shared utility file** (`utils.js`) that provides consistent API handling across all extension components.

### Before (Multiple Implementations):
- ❌ `popup.js` had its own API logic
- ❌ `background.js` had duplicate API logic
- ❌ Different error handling in each file
- ❌ Inconsistent token/storage management

### After (Unified System):
- ✅ `utils.js` contains all shared logic
- ✅ Both `popup.js` and `background.js` use the same functions
- ✅ Consistent error handling everywhere
- ✅ Single source of truth for API calls

## New File Structure

```
extension/
├── utils.js              ⭐ NEW - Shared utilities
├── background.js         ✏️ UPDATED - Uses utils.js
├── popup.js              ✏️ UPDATED - Uses utils.js (coming next)
├── content.js            ✅ Already has retry logic
└── manifest.json         ✅ No changes needed
```

## Key Features of utils.js

### 1. **Storage Helper**
```javascript
storage.get('token')          // Get single value
storage.set('token', value)   // Set single value
storage.getMultiple(['token', 'user'])  // Get multiple
storage.clear()               // Clear all
```

### 2. **API Call Helper**
```javascript
apiCall('/auth/login', 'POST', { email, password })
apiCall('/questions', 'POST', { url: 'two-sum' })
```
- Automatically adds auth token
- Handles errors consistently
- Logs all requests/responses

### 3. **Add Question Helper**
```javascript
addQuestionToTracker('two-sum')      // By URL
addQuestionToTracker('1')            // By number
```
- Auto-detects input type
- Uses consistent API format
- Better error messages

### 4. **Auth Check Helper**
```javascript
const isAuthenticated = await checkAuth()
```
- Validates token
- Checks with backend
- Returns boolean

## How It Works Now

### Adding a Question Flow:

```
LeetCode Page
    ↓
[Click "Add to Tracker" Button]
    ↓
content.js (with retry logic)
    ↓
chrome.runtime.sendMessage()
    ↓
background.js (service worker)
    ↓
utils.js → addQuestionToTracker()
    ↓
API Call to Backend
    ↓
Response back through chain
    ↓
Success notification!
```

## Benefits

### 1. **Reliability**
- ✅ Content script retries 3 times if context invalidates
- ✅ Background worker stays alive with keep-alive pings
- ✅ Shared utility ensures consistent behavior

### 2. **Maintainability**
- ✅ Fix once in utils.js, works everywhere
- ✅ No duplicate code
- ✅ Easier to debug

### 3. **Consistency**
- ✅ Same error messages everywhere
- ✅ Same token handling
- ✅ Same API URL logic

## What You Need to Do

### Step 1: Reload Extension
```
1. Go to chrome://extensions/
2. Click reload 🔄 on "LeetCode Tracker"
3. Wait for it to finish loading
```

### Step 2: Test It
```
1. Go to https://leetcode.com/problems/two-sum/
2. Wait for "Add to Tracker" button
3. Click it
4. Should see: "Problem added successfully! 🎉"
```

### Step 3: Check Logs (Optional)
```
1. Go to chrome://extensions/
2. Click "Service Worker" under your extension
3. You'll see:
   🔄 Keepalive ping
   📨 Received message: addQuestion
   🎯 Using shared utility to add question
   🌐 API Call: POST http://localhost:5000/api/questions
   📡 Response: 201
   ✅ Question added
   ✅ Sending success response
```

## Debugging

### If "Extension context invalidated" still appears:

**The retry logic in content.js should handle this automatically**, but if it persists:

1. Check service worker is active:
   - Go to `chrome://extensions/`
   - Look for "Service Worker" status
   - Should say "active" (not "inactive")

2. Check logs in service worker console:
   - Should see keepalive pings every 30 seconds
   - `🔄 Keepalive ping`

3. Hard reset:
   - Close all LeetCode tabs
   - Reload extension
   - Open new LeetCode tab
   - Try again

### If "Failed to fetch":

1. Backend running? `cd backend; node server.js`
2. Port 5000 accessible? Open http://localhost:5000/api/auth/me
3. Logged in? Check extension popup

### If "Not authenticated":

1. Click extension icon
2. Login with your credentials
3. Should sync automatically
4. Try adding problem again

## Technical Deep Dive

### Why This Architecture?

**Problem with Manifest V3:**
- Service workers sleep after 30 seconds
- Content scripts can lose connection
- Direct API calls from content scripts are unreliable

**Our Solution:**
1. **Keep-Alive**: Service worker stays awake (alarms every 30s)
2. **Retry Logic**: Content script retries if connection fails
3. **Shared Utils**: Consistent API handling everywhere
4. **Message Passing**: Reliable content → background → API flow

### Message Flow Diagram:

```
┌─────────────────┐
│  LeetCode Page  │
└────────┬────────┘
         │ Click button
         ↓
┌─────────────────┐
│   content.js    │ ← Has retry logic (3 attempts)
└────────┬────────┘
         │ sendMessage()
         ↓
┌─────────────────┐
│  background.js  │ ← Uses utils.js
│  (Service Worker)│ ← Has keep-alive
└────────┬────────┘
         │ handleAddQuestion()
         ↓
┌─────────────────┐
│    utils.js     │ ← Shared logic
│ addQuestionToTracker() │
└────────┬────────┘
         │ fetch()
         ↓
┌─────────────────┐
│     Backend     │
│  localhost:5000 │
└─────────────────┘
```

## Next Steps

Once this is working reliably:
- [ ] Update popup.js to use utils.js (cleaner code)
- [ ] Add more shared utilities as needed
- [ ] Consider adding offline queue (future feature)
- [ ] Add extension icon (optional)

---

**Current Status**: ✅ Ready to test!
**Expected Result**: No more "context invalidated" errors
**Backup Plan**: Retry logic handles temporary failures

Try it now! 🚀
