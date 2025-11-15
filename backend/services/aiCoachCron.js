const cron = require('node-cron');
const aiCoachService = require('../ai-services/aiCoachService');
const AICoachCache = require('../models/AICoachCache');

// Mock models - Replace with actual imports when available
// const User = require('../models/User');
// const AIProfile = require('../models/AIProfile');
// const LeetCodeSubmission = require('../models/LeetCodeSubmission');

/**
 * Fetch AI profile for a user
 * TODO: Replace with actual database query
 */
async function getAIProfile(userId) {
  // Mock data for now
  return {
    userId,
    profile: {
      totalProblems: 20,
      currentStreak: 1,
      lastSolved: new Date(),
      strongTopics: ['Sliding Window', 'Array', 'Hash Table'],
      weakTopics: ['Linked List', 'Enumeration', 'Simulation']
    }
  };
}

/**
 * Fetch LeetCode submissions for a user
 * TODO: Replace with actual database query
 */
async function getLeetCodeSubmissions(userId) {
  // Mock data for now
  return [];
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
