const mongoose = require('mongoose');

const aiProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  summary: {
    type: String,
    default: ''
  },
  strengths: [{
    topic: String,
    comment: String
  }],
  weaknesses: [{
    topic: String,
    comment: String
  }],
  revisionFeedback: {
    type: String,
    default: ''
  },
  behavioralTips: [{
    type: String
  }],
  weeklyGoal: {
    focusTopic: String,
    targetProblems: Number,
    expectedAccuracyImprovement: String
  },
  profile: {
    totalSolved: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    topicAccuracy: [{
      topic: String,
      solved: Number,
      revised: Number,
      accuracy: Number,  // percentage
      lastWeekCount: Number
    }],
    strongTopics: [{
      type: String
    }],
    weakTopics: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// Index for faster queries
aiProfileSchema.index({ userId: 1 });
aiProfileSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('AIProfile', aiProfileSchema);
