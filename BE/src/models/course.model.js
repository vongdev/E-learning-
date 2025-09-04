const mongoose = require('mongoose');

const CourseContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: String,
  type: {
    type: String,
    enum: ['video', 'document', 'quiz', 'assignment', 'discussion', 'interactive'],
    required: [true, 'Please specify content type']
  },
  order: {
    type: Number,
    required: true
  },
  duration: Number,
  isLocked: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  url: String,
  videoUrl: String,
  documentUrl: String,
  thumbnail: String,
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  }
});

const CourseSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: String,
  order: {
    type: Number,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
  },
  duration: Number,
  contents: [CourseContentSchema]
});

const CoursePriceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'VND'
  },
  discountAmount: Number,
  discountPercentage: Number,
  isOnSale: {
    type: Boolean,
    default: false
  },
  saleEndDate: Date
});

const CourseSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Please add a course code'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please add a course name'],
    trim: true
  },
  subtitle: String,
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  shortDescription: String,
  language: {
    type: String,
    default: 'vi'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Please add a difficulty level']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  subcategory: String,
  tags: [String],
  thumbnail: {
    type: String,
    required: [true, 'Please add a thumbnail image']
  },
  coverImage: String,
  previewVideo: String,
  duration: Number,
  lectureCount: {
    type: Number,
    default: 0
  },
  sections: [CourseSectionSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'private'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'password-protected'],
    default: 'private'
  },
  password: {
    type: String,
    select: false
  },
  price: CoursePriceSchema,
  instructor: {
    type: String,
    required: [true, 'Please provide an instructor name']
  },
  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requirements: [{
    description: String,
    order: Number
  }],
  learningOutcomes: [{
    description: String,
    order: Number
  }],
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must not be more than 5'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
  certificate: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    template: String,
    requiredCompletionPercentage: {
      type: Number,
      default: 80
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create course slug from title
CourseSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next();
    return;
  }
  
  // Create slug from name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
    
  next();
});

// Calculate lecture count from sections
CourseSchema.pre('save', function(next) {
  let count = 0;
  this.sections.forEach(section => {
    count += section.contents.length || 0;
  });
  this.lectureCount = count;
  next();
});

// Virtual for reviews
CourseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Virtual for enrollments
CourseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

module.exports = mongoose.model('Course', CourseSchema);