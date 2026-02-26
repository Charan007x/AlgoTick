const cron = require('node-cron');
const aiCoachService = require('../ai-services/aiCoachService');
const AICoachCache = require('../models/AICoachCache');
const AIProfile = require('../models/AIProfile');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');
const CronSettings = require('../models/CronSettings');

// Cron job state management
let cronJobEnabled = true;
let cronTask = null;

/**
 * Fetch AI profile for a user - same logic as routes
 */
async function getAIProfile(userId) {
  try {
    let aiProfile = await AIProfile.findOne({ userId });
    
    if (aiProfile) {
      return aiProfile;
    }
    
    const leetcodeData = await LeetCodeSubmission.findOne({ userId });
    
    if (!leetcodeData || !leetcodeData.submissions || leetcodeData.submissions.length === 0) {
      return {
        userId,
        profile: {
          totalProblems: 0,
          currentStreak: 0,
          lastSolved: null,
          strongTopics: ['Array', 'String'],
          weakTopics: ['Dynamic Programming', 'Graph', 'Tree']
        }
      };
    }
    
    const recentSubmissions = leetcodeData.submissions.slice(0, 20);
    const topicCount = {};
    
    recentSubmissions.forEach(sub => {
      if (sub.topics && sub.topics.length > 0) {
        sub.topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });
    
    const sortedTopics = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);
    
    const strongCount = Math.max(3, Math.ceil(sortedTopics.length * 0.4));
    const strongTopics = sortedTopics.slice(0, strongCount);
    
    const weakCount = Math.max(3, Math.ceil(sortedTopics.length * 0.4));
    const weakTopics = sortedTopics.slice(-weakCount);
    
    aiProfile = await AIProfile.create({
      userId,
      profile: {
        totalProblems: recentSubmissions.length,
        currentStreak: 1,
        lastSolved: recentSubmissions[0]?.timestamp || new Date(),
        strongTopics: strongTopics.length > 0 ? strongTopics : ['Array', 'String'],
        weakTopics: weakTopics.length > 0 ? weakTopics : ['Dynamic Programming', 'Graph', 'Tree']
      }
    });
    
    return aiProfile;
  } catch (error) {
    console.error('[Cron] Error in getAIProfile:', error);
    return null;
  }
}

/**
 * Fetch LeetCode submissions for a user
 */
async function getLeetCodeSubmissions(userId) {
  try {
    const leetcodeData = await LeetCodeSubmission.findOne({ userId });
    
    if (!leetcodeData || !leetcodeData.submissions) {
      return [];
    }
    
    return leetcodeData.submissions.slice(0, 20);
  } catch (error) {
    console.error('[Cron] Error in getLeetCodeSubmissions:', error);
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
        leetcodeUsername: aiProfile.leetcodeUsername,
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
async function initAICoachCron() {
  // Load initial state from database
  try {
    let settings = await CronSettings.findOne({ jobName: 'aiCoach' });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await CronSettings.create({ 
        jobName: 'aiCoach', 
        enabled: true 
      });
    }
    
    cronJobEnabled = settings.enabled;
    console.log(`[Cron] AI Coach initial state: ${cronJobEnabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('[Cron] Error loading AI Coach settings:', error);
    cronJobEnabled = true; // Default to enabled on error
  }

  // Schedule cron job for 2am daily (0 2 * * *)
  cronTask = cron.schedule('0 2 * * *', async () => {
    if (!cronJobEnabled) {
      console.log('[Cron] AI Coach refresh skipped (disabled by admin)');
      return;
    }
    console.log('[Cron] AI Coach refresh triggered (daily at 2am)');
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

/**
 * Enable or disable the AI Coach cron job
 * @param {boolean} enabled - Whether to enable or disable the cron job
 * @param {string} userId - ID of admin user making the change
 */
async function setCronJobStatus(enabled, userId = null) {
  try {
    cronJobEnabled = enabled;
    
    // Save to database
    await CronSettings.findOneAndUpdate(
      { jobName: 'aiCoach' },
      { 
        enabled, 
        lastModified: new Date(),
        modifiedBy: userId 
      },
      { upsert: true }
    );
    
    console.log(`[Cron] AI Coach ${enabled ? 'enabled' : 'disabled'} (saved to DB)`);
  } catch (error) {
    console.error('[Cron] Error saving AI Coach settings:', error);
    throw error;
  }
}

/**
 * Get current cron job status
 * @returns {boolean} Whether the cron job is enabled
 */
function getCronJobStatus() {
  return cronJobEnabled;
}

module.exports = {
  initAICoachCron,
  refreshAllUsers,
  refreshUserData,
  setCronJobStatus,
  getCronJobStatus
};
