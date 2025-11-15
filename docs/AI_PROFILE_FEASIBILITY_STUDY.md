# AI Profile Feature - Feasibility Study

**Document Version:** 1.0  
**Date:** November 4, 2025  
**Status:** 🟢 **HIGHLY FEASIBLE**

---

## Executive Summary

The AI Profile feature described in `3.0.txt` is **technically feasible** with the current AlgoTick architecture. Implementation requires:
- **New MongoDB model** for storing AI profiles
- **Gemini API integration** (requires API key from user)
- **Backend cron job** for daily profile updates
- **Frontend dashboard** for displaying insights
- **Estimated Timeline:** 2-3 weeks for full implementation

**Risk Level:** Low  
**Technical Complexity:** Medium  
**ROI:** High (significant UX improvement)

---

## 1. Current System Analysis

### ✅ **What We Already Have**

| Component | Current Status | Usability for AI Profile |
|-----------|----------------|-------------------------|
| User Model | ✅ Exists | Has userId, googleId, email |
| Question Model | ✅ Exists | Has difficulty, tags, dates, revision tracking |
| Revision System | ✅ Exists | Tracks revisedDates, revisionCount, isRevised |
| Authentication | ✅ Complete | JWT + OAuth, secure endpoints |
| MongoDB | ✅ Configured | Atlas for production, local for dev |
| Cron Jobs | ✅ Exists | Already running reminder service |

### ❌ **What We Need to Add**

1. **AI Profile Model** (new schema)
2. **Gemini API Integration** (new service)
3. **Profile Generation Logic** (new service)
4. **AI Dashboard Route** (new frontend page)
5. **Daily Update Cron** (extend existing service)

---

## 2. Data Availability Assessment

### 📊 **Can We Generate the Required JSON?**

#### ✅ **Fields We Can Calculate:**

| Field | Source | Calculation Method |
|-------|--------|-------------------|
| `totalSolved` | Question.find({ userId, isDeleted: false }).count() | Query count |
| `streak` | Question.find({ userId }).sort({ dateAdded: -1 }) | Check consecutive days |
| `revisionPending` | Question.find({ userId, nextReminders: { $exists: true } }) | Count with future reminders |
| `activeTopics` | Question.aggregate by tags (last 7 days) | Group by tags, filter recent |
| `difficulty stats` | Question.aggregate by difficulty | Group by difficulty field |

#### ⚠️ **Fields Missing Data (Need New Tracking):**

| Field | Issue | Solution |
|-------|-------|----------|
| `averageAccuracy` | ❌ No "attempts" or "mistakes" tracking | **Add new fields:** `attempts`, `successfulAttempts` to Question model |
| `topic accuracy` | ❌ No per-topic success rate | Track `topicStats: { [topic]: { attempts, successes } }` in User model |
| `averageSolveTimeMinutes` | ❌ No time tracking | **Add field:** `solveTimeMinutes` to Question model |
| `timeOfDay` | ❌ No activity timestamp | Use `dateAdded` timestamps, aggregate by hour |

#### 🔧 **Recommended Schema Additions:**

**Question Model (add these fields):**
```javascript
attempts: {
  type: Number,
  default: 1 // First add is first attempt
},
solveTimeMinutes: {
  type: Number,
  default: null
},
topicPerformance: {
  type: Map,
  of: {
    attempts: Number,
    successes: Number
  }
}
```

**User Model (add these fields):**
```javascript
aiProfile: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'AIProfile'
},
streak: {
  type: Number,
  default: 0
},
lastActiveDate: {
  type: Date,
  default: Date.now
}
```

---

## 3. Technical Implementation Plan

### 🏗️ **Architecture Overview**

```
┌─────────────────┐
│  Frontend       │
│  (Dashboard)    │
└────────┬────────┘
         │ GET /api/ai/profile
         │ POST /api/ai/refresh
         ▼
┌─────────────────┐
│  Backend API    │
│  /routes/ai.js  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ MongoDB │ │ Gemini API   │
│ Profile │ │ (AI Service) │
└─────────┘ └──────────────┘
         ▲
         │ Daily Cron (00:00 UTC)
         │
┌─────────────────┐
│ Profile Service │
│ /services/      │
│ aiProfileService│
└─────────────────┘
```

### 📁 **New Files Required**

