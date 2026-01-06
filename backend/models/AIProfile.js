const mongoose = require('mongoose');

const aiProfileSchema = new mongoose.Schema({
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
  profile: {
    totalProblems: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    lastSolved: Date,
    strongTopics: [String],
    weakTopics: [String]
  },
  insights: [String],
  motivation: String,
  strengths: [{
    topic: String,
    proficiency: String,
    problems: Number
  }],
  weaknesses: [{
    topic: String,
    proficiency: String,
    problems: Number
  }],
  behavioralTips: [String]
}, { timestamps: true });

// Index for faster queries
aiProfileSchema.index({ userId: 1 });

module.exports = mongoose.model('AIProfile', aiProfileSchema);
