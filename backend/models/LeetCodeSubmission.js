const mongoose = require('mongoose');

const leetCodeSubmissionSchema = new mongoose.Schema({
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
  lastFetched: {
    type: Date,
    default: Date.now
  },
  submissions: [{
    title: String,
    titleSlug: String,
    timestamp: Date,
    statusDisplay: String,
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', null]
    },
    questionId: String,
    topics: [String]
  }],
  // Cache validity period (in hours)
  cacheValidityHours: {
    type: Number,
    default: 6
  }
}, { timestamps: true });

// Index for faster queries
leetCodeSubmissionSchema.index({ userId: 1 });
leetCodeSubmissionSchema.index({ 'submissions.timestamp': -1 });

// Method to check if cache is still valid
leetCodeSubmissionSchema.methods.isValid = function() {
  const now = new Date();
  const cacheAge = (now - this.lastFetched) / (1000 * 60 * 60); // Age in hours
  return cacheAge < this.cacheValidityHours;
};

module.exports = mongoose.model('LeetCodeSubmission', leetCodeSubmissionSchema);
