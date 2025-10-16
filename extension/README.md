# LeetCode Tracker Extension

A Chrome/Edge browser extension for tracking your LeetCode progress with spaced repetition reminders.

## Features

- **One-Click Add**: Add problems directly from LeetCode pages with a single click
- **Multiple Input Methods**: Support for problem numbers, URLs, or slugs
- **Spaced Repetition**: Automatic reminders at 7 days and 30 days
- **Dashboard Statistics**: Track total solved, pending, revised, and due problems
- **Browser Integration**: Seamlessly integrates with LeetCode.com
- **Popup Dashboard**: Quick access to your stats and recent problems

## Installation

### Prerequisites

1. Make sure your backend is running on `http://localhost:5000`
2. Make sure your frontend is running on `http://localhost:3000`

### Load Extension in Chrome/Edge

1. Open Chrome or Edge browser
2. Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `extension` folder: `c:\Users\saich\Desktop\charan\ProjectX\extension`
6. The extension should now appear in your extensions list

## Usage

### First Time Setup

1. Click the extension icon in your browser toolbar
2. Sign up or login with your credentials
3. Your account will be synced with the web app

### Adding Problems

**Method 1: From LeetCode Problem Page**
1. Visit any LeetCode problem page (e.g., `https://leetcode.com/problems/two-sum/`)
2. Click the "Add to Tracker" button that appears in the top-right corner
3. Problem will be automatically added with all details

**Method 2: From Extension Popup**
1. Click the extension icon
2. If you're on a LeetCode problem page, you'll see the current problem
3. Click "Add This Problem" button

**Method 3: Open Full Dashboard**
1. Click the extension icon
2. Click "Open Full Dashboard" to access the complete web interface

### Viewing Statistics

Click the extension icon to see:
- Total problems solved
- Problems due today
- Pending revisions
- Completed revisions

### Settings

1. Right-click the extension icon and select "Options"
2. Configure:
   - Backend API URL (if deployed elsewhere)
   - Enable/disable notifications
   - Auto-detect settings

## Extension Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── content.js            # Injected script for LeetCode pages
├── background.js         # Background service worker
├── options.html          # Settings page
├── options.js            # Settings logic
├── icons/                # Extension icons (to be added)
└── README.md             # This file
```

## Features in Detail

### Content Script (content.js)
- Runs on all LeetCode problem pages
- Extracts problem information (title, slug, difficulty)
- Injects "Add to Tracker" button
- Shows success/error notifications

### Popup (popup.html/js)
- Login/Signup interface
- Dashboard statistics
- Quick add current problem
- Link to full web dashboard

### Background Worker (background.js)
- Handles extension installation
- Manages authentication state
- Sends daily reminder notifications
- Context menu integration

### Options Page (options.html/js)
- Configure backend API URL
- Toggle notifications
- Clear local data
- About information

## API Integration

The extension connects to your local backend:
- **Backend**: `http://localhost:5000/api`
- **Frontend**: `http://localhost:3000`

All API calls use JWT authentication stored in `chrome.storage.local`.

## Icons

The extension currently needs icon files. You can create them or use placeholder icons:

Required sizes:
- 16x16 px (toolbar icon)
- 32x32 px (Windows)
- 48x48 px (extension management)
- 128x128 px (Chrome Web Store)

Place PNG icons in the `icons/` folder with names:
- `icon16.png`
- `icon32.png`
- `icon48.png`
- `icon128.png`

## Troubleshooting

### Extension not loading
- Make sure Developer mode is enabled
- Check if the manifest.json is valid
- Look for errors in `chrome://extensions/`

### Can't add problems
- Ensure you're logged in (click extension icon)
- Check if backend is running on port 5000
- Open browser console (F12) for error messages

### Button not appearing on LeetCode
- Refresh the LeetCode problem page
- Check if content script has permission in manifest
- Look for console errors on the LeetCode page

### Login issues
- Make sure backend is running
- Check API URL in extension settings
- Clear extension data: Options → Clear All Data

## Permissions Explained

- **storage**: Store authentication token and settings
- **activeTab**: Access current tab for problem detection
- **tabs**: Open full dashboard in new tab
- **leetcode.com**: Inject content script and add button
- **localhost:5000**: Make API calls to backend

## Development

### Testing Changes

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test the changes

### Debugging

- **Popup**: Right-click popup → Inspect
- **Content Script**: Open browser console (F12) on LeetCode page
- **Background**: Click "Inspect views: service worker" in extensions page

## Future Enhancements

- [ ] Add extension icons
- [ ] Dark mode support
- [ ] Keyboard shortcuts
- [ ] Quick stats in badge
- [ ] Filter/sort in popup
- [ ] Export/import data
- [ ] Sync with multiple devices

## License

MIT License - feel free to modify and distribute!

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend/frontend are running
3. Check extension permissions
4. Clear extension data and re-login

---

Built with ❤️ for LeetCode enthusiasts
