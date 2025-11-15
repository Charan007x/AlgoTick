# AI Coach - Quick Setup Guide

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install @google/generative-ai
```

### Step 2: Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 3: Add API Key to Environment

Open `backend/.env` and update:

```env
GEMINI_API_KEY=paste-your-actual-api-key-here
```

### Step 4: Register AI Routes

Open `backend/server.js` and add:

```javascript
// Import AI Coach routes
const aiCoachRoutes = require('./routes/aiCoach');

// Register the route (add with other routes)
app.use('/api/ai-coach', aiCoachRoutes);
```

### Step 5: Create Database Models (if not exists)

You'll need two models based on your MongoDB collections:

#### AIProfile Model (`backend/models/AIProfile.js`)
```javascript
const mongoose = require('mongoose');

const aiProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  lastUpdated: Date
}, { timestamps: true });

module.exports = mongoose.model('AIProfile', aiProfileSchema);
```

#### LeetCodeSubmission Model (`backend/models/LeetCodeSubmission.js`)
```javascript
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissions: [{
    title: String,
    titleSlug: String,
    timestamp: Date,
    statusDisplay: String,
    difficulty: String,
    questionId: String,
    topics: [String]
  }],
  lastFetched: Date
}, { timestamps: true });

module.exports = mongoose.model('LeetCodeSubmission', submissionSchema);
```

### Step 6: Update AI Coach Routes

Open `backend/routes/aiCoach.js` and replace the helper functions:

```javascript
// Add at the top
const AIProfile = require('../models/AIProfile');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');

// Replace the helper functions at the bottom
async function getAIProfile(userId) {
  return await AIProfile.findOne({ userId });
}

async function getLeetCodeSubmissions(userId) {
  return await LeetCodeSubmission.findOne({ userId });
}
```

### Step 7: Test the Setup

Start your backend:

```bash
cd backend
npm run dev
```

Test with cURL:

```bash
# Replace YOUR_JWT_TOKEN with your actual token
curl -X GET http://localhost:5000/api/ai-coach/insights \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 API Endpoints Available

Once setup is complete, you'll have these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai-coach/insights` | GET | Get AI-generated profile insights |
| `/api/ai-coach/study-plan` | GET | Get personalized 7-day study plan |
| `/api/ai-coach/recommendations` | GET | Get problem recommendations |
| `/api/ai-coach/chat` | POST | Chat with AI coach |
| `/api/ai-coach/performance` | GET | Get performance analytics |

## 🧪 Testing with Sample Data

If you want to test without real database data, you can modify the routes temporarily to use the sample data you provided:

```javascript
// In routes/aiCoach.js - for testing only
async function getAIProfile(userId) {
  // Return your sample aiProfile data
  return {
    profile: {
      totalSolved: 20,
      streak: 1,
      strongTopics: ["Sliding Window", "Array", "Hash Table"],
      weakTopics: ["Linked List", "Enumeration", "Simulation"],
      // ... rest of your data
    },
    // ... rest of fields
  };
}
```

## ⚠️ Troubleshooting

### Error: "GEMINI_API_KEY not found"
- Make sure you added the key to `backend/.env`
- Restart your server after adding the key
- Check for typos in the variable name

### Error: "AIProfile not found"
- Make sure your database has data in the `aiprofiles` collection
- Check that userId matches between collections
- Verify MongoDB connection is working

### Error: "Failed to generate insights"
- Check your Gemini API key is valid
- Verify you have internet connection
- Check API quota on Google AI Studio dashboard

## 📚 Next Steps

1. **Frontend Integration**: Create UI components to display insights
2. **Caching**: Implement Redis caching for frequently requested data
3. **Rate Limiting**: Add rate limiting to prevent API abuse
4. **Monitoring**: Set up logging and monitoring for AI requests

## 🔗 Useful Links

- [API Documentation](./README.md)
- [Google AI Studio Dashboard](https://makersuite.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)

---

**Need Help?** Check the detailed README in the ai-services folder.
