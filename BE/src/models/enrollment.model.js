const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
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
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['not-enrolled', 'enrolled', 'in-progress', 'completed', 'expired'],
    default: 'enrolled'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedContents: [{
    contentId: String,
    completedAt: Date
  }],
  certificate: {
    id: String,
    issueDate: Date,
    downloadUrl: String
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only enroll once in a course
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);