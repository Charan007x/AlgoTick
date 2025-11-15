const mongoose = require('mongoose');

const leetCodeSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
      enum: ['Easy', 'Medium', 'Hard']
    },
    questionId: String,
    topics: [String]
  }]
}, { timestamps: true });

// Index for faster queries
leetCodeSubmissionSchema.index({ userId: 1 });
leetCodeSubmissionSchema.index({ 'submissions.timestamp': -1 });

module.exports = mongoose.model('LeetCodeSubmission', leetCodeSubmissionSchema);
