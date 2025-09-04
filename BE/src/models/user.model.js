const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserProfileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  bio: String,
  avatar: String,
  coverImage: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  organization: String,
  title: String,
  website: String,
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    github: String,
    youtube: String,
    instagram: String
  },
  location: {
    country: String,
    city: String,
    address: String,
    zipCode: String
  },
  phoneNumber: String,
  displayName: String
});

const UserPreferencesSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  language: {
    type: String,
    default: 'vi'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  autoPlayVideos: {
    type: Boolean,
    default: true
  },
  subtitlesEnabled: {
    type: Boolean,
    default: false
  },
  subtitlesLanguage: String,
  playbackSpeed: {
    type: Number,
    default: 1.0
  },
  videoQuality: {
    type: String,
    enum: ['auto', 'low', 'medium', 'high'],
    default: 'auto'
  }
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  profile: {
    type: UserProfileSchema,
    required: true
  },
  roles: {
    type: [String],
    enum: ['student', 'instructor', 'admin', 'moderator', 'guest'],
    default: ['student']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended', 'banned'],
    default: 'active'
  },
  preferences: {
    type: UserPreferencesSchema,
    default: {}
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    activities: String,
    description: String
  }],
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    description: String,
    skills: [String]
  }],
  skills: [{
    name: String,
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    yearsOfExperience: Number,
    endorsements: Number
  }],
  certificates: [{
    name: String,
    issuedBy: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    skills: [String]
  }],
  achievements: [{
    title: String,
    description: String,
    earnedDate: Date,
    image: String,
    type: {
      type: String,
      enum: ['badge', 'certificate', 'award', 'milestone']
    },
    points: Number,
    level: Number
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  coursesEnrolled: {
    type: Number,
    default: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  totalLearningTime: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  lastActive: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);