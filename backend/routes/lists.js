const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth');
const { fetchLeetCodeProblem, processQuestionInput } = require('../services/leetcodeService');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/lists
// @desc    Get all lists for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ lists });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Failed to retrieve lists' });
  }
});

// @route   POST /api/lists
// @desc    Create a new list
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'List name is required' });
    }
    
    const newList = new List({
      userId: req.user.id,
      name: name.trim(),
      description: description || '',
      color: color || '#61dca3',
      questions: []
    });
    
    await newList.save();
    
    res.status(201).json({
      message: 'List created successfully',
      list: newList
    });
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ message: 'Failed to create list' });
  }
});

// @route   GET /api/lists/:id
// @desc    Get single list by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json({ list });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ message: 'Failed to retrieve list' });
  }
});

// @route   PUT /api/lists/:id
// @desc    Update list (name, description, color)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { 
        name: name?.trim() || undefined,
        description: description !== undefined ? description : undefined,
        color: color || undefined
      },
      { new: true, runValidators: true }
    );
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json({
      message: 'List updated successfully',
      list
    });
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Failed to update list' });
  }
});

// @route   DELETE /api/lists/:id
// @desc    Delete a list
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Failed to delete list' });
  }
});

// @route   POST /api/lists/:id/add-question
// @desc    Add a question to the list
// @access  Private
router.post('/:id/add-question', async (req, res) => {
  try {
    const { url, titleSlug, questionNumber } = req.body;
    
    if (!url && !titleSlug && !questionNumber) {
      return res.status(400).json({ message: 'Please provide question number, LeetCode URL, or title slug' });
    }
    
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Process input to get title slug
    const input = questionNumber || url || titleSlug;
    const slug = await processQuestionInput(input);
    
    // Fetch problem details from LeetCode
    const leetcodeData = await fetchLeetCodeProblem(slug);
    
    // Check if question already exists in this list
    const existingQuestion = list.questions.find(
      q => q.questionNumber === leetcodeData.questionId
    );
    
    if (existingQuestion) {
      return res.status(400).json({ message: 'Question already exists in this list' });
    }
    
    // Add question to list
    list.questions.push({
      questionNumber: leetcodeData.questionId,
      title: leetcodeData.title,
      titleSlug: leetcodeData.titleSlug,
      difficulty: leetcodeData.difficulty,
      url: leetcodeData.url,
      tags: leetcodeData.tags
    });
    
    console.log('\n=== BEFORE SAVE ===');
    console.log('Questions count:', list.questions.length);
    console.log('Questions:', JSON.stringify(list.questions.map(q => ({ 
      _id: q._id, 
      questionNumber: q.questionNumber, 
      title: q.title 
    })), null, 2));
    
    await list.save();
    
    console.log('\n=== AFTER SAVE ===');
    console.log('Questions count:', list.questions.length);
    console.log('Questions:', JSON.stringify(list.questions.map(q => ({ 
      _id: q._id, 
      questionNumber: q.questionNumber, 
      title: q.title 
    })), null, 2));
    
    console.log('\n=== RESPONSE BEING SENT ===');
    console.log('List ID:', list._id);
    console.log('Questions in response:', list.questions.length);
    
    res.status(201).json({
      message: 'Question added to list',
      list
    });
  } catch (error) {
    console.error('Add question to list error:', error);
    res.status(500).json({ 
      message: 'Failed to add question to list',
      error: error.message 
    });
  }
});

// @route   DELETE /api/lists/:id/questions/:questionNumber
// @desc    Remove a question from the list
// @access  Private
router.delete('/:id/questions/:questionNumber', async (req, res) => {
  try {
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    list.questions = list.questions.filter(
      q => q.questionNumber !== req.params.questionNumber
    );
    
    await list.save();
    
    res.json({
      message: 'Question removed from list',
      list
    });
  } catch (error) {
    console.error('Remove question from list error:', error);
    res.status(500).json({ message: 'Failed to remove question' });
  }
});

