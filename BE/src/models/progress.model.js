const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sectionsProgress: {
    type: Map,
    of: Number,
    default: {}
  },
  contentsProgress: {
    type: Map,
    of: Number,
    default: {}
  },
  completedContents: [String],
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  timeSpent: {
    type: Number,
    default: 0
  },
  quizScores: {
    type: Map,
    of: Number,
    default: {}
  },
  assignmentGrades: {
    type: Map,
    of: Number,
    default: {}
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String
}, {
  timestamps: true
});

// Compound index to ensure only one progress record per user per course
ProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);