const Question = require('../models/Question');
const AIProfile = require('../models/AIProfile');
const User = require('../models/User');
const { generateInsights } = require('./geminiService'); // Back to original
const { 
  getLeetCodeSubmissions, 
  buildProfileFromLeetCodeSubmissions 
} = require('./leetcodeService');

// Minimum questions threshold for using AlgoTick data
const MIN_QUESTIONS_THRESHOLD = 5;

/**
 * Build user profile data from questions with LeetCode fallback
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Profile data for AI analysis
 */
async function buildUserProfile(userId) {
  try {
    console.log('🔍 [buildUserProfile] Building profile for user:', userId);
    
    // Fetch all user questions
    const questions = await Question.find({ 
      userId, 
      isDeleted: false 
    }).sort({ dateAdded: -1 });
    
    console.log('🔍 [buildUserProfile] Found AlgoTick questions:', questions.length);
    
    // Check if we have sufficient AlgoTick data
    if (questions.length < MIN_QUESTIONS_THRESHOLD) {
      console.log(`⚠️ [buildUserProfile] Insufficient AlgoTick data (${questions.length} < ${MIN_QUESTIONS_THRESHOLD})`);
      console.log('🔄 [buildUserProfile] Attempting LeetCode fallback...');
      
      // Try to get user's LeetCode username
      const user = await User.findById(userId);
      if (user && user.leetcodeUsername) {
        console.log(`📡 [buildUserProfile] Fetching LeetCode data for: ${user.leetcodeUsername}`);
        
        try {
          const leetcodeSubmissions = await getLeetCodeSubmissions(userId, user.leetcodeUsername);
          
          if (leetcodeSubmissions && leetcodeSubmissions.length > 0) {
            console.log(`✅ [buildUserProfile] Using LeetCode fallback with ${leetcodeSubmissions.length} submissions`);
            const leetcodeProfile = buildProfileFromLeetCodeSubmissions(leetcodeSubmissions);
            return leetcodeProfile;
          }
        } catch (error) {
          console.error('❌ [buildUserProfile] LeetCode fallback failed:', error.message);
        }
      } else {
        console.log('⚠️ [buildUserProfile] No LeetCode username found for user');
      }
      
      // If LeetCode fallback also fails, continue with minimal AlgoTick data
      console.log('⚠️ [buildUserProfile] Continuing with limited AlgoTick data...');
    }
    
    console.log('🔍 [buildUserProfile] Sample questions:', questions.slice(0, 3).map(q => ({
      title: q.title,
      tags: q.tags,
      dateAdded: q.dateAdded,
      revisedDates: q.revisedDates,
      revisionCount: q.revisionCount,
      isRevised: q.isRevised
    })));
    
    // Calculate total solved
    const totalSolved = questions.length;
    
    // Calculate streak (consecutive days with activity)
    const streak = calculateStreak(questions);
    
    // Get questions from last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const lastWeekQuestions = questions.filter(q => 
      new Date(q.dateAdded) >= oneWeekAgo
    );
    
    console.log('🔍 [buildUserProfile] Last week questions:', lastWeekQuestions.length);
    
    // Calculate topic accuracy based on revision performance
    const topicStats = {};
    
    lastWeekQuestions.forEach(q => {
      if (q.tags && q.tags.length > 0) {
        q.tags.forEach(tag => {
          if (!topicStats[tag]) {
            topicStats[tag] = {
              topic: tag,
              solved: 0,
              revised: 0,
              total: 0
            };
          }
          
          topicStats[tag].solved += 1;
          topicStats[tag].total += 1;
          
          // Check if question was revised (has revision dates)
          if (q.revisedDates && q.revisedDates.length > 0) {
            topicStats[tag].revised += 1;
          }
        });
      }
    });
    
    // Calculate accuracy and prepare topic accuracy array
    const topicAccuracy = Object.values(topicStats).map(stat => {
      const accuracy = stat.total > 0 
        ? Math.round((stat.revised / stat.total) * 100) 
        : 0;
      
      return {
        topic: stat.topic,
        solved: stat.solved,
        revised: stat.revised,
        accuracy: accuracy,
        lastWeekCount: stat.solved
      };
    });
    
    // Sort by accuracy (descending)
    topicAccuracy.sort((a, b) => b.accuracy - a.accuracy);
    
    console.log('🔍 [buildUserProfile] Topic accuracy:', topicAccuracy);
    
    // Determine strong and weak topics based on accuracy
    let strongTopics = [];
    let weakTopics = [];
    
    if (topicAccuracy.length >= 4) {
      // Strong topics: top 2-3 by accuracy
      strongTopics = topicAccuracy.slice(0, Math.min(3, topicAccuracy.length))
        .filter(t => t.accuracy >= 50)  // Only if accuracy is 50% or above
        .map(t => t.topic);
      
      // Weak topics: bottom 2-3 by accuracy
      weakTopics = topicAccuracy.slice(-Math.min(3, topicAccuracy.length))
        .filter(t => t.accuracy < 50)  // Only if accuracy is below 50%
        .map(t => t.topic)
        .reverse();
    } else if (topicAccuracy.length > 0) {
      // Not enough data - categorize based on 50% threshold
      strongTopics = topicAccuracy.filter(t => t.accuracy >= 50).map(t => t.topic);
      weakTopics = topicAccuracy.filter(t => t.accuracy < 50).map(t => t.topic);
    }
    
    console.log('🔍 [buildUserProfile] Strong topics (high accuracy):', strongTopics);
    console.log('🔍 [buildUserProfile] Weak topics (low accuracy):', weakTopics);
    
    // Get overall topic breakdown (all time)
    const topicBreakdown = {};
    questions.forEach(q => {
      if (q.tags && q.tags.length > 0) {
        q.tags.forEach(tag => {
          topicBreakdown[tag] = (topicBreakdown[tag] || 0) + 1;
        });
      }
    });
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentQuestions = questions.filter(q => 
      new Date(q.dateAdded) >= sevenDaysAgo
    );
    
    // Calculate overall revision/completion metrics
    const totalRevised = questions.filter(q => q.revisedDates && q.revisedDates.length > 0).length;
    const revisionRate = totalSolved > 0 ? Math.round((totalRevised / totalSolved) * 100) : 0;
    
    // Calculate overdue questions (questions with past reminder dates)
    const now = new Date();
    const overdueQuestions = questions.filter(q => {
      if (!q.nextReminders || q.nextReminders.length === 0) return false;
      return q.nextReminders.some(reminder => new Date(reminder) < now);
    }).length;
    
    console.log('🔍 [buildUserProfile] Revision metrics:', {
      totalRevised,
      revisionRate: `${revisionRate}%`,
      overdueQuestions
    });
    
    const profileData = {
      totalSolved,
      streak,
      topicBreakdown,
      topicAccuracy,
      strongTopics: strongTopics.length > 0 ? strongTopics : ['No data yet'],
      weakTopics: weakTopics.length > 0 ? weakTopics : ['No data yet'],
      recentActivity: `${recentQuestions.length} problems in last 7 days`,
      revisionRate,
      overdueQuestions
    };
    
    console.log('✅ [buildUserProfile] Profile built:', {
      totalSolved: profileData.totalSolved,
      streak: profileData.streak,
      strongTopics: profileData.strongTopics,
      weakTopics: profileData.weakTopics,
      topicAccuracyCount: profileData.topicAccuracy.length
    });
    
    return profileData;
    
  } catch (error) {
    console.error('Error building user profile:', error);
    throw error;
  }
}

