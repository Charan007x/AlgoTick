# LeetCode Fallback System Implementation

## Overview
Implemented a fallback system that fetches LeetCode submissions when AlgoTick revision data is insufficient (< 5 questions).

## Problem Solved
- **New users**: No AlgoTick data to generate AI insights
- **Inactive users**: Limited revision history in AlgoTick
- **Empty state**: Previously showed "No data yet" for everything

## Solution Architecture

### 1. New Database Collection
**File**: `backend/models/LeetCodeSubmission.js`

**Schema**:
```javascript
{
  userId: ObjectId,
  submissions: [{
    title: String,
    titleSlug: String,
    timestamp: Date,
    statusDisplay: String,
    difficulty: String,
    questionId: String,
    topics: [String],
  }],
  lastFetched: Date
}
```

**Features**:
- Stores last 20 LeetCode accepted submissions
- Cached for 24 hours (auto-refresh)
- Indexed on userId for fast queries

### 2. LeetCode API Integration
**File**: `backend/services/leetcodeService.js`

**New Functions**:

#### `fetchRecentSubmissions(username, limit)`
- Fetches last 20 accepted submissions from LeetCode GraphQL API
- Includes problem details (title, difficulty, topics)
- Returns detailed submission array

#### `saveLeetCodeSubmissions(userId, username)`
- Fetches submissions from LeetCode
- Saves to database with timestamp
- Returns saved document

#### `getLeetCodeSubmissions(userId, username)`
- Checks cache (24-hour TTL)
- Returns cached data if fresh
- Fetches new data if expired
- Smart caching strategy

#### `buildProfileFromLeetCodeSubmissions(submissions)`
- Converts LeetCode submissions to AlgoTick profile format
- Calculates topic breakdown
- Identifies strong/weak topics by frequency
- Returns profile data compatible with AI insights

### 3. AI Profile Service Updates
**File**: `backend/services/aiProfileService.js`

**Changes**:
```javascript
const MIN_QUESTIONS_THRESHOLD = 5;

async function buildUserProfile(userId) {
  // Fetch AlgoTick questions
  const questions = await Question.find({ userId });
  
  // Check if insufficient data
  if (questions.length < MIN_QUESTIONS_THRESHOLD) {
    // Try LeetCode fallback
    const user = await User.findById(userId);
    if (user.leetcodeUsername) {
      const leetcodeSubmissions = await getLeetCodeSubmissions(userId, user.leetcodeUsername);
      const leetcodeProfile = buildProfileFromLeetCodeSubmissions(leetcodeSubmissions);
      return leetcodeProfile; // Use LeetCode data
    }
  }
  
  // Continue with AlgoTick data
  // ...existing logic
}
```

**Logic Flow**:
1. Fetch AlgoTick questions
2. If < 5 questions → Try LeetCode fallback
3. Check if user has LeetCode username
4. Fetch/cache LeetCode submissions
5. Build profile from submissions
6. Return to AI insights generator

### 4. New API Endpoint
**File**: `backend/routes/ai.js`

**Endpoint**: `POST /api/ai/sync-leetcode`

**Purpose**: Manually sync LeetCode submissions

**Request**:
```javascript
// Requires authentication
POST /api/ai/sync-leetcode
Authorization: Bearer <token>
```

**Response**:
```json
{
  "message": "LeetCode submissions synced successfully",
  "submissionsCount": 20,
  "lastFetched": "2025-11-07T10:30:00.000Z"
}
```

**Error Responses**:
- 400: No LeetCode username in profile
- 500: LeetCode API error

## Data Flow Diagram

```
User Requests AI Insights
         ↓
Check AlgoTick Questions
         ↓
    < 5 Questions?
    /          \
  YES          NO
   ↓            ↓
Check LeetCode  Use AlgoTick
Username?       Data
   ↓
Fetch from
LeetCode API
   ↓
Cache in DB
(24 hours)
   ↓
Build Profile
   ↓
Generate AI
Insights
   ↓
Return to User
```

## Profile Data Comparison

### AlgoTick Data (Preferred)
```javascript
{
  totalSolved: 15,
  streak: 3,
  recentActivity: 5,
  revisionRate: 60%,        // Has revision data
  overdueQuestions: 2,       // Has reminders
  strongTopics: ["Array", "DP"],
  weakTopics: ["Graphs"],
  topicAccuracy: [           // Revision-based
    { topic: "Array", solved: 8, revised: 6, accuracy: 75% }
  ],
  dataSource: "algotick"
}
```

### LeetCode Fallback Data
```javascript
{
  totalSolved: 20,
  streak: 1,                 // Simplified (last 7 days)
  recentActivity: 5,
  revisionRate: 0,           // No revision data
  overdueQuestions: 0,       // No reminders
  strongTopics: ["Array", "Math"],  // By frequency
  weakTopics: ["Backtracking"],
  topicAccuracy: [           // Frequency-based
    { topic: "Array", solved: 12, revised: 0, accuracy: 0 }
  ],
  dataSource: "leetcode"     // Flag for fallback
}
```

## Usage Examples

### Automatic Fallback
When user has < 5 AlgoTick questions, system automatically:
1. Checks for LeetCode username
2. Fetches submissions (cached 24h)
3. Uses LeetCode data for AI insights

### Manual Sync
Frontend can trigger manual sync:
```javascript
// Frontend code
const syncLeetCode = async () => {
  const response = await fetch('/api/ai/sync-leetcode', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(`Synced ${data.submissionsCount} submissions`);
};
```

