const mongoose = require('mongoose');

const QuizOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add option text']
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  explanation: String
});

const QuizQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'single-choice', 'true-false', 'matching', 'fill-in-blank', 'essay'],
    default: 'single-choice'
  },
  text: {
    type: String,
    required: [true, 'Please add question text']
  },
  explanation: String,
  points: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    required: true
  },
  options: [QuizOptionSchema],
  matchingPairs: [{
    left: String,
    right: String
  }],
  blankAnswers: [String],
  image: String,
  video: String,
  audio: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  wordLimit: Number,
  studyTips: [String]
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: String,
  instructions: String,
  type: {
    type: String,
    enum: ['self-assessment', 'graded', 'practice', 'final', 'mid-term', 'survey'],
    default: 'practice'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  sectionId: String,
  contentId: String,
  questions: [QuizQuestionSchema],
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  shuffleOptions: {
    type: Boolean,
    default: false
  },
  timeLimit: Number,
  passingScore: {
    type: Number,
    default: 70
  },
  maxAttempts: {
    type: Number,
    default: 0 // 0 = unlimited
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showExplanations: {
    type: Boolean,
    default: true
  },
  points: {
    type: Number,
    default: 10
  },
  videoId: String,
  showAtTime: Number,
  duration: {
    type: Number,
    default: 60
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', QuizSchema);
