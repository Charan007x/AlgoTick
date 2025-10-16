const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth');
const { fetchLeetCodeProblem, processQuestionInput } = require('../services/leetcodeService');

// All routes require authentication
router.use(authMiddleware);

// @route   POST /api/questions
// @desc    Add a new question
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { url, titleSlug, questionNumber, notes } = req.body;
    
    if (!url && !titleSlug && !questionNumber) {
      return res.status(400).json({ message: 'Please provide question number, LeetCode URL, or title slug' });
    }
    
    // Process input (question number, URL, or slug) to get title slug
    const input = questionNumber || url || titleSlug;
    const slug = await processQuestionInput(input);
    
    // Fetch problem details from LeetCode API
    const leetcodeData = await fetchLeetCodeProblem(slug);
    
    // Check if question already exists for this user
    const existingQuestion = await Question.findOne({
      userId: req.user.id,
      questionId: leetcodeData.questionId
    });
    
    if (existingQuestion) {
      return res.status(400).json({ message: 'You have already added this question' });
    }
    
    // Create new question
    const newQuestion = new Question({
      userId: req.user.id,
      title: leetcodeData.title,
      questionId: leetcodeData.questionId,
      difficulty: leetcodeData.difficulty,
      tags: leetcodeData.tags,
      url: leetcodeData.url,
      notes: notes || ''
    });
    
    // Set reminder dates
    newQuestion.setReminders();
    
    await newQuestion.save();
    
    res.status(201).json({
      message: 'Question added successfully',
      question: newQuestion
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ 
      message: 'Failed to add question', 
      error: error.message 
    });
  }
});

// @route   GET /api/questions
// @desc    Get all questions for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { filter, sortBy } = req.query;
    
    let query = { userId: req.user.id };
    
    // Apply filters
    if (filter === 'pending') {
      query.isRevised = false;
    } else if (filter === 'revised') {
      query.isRevised = true;
    } else if (filter === 'due-soon') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.nextReminders = { $elemMatch: { $lte: tomorrow } };
      query.isRevised = false;
    } else if (filter === 'overdue') {
      const today = new Date();
      query.nextReminders = { $elemMatch: { $lt: today } };
      query.isRevised = false;
    }
    
    // Sorting
    let sortOption = { dateAdded: -1 }; // Default: newest first
    if (sortBy === 'oldest') {
      sortOption = { dateAdded: 1 };
    } else if (sortBy === 'difficulty') {
      sortOption = { difficulty: 1 };
    } else if (sortBy === 'next-reminder') {
      sortOption = { 'nextReminders.0': 1 };
    }
    
    const questions = await Question.find(query).sort(sortOption);
    
    res.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Failed to retrieve questions' });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ question });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Failed to retrieve question' });
  }
});

// @route   PUT /api/questions/:id/revise
// @desc    Mark question as revised
// @access  Private
router.put('/:id/revise', async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Mark as revised
    question.markRevised();
    await question.save();
    
    res.json({
      message: 'Question marked as revised',
      question
    });
  } catch (error) {
    console.error('Revise question error:', error);
    res.status(500).json({ message: 'Failed to mark question as revised' });
  }
});

// @route   PUT /api/questions/:id
// @desc    Update question notes
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { notes } = req.body;
    
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { notes },
      { new: true }
    );
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
});

// @route   GET /api/questions/stats/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalSolved = await Question.countDocuments({ userId });
    const totalRevised = await Question.countDocuments({ userId, isRevised: true });
    const pending = await Question.countDocuments({ userId, isRevised: false });
    
    // Questions due today or overdue
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const dueToday = await Question.countDocuments({
      userId,
      isRevised: false,
      nextReminders: { $elemMatch: { $lte: today } }
    });
    
    // Questions due this week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueThisWeek = await Question.countDocuments({
      userId,
      isRevised: false,
      nextReminders: { $elemMatch: { $lte: nextWeek, $gt: today } }
    });
    
    // Difficulty breakdown
    const difficultyStats = await Question.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);
    
    const difficulty = {
      Easy: 0,
      Medium: 0,
      Hard: 0
    };
    
    difficultyStats.forEach(stat => {
      difficulty[stat._id] = stat.count;
    });
    
    res.json({
      totalSolved,
      totalRevised,
      pending,
      dueToday,
      dueThisWeek,
      difficulty
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve dashboard statistics' });
  }
});

module.exports = router;
