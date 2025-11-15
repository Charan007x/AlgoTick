# AI Coach Services Documentation

## 📁 Folder Structure

```
backend/ai-services/
├── geminiService.js      # Google Gemini API integration
├── aiCoachService.js     # AI Coach business logic
└── README.md            # This file

backend/routes/
└── aiCoach.js           # API routes for AI coach endpoints
```

## 🚀 Setup

### 1. Install Required Package

```bash
cd backend
npm install @google/generative-ai
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key
4. Add to `backend/.env`:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Register Routes in server.js

Add this to your `backend/server.js`:

```javascript
const aiCoachRoutes = require('./routes/aiCoach');

// ... other middleware ...

// Routes
app.use('/api/ai-coach', aiCoachRoutes);
```

## 📊 Data Models Required

### AIProfile Model Structure
Based on the provided MongoDB document:

```javascript
{
  userId: ObjectId,
  profile: {
    totalSolved: Number,
    streak: Number,
    topicAccuracy: [{
      topic: String,
      solved: Number,
      revised: Number,
      accuracy: Number,
      lastWeekCount: Number
    }],
    strongTopics: [String],
    weakTopics: [String]
  },
  weeklyGoal: {
    focusTopic: String,
    targetProblems: Number,
    expectedAccuracyImprovement: String
  },
  insights: [String],
  motivation: String,
  behavioralTips: [String],
  revisionFeedback: String,
  strengths: [{
    topic: String,
    comment: String
  }],
  weaknesses: [{
    topic: String,
    comment: String
  }],
  summary: String,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### LeetCodeSubmission Model Structure

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
    topics: [String]
  }],
  lastFetched: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 API Endpoints

### 1. Get AI Insights
```
GET /api/ai-coach/insights
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": [
      "✅ You're building strong fundamentals!",
      "💡 Consider focusing on Linked Lists next"
    ],
    "motivation": "Keep pushing forward! 🚀",
    "strengths": [
      {
        "topic": "Sliding Window",
        "comment": "Excellent mastery with 14 problems solved"
      }
    ],
    "weaknesses": [
      {
        "topic": "Linked List",
        "comment": "Needs more practice (only 1 problem)"
      }
    ],
    "behavioralTips": [
      "Set aside 30 minutes daily for focused practice",
      "Review old problems weekly to reinforce learning"
    ],
    "nextSteps": [
      "Solve 3 Linked List problems this week",
      "Review Sliding Window patterns"
    ],
    "generatedAt": "2025-11-15T10:00:00.000Z"
  }
}
```

### 2. Get Study Plan
```
GET /api/ai-coach/study-plan
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "weeklyPlan": [
      {
        "day": 1,
        "focus": "Linked List",
        "problems": ["Reverse Linked List", "Merge Two Sorted Lists"],
        "goal": "Master basic linked list operations",
        "estimatedTime": "1-2 hours"
      }
    ],
    "tips": [
      "Start each session reviewing yesterday's problems",
      "Take breaks every 45 minutes"
    ]
  }
}
```

### 3. Get Recommendations
```
GET /api/ai-coach/recommendations?count=5
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "title": "Remove Nth Node From End of List",
        "difficulty": "Medium",
        "topics": ["Linked List", "Two Pointers"],
        "reason": "Strengthen your weak area with a classic problem",
        "estimatedTime": "30-45 mins"
      }
    ]
  }
}
```

### 4. Chat with AI Coach
```
POST /api/ai-coach/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "How can I improve my linked list skills?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Great question! 🎯 Start with the basics...",
  "timestamp": "2025-11-15T10:00:00.000Z"
}
```

### 5. Get Performance Analysis
```
GET /api/ai-coach/performance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recentCount": 20,
    "difficultyDistribution": {
      "Easy": 8,
      "Medium": 10,
      "Hard": 2
    },
    "topTopics": [
      ["Sliding Window", 14],
      ["Array", 13],
      ["Hash Table", 8]
    ],
    "lastSubmission": "2025-11-14T17:03:17.000Z"
  }
}
```

## 🎨 Services Overview

### GeminiService (`geminiService.js`)

Core AI integration layer that communicates with Google's Gemini API.

**Methods:**
- `generateProfileInsights(aiProfile, submissions)` - Analyze user profile and generate insights
- `generateStudyPlan(aiProfile, submissions)` - Create personalized study plan
- `getRecommendations(aiProfile, submissions, count)` - Suggest next problems
- `chatWithCoach(userMessage, context)` - Interactive chat functionality

**Features:**
- Smart prompt engineering for better responses
- JSON response parsing with fallbacks
- Error handling and logging
- Configurable model (currently using gemini-1.5-flash)

### AICoachService (`aiCoachService.js`)

Business logic layer that orchestrates AI features.

**Methods:**
- `generateInsights(aiProfile, submissions)` - Get comprehensive insights
- `createStudyPlan(aiProfile, submissions)` - Generate study plan
- `getRecommendations(aiProfile, submissions, count)` - Get problem suggestions
- `chat(userMessage, context)` - Chat interface
- `analyzePerformance(submissions)` - Statistical analysis

**Features:**
- Fallback responses when AI is unavailable
- Performance metrics calculation
- Context building for personalized responses

## 🔧 Configuration

### Environment Variables

```env
# Required for AI features
GEMINI_API_KEY=your-api-key-here

# Optional configurations
GEMINI_MODEL=gemini-1.5-flash  # Default model
```

### Model Options

Available Gemini models:
- `gemini-1.5-flash` - Fast, efficient (recommended)
- `gemini-1.5-pro` - More capable, slower
- `gemini-1.0-pro` - Stable, proven

## 🧪 Testing

### Test with cURL

```bash
# Get insights
curl -X GET http://localhost:5000/api/ai-coach/insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Chat with coach
curl -X POST http://localhost:5000/api/ai-coach/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I improve?"}'
```

## 📝 Implementation Checklist

### Backend Setup
- [x] Create ai-services folder
- [x] Implement GeminiService
- [x] Implement AICoachService
- [x] Create API routes
- [ ] Add route to server.js
- [ ] Install @google/generative-ai package
- [ ] Add GEMINI_API_KEY to .env
- [ ] Create AIProfile model (if not exists)
- [ ] Create LeetCodeSubmission model (if not exists)
- [ ] Implement database queries in routes/aiCoach.js

### Frontend Integration (Next Steps)
- [ ] Create AI Coach component for Test Dashboard
- [ ] Add API client methods for AI endpoints
- [ ] Create chat interface UI
- [ ] Display insights and recommendations
- [ ] Show study plan visualization

## 🚨 Important Notes

1. **API Key Security**: Never commit your API key to git. Always use environment variables.

2. **Rate Limiting**: Gemini API has rate limits. Consider implementing caching for frequently requested data.

3. **Error Handling**: The service includes fallback responses when AI is unavailable.

4. **Data Privacy**: User data sent to Gemini should be anonymized if needed based on your privacy policy.

5. **Cost**: Monitor your API usage on Google AI Studio dashboard.

## 🔮 Future Enhancements

- [ ] Add conversation history for chat
- [ ] Implement caching for insights (24-hour cache)
- [ ] Add rate limiting per user
- [ ] Create scheduled jobs to update AI profiles
- [ ] Add A/B testing for different prompts
- [ ] Implement feedback mechanism for AI responses
- [ ] Add support for multiple AI providers (OpenAI, Anthropic)

## 📚 Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Quickstart](https://ai.google.dev/tutorials/quickstart)

---

**Created**: November 15, 2025  
**Status**: ✅ Ready for Integration  
**Next Step**: Install npm package and add your Gemini API key
