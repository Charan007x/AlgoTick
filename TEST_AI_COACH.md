# Test AI Coach Feature

## ✅ Fixed Issues

1. **Added Authentication Middleware** - All AI Coach routes now require authentication
2. **Fixed userId References** - Changed from `req.user.id` to `req.user.userId`
3. **Added Mock Data** - Helper functions now return mock data instead of null

## 🧪 How to Test

### 1. Navigate to Test Dashboard
```
http://localhost:3000/test-dashboard
```

### 2. Login First
Make sure you're logged in with a valid JWT token. The AI Coach component will automatically fetch data on load.

### 3. Test Refresh Button
- Click the **Refresh** button in the AI Coach section
- You should see:
  - Button shows "Refreshing..." with spinning icon
  - New recommendations are generated
  - Button becomes disabled (cooldown = 0 in dev, so it refreshes immediately)

### 4. What You Should See

**Strong Topics (Green Badges):**
- Sliding Window
- Array  
- Hash Table

**Weak Topics (Red Badges):**
- Linked List
- Enumeration
- Simulation

**Recommendations:**
5 LeetCode problems focusing on your weak topics, each with:
- Problem title
- Difficulty (Easy/Medium/Hard)
- Topic
- Direct LeetCode link (clickable)
- Reason for recommendation

### 5. Test Cooldown (Optional)
To test the 6-hour cooldown:

1. Open `backend/models/AICoachCache.js`
2. Change line ~25:
   ```javascript
   cooldownHours: { type: Number, default: 6 }
   ```
3. Restart server
4. Click refresh
5. Try refreshing again - should show "Please wait Xh Xm before refreshing"

## 🔍 Troubleshooting

### "Error loading AI coach" / "Failed to load AI coach data"
**Solution:** Check browser console for specific error. Make sure:
- Backend server is running
- You're logged in (check localStorage for 'token')
- MongoDB is connected

### Refresh Button Not Working
**Solution:** 
- Open browser DevTools → Network tab
- Click refresh button
- Check the POST request to `/api/ai-coach/refresh`
- Look for 401 (auth error) or 500 (server error)

### No Recommendations Showing
**Solution:** 
- Backend should use fallback system automatically
- Check backend console for errors
- Gemini API key might be invalid (fallback should still work)

## 📊 Mock Data Used

The system currently uses mock data:
```javascript
{
  strongTopics: ['Sliding Window', 'Array', 'Hash Table'],
  weakTopics: ['Linked List', 'Enumeration', 'Simulation'],
  totalProblems: 20,
  currentStreak: 1
}
```

## 🎯 Expected Behavior

1. **On Page Load:**
   - Shows loading skeleton
   - Fetches cached data if available
   - Shows strong/weak topics and recommendations

2. **On Refresh Click:**
   - Button shows "Refreshing..." with spinner
   - Calls Gemini API (or fallback if API fails)
   - Updates cache with new data
   - Shows success message
   - Button disabled until cooldown expires

3. **During Cooldown:**
   - Refresh button is grayed out
   - Shows timer: "⏰ Next refresh available in Xh Xm"
   - Button cursor changes to "not-allowed"

## 🚀 Production Ready

To deploy with 6-hour cooldown:
1. Change `cooldownHours: 0` to `cooldownHours: 6` in `AICoachCache.js`
2. Set `NODE_ENV=production` in backend `.env`
3. Cron job will auto-refresh all users daily at 2am

---

**Status:** ✅ Ready to test!  
**Test URL:** http://localhost:3000/test-dashboard  
**Refresh Button:** Located in AI Coach section header (top right)