#### **Backend:**
1. `backend/models/AIProfile.js` - MongoDB schema
2. `backend/routes/ai.js` - API endpoints
3. `backend/services/aiProfileService.js` - Profile generation logic
4. `backend/services/geminiService.js` - Gemini API integration
5. `backend/middleware/aiRateLimit.js` - Rate limiting for AI calls

#### **Frontend:**
1. `frontend/src/pages/AICoach.js` - Main dashboard
2. `frontend/src/components/ai/InsightsCard.js` - Display insights
3. `frontend/src/components/ai/TrendChart.js` - Progress visualization
4. `frontend/src/components/ai/WeakTopics.js` - Weakness breakdown

---

## 4. API Integration Assessment

### 🤖 **Gemini API (Google AI)**

**Status:** ✅ **Fully Compatible**

| Aspect | Details |
|--------|---------|
| API Type | REST API (Google Generative AI) |
| Authentication | API Key (user will provide) |
| Rate Limits | Free tier: 60 requests/minute |
| Pricing | Free tier: 15 requests/minute, 1 million tokens/month |
| Node.js SDK | `@google/generative-ai` npm package |
| Response Format | JSON with generated text |

**Installation:**
```bash
npm install @google/generative-ai --save
```

**Sample Implementation:**
```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateInsights(profileJSON) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `You are AlgoTick AI — a personal coding coach.
Analyze this JSON performance profile and generate:
1. Three personalized insights (strengths, weaknesses, suggestions).
2. One weekly goal recommendation.
3. A short motivational message.

Profile: ${JSON.stringify(profileJSON)}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## 5. Implementation Roadmap

### 📅 **Phase 1: Data Collection (Week 1)**

**Goal:** Start tracking accuracy and timing data

- [ ] Update Question model with `attempts`, `solveTimeMinutes`
- [ ] Update User model with `streak`, `lastActiveDate`
- [ ] Modify `/api/questions` POST endpoint to accept these fields
- [ ] Update frontend to send timing data when adding questions
- [ ] Create migration script for existing data (set defaults)

**Deliverables:**
- Modified models
- Updated API endpoints
- Frontend form changes

---

### 📅 **Phase 2: Profile Generation (Week 2)**

**Goal:** Build AI profile generation system

- [ ] Create AIProfile model
- [ ] Build `aiProfileService.js` with calculation logic:
  - Calculate totalSolved, averageAccuracy
  - Aggregate topicStats from Question documents
  - Compute progressTrends (week-over-week)
  - Detect behavior patterns (timeOfDay, preferredDifficulty)
- [ ] Integrate Gemini API in `geminiService.js`
- [ ] Create `/api/ai/profile` GET endpoint
- [ ] Create `/api/ai/refresh` POST endpoint (manual refresh)
- [ ] Add daily cron job to auto-update profiles

**Deliverables:**
- AIProfile collection in MongoDB
- Profile generation working
- Gemini API returning insights

---

### 📅 **Phase 3: Frontend Dashboard (Week 3)**

**Goal:** Display AI insights in beautiful UI

- [ ] Create `/ai-coach` route in App.js
- [ ] Build AICoach dashboard page:
  - Profile summary cards
  - Insights from Gemini
  - Topic breakdown chart
  - Weekly goal section
  - Motivational message
- [ ] Add loading states and error handling
- [ ] Add manual refresh button
- [ ] Link to navbar

**Deliverables:**
- AI Coach page live
- Users can see insights
- Responsive design

---

## 6. Cost & Resource Analysis

### 💰 **Costs**

| Item | Cost | Notes |
|------|------|-------|
| Gemini API (Free Tier) | $0/month | 15 RPM, 1M tokens/month |
| Gemini API (Paid) | ~$0.50/1M tokens | If free tier exceeded |
| MongoDB Storage | $0 (Atlas Free) | ~10KB per profile |
| Development Time | 40-60 hours | 2-3 weeks part-time |

**Total Estimated Cost:** **$0-5/month** (stays free for <1000 users)

### 👨‍💻 **Developer Effort**

| Task | Hours | Complexity |
|------|-------|------------|
| Schema updates | 4h | Low |
| Profile generation logic | 8h | Medium |
| Gemini integration | 6h | Medium |
| API endpoints | 6h | Low |
| Cron job updates | 4h | Low |
| Frontend dashboard | 12-16h | Medium-High |
| Testing & debugging | 8h | Medium |
| **Total** | **48-52h** | **Medium** |

