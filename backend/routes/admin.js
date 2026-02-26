const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');
const { LeetCodeProblemCache, LeetCodeUserStatsCache } = require('../models/LeetCodeCache');
const SyncLog = require('../models/SyncLog');
const { syncAllUsersLeetCodeData, syncSpecificUser } = require('../services/leetcodeSyncCron');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');

// Get overall statistics
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // User Statistics
    const totalUsers = await User.countDocuments();
    const usersWithLeetCode = await User.countDocuments({ leetcodeUsername: { $exists: true, $ne: '' } });
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: oneMonthAgo } });

    // Most active users (by number of questions tracked)
    const mostActiveUsers = await Question.aggregate([
      { $group: { _id: '$userId', questionCount: { $sum: 1 } } },
      { $sort: { questionCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          username: '$user.username',
          email: '$user.email',
          leetcodeUsername: '$user.leetcodeUsername',
          questionCount: 1
        }
      }
    ]);

    // Activity Overview
    const totalQuestionsTracked = await Question.countDocuments();
    const totalSubmissions = await LeetCodeSubmission.countDocuments();
    
    // Average problems solved per user
    const userStats = await LeetCodeUserStatsCache.find({});
    const avgProblemsPerUser = userStats.length > 0
      ? Math.round(userStats.reduce((sum, stat) => sum + (stat.stats.totalSolved || 0), 0) / userStats.length)
      : 0;

    // Top 5 most tracked problems
    const topTrackedProblems = await Question.aggregate([
      { $group: { _id: '$titleSlug', count: { $sum: 1 }, title: { $first: '$title' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          titleSlug: '$_id',
          title: 1,
          count: 1,
          _id: 0
        }
      }
    ]);

    // Activity trend (last 7 days)
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const submissions = await LeetCodeSubmission.countDocuments({
        timestamp: { $gte: date, $lt: nextDay }
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      activityTrend.push({
        day: dayNames[date.getDay()],
        date: date.toISOString().split('T')[0],
        submissions
      });
    }

    // Sync Status
    const latestSync = await SyncLog.findOne().sort({ timestamp: -1 });
    const syncHistory = await SyncLog.find().sort({ timestamp: -1 }).limit(10);

    // Cache stats
    const cachedProblems = await LeetCodeProblemCache.countDocuments();
    const cachedUserStats = await LeetCodeUserStatsCache.countDocuments();
    const cachedSubmissions = await LeetCodeSubmission.countDocuments();

    res.json({
      userStats: {
        total: totalUsers,
        withLeetCode: usersWithLeetCode,
        newThisWeek: newUsersThisWeek,
        newThisMonth: newUsersThisMonth,
        mostActive: mostActiveUsers
      },
      activityOverview: {
        totalQuestions: totalQuestionsTracked,
        totalSubmissions,
        avgProblemsPerUser,
        topTrackedProblems,
        activityTrend
      },
      syncStatus: {
        lastSync: latestSync,
        history: syncHistory,
        nextScheduledSync: latestSync ? new Date(latestSync.timestamp.getTime() + 6 * 60 * 60 * 1000) : null
      },
      cacheStats: {
        cachedProblems,
        cachedUserStats,
        cachedSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Manual sync all users (legacy endpoint)
router.post('/sync-all', authMiddleware, isAdmin, async (req, res) => {
  try {
    console.log('Admin triggered manual sync for all users');
    const result = await syncAllUsersLeetCodeData();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error in manual sync:', error);
    res.status(500).json({ error: 'Failed to sync users' });
  }
});

// Manual sync all users with SSE (live updates)
router.get('/sync-all-stream', authMiddleware, isAdmin, async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  console.log('Admin triggered manual sync with live updates');

  // Progress callback for real-time updates
  const sendUpdate = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    await syncAllUsersLeetCodeData(sendUpdate);
    
    // Send completion event
    sendUpdate({ type: 'complete', message: 'Sync completed successfully' });
    res.end();
  } catch (error) {
    console.error('Error in manual sync:', error);
    sendUpdate({ type: 'error', message: error.message });
    res.end();
  }
});

// Sync specific user
router.post('/sync-user/:username', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`Admin triggered sync for user: ${username}`);
    const result = await syncSpecificUser(username);
    res.json({ success: true, result });
  } catch (error) {
    console.error(`Error syncing user ${req.params.username}:`, error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// Clear stale cache
router.post('/clear-stale-cache', authMiddleware, isAdmin, async (req, res) => {
  try {
    const now = new Date();
    
    // Find and delete stale problem caches
    const staleProblems = await LeetCodeProblemCache.find({}).lean();
    const staleProblemsToDelete = staleProblems.filter(cache => {
      const lastFetched = new Date(cache.lastFetched);
      const hoursSinceUpdate = (now - lastFetched) / (1000 * 60 * 60);
      return hoursSinceUpdate > (cache.cacheValidityHours || 6);
    });
    
    // Find and delete stale user stats caches
    const staleStats = await LeetCodeUserStatsCache.find({}).lean();
    const staleStatsToDelete = staleStats.filter(cache => {
      const lastFetched = new Date(cache.lastFetched);
      const hoursSinceUpdate = (now - lastFetched) / (1000 * 60 * 60);
      return hoursSinceUpdate > (cache.cacheValidityHours || 6);
    });

    const deletedProblems = await LeetCodeProblemCache.deleteMany({
      titleSlug: { $in: staleProblemsToDelete.map(p => p.titleSlug) }
    });
    
    const deletedStats = await LeetCodeUserStatsCache.deleteMany({
      username: { $in: staleStatsToDelete.map(s => s.username) }
    });

    res.json({
      success: true,
      deleted: {
        problems: deletedProblems.deletedCount,
        userStats: deletedStats.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing stale cache:', error);
    res.status(500).json({ error: 'Failed to clear stale cache' });
  }
});

// Force refresh all data
router.post('/force-refresh', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Delete all caches
    await LeetCodeProblemCache.deleteMany({});
    await LeetCodeUserStatsCache.deleteMany({});
    await LeetCodeSubmission.deleteMany({});
    
    // Trigger sync
    const result = await syncAllUsersLeetCodeData();
    
    res.json({ success: true, message: 'All caches cleared and data refreshed', result });
  } catch (error) {
    console.error('Error in force refresh:', error);
    res.status(500).json({ error: 'Failed to force refresh' });
  }
});

// Export data
router.get('/export', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    const questions = await Question.find({}).lean();
    const submissions = await LeetCodeSubmission.find({}).lean();
    const userStatsCache = await LeetCodeUserStatsCache.find({}).lean();
    
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    // Users Sheet
    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'LeetCode Username', key: 'leetcodeUsername', width: 25 },
      { header: 'Created At', key: 'createdAt', width: 20 }
    ];
    usersSheet.addRows(users.map(u => ({
      username: u.username,
      email: u.email,
      leetcodeUsername: u.leetcodeUsername || 'N/A',
      createdAt: new Date(u.createdAt).toLocaleString()
    })));
    
    // Style header row
    usersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    usersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2DD4BF' }
    };
    usersSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // User Stats Sheet
    const statsSheet = workbook.addWorksheet('User Stats');
    statsSheet.columns = [
      { header: 'LeetCode Username', key: 'username', width: 25 },
      { header: 'Total Solved', key: 'totalSolved', width: 15 },
      { header: 'Easy Solved', key: 'easy', width: 12 },
      { header: 'Medium Solved', key: 'medium', width: 15 },
      { header: 'Hard Solved', key: 'hard', width: 12 },
      { header: 'Ranking', key: 'ranking', width: 15 },
      { header: 'Last Updated', key: 'lastFetched', width: 20 }
    ];
    statsSheet.addRows(userStatsCache.map(s => ({
      username: s.leetcodeUsername,
      totalSolved: s.stats?.totalSolved || 0,
      easy: s.stats?.easySolved || 0,
      medium: s.stats?.mediumSolved || 0,
      hard: s.stats?.hardSolved || 0,
      ranking: s.stats?.ranking || 'N/A',
      lastFetched: new Date(s.lastFetched).toLocaleString()
    })));
    
    statsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    statsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    };
    statsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Tracked Questions Sheet
    const questionsSheet = workbook.addWorksheet('Tracked Questions');
    questionsSheet.columns = [
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Notes', key: 'notes', width: 50 },
      { header: 'Added At', key: 'createdAt', width: 20 }
    ];
    
    // Populate questions with user lookup
    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.username;
    });
    
    questionsSheet.addRows(questions.map(q => ({
      title: q.title || 'N/A',
      difficulty: q.difficulty || 'N/A',
      status: q.status || 'Not Started',
      notes: q.notes || '',
      createdAt: new Date(q.createdAt).toLocaleString()
    })));
    
    questionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    questionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' }
    };
    questionsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Submissions Overview Sheet
    const submissionsSheet = workbook.addWorksheet('Submissions Overview');
    submissionsSheet.columns = [
      { header: 'LeetCode Username', key: 'username', width: 25 },
      { header: 'Total Submissions', key: 'totalSubmissions', width: 18 },
      { header: 'Recent Problems', key: 'recentProblems', width: 50 },
      { header: 'Last Fetched', key: 'lastFetched', width: 20 }
    ];
    
    submissionsSheet.addRows(submissions.map(s => ({
      username: s.leetcodeUsername,
      totalSubmissions: s.submissions?.length || 0,
      recentProblems: s.submissions?.slice(0, 5).map(sub => sub.title).join(', ') || 'N/A',
      lastFetched: new Date(s.lastFetched).toLocaleString()
    })));
    
    submissionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    submissionsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    };
    submissionsSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    
    // Generate buffer and send
    const buffer = await workbook.xlsx.writeBuffer();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=algotick-admin-report.xlsx');
    res.send(buffer);
    
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// User Management Routes

// Get all users with details
router.get('/users', authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:userId/role', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Block user
router.put('/users/:userId/block', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'blocked', updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User blocked successfully', user });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Failed to block user' });
  }
});

// Unblock user
router.put('/users/:userId/unblock', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { status: 'active', updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User unblocked successfully', user });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Failed to unblock user' });
  }
});

// Delete user
router.delete('/users/:userId', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Also delete user's questions
    await Question.deleteMany({ userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
