const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAIProfile, generateAndSaveProfile } = require('../services/aiProfileService');

// Rate limiting: Simple in-memory cache
const userRequestCache = new Map();
const RATE_LIMIT_MINUTES = 360; // 6 hours

// @route   GET /api/ai/insights
// @desc    Get AI-generated insights for the user (from database)
// @access  Private
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📊 [AI Insights GET] User ID:', userId);
    console.log('📊 [AI Insights GET] User from token:', req.user);
    
    // Fetch AI profile from database
    const aiProfile = await getAIProfile(userId);
    
    if (!aiProfile) {
      console.log('⚠️ [AI Insights GET] No profile found for user:', userId);
      return res.status(404).json({ 
        message: 'No AI insights available yet. Please check back tomorrow after 2 AM.',
        profile: {
          totalSolved: 0,
          streak: 0,
          strongTopics: [],
          weakTopics: []
        }
      });
    }
    
    console.log('✅ [AI Insights GET] Profile found for user:', userId);
    console.log('✅ [AI Insights GET] Profile data:', {
      totalSolved: aiProfile.profile?.totalSolved,
      streak: aiProfile.profile?.streak,
      strongTopics: aiProfile.profile?.strongTopics,
      weakTopics: aiProfile.profile?.weakTopics,
      lastUpdated: aiProfile.lastUpdated
    });
    
    // Return stored insights
    res.json({
      summary: aiProfile.summary,
      strengths: aiProfile.strengths,
      weaknesses: aiProfile.weaknesses,
      revisionFeedback: aiProfile.revisionFeedback,
      behavioralTips: aiProfile.behavioralTips,
      weeklyGoal: aiProfile.weeklyGoal,
      profile: aiProfile.profile,
      lastUpdated: aiProfile.lastUpdated
    });
    
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch AI insights',
      error: error.message 
    });
  }
});

// @route   POST /api/ai/refresh
// @desc    Manually refresh AI insights (rate limited)
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🔄 [AI Refresh POST] User ID:', userId);
    console.log('🔄 [AI Refresh POST] User from token:', req.user);
    
    // Rate limiting check
    const now = Date.now();
    const lastRequest = userRequestCache.get(userId);
    
    if (lastRequest && (now - lastRequest) < RATE_LIMIT_MINUTES * 60 * 1000) {
      const waitTimeMinutes = Math.ceil((RATE_LIMIT_MINUTES * 60 * 1000 - (now - lastRequest)) / 1000 / 60);
      const waitTimeHours = Math.floor(waitTimeMinutes / 60);
      const remainingMinutes = waitTimeMinutes % 60;
      
      let waitMessage;
      if (waitTimeHours > 0) {
        waitMessage = remainingMinutes > 0 
          ? `${waitTimeHours}h ${remainingMinutes}m`
          : `${waitTimeHours}h`;
      } else {
        waitMessage = `${waitTimeMinutes}m`;
      }
      
      return res.status(429).json({ 
        message: `Please wait ${waitMessage} before requesting new insights.`,
        retryAfter: waitTimeMinutes
      });
    }
    
    // Build user profile from questions
    const aiProfile = await generateAndSaveProfile(userId);
    
    // Update rate limit cache
    userRequestCache.set(userId, now);
    
    // Clean up old cache entries (every 100 requests)
    if (userRequestCache.size > 100) {
      const cutoffTime = now - (RATE_LIMIT_MINUTES * 60 * 1000);
      for (const [key, value] of userRequestCache.entries()) {
        if (value < cutoffTime) {
          userRequestCache.delete(key);
        }
      }
    }
    
    // Return response
    res.json({
      summary: aiProfile.summary,
      strengths: aiProfile.strengths,
      weaknesses: aiProfile.weaknesses,
      revisionFeedback: aiProfile.revisionFeedback,
      behavioralTips: aiProfile.behavioralTips,
      weeklyGoal: aiProfile.weeklyGoal,
      profile: aiProfile.profile,
      lastUpdated: aiProfile.lastUpdated,
      message: 'AI insights refreshed successfully'
    });
    
  } catch (error) {
    console.error('AI Refresh Error:', error);
    res.status(500).json({ 
      message: 'Failed to refresh AI insights',
      error: error.message 
    });
  }
});

// @route   POST /api/ai/sync-leetcode
// @desc    Sync LeetCode submissions to database
// @access  Private
router.post('/sync-leetcode', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const User = require('../models/User');
    const { saveLeetCodeSubmissions } = require('../services/leetcodeService');
    
    console.log('🔄 [LeetCode Sync] User ID:', userId);
    
    // Get user's LeetCode username
    const user = await User.findById(userId);
    
    if (!user || !user.leetcodeUsername) {
      return res.status(400).json({
        message: 'LeetCode username not found. Please update your profile.'
      });
    }
    
    console.log('📡 [LeetCode Sync] Fetching for username:', user.leetcodeUsername);
    
    // Fetch and save submissions
    const submissionDoc = await saveLeetCodeSubmissions(userId, user.leetcodeUsername);
    
    res.json({
      message: 'LeetCode submissions synced successfully',
      submissionsCount: submissionDoc.submissions.length,
      lastFetched: submissionDoc.lastFetched
    });
    
  } catch (error) {
    console.error('❌ [LeetCode Sync] Error:', error);
    res.status(500).json({
      message: 'Failed to sync LeetCode submissions',
      error: error.message
    });
  }
});

module.exports = router;
