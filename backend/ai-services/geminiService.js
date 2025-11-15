const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      this.model = null;
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate AI insights based on user's coding profile
   */
  async generateProfileInsights(aiProfile, submissions) {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    const prompt = this.buildProfileAnalysisPrompt(aiProfile, submissions);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseInsightsResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate AI insights: ' + error.message);
    }
  }

  /**
   * Generate personalized study plan
   */
  async generateStudyPlan(aiProfile, submissions) {
    if (!this.model) {
      throw new Error('Gemini API not configured.');
    }

    const prompt = this.buildStudyPlanPrompt(aiProfile, submissions);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseStudyPlanResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate study plan: ' + error.message);
    }
  }

  /**
   * Get problem recommendations
   */
  async getRecommendations(aiProfile, submissions, count = 5) {
    if (!this.model) {
      throw new Error('Gemini API not configured.');
    }

    const prompt = this.buildRecommendationsPrompt(aiProfile, submissions, count);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseRecommendationsResponse(text);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate recommendations: ' + error.message);
    }
  }

  // ============ PROMPT BUILDERS ============

  buildProfileAnalysisPrompt(aiProfile, submissions) {
    const recentSubmissions = submissions.submissions.slice(0, 10);
    
    return `
You are an expert coding mentor analyzing a student's LeetCode progress. Provide insightful, actionable feedback.

## User Profile:
- Total Problems Solved: ${aiProfile.profile.totalSolved}
- Current Streak: ${aiProfile.profile.streak} days
- Revision Rate: ${aiProfile.revisionFeedback}

## Strong Topics (Top 3):
${aiProfile.profile.strongTopics.map((topic, i) => {
  const topicData = aiProfile.profile.topicAccuracy.find(t => t.topic === topic);
  return `${i + 1}. ${topic}: ${topicData.solved} problems solved, ${topicData.lastWeekCount} in last week`;
}).join('\n')}

## Weak Topics (Bottom 3):
${aiProfile.profile.weakTopics.map((topic, i) => {
  const topicData = aiProfile.profile.topicAccuracy.find(t => t.topic === topic);
  return `${i + 1}. ${topic}: ${topicData.solved} problems solved`;
}).join('\n')}

## Recent Submissions (Last 10):
${recentSubmissions.map((sub, i) => 
  `${i + 1}. ${sub.title} (${sub.difficulty}) - ${sub.topics.join(', ')}`
).join('\n')}

## Current Weekly Goal:
- Focus Topic: ${aiProfile.weeklyGoal.focusTopic}
- Target: ${aiProfile.weeklyGoal.targetProblems} problems
- Expected Improvement: ${aiProfile.weeklyGoal.expectedAccuracyImprovement}

Please provide a JSON response with the following structure:
{
  "insights": ["3-4 key insights as bullet points with emojis"],
  "motivation": "A short, inspiring message",
  "strengths": [{"topic": "...", "comment": "..."}],
  "weaknesses": [{"topic": "...", "comment": "..."}],
  "behavioralTips": ["3-4 actionable study tips"],
  "nextSteps": ["3-4 specific action items for improvement"]
}

Keep it concise, encouraging, and actionable. Use emojis to make it engaging.
`;
  }

  buildStudyPlanPrompt(aiProfile, submissions) {
    return `
Create a personalized 7-day study plan for this coder:

## Profile Summary:
- Solved: ${aiProfile.profile.totalSolved} problems
- Streak: ${aiProfile.profile.streak} days
- Strong: ${aiProfile.profile.strongTopics.join(', ')}
- Weak: ${aiProfile.profile.weakTopics.join(', ')}
- Focus Topic: ${aiProfile.weeklyGoal.focusTopic}

## Recent Activity:
${submissions.submissions.slice(0, 5).map((sub, i) => 
  `${i + 1}. ${sub.difficulty} - ${sub.topics.join(', ')}`
).join('\n')}

Provide a JSON response:
{
  "weeklyPlan": [
    {
      "day": 1,
      "focus": "Topic name",
      "problems": ["Problem name 1", "Problem name 2"],
      "goal": "Clear goal for the day",
      "estimatedTime": "1-2 hours"
    }
  ],
  "tips": ["Daily tips for success"]
}
`;
  }

  buildRecommendationsPrompt(aiProfile, submissions, count) {
    const weakTopics = aiProfile.profile.weakTopics;
    
    return `
You are a LeetCode problem recommender. Based on the user's weak topics, recommend ${count} ACTUAL LeetCode problems.

## User's Weak Topics (Need Practice):
${weakTopics.map((topic, i) => {
  const topicData = aiProfile.profile.topicAccuracy.find(t => t.topic === topic);
  return `${i + 1}. ${topic}: Only ${topicData?.solved || 0} problems solved`;
}).join('\n')}

## Recently Solved (Don't recommend these):
${submissions.submissions.slice(0, 10).map(sub => sub.titleSlug).join(', ')}

Recommend ${count} REAL LeetCode problems that:
1. Focus on the weak topics: ${weakTopics.join(', ')}
2. Start with Easy/Medium difficulty
3. Are foundational problems for these topics
4. Use actual LeetCode problem titles (e.g., "Two Sum", "Reverse Linked List")

Provide JSON response with REAL problem names:
{
  "recommendations": [
    {
      "title": "Actual LeetCode Problem Title",
      "titleSlug": "actual-leetcode-slug",
      "difficulty": "Easy/Medium/Hard",
      "topics": ["Topic1", "Topic2"],
      "reason": "Why this helps with weak topic",
      "leetcodeUrl": "https://leetcode.com/problems/slug/",
      "estimatedTime": "20-30 mins"
    }
  ]
}

IMPORTANT: Use only real LeetCode problem names that exist on leetcode.com.
`;
  }

  // ============ RESPONSE PARSERS ============

  parseInsightsResponse(text) {
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Failed to parse insights response:', error);
      // Return fallback structure
      return {
        insights: [text.substring(0, 200)],
        motivation: "Keep pushing forward! 🚀",
        strengths: [],
        weaknesses: [],
        behavioralTips: [],
        nextSteps: []
      };
    }
  }

  parseStudyPlanResponse(text) {
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Failed to parse study plan response:', error);
      return {
        weeklyPlan: [],
        tips: [text.substring(0, 200)]
      };
    }
  }

  parseRecommendationsResponse(text) {
    try {
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleanText);
    } catch (error) {
      console.error('Failed to parse recommendations response:', error);
      return {
        recommendations: []
      };
    }
  }
}

module.exports = new GeminiService();
