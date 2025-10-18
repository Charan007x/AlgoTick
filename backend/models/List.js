const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [{
    questionNumber: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    titleSlug: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }]
  }],
  color: {
    type: String,
    default: '#61dca3'
  }
}, {
  timestamps: true
});

// Index for faster queries
listSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('List', listSchema);
