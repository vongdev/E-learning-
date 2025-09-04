const mongoose = require('mongoose');

const BreakoutRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add room name']
  },
  topic: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    isOnline: {
      type: Boolean,
      default: false
    },
    isLeader: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'waiting', 'closed'],
    default: 'active'
  },
  maxCapacity: {
    type: Number,
    default: 10
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('BreakoutRoom', BreakoutRoomSchema);