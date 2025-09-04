const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  detailedRequirements: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sectionId: String,
  contentId: String,
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  type: {
    type: String,
    enum: ['essay', 'quiz', 'project', 'presentation', 'discussion'],
    default: 'essay'
  },
  maxScore: {
    type: Number,
    default: 100
  },
  rubric: [{
    criteria: String,
    maxPoints: Number,
    description: String
  }],
  allowLateSubmissions: {
    type: Boolean,
    default: false
  },
  latePenaltyPercentage: {
    type: Number,
    default: 0
  },
  resources: [{
    name: String,
    url: String,
    type: String
  }],
  attachments: [{
    name: String,
    size: String,
    type: String,
    url: String
  }],
  isGroupAssignment: {
    type: Boolean,
    default: false
  },
  groupSize: {
    min: Number,
    max: Number
  },
  visibleToStudents: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', AssignmentSchema);