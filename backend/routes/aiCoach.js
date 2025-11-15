const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiCoachService = require('../ai-services/aiCoachService');
const AICoachCache = require('../models/AICoachCache');

// Mock models - Replace with actual imports when available
// const AIProfile = require('../models/AIProfile');
// const LeetCodeSubmission = require('../models/LeetCodeSubmission');

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

    // Check cache first
    let cache = await AICoachCache.findOne({ userId });
    console.log('💾 Cache found:', !!cache);
    
    if (cache && !req.query.refresh) {
      // Return cached data with cooldown info
      const timeUntilRefresh = cache.getTimeUntilRefresh();
      
      console.log('✅ Returning cached data');
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
      await cache.save();
      console.log('💾 Cache updated');
    } else {
      cache = await AICoachCache.create({
        userId,
        strongTopics: aiProfile.profile.strongTopics,
        weakTopics: aiProfile.profile.weakTopics,
        recommendations: recommendations.data?.recommendations || recommendations.fallback?.recommendations || [],
        lastRefreshed: new Date(),
        cooldownHours: 0 // Change to 6 for production
      });
      console.log('💾 Cache created');
    }

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
      await cache.save();
      console.log('✅ Updated cache with fresh Gemini data');
    } else {
      cache = await AICoachCache.create({
        userId,
        ...newData,
        cooldownHours: 0 // Change to 6 for production
      });
      console.log('✅ Created new cache with Gemini data');
    }

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
// TODO: Replace these with actual database queries

async function getAIProfile(userId) {
  // This should query your AIProfile model
  // Example: return await AIProfile.findOne({ userId });
  
  // Temporary mock data for development
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

async function getLeetCodeSubmissions(userId) {
  // This should query your LeetCodeSubmission model
  // Example: return await LeetCodeSubmission.findOne({ userId });
  
  // Temporary mock data for development
  return {
    userId,
    submissions: []
  };
}

module.exports = router;
