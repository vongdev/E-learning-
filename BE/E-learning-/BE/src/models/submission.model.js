const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
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
  submissionText: String,
  attachments: [{
    name: String,
    size: String,
    type: String,
    url: String
  }],
  submissionDate: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned', 'late', 'missing'],
    default: 'submitted'
  },
  grade: {
    score: Number,
    maxScore: Number,
    percentage: Number,
    feedback: String,
    rubricEvaluation: [{
      criteriaId: String,
      score: Number,
      feedback: String
    }],
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  feedbacks: [{
    author: String,
    date: String,
    comment: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', SubmissionSchema);