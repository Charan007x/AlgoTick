const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiCoachService = require('../ai-services/aiCoachService');
const AICoachCache = require('../models/AICoachCache');
const AIProfile = require('../models/AIProfile');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');
const {
  getAICoachCache,
  setAICoachCache,
  delAICoachCache,
} = require('../services/cacheService');

function aiCoachRedisPayload(cache) {
  const canRefresh =
    typeof cache.canRefresh === 'function' ? cache.canRefresh() : true;
  const timeUntilRefresh =
    typeof cache.getTimeUntilRefresh === 'function'
      ? cache.getTimeUntilRefresh()
      : { hours: 0, minutes: 0, canRefresh: true };

  return {
    strongTopics: cache.strongTopics,
    weakTopics: cache.weakTopics,
    recommendations: cache.recommendations,
    lastRefreshed: cache.lastRefreshed,
    canRefresh,
    timeUntilRefresh,
    leetcodeUsername: cache.leetcodeUsername,
  };
}

/**
 * @route   GET /api/ai-coach/dashboard
 * @desc    Get AI coach dashboard data (topics + recommendations)
 * @access  Private
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    console.log('📊 AI Coach Dashboard request received');
    console.log('👤 User ID from token:', req.user);
    
    const userId = req.user.userId || req.user.id;
    console.log('🔍 Looking for cache with userId:', userId);

    // 1) Redis first (skip when ?refresh)
    if (!req.query.refresh) {
      const redisHit = await getAICoachCache(userId);
      if (redisHit) {
        console.log('✅ Returning Redis cached AI coach data');
        return res.json({
          success: true,
          data: {
            ...redisHit,
            cached: true,
          },
        });
      }
    }

    // 2) Mongo cache
    let cache = await AICoachCache.findOne({ userId });
    console.log('💾 Mongo cache found:', !!cache);
    
    if (cache && !req.query.refresh) {
      const timeUntilRefresh = cache.getTimeUntilRefresh();
      await setAICoachCache(userId, aiCoachRedisPayload(cache));
      
      console.log('✅ Returning Mongo cached data (warmed Redis)');
      return res.json({
        success: true,
        data: {
          strongTopics: cache.strongTopics,
          weakTopics: cache.weakTopics,
          recommendations: cache.recommendations,
          lastRefreshed: cache.lastRefreshed,
          canRefresh: cache.canRefresh(),
          timeUntilRefresh: timeUntilRefresh,
          cached: true
        }
      });
    }

    // Check if refresh is allowed
    if (cache && req.query.refresh && !cache.canRefresh()) {
      const timeUntilRefresh = cache.getTimeUntilRefresh();
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeUntilRefresh.hours}h ${timeUntilRefresh.minutes}m before refreshing again`,
        timeUntilRefresh: timeUntilRefresh
      });
    }

    console.log('🆕 No cache found or refresh requested, generating new data...');
    // Fetch fresh data
    const aiProfile = await getAIProfile(userId);
    const submissions = await getLeetCodeSubmissions(userId);

    console.log('📝 AI Profile:', aiProfile);

    if (!aiProfile) {
      return res.status(404).json({ message: 'AI profile not found' });
    }

    // Generate recommendations
    console.log('🤖 Calling AI Coach service...');
    const recommendations = await aiCoachService.getRecommendations(
      aiProfile,
      submissions,
      5
    );

    console.log('✨ Recommendations generated:', recommendations);

    // Update or create cache
    if (cache) {
      cache.strongTopics = aiProfile.profile.strongTopics;
      cache.weakTopics = aiProfile.profile.weakTopics;
      cache.recommendations = recommendations.data?.recommendations || recommendations.fallback?.recommendations || [];
      cache.lastRefreshed = new Date();
      cache.leetcodeUsername = aiProfile.leetcodeUsername;
      await cache.save();
      console.log('💾 Cache updated');
    } else {
      cache = await AICoachCache.create({
        userId,
        leetcodeUsername: aiProfile.leetcodeUsername,
        strongTopics: aiProfile.profile.strongTopics,
        weakTopics: aiProfile.profile.weakTopics,
        recommendations: recommendations.data?.recommendations || recommendations.fallback?.recommendations || [],
        lastRefreshed: new Date(),
        cooldownHours: 0 // Change to 6 for production
      });
      console.log('💾 Cache created');
    }

    await setAICoachCache(userId, aiCoachRedisPayload(cache));

    console.log('✅ Sending response');
    res.json({
      success: true,
      data: {
        strongTopics: cache.strongTopics,
        weakTopics: cache.weakTopics,
        recommendations: cache.recommendations,
        lastRefreshed: cache.lastRefreshed,
        canRefresh: cache.canRefresh(),
        timeUntilRefresh: cache.getTimeUntilRefresh(),
        cached: false
      }
    });
  } catch (error) {
    console.error('AI Coach Dashboard Error:', error);
    res.status(500).json({
      message: 'Failed to load AI coach data',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/ai-coach/refresh
 * @desc    Refresh AI coach recommendations (generates new data via Gemini)
 * @access  Private
 */
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    console.log('🔄 Refresh request received');
    console.log('👤 User from token:', req.user);
    
    const userId = req.user.userId || req.user.id;
    console.log('🔍 Using userId:', userId);

    // Check if cache exists and cooldown is active
    let cache = await AICoachCache.findOne({ userId });
    
    console.log('💾 Existing cache:', !!cache);
    
    if (cache && !cache.canRefresh()) {
      const timeUntilRefresh = cache.getTimeUntilRefresh();
      console.log('⏰ Cooldown active:', timeUntilRefresh);
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeUntilRefresh.hours}h ${timeUntilRefresh.minutes}m before refreshing`,
        timeUntilRefresh: timeUntilRefresh
      });
    }

    console.log('✅ Cooldown check passed, proceeding with refresh');

    // Get AI profile data to send to Gemini
    const aiProfile = await getAIProfile(userId);
    const submissions = await getLeetCodeSubmissions(userId);

    console.log('📝 AI Profile retrieved:', !!aiProfile);

    if (!aiProfile) {
      return res.status(404).json({ message: 'AI profile not found' });
    }

    // Call Gemini API to generate new recommendations
    console.log('🤖 Calling Gemini API to generate fresh recommendations...');
    const recommendations = await aiCoachService.getRecommendations(
      aiProfile,
      submissions,
      5
    );

    console.log('✨ Recommendations result:', recommendations);

    const newData = {
      strongTopics: aiProfile.profile.strongTopics,
      weakTopics: aiProfile.profile.weakTopics,
      recommendations: recommendations.data?.recommendations || recommendations.fallback?.recommendations || [],
      lastRefreshed: new Date()
    };

    console.log('📦 New data to save:', newData);

    // Update or create cache with new data from Gemini
    if (cache) {
      cache.strongTopics = newData.strongTopics;
      cache.weakTopics = newData.weakTopics;
      cache.recommendations = newData.recommendations;
      cache.lastRefreshed = newData.lastRefreshed;
      cache.leetcodeUsername = aiProfile.leetcodeUsername;
      await cache.save();
      console.log('✅ Updated cache with fresh Gemini data');
    } else {
      cache = await AICoachCache.create({
        userId,
        leetcodeUsername: aiProfile.leetcodeUsername,
        ...newData,
        cooldownHours: 0 // Change to 6 for production
      });
      console.log('✅ Created new cache with Gemini data');
    }

    await setAICoachCache(userId, aiCoachRedisPayload(cache));

    res.json({
      success: true,
      message: 'Recommendations refreshed successfully',
      data: {
        ...newData,
        canRefresh: false,
        timeUntilRefresh: cache.getTimeUntilRefresh()
      }
    });
  } catch (error) {
    console.error('Refresh Error:', error);
    res.status(500).json({
      message: 'Failed to refresh recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/ai-coach/insights
 * @desc    Get AI-generated insights for user
 * @access  Private
 */
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // TODO: Replace with actual model queries
    // For now, using mock data structure based on provided examples
    const aiProfile = await getAIProfile(userId);
    const submissions = await getLeetCodeSubmissions(userId);

    if (!aiProfile) {
      return res.status(404).json({ message: 'AI profile not found' });
    }

    const insights = await aiCoachService.generateInsights(aiProfile, submissions);
    
    res.json(insights);
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate insights', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/ai-coach/study-plan
 * @desc    Get personalized study plan
 * @access  Private
 */
router.get('/study-plan', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const aiProfile = await getAIProfile(userId);
    const submissions = await getLeetCodeSubmissions(userId);

    if (!aiProfile) {
      return res.status(404).json({ message: 'AI profile not found' });
    }

    const studyPlan = await aiCoachService.createStudyPlan(aiProfile, submissions);
    
    res.json(studyPlan);
  } catch (error) {
    console.error('Study Plan Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate study plan', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/ai-coach/recommendations
 * @desc    Get problem recommendations
 * @access  Private
 */
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = parseInt(req.query.count) || 5;

    const aiProfile = await getAIProfile(userId);
    const submissions = await getLeetCodeSubmissions(userId);

    if (!aiProfile) {
      return res.status(404).json({ message: 'AI profile not found' });
    }

    const recommendations = await aiCoachService.getRecommendations(
      aiProfile, 
      submissions, 
      count
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate recommendations', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/ai-coach/performance
 * @desc    Get performance analysis
 * @access  Private
 */
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const submissions = await getLeetCodeSubmissions(userId);

    if (!submissions || !submissions.submissions) {
      return res.status(404).json({ message: 'No submissions found' });
    }

    const performance = aiCoachService.analyzePerformance(submissions);
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Performance Analysis Error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze performance', 
      error: error.message 
    });
  }
});

// ============ HELPER FUNCTIONS ============

async function getAIProfile(userId) {
  try {
    // Get user's current LeetCode username
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user || !user.leetcodeUsername) {
      console.log('⚠️ User has no LeetCode username set');
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
    
    const currentUsername = user.leetcodeUsername;
    
    // Get LeetCode submissions first
    const leetcodeData = await LeetCodeSubmission.findOne({ userId });
    
    if (!leetcodeData || !leetcodeData.submissions || leetcodeData.submissions.length === 0) {
      // Return default profile for new users
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
    
    // Check if AI profile exists and matches the current username
    let aiProfile = await AIProfile.findOne({ userId });
    
    // If username changed, delete old profile and force regeneration
    if (aiProfile && aiProfile.leetcodeUsername !== currentUsername) {
      console.log(`🔄 Username changed from ${aiProfile.leetcodeUsername} to ${currentUsername}, regenerating profile...`);
      await AIProfile.deleteOne({ userId });
      await AICoachCache.deleteOne({ userId });
      await delAICoachCache(userId);
      aiProfile = null;
    }
    // If LeetCode submissions username doesn't match current username, force refresh
    else if (leetcodeData.leetcodeUsername !== currentUsername) {
      console.log(`🔄 Submissions username (${leetcodeData.leetcodeUsername}) doesn't match current (${currentUsername}), will use current data`);
      // Don't return cached profile, let it regenerate below
      if (aiProfile) {
        await AIProfile.deleteOne({ userId });
        await AICoachCache.deleteOne({ userId });
        await delAICoachCache(userId);
        aiProfile = null;
      }
    }
    // If profile exists and LeetCode data was updated recently, regenerate the profile
    else if (aiProfile && leetcodeData.lastFetched && aiProfile.updatedAt) {
      const shouldRegenerate = new Date(leetcodeData.lastFetched) > new Date(aiProfile.updatedAt);
      if (shouldRegenerate) {
        console.log('🔄 LeetCode data is newer, regenerating AI profile...');
        await AIProfile.deleteOne({ userId });
        aiProfile = null;
      } else {
        return aiProfile;
      }
    } else if (aiProfile) {
      return aiProfile;
    }
    
    // Analyze last 20 submissions to determine strong/weak topics
    const recentSubmissions = leetcodeData.submissions.slice(0, 20);
    const topicCount = {};
    
    recentSubmissions.forEach(sub => {
      if (sub.topics && sub.topics.length > 0) {
        sub.topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });
    
    // Sort topics by frequency
    const sortedTopics = Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);
    
    // Strong topics: top 40%
    const strongCount = Math.max(3, Math.ceil(sortedTopics.length * 0.4));
    const strongTopics = sortedTopics.slice(0, strongCount);
    
    // Weak topics: bottom 40%
    const weakCount = Math.max(3, Math.ceil(sortedTopics.length * 0.4));
    const weakTopics = sortedTopics.slice(-weakCount);
    
    // Create and save new AI profile
    aiProfile = await AIProfile.create({
      userId,
      leetcodeUsername: currentUsername,
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
    console.error('Error in getAIProfile:', error);
    // Return default profile on error
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
}

async function getLeetCodeSubmissions(userId) {
  try {
    const leetcodeData = await LeetCodeSubmission.findOne({ userId });
    
    if (!leetcodeData || !leetcodeData.submissions) {
      return {
        userId,
        submissions: []
      };
    }
    
    // Return last 20 submissions
    return {
      userId,
      submissions: leetcodeData.submissions.slice(0, 20)
    };
  } catch (error) {
    console.error('Error in getLeetCodeSubmissions:', error);
    return {
      userId,
      submissions: []
    };
  }
}

module.exports = router;

