const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  questionId: {
    type: String,
    required: true
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
    type: String
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  nextReminders: [{
    type: Date
  }],
  revisedDates: [{
    type: Date
  }],
  isRevised: {
    type: Boolean,
    default: false
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
questionSchema.index({ userId: 1, dateAdded: -1 });
questionSchema.index({ userId: 1, nextReminders: 1 });

// Method to calculate next reminder dates
questionSchema.methods.setReminders = function() {
  const oneWeek = new Date(this.dateAdded);
  oneWeek.setDate(oneWeek.getDate() + 7);
  
  const oneMonth = new Date(this.dateAdded);
  oneMonth.setDate(oneMonth.getDate() + 30);
  
  this.nextReminders = [oneWeek, oneMonth];
};

// Method to mark as revised
questionSchema.methods.markRevised = function() {
  this.revisedDates.push(new Date());
  this.revisionCount += 1;
  
  // Remove the first reminder if exists
  if (this.nextReminders.length > 0) {
    this.nextReminders.shift();
  }
  
  // Mark as fully revised if no more reminders
  if (this.nextReminders.length === 0) {
    this.isRevised = true;
  }
};

module.exports = mongoose.model('Question', questionSchema);
