const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini AI with new SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * Generate AI insights from user profile data
 * @param {Object} profileData - User's performance profile
 * @returns {Promise<Object>} AI-generated insights
 */
async function generateInsights(profileData) {
  try {
    console.log('🤖 [generateInsights] Input profileData:', JSON.stringify(profileData, null, 2));
    
    const prompt = `You are AlgoTick AI — a personal coding coach for LeetCode problem solving.
Analyze this user's performance profile and generate detailed coaching insights with specific metrics.

**Profile Data:**
- Total problems solved: ${profileData.totalSolved}
- Streak: ${profileData.streak} days
- Recent activity: ${profileData.recentActivity}
- Overall revision rate: ${profileData.revisionRate}%
- Overdue questions: ${profileData.overdueQuestions}
- Strong topics (high accuracy): ${profileData.strongTopics.join(', ')}
- Weak topics (low accuracy): ${profileData.weakTopics.join(', ')}
- Detailed topic accuracy: ${JSON.stringify(profileData.topicAccuracy, null, 2)}

**IMPORTANT:**
- Include ACTUAL accuracy percentages in comments (e.g., "High accuracy (92%)")
- Mention specific metrics from the data above
- Reference problem counts, revision rates, overdue questions
- Strong/weak topics are pre-determined, explain WHY with data

**Generate a JSON response with this EXACT structure:**
{
  "summary": "Brief assessment mentioning streak, revision rate, and overall performance",
  "strengths": [
    { "topic": "TopicName", "comment": "High accuracy (XX%) with Y problems solved" },
    { "topic": "TopicName", "comment": "Z% accuracy and improving/consistent growth" }
  ],
  "weaknesses": [
    { "topic": "TopicName", "comment": "Low accuracy (XX%) needs focused practice" },
    { "topic": "TopicName", "comment": "Needs review; accuracy at YY% with Z problems" }
  ],
  "revisionFeedback": "XX% completion rate — mention consistency, overdue questions, and patterns",
  "behavioralTips": [
    "Specific tip based on practice patterns, time, or distribution",
    "Actionable recommendation to improve weak areas or maintain strengths"
  ],
  "weeklyGoal": {
    "focusTopic": "Weakest topic from data",
    "targetProblems": 5-10,
    "expectedAccuracyImprovement": "+5% to +15%"
  }
}

Rules:
1. Use exact topics from strongTopics and weakTopics arrays
2. Include actual accuracy % from topicAccuracy data in EVERY comment
3. Mention problem counts (solved: X, revised: Y) where relevant
4. Reference overall revision rate (${profileData.revisionRate}%) in revisionFeedback
5. Mention overdue questions (${profileData.overdueQuestions}) if > 0
6. Provide 2-3 specific, actionable behavioral tips
7. Set weekly goal with realistic targets based on weakest topic
8. Keep each comment under 80 characters but MUST include metrics
9. Return ONLY valid JSON, no markdown formatting

Example formats:
- "High accuracy (92%) and improving +5% this week"
- "Low accuracy (42%) but trending positive"
- "Needs review; accuracy dropping to 45%"
- "${profileData.revisionRate}% completion rate — good consistency, but ${profileData.overdueQuestions} overdue questions"
`;
    
    // Use new SDK syntax
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster responses
        },
      },
    });
    
    let responseText = response.text;
    
    console.log('🤖 [generateInsights] Raw AI response:', responseText);
    
    // Clean markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON response
    let aiData;
    try {
      aiData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response was:', responseText);
      throw new Error('Invalid JSON response from AI');
    }
    
    console.log('🤖 [generateInsights] Parsed AI data:', JSON.stringify(aiData, null, 2));
    
    // Validate and ensure required fields
    return {
      summary: aiData.summary || "Building coding skills with consistent practice.",
      strengths: aiData.strengths || [],
      weaknesses: aiData.weaknesses || [],
      revisionFeedback: aiData.revisionFeedback || "Keep maintaining consistency in your practice.",
      behavioralTips: aiData.behavioralTips || ["Practice regularly to build momentum."],
      weeklyGoal: aiData.weeklyGoal || {
        focusTopic: profileData.strongTopics[0] || "Mixed Topics",
        targetProblems: 5,
        expectedAccuracyImprovement: "+5%"
      }
    };
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    
    // Build fallback insights with actual data
    const strongTopicData = profileData.topicAccuracy?.find(t => t.topic === profileData.strongTopics[0]);
    const weakTopicData = profileData.topicAccuracy?.find(t => t.topic === profileData.weakTopics[0]);
    
    const strengths = [];
    if (strongTopicData) {
      strengths.push({
        topic: strongTopicData.topic,
        comment: `High accuracy (${strongTopicData.accuracy}%) with ${strongTopicData.solved} problems`
      });
    }
    
    const secondStrongTopic = profileData.topicAccuracy?.find(t => t.topic === profileData.strongTopics[1]);
    if (secondStrongTopic) {
      strengths.push({
        topic: secondStrongTopic.topic,
        comment: `${secondStrongTopic.accuracy}% accuracy with ${secondStrongTopic.revised} revised`
      });
    }
    
    const weaknesses = [];
    if (weakTopicData) {
      weaknesses.push({
        topic: weakTopicData.topic,
        comment: `Low accuracy (${weakTopicData.accuracy}%) needs focused practice`
      });
    }
    
    const secondWeakTopic = profileData.topicAccuracy?.find(t => t.topic === profileData.weakTopics[1]);
    if (secondWeakTopic) {
      weaknesses.push({
        topic: secondWeakTopic.topic,
        comment: `Only ${secondWeakTopic.solved} solved at ${secondWeakTopic.accuracy}% accuracy`
      });
    }
    
    // Return fallback insights with actual metrics
    return {
      summary: `${profileData.streak}-day streak with ${profileData.revisionRate}% revision rate.`,
      strengths: strengths.length > 0 ? strengths : [
        { topic: profileData.strongTopics[0] || "Arrays", comment: "Most practiced topic with good progress" }
      ],
      weaknesses: weaknesses.length > 0 ? weaknesses : [
        { topic: profileData.weakTopics[0] || "Graphs", comment: "Needs more practice and focus" }
      ],
      revisionFeedback: `${profileData.revisionRate}% completion rate — ${
        profileData.overdueQuestions > 0 
          ? `${profileData.overdueQuestions} overdue questions need attention`
          : 'good consistency'
      }.`,
      behavioralTips: [
        "Try solving problems at the same time each day for better retention.",
        `Focus on ${profileData.weakTopics[0] || 'weak areas'} to improve overall balance.`
      ],
      weeklyGoal: {
        focusTopic: profileData.weakTopics[0] || "Graphs",
        targetProblems: 5,
        expectedAccuracyImprovement: "+5%"
      }
    };
  }
}

module.exports = {
  generateInsights
};