### AI Insights Generation
```javascript
// Works with both data sources
const profile = await buildUserProfile(userId);
// profile.dataSource = "algotick" or "leetcode"

const insights = await generateInsights(profile);
// AI adapts to data source automatically
```

## Caching Strategy

### Cache Duration
- **24 hours** for LeetCode submissions
- Prevents excessive API calls
- Balances freshness vs. performance

### Cache Invalidation
- Automatic: After 24 hours
- Manual: POST /api/ai/sync-leetcode
- First request: Always fetches fresh

### Performance Benefits
- **Fast**: ~50ms (cached) vs ~2s (API call)
- **Reliable**: Works even if LeetCode API is slow
- **Efficient**: Reduces API quota usage

## Error Handling

### Missing LeetCode Username
```javascript
if (!user.leetcodeUsername) {
  console.log('No LeetCode username, using minimal AlgoTick data');
  // Continue with available data
}
```

### LeetCode API Failure
```javascript
try {
  const leetcodeData = await getLeetCodeSubmissions(...);
} catch (error) {
  console.error('LeetCode fallback failed, using AlgoTick data');
  // Fall back to AlgoTick even if < 5 questions
}
```

### No Data Available
```javascript
if (questions.length === 0 && !leetcodeSubmissions) {
  return {
    message: 'No data available. Add questions or connect LeetCode.',
    // Return empty profile structure
  };
}
```

## Testing

### Test New User Flow
```bash
# 1. Create user with LeetCode username
POST /api/auth/register
{ 
  "username": "newuser",
  "leetcodeUsername": "leetcode_user"
}

# 2. Request AI insights (should trigger fallback)
GET /api/ai/insights

# 3. Check logs for:
# "⚠️ Insufficient AlgoTick data (0 < 5)"
# "🔄 Attempting LeetCode fallback..."
# "✅ Using LeetCode fallback with 20 submissions"
```

### Test Cache Behavior
```bash
# 1. First request (fetches from LeetCode)
POST /api/ai/sync-leetcode
# Response: "LeetCode submissions synced successfully"

# 2. Second request within 24h (uses cache)
POST /api/ai/sync-leetcode
# Logs: "✅ Using cached submissions (last fetched: ...)"

# 3. After 24h (fetches fresh)
POST /api/ai/sync-leetcode
# Logs: "🔄 Cache expired or missing, fetching fresh data..."
```

### Test Fallback Priority
```bash
# AlgoTick: 3 questions
# LeetCode: 20 submissions
# Result: Uses LeetCode (< 5 threshold)

# AlgoTick: 10 questions
# LeetCode: 20 submissions
# Result: Uses AlgoTick (>= 5 threshold)
```

## Configuration

### Threshold Setting
```javascript
// backend/services/aiProfileService.js
const MIN_QUESTIONS_THRESHOLD = 5;

// Adjust based on needs:
// Higher (10): More reliance on AlgoTick
// Lower (3): More use of LeetCode fallback
```

### Cache Duration
```javascript
// backend/services/leetcodeService.js
const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

// Adjust TTL:
// Shorter (12h): More fresh data, more API calls
// Longer (48h): Less API calls, less fresh data
```

### Submission Limit
```javascript
// backend/services/leetcodeService.js
const submissions = await fetchRecentSubmissions(username, 20);

// Adjust limit:
// More (50): Better topic coverage, slower
// Less (10): Faster, less data
```

## Future Enhancements

### 1. Smart Merging
Combine AlgoTick + LeetCode data:
```javascript
if (questions.length > 0 && questions.length < 10) {
  // Use both sources
  const algoTickProfile = buildFromAlgoTick(questions);
  const leetcodeProfile = buildFromLeetCode(submissions);
  return mergeProfiles(algoTickProfile, leetcodeProfile);
}
```

### 2. User Preference
Let users choose data source:
```javascript
user.preferences = {
  dataSource: "auto" | "algotick" | "leetcode" | "both"
};
```

### 3. Background Sync
Cron job to keep LeetCode data fresh:
```javascript
// Run daily at 3 AM
cron.schedule('0 3 * * *', async () => {
  // Sync all users with LeetCode usernames
});
```

### 4. Submission History
Track submission trends over time:
```javascript
submissions: [{
  // ...existing fields
  performance: {
    runtime: "100ms",
    memory: "15MB",
    beats: "85%"
  }
}]
```

## Production Checklist

- [x] Model created and exported
- [x] Service functions implemented
- [x] API endpoint added
- [x] Error handling in place
- [x] Logging for debugging
- [x] Cache strategy implemented
- [ ] Frontend UI for manual sync
- [ ] User notification when using fallback
- [ ] Analytics/metrics tracking
- [ ] Rate limiting for sync endpoint

## Summary

✅ **Implemented**:
- LeetCode submissions caching (24h TTL)
- Automatic fallback when < 5 AlgoTick questions
- Manual sync endpoint
- Profile building from LeetCode data
- Smart cache management

✅ **Benefits**:
- New users get immediate insights
- Inactive users have fallback data
- No "empty state" anymore
- Reduced manual data entry
- Better onboarding experience

✅ **Next Steps**:
1. Test with real LeetCode usernames
2. Add frontend sync button
3. Display data source indicator
4. Monitor cache hit rates
5. Add background sync cron job
