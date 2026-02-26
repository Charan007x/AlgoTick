const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    required: true
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  successCount: {
    type: Number,
    default: 0
  },
  failedCount: {
    type: Number,
    default: 0
  },
  skippedCount: {
    type: Number,
    default: 0
  },
  details: {
    type: String,
    default: ''
  },
  errors: [{
    username: String,
    error: String
  }],
  duration: {
    type: Number, // in milliseconds
    default: 0
  }
});

module.exports = mongoose.model('SyncLog', syncLogSchema);
