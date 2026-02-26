const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['achievement', 'streak', 'progress', 'reminder', 'system', 'update'],
    default: 'system'
  },
  recipients: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all'
  },
  specificUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  iconColor: {
    type: String,
    default: 'text-teal-400'
  },
  iconBg: {
    type: String,
    default: 'bg-teal-500/20'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipients: 1 });
notificationSchema.index({ specificUsers: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
