const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AICoachCache = require('../models/AICoachCache');

dotenv.config();

async function resetCooldown() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding all cache entries...');
    const caches = await AICoachCache.find({});
    console.log(`📊 Found ${caches.length} cache entries`);

    if (caches.length === 0) {
      console.log('ℹ️ No cache entries to update');
      process.exit(0);
    }

    console.log('🔄 Updating cooldownHours to 0...');
    const result = await AICoachCache.updateMany(
      {},
      { $set: { cooldownHours: 0 } }
    );

    console.log(`✅ Updated ${result.modifiedCount} cache entries`);
    console.log('🎉 Cooldown reset complete!');

    // Verify the update
    const updatedCaches = await AICoachCache.find({});
    updatedCaches.forEach(cache => {
      console.log(`User: ${cache.userId}, cooldownHours: ${cache.cooldownHours}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetCooldown();
