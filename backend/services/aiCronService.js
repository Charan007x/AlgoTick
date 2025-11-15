const cron = require('node-cron');
const User = require('../models/User');
const { generateAndSaveProfile } = require('./aiProfileService');

/**
 * Initialize AI Profile Generation Cron Job
 * Runs daily at 2:00 AM to generate AI profiles for all users
 */
function initAIProfileCron() {
  // Schedule: At 02:00 AM every day
  // Cron format: minute hour day month weekday
  // '0 2 * * *' = At minute 0 of hour 2 (2:00 AM) every day
  
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('\n🤖 ======================================');
      console.log('🤖 Starting AI Profile Generation');
      console.log('🤖 Time:', new Date().toISOString());
      console.log('🤖 ======================================\n');
      
      // Get all users
      const users = await User.find({}).select('_id username');
      console.log(`📊 Found ${users.length} users to process`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Generate profiles for each user
      for (const user of users) {
        try {
          await generateAndSaveProfile(user._id);
          successCount++;
          
          // Add small delay between API calls to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          
        } catch (error) {
          console.error(`❌ Failed for user ${user.username}:`, error.message);
          errorCount++;
        }
      }
      
      console.log('\n🤖 ======================================');
      console.log('🤖 AI Profile Generation Complete');
      console.log(`✅ Success: ${successCount} profiles`);
      console.log(`❌ Errors: ${errorCount} profiles`);
      console.log('🤖 ======================================\n');
      
    } catch (error) {
      console.error('❌ AI Profile Cron Job Error:', error);
    }
  });
  
  console.log('✅ AI Profile Cron Job initialized (runs daily at 2:00 AM)');
}

/**
 * Manual trigger for testing
 * Generate AI profile for a specific user
 */
async function generateProfileForUser(userId) {
  try {
    console.log(`🤖 Manually generating AI profile for user: ${userId}`);
    const profile = await generateAndSaveProfile(userId);
    console.log('✅ Profile generated successfully');
    return profile;
  } catch (error) {
    console.error('❌ Manual generation failed:', error);
    throw error;
  }
}

module.exports = {
  initAIProfileCron,
  generateProfileForUser
};
