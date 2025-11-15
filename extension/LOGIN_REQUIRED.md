# 🔐 Login Required - Quick Fix

## The Issue:
You're seeing: **"Please login first (click extension icon)"**

This means:
- ✅ Extension is loaded correctly
- ✅ Button is working
- ✅ Backend is running
- ❌ **You need to login through the extension**

## 🎯 How to Login:

### Step 1: Click Extension Icon
Look at your browser toolbar (top-right) and click the **LeetCode Revision Tracker** icon.

### Step 2: Enter Credentials
In the popup that appears:
- Enter your **email** (the one you use for the web app)
- Enter your **password**
- Click **"Login"**

### Step 3: Verify Login
After login, you should see:
- ✅ Dashboard with stats
- ✅ Your username displayed
- ✅ 4 stat cards (Total Solved, Due Today, etc.)

### Step 4: Try Adding Again
Now go back to the LeetCode problem page and click **"Add to Tracker"** button again.
It should work! 🎉

## 🆕 Don't Have an Account Yet?

If you haven't created an account:

1. Click extension icon
2. Click **"Don't have an account? Sign up"**
3. Enter:
   - Username (e.g., "john")
   - Email (e.g., "john@email.com")
   - Password (min 6 characters)
4. Click **"Sign Up"**

## 🔍 Troubleshooting:

### Can't see extension icon?
- Look in the puzzle piece icon (Extensions menu)
- Pin the extension to toolbar

### Login button not responding?
- Make sure backend is running on port 5000
- Check terminal for backend errors
- Try: `cd backend && npm start`

### "Email already registered" error?
- Use the login form instead of signup
- Or use a different email

### Token expired?
- Just login again
- Extension will get a new 7-day token

## ✅ After Login:

Once logged in, you can:
- ✅ Add problems from LeetCode pages
- ✅ View stats in popup
- ✅ Open full dashboard
- ✅ Manage settings

The extension will remember you for 7 days (token expiry).

## 🎯 Quick Steps:

```
1. Click extension icon (toolbar)
2. Login with email + password
3. Close popup
4. Go back to LeetCode problem page
5. Click "Add to Tracker"
6. Success! 🎉
```

---

**Note:** Extension login is separate from leetcode.com login. You need to login to the **tracker** extension with the credentials you created for the web app.