---

## 7. Risk Analysis

### ⚠️ **Potential Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Gemini API rate limits | Medium | High | Cache results, implement retry logic |
| Inaccurate insights (bad data) | Low | Medium | Add data validation, minimum data requirements |
| User privacy concerns | Low | High | Store profiles securely, allow opt-out |
| API key exposure | Medium | Critical | Use env variables, never commit to git |
| Performance degradation | Low | Medium | Run cron at low-traffic hours (midnight) |

### 🛡️ **Security Considerations**

1. **API Key Storage:** Store in `.env`, never in code
2. **Rate Limiting:** Max 5 AI requests per user per day
3. **Data Privacy:** Users can delete AI profiles anytime
4. **Input Validation:** Sanitize all data before sending to Gemini

---

## 8. Alternative Approaches

### 🔄 **Option A: Current Proposal (Gemini API)**
**Pros:** Advanced NLP, personalized insights, free tier  
**Cons:** External dependency, rate limits

### 🔄 **Option B: Rule-Based System (No AI)**
**Pros:** No external API, unlimited queries, predictable  
**Cons:** Less personalized, no natural language

### 🔄 **Option C: Hybrid (Rules + AI)**
**Pros:** Best of both, fallback if API fails  
**Cons:** More complex logic

**Recommendation:** Start with **Option A** (Gemini), add rule-based fallback later.

---

## 9. Success Metrics

### 📈 **KPIs to Track**

1. **User Engagement:**
   - % of users viewing AI Coach page
   - Average time spent on insights
   - Daily active users

2. **AI Quality:**
   - User ratings on insights (1-5 stars)
   - Click-through rate on recommendations
   - Topics improved after following suggestions

3. **Technical Performance:**
   - API response time (<2s)
   - Profile generation time (<30s)
   - Cron job success rate (>99%)

---

## 10. Final Recommendation

### ✅ **GO AHEAD WITH IMPLEMENTATION**

**Reasoning:**
1. **Technically Feasible:** All components are achievable with current stack
2. **Low Cost:** Free tier supports initial launch
3. **High Value:** Personalized coaching is a killer feature
4. **Manageable Scope:** 2-3 weeks for MVP

### 🚀 **Next Steps**

1. **Get Gemini API Key** from user
2. **Start Phase 1** (data collection updates)
3. **Build AIProfile model** and service
4. **Test with sample data** before full deployment
5. **Launch beta** with opt-in for early users

---

## 11. Sample API Key Setup

**Required from user:**
```env
# Add to backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get API key:**
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy and paste into `.env` file

---

## Appendix: Sample Profile Generation

**Input Data:**
- 120 questions solved
- 45 in Arrays (92% accuracy)
- 10 in Graphs (40% accuracy)
- Active for 14 consecutive days

**Generated Profile:**
```json
{
  "userId": "u123",
  "stats": {
    "totalSolved": 120,
    "averageAccuracy": 81,
    "streak": 14,
    "activeTopics": ["Arrays", "Binary Search"],
    "weakTopics": ["Graphs", "Recursion"],
    "revisionPending": 5
  },
  "topicStats": {
    "Arrays": { "solved": 45, "accuracy": 92, "trend": "+5%" },
    "Graphs": { "solved": 10, "accuracy": 40, "trend": "+1%" }
  },
  "progressTrends": {
    "lastWeekImprovement": "+6%",
    "strongestGrowth": "DP",
    "focusRecommendation": "Graphs"
  },
  "behavior": {
    "preferredDifficulty": "Medium",
    "timeOfDay": "Night",
    "averageSolveTimeMinutes": 14
  }
}
```

**AI-Generated Insights:**
```
✅ Your array skills are exceptional (92% accuracy)!
⚠️ Graphs need attention — only 40% accuracy but showing improvement.
🎯 This week's goal: Solve 3 graph problems (BFS, DFS, shortest path).
💬 14-day streak is incredible! Keep it up! 🔥
```

---

**End of Feasibility Study**

**Status:** 🟢 Ready to proceed  
**Confidence Level:** 95%  
**Waiting for:** Gemini API Key
