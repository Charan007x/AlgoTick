const cron = require('node-cron');
const User = require('../models/User');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');
const { LeetCodeUserStatsCache } = require('../models/LeetCodeCache');
const SyncLog = require('../models/SyncLog');
const { getUserActivitySummaryFromAPI } = require('./leetcodeService');
const axios = require('axios');

// Cron job state management
let cronJobEnabled = true;
let cronTask = null;

/**
 * Fetch user's recent submissions from LeetCode API
 * @param {string} leetcodeUsername - LeetCode username
 * @returns {Array} Array of submissions
 */
async function fetchUserSubmissionsFromAPI(leetcodeUsername) {
  try {
    console.log(`[Sync] Fetching submissions for: ${leetcodeUsername}`);
    
    const graphqlQuery = {
      query: `
        query recentAcSubmissions($username: String!, $limit: Int!) {
          recentAcSubmissionList(username: $username, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: {
        username: leetcodeUsername,
        limit: 100 // Fetch last 100 submissions
      }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    if (response.data && response.data.data && response.data.data.recentAcSubmissionList) {
      const submissions = response.data.data.recentAcSubmissionList;
      
      // Transform submissions to our format
      return submissions.map(sub => ({
        title: sub.title,
        titleSlug: sub.titleSlug,
        timestamp: new Date(parseInt(sub.timestamp) * 1000),
        statusDisplay: 'Accepted',
        // We'll need to fetch additional details separately if needed
        difficulty: null,
        questionId: null,
        topics: []
      }));
    }

    return [];
  } catch (error) {
    console.error(`[Sync] Error fetching submissions for ${leetcodeUsername}:`, error.message);
    return [];
  }
}

/**
 * Fetch additional problem details for a submission
 * @param {string} titleSlug - Problem title slug
 * @returns {object} Problem details
 */
async function fetchProblemDetails(titleSlug) {
  try {
    const graphqlQuery = {
      query: `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            questionId
            questionFrontendId
            difficulty
            topicTags {
              name
            }
          }
        }
      `,
      variables: { titleSlug }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      }
    });

    if (response.data && response.data.data && response.data.data.question) {
      const question = response.data.data.question;
      return {
        questionId: question.questionFrontendId || question.questionId,
        difficulty: question.difficulty,
        topics: question.topicTags.map(tag => tag.name)
      };
    }

    return null;
  } catch (error) {
    console.error(`[Sync] Error fetching problem details for ${titleSlug}:`, error.message);
    return null;
  }
}

/**
 * Sync LeetCode data for a single user
 * @param {object} user - User object from database
 * @returns {boolean|null} Success status (null if skipped, true if success, false if failed)
 */
async function syncUserLeetCodeData(user) {
  try {
    if (!user.leetcodeUsername) {
      console.log(`[Sync] User ${user.username} has no LeetCode username set, skipping`);
      return null;
    }

    console.log(`[Sync] Syncing data for user: ${user.username} (LeetCode: ${user.leetcodeUsername})`);

    // 1. Fetch and update user stats
    try {
      const stats = await getUserActivitySummaryFromAPI(user.leetcodeUsername);
      
      // IMPORTANT: Delete existing record first, then create new one to ensure complete replacement
      await LeetCodeUserStatsCache.deleteOne({ userId: user._id });
      
      await LeetCodeUserStatsCache.create({
        userId: user._id,
        leetcodeUsername: user.leetcodeUsername,
        stats: stats,
        lastFetched: new Date()
      });
      
      console.log(`[Sync] ✅ User stats REPLACED for ${user.leetcodeUsername} (${stats.totalSolved} solved)`);
    } catch (statsError) {
      console.error(`[Sync] ❌ Failed to update stats for ${user.leetcodeUsername}:`, statsError.message);
    }

    // 2. Fetch and update submissions
    try {
      const submissions = await fetchUserSubmissionsFromAPI(user.leetcodeUsername);
      
      if (submissions.length > 0) {
        // Deduplicate submissions by titleSlug + timestamp
        // Keep only the most recent submission for each unique problem-timestamp combination
        const submissionMap = new Map();
        submissions.forEach(sub => {
          const key = `${sub.titleSlug}_${sub.timestamp.getTime()}`;
          if (!submissionMap.has(key)) {
            submissionMap.set(key, sub);
          }
        });
        
        const deduplicatedSubmissions = Array.from(submissionMap.values());
        console.log(`[Sync] Deduplicated: ${submissions.length} → ${deduplicatedSubmissions.length} submissions`);
        
        // Enrich submissions with problem details (do this for unique problems only)
        const uniqueSlugs = [...new Set(deduplicatedSubmissions.map(s => s.titleSlug))];
        const problemDetailsMap = {};
        
        // Fetch details for unique problems (with rate limiting)
        for (let i = 0; i < Math.min(uniqueSlugs.length, 20); i++) {
          const slug = uniqueSlugs[i];
          const details = await fetchProblemDetails(slug);
          if (details) {
            problemDetailsMap[slug] = details;
          }
          // Rate limiting: wait 500ms between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Enrich submissions with fetched details
        const enrichedSubmissions = deduplicatedSubmissions.map(sub => ({
          ...sub,
          difficulty: problemDetailsMap[sub.titleSlug]?.difficulty || sub.difficulty,
          questionId: problemDetailsMap[sub.titleSlug]?.questionId || sub.questionId,
          topics: problemDetailsMap[sub.titleSlug]?.topics || sub.topics
        }));

        // IMPORTANT: Delete existing record first, then create new one to ensure complete replacement
        await LeetCodeSubmission.deleteOne({ userId: user._id });
        
        await LeetCodeSubmission.create({
          userId: user._id,
          leetcodeUsername: user.leetcodeUsername,
          submissions: enrichedSubmissions,
          lastFetched: new Date()
        });
        
        console.log(`[Sync] ✅ Submissions REPLACED for ${user.leetcodeUsername} (${enrichedSubmissions.length} submissions)`);
      } else {
        // If no submissions, clear the cache
        await LeetCodeSubmission.deleteOne({ userId: user._id });
        console.log(`[Sync] ⚠️ No submissions found for ${user.leetcodeUsername}, cache cleared`);
      }
    } catch (submissionsError) {
      console.error(`[Sync] ❌ Failed to update submissions for ${user.leetcodeUsername}:`, submissionsError.message);
    }

    return true;
  } catch (error) {
    console.error(`[Sync] Error syncing user ${user.username}:`, error.message);
    return false;
  }
}

/**
 * Sync LeetCode data for all users
 * @param {Function} progressCallback - Optional callback for real-time progress updates
 */
async function syncAllUsersLeetCodeData(progressCallback = null) {
  const startTime = Date.now();
  const syncErrors = [];
  
  try {
    console.log('\n========================================');
    console.log('[Sync] Starting LeetCode data sync for all users...');
    console.log('========================================\n');

    // Find all users with LeetCode usernames
    const users = await User.find({ 
      leetcodeUsername: { $exists: true, $ne: null, $ne: '' } 
    });

    console.log(`[Sync] Found ${users.length} users with LeetCode usernames`);

    // Send initial status
    if (progressCallback) {
      progressCallback({
        type: 'start',
        totalUsers: users.length,
        message: `Starting sync for ${users.length} users...`
      });
    }

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      // Send progress update for current user
      if (progressCallback) {
        progressCallback({
          type: 'progress',
          currentUser: user.leetcodeUsername,
          userIndex: i + 1,
          totalUsers: users.length,
          successCount,
          failCount,
          skippedCount,
          message: `Syncing ${user.leetcodeUsername}...`
        });
      }

      try {
        const success = await syncUserLeetCodeData(user);
        
        if (success === null) {
          skippedCount++;
          if (progressCallback) {
            progressCallback({
              type: 'user-complete',
              username: user.leetcodeUsername,
              status: 'skipped',
              message: `Skipped ${user.leetcodeUsername} (no recent changes)`
            });
          }
        } else if (success) {
          successCount++;
          if (progressCallback) {
            progressCallback({
              type: 'user-complete',
              username: user.leetcodeUsername,
              status: 'success',
              message: `✅ Successfully synced ${user.leetcodeUsername}`
            });
          }
        } else {
          failCount++;
          syncErrors.push({ username: user.leetcodeUsername, error: 'Sync failed' });
          if (progressCallback) {
            progressCallback({
              type: 'user-complete',
              username: user.leetcodeUsername,
              status: 'failed',
              message: `❌ Failed to sync ${user.leetcodeUsername}`
            });
          }
        }
      } catch (error) {
        failCount++;
        syncErrors.push({ username: user.leetcodeUsername, error: error.message });
        if (progressCallback) {
          progressCallback({
            type: 'user-complete',
            username: user.leetcodeUsername,
            status: 'error',
            error: error.message,
            message: `❌ Error syncing ${user.leetcodeUsername}: ${error.message}`
          });
        }
      }

      // Rate limiting: wait 2 seconds between users to avoid hitting API limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const duration = Date.now() - startTime;
    const totalUsers = users.length;

    console.log('\n========================================');
    console.log('[Sync] LeetCode data sync completed');
    console.log(`[Sync] ✅ Successful: ${successCount}`);
    console.log(`[Sync] ⚠️ Skipped: ${skippedCount}`);
    console.log(`[Sync] ❌ Failed: ${failCount}`);
    console.log('========================================\n');

    // Save sync log to database
    const syncStatus = failCount === totalUsers ? 'failed' : (failCount > 0 ? 'partial' : 'success');
    
    await SyncLog.create({
      timestamp: new Date(),
      status: syncStatus,
      totalUsers,
      successCount,
      failedCount: failCount,
      skippedCount,
      details: `Synced ${successCount}/${totalUsers} users successfully`,
      errors: syncErrors,
      duration
    });

    return { successCount, failCount, skippedCount, totalUsers };
  } catch (error) {
    console.error('[Sync] Error during sync:', error);
    
    // Log failed sync
    await SyncLog.create({
      timestamp: new Date(),
      status: 'failed',
      totalUsers: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      details: 'Sync job failed to start',
      errors: [{ username: 'N/A', error: error.message }],
      duration: Date.now() - startTime
    });
    
    return { successCount: 0, failCount: 0, skippedCount: 0, totalUsers: 0 };
  }
}

/**
 * Initialize LeetCode sync cron job
 */
function initLeetCodeSyncCron() {
  // Schedule cron job to run daily at 2am
  // Pattern: '0 2 * * *' means at 2:00 AM every day
  cronTask = cron.schedule('0 2 * * *', async () => {
    if (!cronJobEnabled) {
      console.log('[Cron] LeetCode sync skipped (disabled by admin)');
      return;
    }
    console.log('[Cron] LeetCode sync triggered (daily at 2am)');
    await syncAllUsersLeetCodeData();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Change to your timezone
  });

  console.log('[Cron] LeetCode sync cron job scheduled (daily at 2am)');

  // Optional: Uncomment to run sync on startup (10 seconds after server starts)
  // console.log('[Cron] Running initial sync in 10 seconds...');
  // setTimeout(() => {
  //   console.log('[Cron] Starting initial LeetCode sync for all users...');
  //   syncAllUsersLeetCodeData();
  // }, 10000); // Run 10 seconds after startup
}

/**
 * Enable or disable the LeetCode sync cron job
 * @param {boolean} enabled - Whether to enable or disable the cron job
 */
function setCronJobStatus(enabled) {
  cronJobEnabled = enabled;
  console.log(`[Cron] LeetCode sync ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Get current cron job status
 * @returns {boolean} Whether the cron job is enabled
 */
function getCronJobStatus() {
  return cronJobEnabled;
}

/**
 * Manually trigger sync for a specific user
 * @param {string} userId - User's database ID
 */
async function syncSpecificUser(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return await syncUserLeetCodeData(user);
  } catch (error) {
    console.error(`[Sync] Error syncing specific user ${userId}:`, error.message);
    return false;
  }
}

module.exports = {
  initLeetCodeSyncCron,
  syncAllUsersLeetCodeData,
  syncUserLeetCodeData,
  syncSpecificUser,
  setCronJobStatus,
  getCronJobStatus
};
