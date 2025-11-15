# AI Coach Feature - Complete Implementation

## Overview
The AI Coach feature provides personalized LeetCode problem recommendations based on user performance, focusing on weak topics to improve skills systematically.

## Features Implemented

### 1. **Topic Analysis**
- Displays strong topics (areas where user performs well)
- Displays weak topics (areas needing improvement)
- Based on LeetCode submission history and AI profile data

### 2. **Smart Recommendations**
- Generates 5 personalized LeetCode problems from weak topics
- Uses Google Gemini AI for intelligent recommendations
- Includes problem difficulty, topic, and direct LeetCode links
- Fallback system with hardcoded quality problems if AI fails

### 3. **Refresh System with Cooldown**
- **Cooldown Period**: 0 minutes (dev) / 6 hours (production)
- Refresh button shows cooldown timer
- Prevents excessive API calls
- Cached data served during cooldown

### 4. **Automated Daily Refresh**
- **Cron Job**: Runs daily at 2:00 AM
- Automatically refreshes recommendations for all users
- Ensures fresh recommendations each day

## File Structure

```
backend/
├── ai-services/
│   ├── geminiService.js       # Google Gemini API integration
│   ├── aiCoachService.js      # Business logic & fallbacks
│   └── index.js               # Service exports
├── models/
│   └── AICoachCache.js        # Cache model with cooldown
├── routes/
│   └── aiCoach.js             # API endpoints
├── services/
│   └── aiCoachCron.js         # Cron job scheduler
└── server.js                  # Express server with routes

frontend/
└── src/
    ├── components/
    │   └── AICoach.js         # React component
    └── pages/
        └── TestDashboard.js   # Integrated dashboard
```

## API Endpoints

### 1. GET `/api/ai-coach/dashboard`
**Description**: Get AI coach data with topics and recommendations

**Query Parameters**:
- `refresh=true` - Force refresh (respects cooldown)

**Response**:
```json
{
  "success": true,
  "data": {
    "strongTopics": ["Array", "Hash Table", "Sliding Window"],
    "weakTopics": ["Linked List", "Enumeration", "Simulation"],
    "recommendations": [
      {
        "title": "Reverse Linked List",
        "titleSlug": "reverse-linked-list",
        "difficulty": "Easy",
        "topic": "Linked List",
        "leetcodeUrl": "https://leetcode.com/problems/reverse-linked-list/",
        "reason": "Foundation problem for linked list manipulation"
      }
    ],
    "lastRefreshed": "2025-01-16T10:30:00.000Z",
    "canRefresh": false,
    "timeUntilRefresh": {
      "hours": 5,
      "minutes": 30,
      "canRefresh": false
    },
    "cached": true
  }
}
```

### 2. POST `/api/ai-coach/refresh`
**Description**: Manually refresh recommendations

**Response**: Same as dashboard endpoint
**Error (429)**: Returns cooldown message if refresh not allowed

### 3. GET `/api/ai-coach/insights`
**Description**: Get AI-generated insights about performance

### 4. GET `/api/ai-coach/study-plan`
**Description**: Get 7-day personalized study plan

### 5. GET `/api/ai-coach/performance`
**Description**: Get statistical analysis of performance

## Configuration

### Environment Variables
Add to `backend/.env`:
```env
GEMINI_API_KEY=AIzaSyAf5lRpIan72fEPoN1w1UqvltAFPEAp-D8
NODE_ENV=development
```

### Cooldown Configuration
In `backend/models/AICoachCache.js`:
```javascript
cooldownHours: {
  type: Number,
  default: 0  // Change to 6 for production
}
```

### Cron Schedule
In `backend/services/aiCoachCron.js`:
```javascript
cron.schedule('0 2 * * *', async () => {
  await refreshAllUsers();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"  // Change to your timezone
});
```

## Database Schema

