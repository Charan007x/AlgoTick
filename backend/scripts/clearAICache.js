const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AICoachCache = require('../models/AICoachCache');
const AIProfile = require('../models/AIProfile');

dotenv.config();

async function clearCache() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n=== BEFORE CLEARING ===');
    
    console.log('\n📊 AI Profiles:');
    const profiles = await AIProfile.find();
    profiles.forEach(p => {
      console.log(`  User: ${p.userId}`);
      console.log(`  Strong: ${p.profile.strongTopics.join(', ')}`);
      console.log(`  Weak: ${p.profile.weakTopics.join(', ')}`);
      console.log(`  Updated: ${p.updatedAt}`);
    });

    console.log('\n💾 AI Coach Cache:');
    const caches = await AICoachCache.find();
    caches.forEach(c => {
      console.log(`  User: ${c.userId}`);
      console.log(`  Strong: ${c.strongTopics.join(', ')}`);
      console.log(`  Weak: ${c.weakTopics.join(', ')}`);
      console.log(`  Last Refreshed: ${c.lastRefreshed}`);
    });

    console.log('\n🗑️ Deleting all AI profiles and cache...');
    const profileResult = await AIProfile.deleteMany({});
    const cacheResult = await AICoachCache.deleteMany({});
    
    console.log(`✅ Deleted ${profileResult.deletedCount} profiles`);
    console.log(`✅ Deleted ${cacheResult.deletedCount} cache entries`);
    console.log('\n🎉 Cache cleared! Refresh AI Coach to regenerate with new data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearCache();
