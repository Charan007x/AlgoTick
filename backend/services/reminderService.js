const Question = require('../models/Question');

/**
 * Check for questions with due reminders
 * This function is called by the cron job
 */
async function checkReminders() {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Find all questions with reminders due today or earlier
    const dueQuestions = await Question.find({
      isRevised: false,
      nextReminders: { $elemMatch: { $lte: today } }
    }).populate('userId', 'username email');
    
    console.log(`📋 Found ${dueQuestions.length} questions with due reminders`);
    
    // In a production app, you would send notifications here
    // For now, we'll just log them
    dueQuestions.forEach(question => {
      const nextReminder = question.nextReminders[0];
      const daysOverdue = Math.floor((today - nextReminder) / (1000 * 60 * 60 * 24));
      
      console.log(`🔔 Reminder: ${question.userId.username} - ${question.title}`);
      console.log(`   Due: ${nextReminder.toLocaleDateString()}`);
      if (daysOverdue > 0) {
        console.log(`   ⚠️  Overdue by ${daysOverdue} day(s)`);
      }
    });
    
    return dueQuestions;
  } catch (error) {
    console.error('❌ Error checking reminders:', error);
    throw error;
  }
}

/**
 * Get upcoming reminders for a specific user
 * @param {string} userId - The user's ID
 * @param {number} days - Number of days to look ahead
 */
async function getUpcomingReminders(userId, days = 7) {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const upcomingQuestions = await Question.find({
      userId,
      isRevised: false,
      nextReminders: { $elemMatch: { $gte: today, $lte: futureDate } }
    }).sort({ 'nextReminders.0': 1 });
    
    return upcomingQuestions;
  } catch (error) {
    console.error('Error getting upcoming reminders:', error);
    throw error;
  }
}

/**
 * Get overdue reminders for a specific user
 * @param {string} userId - The user's ID
 */
async function getOverdueReminders(userId) {
  try {
    const today = new Date();
    
    const overdueQuestions = await Question.find({
      userId,
      isRevised: false,
      nextReminders: { $elemMatch: { $lt: today } }
    }).sort({ 'nextReminders.0': 1 });
    
    return overdueQuestions;
  } catch (error) {
    console.error('Error getting overdue reminders:', error);
    throw error;
  }
}

module.exports = {
  checkReminders,
  getUpcomingReminders,
  getOverdueReminders
};
