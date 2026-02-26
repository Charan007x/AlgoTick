const mongoose = require('mongoose');

const cronSettingsSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true,
    unique: true,
    enum: ['leetcodeSync', 'aiCoach']
  },
  enabled: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CronSettings', cronSettingsSchema);
