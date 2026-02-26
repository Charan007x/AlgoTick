// Quick script to verify the LeetCode cache data in MongoDB
const mongoose = require('mongoose');
const { LeetCodeProblemCache, LeetCodeUserStatsCache } = require('../models/LeetCodeCache');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');
const User = require('../models/User');
require('dotenv').config();

async function checkCacheData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leetcode-tracker');
    console.log('✅ Connected to MongoDB\n');

    // Check LeetCodeProblemCache
    const problemCount = await LeetCodeProblemCache.countDocuments();
    console.log(`📊 LeetCode Problem Cache: ${problemCount} problems cached`);
    
    if (problemCount > 0) {
      const sampleProblem = await LeetCodeProblemCache.findOne();
      console.log('   Sample:', {
        title: sampleProblem.title,
        difficulty: sampleProblem.difficulty,
        lastFetched: sampleProblem.lastFetched
      });
    }
    console.log('');

    // Check LeetCodeUserStatsCache
    const statsCount = await LeetCodeUserStatsCache.countDocuments();
    console.log(`📊 User Stats Cache: ${statsCount} users cached`);
    
    if (statsCount > 0) {
      const stats = await LeetCodeUserStatsCache.find().populate('userId', 'username leetcodeUsername');
      stats.forEach(stat => {
        console.log(`   - ${stat.leetcodeUsername}:`);
        console.log(`     Total Solved: ${stat.stats.totalSolved}`);
        console.log(`     Last Fetched: ${stat.lastFetched}`);
        console.log(`     Cache Valid: ${stat.isValid() ? '✅ Yes' : '❌ No'}`);
      });
    }
    console.log('');

    // Check LeetCodeSubmission
    const submissionCount = await LeetCodeSubmission.countDocuments();
    console.log(`📊 Submissions Cache: ${submissionCount} users with submissions`);
    
    if (submissionCount > 0) {
      const submissions = await LeetCodeSubmission.find().populate('userId', 'username leetcodeUsername');
      submissions.forEach(sub => {
        console.log(`   - ${sub.leetcodeUsername}:`);
        console.log(`     Submissions: ${sub.submissions.length}`);
        console.log(`     Last Fetched: ${sub.lastFetched}`);
        console.log(`     Cache Valid: ${sub.isValid() ? '✅ Yes' : '❌ No'}`);
      });
    }

    console.log('\n✅ Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCacheData();
