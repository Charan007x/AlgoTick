const geminiService = require('./geminiService');

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
    const weakTopic = aiProfile.profile.weakTopics[0];
    const weakTopic2 = aiProfile.profile.weakTopics[1];
    
    // Hardcoded real LeetCode problems for weak topics
    const problemsByTopic = {
      'Linked List': [
        { title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy' },
        { title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', difficulty: 'Easy' },
        { title: 'Remove Nth Node From End of List', slug: 'remove-nth-node-from-end-of-list', difficulty: 'Medium' }
      ],
      'Tree': [
        { title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', difficulty: 'Easy' },
        { title: 'Invert Binary Tree', slug: 'invert-binary-tree', difficulty: 'Easy' },
        { title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', difficulty: 'Medium' }
      ],
      'Dynamic Programming': [
        { title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy' },
        { title: 'House Robber', slug: 'house-robber', difficulty: 'Medium' },
        { title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium' }
      ],
      'Graph': [
        { title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium' },
        { title: 'Clone Graph', slug: 'clone-graph', difficulty: 'Medium' },
        { title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' }
      ],
      'Binary Search': [
        { title: 'Binary Search', slug: 'binary-search', difficulty: 'Easy' },
        { title: 'Search Insert Position', slug: 'search-insert-position', difficulty: 'Easy' },
        { title: 'Find First and Last Position of Element in Sorted Array', slug: 'find-first-and-last-position-of-element-in-sorted-array', difficulty: 'Medium' }
      ]
    };
    
    const weakTopicProblems = problemsByTopic[weakTopic] || [
      { title: `${weakTopic} Practice Problem 1`, slug: 'practice-1', difficulty: 'Easy' },
      { title: `${weakTopic} Practice Problem 2`, slug: 'practice-2', difficulty: 'Medium' }
    ];
    
    const weakTopic2Problems = problemsByTopic[weakTopic2] || [];
    
    const recommendations = [];
    
    // Add 2-3 problems from first weak topic
    weakTopicProblems.slice(0, 3).forEach(prob => {
      recommendations.push({
        title: prob.title,
        titleSlug: prob.slug,
        difficulty: prob.difficulty,
        topics: [weakTopic],
        reason: `Build foundation in ${weakTopic}`,
        leetcodeUrl: `https://leetcode.com/problems/${prob.slug}/`,
        estimatedTime: prob.difficulty === 'Easy' ? '20-30 mins' : '30-45 mins'
      });
    });
    
    // Add 1-2 problems from second weak topic
    if (weakTopic2Problems.length > 0) {
      weakTopic2Problems.slice(0, 2).forEach(prob => {
        recommendations.push({
          title: prob.title,
          titleSlug: prob.slug,
          difficulty: prob.difficulty,
          topics: [weakTopic2],
          reason: `Strengthen ${weakTopic2} skills`,
          leetcodeUrl: `https://leetcode.com/problems/${prob.slug}/`,
          estimatedTime: prob.difficulty === 'Easy' ? '20-30 mins' : '30-45 mins'
        });
      });
    }
    
    return {
      recommendations: recommendations.slice(0, 5)
    };
  }
}

module.exports = new AICoachService();
