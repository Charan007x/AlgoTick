# 🚨 Quick Extension Troubleshooting

## "Extension Context Invalidated" Error

### ✅ Quick Fix (Do These in Order):

```
1. Go to chrome://extensions/
2. Find "LeetCode Revision Tracker"
3. Click the REFRESH/RELOAD icon ↻
4. Refresh your LeetCode page (F5)
5. Try again!
```

### 🔄 If Still Not Working:

**Close all LeetCode tabs and:**
1. Click extension icon to open popup
2. Right-click popup → Inspect
3. Check Console for errors
4. Share error messages if needed

## Common Issues & Instant Fixes:

### ❌ "Extension context invalidated"
**Fix**: Reload extension + Refresh page

### ❌ "Please login to add problems"
**Fix**: Click extension icon → Login

### ❌ Button not appearing on LeetCode
**Fix**: 
- Make sure you're on a problem page (not problems list)
- Refresh the page
- Check URL includes `/problems/[problem-name]`

### ❌ "Cannot read properties of undefined"
**Fix**: 
- Reload extension
- Clear extension data (Options → Clear All Data)
- Login again

### ❌ CORS error / Network error
**Fix**:
- Make sure backend is running: http://localhost:5000
- Check backend terminal for errors
- Try: `cd backend && npm start`

### ❌ "Token is not valid"
**Fix**:
- Your session expired (7 days)
- Click extension → Logout → Login again

## 🎯 After Every Extension Update:

```bash
1. Reload extension (chrome://extensions/)
2. Refresh all LeetCode tabs
3. Test login/logout
4. Test add button
```

## 🔍 Debug Checklist:

**Is backend running?**
- [ ] Visit http://localhost:5000/api/auth/me
- [ ] Should see JSON response (even if 401 Unauthorized)

**Is extension loaded?**
- [ ] Go to chrome://extensions/
- [ ] "LeetCode Revision Tracker" shows "Enabled"
- [ ] No error messages on extension card

**Is MongoDB running?**
- [ ] Open PowerShell
- [ ] Run: `net start MongoDB`
- [ ] Should see "service already started" or "started successfully"

**Are you logged in?**
- [ ] Click extension icon
- [ ] Should show dashboard, not login form
- [ ] Should see your username

**Is the page correct?**
- [ ] URL: https://leetcode.com/problems/[problem-name]/
- [ ] Not: https://leetcode.com/problemset/
- [ ] Wait 2 seconds after page load

## 💡 Prevention Tips:

1. **After editing extension files**: Always reload extension + refresh pages
2. **When starting work**: Start backend first, then open extension
3. **Before adding problems**: Make sure you're logged in
4. **Keep terminal visible**: Watch for backend errors

## 🆘 Still Stuck?

### Check These Terminals:

**Backend Terminal:**
```
Should see: 
✅ Server running on port 5000
✅ MongoDB connected successfully
❌ No error messages
```

**Extension Console (Popup Inspector):**
```
Right-click extension icon → Inspect
Should NOT see:
❌ "Extension context invalidated"
❌ "Cannot read properties"
❌ "Network error"
```

**LeetCode Page Console (F12):**
```
Should see:
✅ "LeetCode Tracker extension loaded!"
❌ No red errors
```

## 🎉 Everything Working Means:

- ✅ Extension icon shows in toolbar
- ✅ Clicking icon shows dashboard with stats
- ✅ "Add to Tracker" button visible on LeetCode problems
- ✅ Clicking button adds problem successfully
- ✅ Green notification shows "Problem added successfully! 🎉"
- ✅ No errors in any console

---

**Quick Recovery Command:**
```
1. Close all LeetCode tabs
2. chrome://extensions/ → Reload extension
3. Open fresh LeetCode problem page
4. Click extension icon to verify login
5. Test "Add to Tracker" button
```

Done! 🚀