/**
 * Calculate user's current streak
 * @param {Array} questions - Sorted questions (newest first)
 * @returns {Number} Streak in days
 */
function calculateStreak(questions) {
  if (questions.length === 0) return 0;
  
  const dates = questions.map(q => {
    const date = new Date(q.dateAdded);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  });
  
  const uniqueDates = [...new Set(dates)].sort((a, b) => b - a);
  
  if (uniqueDates.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTime = yesterday.getTime();
  
  // Check if user was active today or yesterday
  if (uniqueDates[0] !== todayTime && uniqueDates[0] !== yesterdayTime) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = uniqueDates[0];
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const expectedPrevDay = currentDate - (24 * 60 * 60 * 1000);
    
    if (uniqueDates[i] === expectedPrevDay) {
      streak++;
      currentDate = uniqueDates[i];
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Generate and save AI profile for a user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Saved AI profile
 */
async function generateAndSaveProfile(userId) {
  try {
    console.log(`🤖 Generating AI profile for user: ${userId}`);
    
    // Build user profile from questions
    const profileData = await buildUserProfile(userId);
    
    // Generate AI insights using Gemini
    const aiInsights = await generateInsights(profileData);
    
    // Save or update AI profile in database
    const aiProfile = await AIProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        lastUpdated: new Date(),
        summary: aiInsights.summary,
        strengths: aiInsights.strengths,
        weaknesses: aiInsights.weaknesses,
        revisionFeedback: aiInsights.revisionFeedback,
        behavioralTips: aiInsights.behavioralTips,
        weeklyGoal: aiInsights.weeklyGoal,
        profile: {
          totalSolved: profileData.totalSolved,
          streak: profileData.streak,
          topicAccuracy: profileData.topicAccuracy,
          strongTopics: profileData.strongTopics,
          weakTopics: profileData.weakTopics
        }
      },
      { 
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    console.log(`✅ AI profile saved for user: ${userId}`);
    return aiProfile;
    
  } catch (error) {
    console.error(`❌ Error generating AI profile for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get AI profile for a user (from database)
 * @param {String} userId - User ID
 * @returns {Promise<Object>} AI profile or null
 */
async function getAIProfile(userId) {
  try {
    console.log('🔍 [getAIProfile] Fetching profile for user:', userId);
    const profile = await AIProfile.findOne({ userId });
    
    if (profile) {
      console.log('✅ [getAIProfile] Found profile:', {
        userId: profile.userId,
        totalSolved: profile.profile?.totalSolved,
        streak: profile.profile?.streak,
        lastUpdated: profile.lastUpdated
      });
    } else {
      console.log('⚠️ [getAIProfile] No profile found for user:', userId);
    }
    
    return profile;
  } catch (error) {
    console.error('Error fetching AI profile:', error);
    throw error;
  }
}

module.exports = {
  buildUserProfile,
  calculateStreak,
  generateAndSaveProfile,
  getAIProfile
};
