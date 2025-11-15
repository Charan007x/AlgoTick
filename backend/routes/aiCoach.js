const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiCoachService = require('../ai-services/aiCoachService');
const AICoachCache = require('../models/AICoachCache');
const Question = require('../models/Question');

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

    // Generate recommendations (even for users with no questions)
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
        cooldownHours: 6
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
  try {
    // Fetch all user's questions
    const questions = await Question.find({ userId, isDeleted: false });
    
    if (!questions || questions.length === 0) {
      // Return default profile if no questions
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
    
    // Analyze tags/topics frequency
    const tagCount = {};
    questions.forEach(q => {
      if (q.tags && q.tags.length > 0) {
        q.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    // Sort topics by frequency
    const sortedTopics = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([topic]) => topic);
    
    // Strong topics: top 40% of topics
    const strongCount = Math.ceil(sortedTopics.length * 0.4);
    const strongTopics = sortedTopics.slice(0, strongCount);
    
    // Weak topics: bottom 40% of topics (or topics with low count)
    const weakTopics = sortedTopics.slice(-Math.ceil(sortedTopics.length * 0.4));
    
    return {
      userId,
      profile: {
        totalProblems: questions.length,
        currentStreak: 1, // TODO: Calculate actual streak
        lastSolved: questions[0]?.dateAdded || new Date(),
        strongTopics: strongTopics.length > 0 ? strongTopics : ['Array'],
        weakTopics: weakTopics.length > 0 ? weakTopics : ['Dynamic Programming']
      }
    };
  } catch (error) {
    console.error('Error fetching AI profile:', error);
    // Return default with basic topics on error
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
    // Fetch user's questions as submissions
    const questions = await Question.find({ userId, isDeleted: false })
      .sort({ dateAdded: -1 })
      .limit(50); // Last 50 submissions
    
    return {
      userId,
      submissions: questions.map(q => ({
        title: q.title,
        difficulty: q.difficulty,
        tags: q.tags,
        dateAdded: q.dateAdded,
        isRevised: q.isRevised,
        revisionCount: q.revisionCount
      }))
    };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return {
      userId,
      submissions: []
    };
  }
}

module.exports = router;
