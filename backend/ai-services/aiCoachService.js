const geminiService = require('./geminiService');
const { LEETCODE_PROBLEMS_BY_TOPIC } = require('../data/leetcodeProblems');

class AICoachService {
  /**
   * Generate comprehensive AI insights for user
   */
  async generateInsights(aiProfile, submissions) {
    try {
      const insights = await geminiService.generateProfileInsights(aiProfile, submissions);
      
      return {
        success: true,
        data: {
          ...insights,
          generatedAt: new Date(),
          profileVersion: aiProfile.updatedAt
        }
      };
    } catch (error) {
      console.error('AI Coach - Generate Insights Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackInsights(aiProfile)
      };
    }
  }

  /**
   * Create personalized study plan
   */
  async createStudyPlan(aiProfile, submissions) {
    try {
      const plan = await geminiService.generateStudyPlan(aiProfile, submissions);
      
      return {
        success: true,
        data: plan
      };
    } catch (error) {
      console.error('AI Coach - Study Plan Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackStudyPlan(aiProfile)
      };
    }
  }

  /**
   * Get problem recommendations
   */
  async getRecommendations(aiProfile, submissions, count = 5) {
    try {
      const recommendations = await geminiService.getRecommendations(aiProfile, submissions, count);
      
      return {
        success: true,
        data: recommendations
      };
    } catch (error) {
      console.error('AI Coach - Recommendations Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackRecommendations(aiProfile)
      };
    }
  }

  /**
   * Analyze recent performance
   */
  analyzePerformance(submissions) {
    const recentSubmissions = submissions.submissions.slice(0, 20);
    
    // Calculate statistics
    const difficultyCount = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    };
    
    const topicFrequency = {};
    const dailyActivity = {};
    
    recentSubmissions.forEach(sub => {
      // Count by difficulty
      difficultyCount[sub.difficulty]++;
      
      // Count topics
      sub.topics.forEach(topic => {
        topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
      });
      
      // Daily activity
      const date = new Date(sub.timestamp.$date).toISOString().split('T')[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
    
    // Find most active topics
    const sortedTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return {
      recentCount: recentSubmissions.length,
      difficultyDistribution: difficultyCount,
      topTopics: sortedTopics,
      dailyActivity: dailyActivity,
      lastSubmission: recentSubmissions[0]?.timestamp.$date
    };
  }

  // ============ FALLBACK METHODS ============
  
  getFallbackInsights(aiProfile) {
    return {
      insights: aiProfile.insights || [
        "✅ Keep up the consistent practice!",
        "💡 Focus on understanding patterns rather than memorizing solutions.",
        "🎯 Try solving problems from different difficulty levels."
      ],
      motivation: aiProfile.motivation || "Every problem solved brings you closer to mastery! 🚀",
      strengths: aiProfile.strengths || [],
      weaknesses: aiProfile.weaknesses || [],
      behavioralTips: aiProfile.behavioralTips || [
        "Set aside dedicated time for coding practice each day.",
        "Review your old solutions to reinforce learning."
      ],
      nextSteps: [
        `Focus on ${aiProfile.weeklyGoal.focusTopic}`,
        "Solve at least 2 problems daily",
        "Review weak topics regularly"
      ]
    };
  }

  getFallbackStudyPlan(aiProfile) {
    const focusTopic = aiProfile.weeklyGoal.focusTopic;
    const weakTopics = aiProfile.profile.weakTopics;
    
    return {
      weeklyPlan: [
        {
          day: 1,
          focus: focusTopic,
          problems: ["Start with Easy difficulty"],
          goal: `Introduction to ${focusTopic} patterns`,
          estimatedTime: "1-2 hours"
        },
        {
          day: 2,
          focus: focusTopic,
          problems: ["Medium difficulty problems"],
          goal: `Practice ${focusTopic} core concepts`,
          estimatedTime: "1-2 hours"
        },
        {
          day: 3,
          focus: weakTopics[1] || "Review",
          problems: ["Mix of Easy and Medium"],
          goal: "Strengthen weak areas",
          estimatedTime: "1-2 hours"
        },
        {
          day: 4,
          focus: focusTopic,
          problems: ["Challenge yourself with Hard"],
          goal: "Advanced pattern recognition",
          estimatedTime: "2-3 hours"
        },
        {
          day: 5,
          focus: "Mixed Practice",
          problems: ["All difficulty levels"],
          goal: "Apply all learned concepts",
          estimatedTime: "1-2 hours"
        },
        {
          day: 6,
          focus: "Revision",
          problems: ["Revisit this week's problems"],
          goal: "Solidify understanding",
          estimatedTime: "1 hour"
        },
        {
          day: 7,
          focus: "Assessment",
          problems: ["Mock contest or timed practice"],
          goal: "Test your progress",
          estimatedTime: "2 hours"
        }
      ],
      tips: [
        "Start each session by reviewing yesterday's problems",
        "Take breaks every 45 minutes to avoid burnout",
        "Write down patterns and approaches you learn"
      ]
    };
  }

  getFallbackRecommendations(aiProfile) {
    const weakTopics = aiProfile.profile.weakTopics;
    const recommendations = [];
    const addedSlugs = new Set();
    
    // Get problems from each weak topic
    weakTopics.forEach(topic => {
      const problems = LEETCODE_PROBLEMS_BY_TOPIC[topic] || [];
      
      // Add up to 2 problems per weak topic
      problems.slice(0, 2).forEach(problem => {
        if (!addedSlugs.has(problem.slug) && recommendations.length < 5) {
          recommendations.push({
            title: problem.title,
            titleSlug: problem.slug,
            difficulty: problem.difficulty,
            topics: problem.topics,
            reason: `Practice ${topic} - one of your weak areas`,
            leetcodeUrl: `https://leetcode.com/problems/${problem.slug}/`,
            estimatedTime: problem.time
          });
          addedSlugs.add(problem.slug);
        }
      });
    });
    
    // If we don't have 5 yet, add more from the first weak topic
    if (recommendations.length < 5 && weakTopics.length > 0) {
      const firstTopic = weakTopics[0];
      const problems = LEETCODE_PROBLEMS_BY_TOPIC[firstTopic] || [];
      
      problems.forEach(problem => {
        if (!addedSlugs.has(problem.slug) && recommendations.length < 5) {
          recommendations.push({
            title: problem.title,
            titleSlug: problem.slug,
            difficulty: problem.difficulty,
            topics: problem.topics,
            reason: `Build ${firstTopic} fundamentals`,
            leetcodeUrl: `https://leetcode.com/problems/${problem.slug}/`,
            estimatedTime: problem.time
          });
          addedSlugs.add(problem.slug);
        }
      });
    }
    
    return {
      recommendations: recommendations
    };
  }
}

module.exports = new AICoachService();
