const mongoose = require('mongoose');

const aiCoachCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  leetcodeUsername: {
    type: String,
    required: false // Optional for backward compatibility
  },
  lastRefreshed: {
    type: Date,
    default: Date.now
  },
  recommendations: [{
    title: String,
    titleSlug: String,
    difficulty: String,
    topics: [String],
    reason: String,
    leetcodeUrl: String,
    estimatedTime: String
  }],
  strongTopics: [String],
  weakTopics: [String],
  cooldownHours: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Method to check if refresh is allowed
aiCoachCacheSchema.methods.canRefresh = function() {
  if (this.cooldownHours === 0) return true;
  
  const now = new Date();
  const hoursSinceLastRefresh = (now - this.lastRefreshed) / (1000 * 60 * 60);
  return hoursSinceLastRefresh >= this.cooldownHours;
};

// Method to get time until next refresh
aiCoachCacheSchema.methods.getTimeUntilRefresh = function() {
  if (this.cooldownHours === 0) return 0;
  
  const now = new Date();
  const hoursSinceLastRefresh = (now - this.lastRefreshed) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, this.cooldownHours - hoursSinceLastRefresh);
  
  return {
    hours: Math.floor(hoursRemaining),
    minutes: Math.floor((hoursRemaining % 1) * 60),
    canRefresh: hoursRemaining === 0
  };
};

module.exports = mongoose.model('AICoachCache', aiCoachCacheSchema);
