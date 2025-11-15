const mongoose = require('mongoose');

const leetcodeSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  submissions: [{
    title: String,
    titleSlug: String,
    timestamp: Date,
    statusDisplay: String, // "Accepted", "Wrong Answer", etc.
    lang: String,
    difficulty: String, // "Easy", "Medium", "Hard"
    acRate: Number, // Acceptance rate percentage
    questionId: String,
    topics: [String], // Tags/topics for the problem
    isPremium: Boolean
  }],
  lastFetched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
leetcodeSubmissionSchema.index({ userId: 1, lastFetched: -1 });

module.exports = mongoose.model('LeetCodeSubmission', leetcodeSubmissionSchema);
