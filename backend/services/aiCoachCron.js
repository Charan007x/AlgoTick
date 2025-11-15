const cron = require('node-cron');
const aiCoachService = require('../ai-services/aiCoachService');
const AICoachCache = require('../models/AICoachCache');
const Question = require('../models/Question');

// Mock models - Replace with actual imports when available
// const User = require('../models/User');
// const AIProfile = require('../models/AIProfile');
// const LeetCodeSubmission = require('../models/LeetCodeSubmission');

/**
 * Fetch AI profile for a user based on their questions
 */
async function getAIProfile(userId) {
  try {
    const questions = await Question.find({ userId, isDeleted: false });
    
    if (!questions || questions.length === 0) {
      return {
        userId,
        profile: {
          totalProblems: 0,
          currentStreak: 0,
          lastSolved: null,
          strongTopics: [],
          weakTopics: []
        }
      };
    }
    
    const tagCount = {};
    questions.forEach(q => {
      if (q.tags && q.tags.length > 0) {
        q.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    const sortedTopics = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);
    
    const strongCount = Math.ceil(sortedTopics.length * 0.4);
    const strongTopics = sortedTopics.slice(0, strongCount);
    const weakTopics = sortedTopics.slice(-Math.ceil(sortedTopics.length * 0.4));
    
    return {
      userId,
      profile: {
        totalProblems: questions.length,
        currentStreak: 1,
        lastSolved: questions[0]?.dateAdded || new Date(),
        strongTopics: strongTopics.length > 0 ? strongTopics : ['Array'],
        weakTopics: weakTopics.length > 0 ? weakTopics : ['Dynamic Programming']
      }
    };
  } catch (error) {
    console.error('[Cron] Error fetching AI profile:', error);
    return null;
  }
}

/**
 * Fetch LeetCode submissions for a user
 */
async function getLeetCodeSubmissions(userId) {
  try {
    const questions = await Question.find({ userId, isDeleted: false })
      .sort({ dateAdded: -1 })
      .limit(50);
    
    return questions.map(q => ({
      title: q.title,
      difficulty: q.difficulty,
      tags: q.tags,
      dateAdded: q.dateAdded,
      isRevised: q.isRevised,
      revisionCount: q.revisionCount
    }));
  } catch (error) {
    console.error('[Cron] Error fetching submissions:', error);
    return [];
  }
}

/**
 * Refresh AI coach data for a single user
 */
async function refreshUserData(userId) {
  try {
    console.log(`[Cron] Refreshing AI coach data for user: ${userId}`);

    // Fetch user data
    const aiProfile = await getAIProfile(userId);
    const submissions = await getLeetCodeSubmissions(userId);

    if (!aiProfile) {
      console.log(`[Cron] AI profile not found for user: ${userId}`);
      return;
    }

    // Generate fresh recommendations
    const recommendations = await aiCoachService.getRecommendations(
      aiProfile,
      submissions,
      5
    );

    // Update cache
    let cache = await AICoachCache.findOne({ userId });

    if (cache) {
      cache.strongTopics = aiProfile.profile.strongTopics;
      cache.weakTopics = aiProfile.profile.weakTopics;
      cache.recommendations = recommendations.data?.recommendations || recommendations.fallback?.recommendations || [];
      cache.lastRefreshed = new Date();
      await cache.save();
    } else {
      await AICoachCache.create({
        userId,
        strongTopics: aiProfile.profile.strongTopics,
        weakTopics: aiProfile.profile.weakTopics,
        recommendations: recommendations.data?.recommendations || recommendations.fallback?.recommendations || [],
        lastRefreshed: new Date(),
        cooldownHours: 0 // Change to 6 for production
      });
    }

    console.log(`[Cron] Successfully refreshed data for user: ${userId}`);
  } catch (error) {
    console.error(`[Cron] Error refreshing data for user ${userId}:`, error);
  }
}

/**
 * Refresh AI coach data for all users
 */
async function refreshAllUsers() {
  try {
    console.log('[Cron] Starting daily AI coach refresh at 2am...');

    // TODO: Replace with actual User.find() query
    // const users = await User.find({}, 'id');
    
    // For now, refresh all cached users
    const caches = await AICoachCache.find({}, 'userId');
    
    console.log(`[Cron] Found ${caches.length} users to refresh`);

    for (const cache of caches) {
      await refreshUserData(cache.userId);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('[Cron] Daily refresh completed successfully');
  } catch (error) {
    console.error('[Cron] Error during daily refresh:', error);
  }
}

/**
 * Initialize cron job scheduler
 */
function initAICoachCron() {
  // Schedule cron job for 2am daily (0 2 * * *)
  cron.schedule('0 2 * * *', async () => {
    await refreshAllUsers();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Change to your timezone
  });

  console.log('[Cron] AI Coach cron job scheduled for 2am daily');

  // Optional: Run on startup for testing
  // Uncomment the line below to run immediately on server start
  // refreshAllUsers();
}

module.exports = {
  initAICoachCron,
  refreshAllUsers,
  refreshUserData
};
