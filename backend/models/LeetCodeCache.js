const mongoose = require('mongoose');

/**
 * Cache for LeetCode problem details to reduce API calls
 */
const leetCodeProblemCacheSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  titleSlug: {
    type: String,
    required: true,
    unique: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  tags: [{
    type: String
  }],
  url: {
    type: String,
    required: true
  },
  lastFetched: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

/**
 * Cache for LeetCode user statistics and activity
 */
const leetCodeUserStatsCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  leetcodeUsername: {
    type: String,
    required: true
  },
  stats: {
    username: String,
    realName: String,
    ranking: Number,
    totalSolved: Number,
    easySolved: Number,
    mediumSolved: Number,
    hardSolved: Number,
    streak: Number,
    totalActiveDays: Number,
    submissionCalendar: mongoose.Schema.Types.Mixed // Store as object
  },
  lastFetched: {
    type: Date,
    default: Date.now
  },
  // Cache validity period (in hours)
  cacheValidityHours: {
    type: Number,
    default: 6 // Cache is valid for 6 hours
  }
}, { timestamps: true });

// Method to check if cache is still valid
leetCodeUserStatsCacheSchema.methods.isValid = function() {
  const now = new Date();
  const cacheAge = (now - this.lastFetched) / (1000 * 60 * 60); // Age in hours
  return cacheAge < this.cacheValidityHours;
};

const LeetCodeProblemCache = mongoose.model('LeetCodeProblemCache', leetCodeProblemCacheSchema);
const LeetCodeUserStatsCache = mongoose.model('LeetCodeUserStatsCache', leetCodeUserStatsCacheSchema);

module.exports = {
  LeetCodeProblemCache,
  LeetCodeUserStatsCache
};
