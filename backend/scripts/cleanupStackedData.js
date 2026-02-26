// Script to clean up stacked/duplicate data and reset the cache
const mongoose = require('mongoose');
const { LeetCodeUserStatsCache } = require('../models/LeetCodeCache');
const LeetCodeSubmission = require('../models/LeetCodeSubmission');
require('dotenv').config();

async function cleanupStackedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leetcode-tracker');
    console.log('✅ Connected to MongoDB\n');

    console.log('🧹 Cleaning up stacked/duplicate data...\n');

    // 1. Clean User Stats Cache - remove all and let the cron job repopulate
    const statsCount = await LeetCodeUserStatsCache.countDocuments();
    console.log(`📊 Found ${statsCount} user stats cache entries`);
    
    if (statsCount > 0) {
      await LeetCodeUserStatsCache.deleteMany({});
      console.log(`✅ Deleted ${statsCount} user stats cache entries`);
      console.log('   ℹ️  These will be repopulated by the cron job or on next request\n');
    }

    // 2. Clean Submissions Cache - remove duplicates and old data
    const submissionsCount = await LeetCodeSubmission.countDocuments();
    console.log(`📊 Found ${submissionsCount} user submission cache entries`);
    
    if (submissionsCount > 0) {
      const submissions = await LeetCodeSubmission.find();
      
      for (const sub of submissions) {
        console.log(`   Processing ${sub.leetcodeUsername}...`);
        
        // Deduplicate submissions within each user's cache
        const submissionMap = new Map();
        sub.submissions.forEach(s => {
          const key = `${s.titleSlug}_${s.timestamp?.getTime()}`;
          if (!submissionMap.has(key)) {
            submissionMap.set(key, s);
          }
        });
        
        const originalCount = sub.submissions.length;
        const deduplicatedSubmissions = Array.from(submissionMap.values());
        const newCount = deduplicatedSubmissions.length;
        
        if (originalCount !== newCount) {
          console.log(`   ⚠️  Found duplicates: ${originalCount} → ${newCount} submissions`);
          
          // Replace with deduplicated data
          await LeetCodeSubmission.deleteOne({ _id: sub._id });
          await LeetCodeSubmission.create({
            userId: sub.userId,
            leetcodeUsername: sub.leetcodeUsername,
            submissions: deduplicatedSubmissions,
            lastFetched: new Date()
          });
          
          console.log(`   ✅ Cleaned up duplicates for ${sub.leetcodeUsername}`);
        } else {
          console.log(`   ✅ No duplicates found for ${sub.leetcodeUsername}`);
        }
      }
      console.log('');
    }

    console.log('🎉 Cleanup complete!\n');
    console.log('📝 Summary:');
    console.log(`   - User stats cache: Cleared (${statsCount} entries removed)`);
    console.log(`   - Submissions: Deduplicated and cleaned`);
    console.log('\n💡 Recommendation:');
    console.log('   - Restart the server to trigger a fresh sync');
    console.log('   - Or wait for the next scheduled sync (every 6 hours)');
    console.log('   - Or call POST /api/auth/sync-all-users to sync immediately\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

cleanupStackedData();
