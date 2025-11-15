# AI Coach Feature - Quick Start Guide

## ✅ What's Been Implemented

### Backend Components
1. **AI Services** (`backend/ai-services/`)
   - `geminiService.js` - Google Gemini API integration
   - `aiCoachService.js` - Business logic with fallback
   - `index.js` - Service exports

2. **Database Model** (`backend/models/AICoachCache.js`)
   - Stores recommendations cache
   - Tracks refresh cooldown
   - Methods: `canRefresh()`, `getTimeUntilRefresh()`

3. **API Routes** (`backend/routes/aiCoach.js`)
   - `GET /api/ai-coach/dashboard` - Get topics + recommendations
   - `POST /api/ai-coach/refresh` - Manual refresh with cooldown check
   - `GET /api/ai-coach/insights` - AI insights
   - `GET /api/ai-coach/study-plan` - 7-day plan
   - `GET /api/ai-coach/performance` - Stats

4. **Cron Job** (`backend/services/aiCoachCron.js`)
   - Scheduled for 2:00 AM daily
   - Refreshes all users automatically
   - Timezone: Asia/Kolkata (configurable)

5. **Server Integration** (`backend/server.js`)
   - AI Coach routes mounted
   - Cron job initialized on startup

### Frontend Components
1. **AI Coach Component** (`frontend/src/components/AICoach.js`)
   - Displays strong/weak topics
   - Shows 5 recommended problems
   - Refresh button with cooldown timer
   - Loading and error states
   - Direct LeetCode links

2. **Test Dashboard Integration** (`frontend/src/pages/TestDashboard.js`)
   - AI Coach section added
   - Replaces "Coming Soon" placeholder

## 🎯 Current Configuration

- **Cooldown**: 0 minutes (development mode)
- **Production Cooldown**: 6 hours (configurable in `AICoachCache.js`)
- **Cron Schedule**: 2:00 AM daily
- **Gemini Model**: gemini-1.5-flash
- **Recommendations Count**: 5 problems per refresh

## 🚀 How to Use

### 1. Access the Feature
```
http://localhost:3000/test-dashboard
```
Scroll to the AI Coach section

### 2. View Your Data
- **Strong Topics**: Green badges (areas you excel at)
- **Weak Topics**: Red badges (areas to improve)
- **Recommendations**: 5 LeetCode problems from weak topics

### 3. Refresh Recommendations
- Click the "Refresh" button
- During cooldown: Button disabled with timer
- After cooldown: Generate new recommendations

## 📋 Quick Checklist

✅ Backend packages installed (`@google/generative-ai`, `node-cron`)  
✅ Gemini API key configured in `.env`  
✅ AI services created (geminiService, aiCoachService)  
✅ Database model created (AICoachCache)  
✅ API routes implemented (/dashboard, /refresh)  
✅ Cron job configured (2am daily)  
✅ Frontend component created (AICoach.js)  
✅ Test dashboard integrated  

## 🔧 Configuration Changes for Production

### 1. Change Cooldown to 6 Hours
In `backend/models/AICoachCache.js`, line ~25:
```javascript
cooldownHours: {
  type: Number,
  default: 6  // Change from 0 to 6
}
```

### 2. Set Environment
In `backend/.env`:
```env
NODE_ENV=production
```

### 3. Update Timezone (Optional)
In `backend/services/aiCoachCron.js`, line ~105:
```javascript
timezone: "Your/Timezone"  // e.g., "America/New_York"
```

## 🧪 Testing the Feature

### Test Flow:
1. ✅ Navigate to `/test-dashboard`
2. ✅ AI Coach section should load
3. ✅ Should see strong/weak topics (or loading state)
4. ✅ Should see 5 recommendations with LeetCode links
5. ✅ Click any problem link → Opens LeetCode
6. ✅ Click Refresh → Shows success or cooldown message
7. ✅ During cooldown → Button disabled with timer

### Check Backend Logs:
```bash
# Should see:
✅ MongoDB connected successfully
✅ Server is running on port 5000
✅ AI Coach cron job scheduled for 2am daily
```

## 📂 Key Files to Review

### Must-Review Files:
1. `backend/routes/aiCoach.js` - API endpoints
2. `backend/models/AICoachCache.js` - Cache + cooldown
3. `frontend/src/components/AICoach.js` - UI component
4. `backend/services/aiCoachCron.js` - Cron job

### Configuration Files:
- `backend/.env` - Gemini API key
- `backend/server.js` - Routes + cron initialization

## 🐛 Common Issues & Fixes

### Issue: "AI Coach not loading"
**Fix**: Check if backend is running and MongoDB is connected

### Issue: "Refresh button always disabled"
**Fix**: Cooldown is 0 in dev, should refresh immediately. Check cache model.

### Issue: "No recommendations showing"
**Fix**: Fallback system should activate. Check Gemini API key.

### Issue: "Cron job not running at 2am"
**Fix**: Verify `initAICoachCron()` is called in `server.js`

## 📊 Database Collection

New collection created: `aicoachcaches`

Schema:
```javascript
{
  userId: ObjectId,
  strongTopics: [String],
  weakTopics: [String],
  recommendations: [{ title, titleSlug, difficulty, topic, leetcodeUrl, reason }],
  lastRefreshed: Date,
  cooldownHours: Number
}
```

## 🎉 Feature Highlights

1. **Smart AI**: Uses Google Gemini for personalized recommendations
2. **Fallback System**: Hardcoded quality problems if AI fails
3. **Rate Limiting**: Cooldown prevents excessive API calls
4. **Automated**: Daily refresh at 2am keeps data fresh
5. **User-Friendly**: Clear UI with topics, problems, and timers
6. **Direct Links**: One-click access to LeetCode problems

## 📝 Next Steps (Optional)

- [ ] Test with real user data
- [ ] Monitor Gemini API usage
- [ ] Add more fallback problems
- [ ] Implement problem tracking (solved/attempted)
- [ ] Add user preferences for difficulty
- [ ] Create analytics dashboard

---

**Status**: ✅ FULLY IMPLEMENTED AND READY TO TEST

**Test URL**: http://localhost:3000/test-dashboard

**Documentation**: See `AI_COACH_COMPLETE.md` for full details