### AICoachCache Model
```javascript
{
  userId: ObjectId,              // User reference
  strongTopics: [String],        // Strong topic names
  weakTopics: [String],          // Weak topic names
  recommendations: [{            // Problem recommendations
    title: String,
    titleSlug: String,
    difficulty: String,
    topic: String,
    leetcodeUrl: String,
    reason: String
  }],
  lastRefreshed: Date,           // Last refresh timestamp
  cooldownHours: Number          // Cooldown period (0 or 6)
}
```

## Usage

### Access the Feature
1. Navigate to Test Dashboard: `http://localhost:3000/test-dashboard`
2. Scroll to the AI Coach section
3. View strong/weak topics and recommendations
4. Click refresh button when available

### For Production Deployment
1. Change cooldown to 6 hours:
   ```javascript
   // In AICoachCache.js
   cooldownHours: { type: Number, default: 6 }
   ```

2. Set production environment:
   ```env
   NODE_ENV=production
   ```

3. Configure timezone for cron job in `aiCoachCron.js`

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Login and navigate to `/test-dashboard`
3. Observe AI Coach section loading
4. Test refresh button
5. Check cooldown timer display

### Test Endpoints with curl/Postman
```bash
# Get dashboard data
curl http://localhost:5000/api/ai-coach/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Refresh recommendations
curl -X POST http://localhost:5000/api/ai-coach/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Features in Detail

### 1. Gemini AI Integration
- Model: `gemini-1.5-flash`
- Safety settings configured
- Structured JSON responses
- Automatic retry logic

### 2. Fallback System
- Activates if Gemini API fails
- Contains real LeetCode problems
- Organized by topic:
  - Linked List (3 problems)
  - Tree (3 problems)
  - Dynamic Programming (3 problems)
  - Graph (3 problems)
  - Binary Search (3 problems)

### 3. Caching Strategy
- Database-backed caching
- Respects cooldown period
- Automatic cache invalidation
- Serves cached data during cooldown

### 4. Cooldown Timer
- Real-time countdown display
- Shows hours and minutes remaining
- Button disabled during cooldown
- Visual feedback with colors

## UI Components

### Strong Topics Display
- Green pills/badges
- Shows mastered areas
- Positive reinforcement

### Weak Topics Display
- Red pills/badges
- Highlights improvement areas
- Focus for recommendations

### Recommendations List
- Card-based layout
- Difficulty badges (Easy/Medium/Hard)
- Direct LeetCode links
- Hover effects and animations
- Reason for recommendation

### Refresh Button
- Animated refresh icon
- Disabled state during cooldown
- Loading state during refresh
- Cooldown timer message

## Maintenance

### Monitoring Cron Jobs
Check logs for cron execution:
```bash
# Look for these log messages:
[Cron] AI Coach cron job scheduled for 2am daily
[Cron] Starting daily AI coach refresh at 2am...
[Cron] Found X users to refresh
[Cron] Successfully refreshed data for user: <userId>
[Cron] Daily refresh completed successfully
```

### Troubleshooting

**Issue**: Recommendations not loading
- Check Gemini API key in `.env`
- Verify internet connection
- Check backend logs for errors
- Fallback should activate automatically

**Issue**: Refresh button always disabled
- Check cooldown settings
- Verify cache document exists
- Check `canRefresh()` method logic

**Issue**: Cron job not running
- Verify `initAICoachCron()` called in `server.js`
- Check timezone configuration
- Verify `node-cron` package installed

## Future Enhancements
- [ ] Add more fallback problems
- [ ] User preferences for topics
- [ ] Problem tracking (solved/attempted)
- [ ] Progress analytics
- [ ] Custom difficulty selection
- [ ] Topic-specific study plans

## Dependencies
```json
{
  "@google/generative-ai": "^latest",
  "node-cron": "^latest",
  "mongoose": "^latest"
}
```

## Credits
- Google Gemini AI for recommendations
- LeetCode for problem database
- User data structure based on existing AlgoTick schema