// @route   POST /api/lists/:id/add-question-to-today
// @desc    Add a single question from list to today's due questions
// @access  Private
router.post('/:id/add-question-to-today', async (req, res) => {
  try {
    const { questionNumber } = req.body;
    
    if (!questionNumber) {
      return res.status(400).json({ message: 'Question number is required' });
    }
    
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Find the question in the list
    const question = list.questions.find(q => q.questionNumber === questionNumber);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found in list' });
    }
    
    // Check if question already exists in user's questions (including deleted ones)
    const existingQuestion = await Question.findOne({
      userId: req.user.id,
      questionId: question.questionNumber
    });
    
    if (existingQuestion) {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      
      // If question was deleted, restore it
      if (existingQuestion.isDeleted) {
        existingQuestion.isDeleted = false;
        existingQuestion.nextReminders = [now];
        existingQuestion.isRevised = false;
        existingQuestion.dateAdded = now; // Update dateAdded for verification
        await existingQuestion.save();
        
        return res.json({
          message: 'Question restored and added to today\'s reminders',
          question: existingQuestion
        });
      }
      
      // Check if already added today
      const alreadyAddedToday = existingQuestion.nextReminders.some(date => {
        const reminderDate = new Date(date);
        return reminderDate >= todayStart && reminderDate <= todayEnd;
      });
      
      if (alreadyAddedToday) {
        return res.status(400).json({ 
          message: 'Question already added to today\'s reminders',
          question: existingQuestion
        });
      }
      
      // Different day - add new reminder (don't increment revision count - that happens when solved)
      existingQuestion.nextReminders.unshift(now);
      
      // Reset isRevised if it was previously fully revised
      if (existingQuestion.isRevised) {
        existingQuestion.isRevised = false;
      }
      
      await existingQuestion.save();
      
      return res.json({
        message: 'Question added to today\'s reminders',
        question: existingQuestion
      });
    }
    
    // Create new question with NOW as ONLY reminder (no future reminders)
    const newQuestion = new Question({
      userId: req.user.id,
      title: question.title,
      questionId: question.questionNumber,
      difficulty: question.difficulty,
      tags: question.tags,
      url: question.url,
      notes: `Added from list: ${list.name}`
    });
    
    // Set ONLY current time as reminder - no weekly/monthly reminders
    const now = new Date();
    newQuestion.nextReminders = [now];
    
    await newQuestion.save();
    
    res.status(201).json({
      message: 'Question added to today\'s due',
      question: newQuestion
    });
  } catch (error) {
    console.error('Add question to today error:', error);
    res.status(500).json({ message: 'Failed to add question to today' });
  }
});

// @route   POST /api/lists/:id/add-all-to-today
// @desc    Add all questions from list to today's due questions
// @access  Private
router.post('/:id/add-all-to-today', async (req, res) => {
  try {
    const list = await List.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    if (list.questions.length === 0) {
      return res.status(400).json({ message: 'List is empty' });
    }
    
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let restoredCount = 0;
    
    for (const question of list.questions) {
      // Check if question already exists (including deleted ones)
      const existingQuestion = await Question.findOne({
        userId: req.user.id,
        questionId: question.questionNumber
      });
      
      if (existingQuestion) {
        // If question was deleted, restore it
        if (existingQuestion.isDeleted) {
          existingQuestion.isDeleted = false;
          existingQuestion.nextReminders = [now];
          existingQuestion.isRevised = false;
          existingQuestion.dateAdded = now; // Update dateAdded for verification
          await existingQuestion.save();
          restoredCount++;
          continue;
        }
        
        // Check if already added today
        const alreadyAddedToday = existingQuestion.nextReminders.some(date => {
          const reminderDate = new Date(date);
          return reminderDate >= todayStart && reminderDate <= todayEnd;
        });
        
        if (alreadyAddedToday) {
          skippedCount++;
        } else {
          // Different day - add new reminder (don't increment revision - that happens when solved)
          existingQuestion.nextReminders.unshift(now);
          
          // Reset isRevised if it was previously fully revised
          if (existingQuestion.isRevised) {
            existingQuestion.isRevised = false;
          }
          
          await existingQuestion.save();
          updatedCount++;
        }
      } else {
        // Create new question with ONLY current time (no future reminders)
        const newQuestion = new Question({
          userId: req.user.id,
          title: question.title,
          questionId: question.questionNumber,
          difficulty: question.difficulty,
          tags: question.tags,
          url: question.url,
          notes: `Added from list: ${list.name}`,
          nextReminders: [now]  // Only one reminder - now
        });
        
        await newQuestion.save();
        addedCount++;
      }
    }
    
    res.json({
      message: `Added ${addedCount} new, updated ${updatedCount}, restored ${restoredCount}, skipped ${skippedCount} already due today`,
      summary: {
        added: addedCount,
        updated: updatedCount,
        restored: restoredCount,
        skipped: skippedCount,
        total: list.questions.length
      }
    });
  } catch (error) {
    console.error('Add all to today error:', error);
    res.status(500).json({ message: 'Failed to add questions to today' });
  }
});

module.exports = router;
