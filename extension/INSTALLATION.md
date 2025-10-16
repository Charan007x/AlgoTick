# LeetCode Tracker Extension - Installation Guide

## ✅ Fixed Issues
- Created missing `content.css` file
- Removed icon file references (icons are optional for testing)
- Added missing permissions (notifications, contextMenus, alarms)
- Fixed notification code to work without icon files

## 🚀 Load the Extension

### Step 1: Open Extension Page
- **Chrome**: Navigate to `chrome://extensions/`
- **Edge**: Navigate to `edge://extensions/`

### Step 2: Enable Developer Mode
- Toggle **Developer mode** switch in the top-right corner

### Step 3: Load Extension
1. Click **Load unpacked** button
2. Navigate to: `C:\Users\saich\Desktop\charan\ProjectX\extension`
3. Click **Select Folder**

### Step 4: Verify Installation
✅ You should see "LeetCode Revision Tracker" in your extensions list
✅ Extension icon should appear in your browser toolbar
✅ No errors should be displayed

## 📝 Extension Files

All required files are now present:
- ✅ manifest.json (updated with all permissions)
- ✅ popup.html & popup.js (login/dashboard)
- ✅ content.js & content.css (LeetCode page integration)
- ✅ background.js (service worker)
- ✅ options.html & options.js (settings page)

## 🧪 Test the Extension

### Test 1: Login
1. Click the extension icon
2. Enter your credentials
3. Should show dashboard with stats

### Test 2: Add Button on LeetCode
1. Go to https://leetcode.com/problems/two-sum/
2. Look for "Add to Tracker" button (top-right)
3. Click to add the problem

### Test 3: Popup Dashboard
1. While on a LeetCode problem page
2. Click extension icon
3. Should detect and show current problem

### Test 4: Settings
1. Right-click extension icon → Options
2. Configure settings
3. Click Save Settings

## ⚠️ Prerequisites

Make sure these are running:
- ✅ Backend server: `http://localhost:5000`
- ✅ Frontend web app: `http://localhost:3000`
- ✅ MongoDB: Running locally

## 🎨 Optional: Add Icons Later

If you want custom icons, create PNG files (16x16, 32x32, 48x48, 128x128):
1. Place them in `extension/icons/` folder
2. Name them: icon16.png, icon32.png, icon48.png, icon128.png
3. Update manifest.json to include icon paths
4. Reload extension

## 🐛 Troubleshooting

### Extension won't load
- Make sure Developer mode is ON
- Check for error messages in red
- Verify all files are in the extension folder

### Can't see the button on LeetCode
- Make sure you're on a problem page (not problem list)
- Refresh the page after loading extension
- Check browser console (F12) for errors

### Login not working
- Verify backend is running on port 5000
- Check browser console for API errors
- Try opening: http://localhost:5000/api/auth/user

### Popup shows blank screen
- Right-click extension icon → Inspect popup
- Check console for JavaScript errors
- Verify popup.html and popup.js are present

## 📞 Quick Commands

Start backend:
```powershell
cd C:\Users\saich\Desktop\charan\ProjectX\backend
npm start
```

Start frontend:
```powershell
cd C:\Users\saich\Desktop\charan\ProjectX\frontend
npm start
```

Start MongoDB (if not running):
```powershell
net start MongoDB
```

## 🎉 You're Ready!

Once loaded, you can:
- ✨ Add problems from LeetCode pages with one click
- 📊 View your stats in the popup
- 🔔 Get daily reminder notifications
- ⚙️ Customize settings in options page
- 🌐 Open full dashboard from popup

Enjoy tracking your LeetCode journey! 💪
