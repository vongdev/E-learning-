const BreakoutRoom = require('../models/breakoutRoom.model');
const Course = require('../models/course.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all breakout rooms
// @route   GET /api/breakout-rooms
// @access  Private
exports.getBreakoutRooms = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single breakout room
// @route   GET /api/breakout-rooms/:id
// @access  Private
exports.getBreakoutRoom = asyncHandler(async (req, res, next) => {
  const room = await BreakoutRoom.findById(req.params.id)
    .populate('createdBy', 'profile.firstName profile.lastName')
    .populate('participants.userId', 'profile.firstName profile.lastName profile.avatar');

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Create new breakout room
// @route   POST /api/courses/:courseId/breakout-rooms
// @access  Private/Instructor
exports.createBreakoutRoom = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${courseId}`, 404));
  }

  // Make sure user is course owner or admin
  if (course.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to create a breakout room for this course`,
        401
      )
    );
  }

  // Add user to req.body as createdBy
  req.body.createdBy = req.user.id;
  req.body.courseId = courseId;
  req.body.status = 'active';
  req.body.participants = [{
    userId: req.user.id,
    name: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
    isOnline: true,
    isLeader: true,
    joinedAt: Date.now()
  }];

  const breakoutRoom = await BreakoutRoom.create(req.body);

  res.status(201).json({
    success: true,
    data: breakoutRoom
  });
});

// @desc    Update breakout room
// @route   PUT /api/breakout-rooms/:id
// @access  Private
exports.updateBreakoutRoom = asyncHandler(async (req, res, next) => {
  let room = await BreakoutRoom.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is room creator or admin
  if (room.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this breakout room`,
        401
      )
    );
  }

  // Don't allow updating certain fields
  const { participants, messages, createdBy, courseId, ...updateData } = req.body;

  room = await BreakoutRoom.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: room
  });
});

// @desc    Delete breakout room
// @route   DELETE /api/breakout-rooms/:id
// @access  Private
exports.deleteBreakoutRoom = asyncHandler(async (req, res, next) => {
  const room = await BreakoutRoom.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is room creator or admin
  if (room.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this breakout room`,
        401
      )
    );
  }

  await room.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join breakout room
// @route   PUT /api/breakout-rooms/:id/join
// @access  Private
exports.joinBreakoutRoom = asyncHandler(async (req, res, next) => {
  const room = await BreakoutRoom.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  // Check if room is closed
  if (room.status === 'closed') {
    return next(new ErrorResponse(`This breakout room is closed`, 400));
  }

  // Check if room is at max capacity
  if (room.participants.length >= room.maxCapacity) {
    return next(new ErrorResponse(`This breakout room is full`, 400));
  }

  // Check if user is already in the room
  const isAlreadyJoined = room.participants.some(
    participant => participant.userId.toString() === req.user.id
  );

  if (isAlreadyJoined) {
    // Just update online status
    const updatedRoom = await BreakoutRoom.findOneAndUpdate(
      { 
        _id: req.params.id,
        'participants.userId': req.user.id
      },
      {
        $set: {
          'participants.$.isOnline': true,
          lastActivity: Date.now()
        }
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedRoom
    });
  }

  // Add user to participants
  const updatedRoom = await BreakoutRoom.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        participants: {
          userId: req.user.id,
          name: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
          isOnline: true,
          isLeader: false,
          joinedAt: Date.now()
        }
      },
      $set: { lastActivity: Date.now() }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: updatedRoom
  });
});

// @desc    Leave breakout room
// @route   PUT /api/breakout-rooms/:id/leave
// @access  Private
exports.leaveBreakoutRoom = asyncHandler(async (req, res, next) => {
  const room = await BreakoutRoom.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  // Check if user is in the room
  const isInRoom = room.participants.some(
    participant => participant.userId.toString() === req.user.id
  );

  if (!isInRoom) {
    return next(new ErrorResponse(`You are not in this breakout room`, 400));
  }

  // Check if user is the leader and there are other participants
  const isLeader = room.participants.find(
    p => p.userId.toString() === req.user.id && p.isLeader
  );
  
  if (isLeader && room.participants.length > 1) {
    // Find next leader (the next person who joined)
    const nextLeader = room.participants
      .filter(p => p.userId.toString() !== req.user.id)
      .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt))[0];

    // Update next person as leader
    await BreakoutRoom.updateOne(
      { _id: req.params.id, 'participants.userId': nextLeader.userId },
      { $set: { 'participants.$.isLeader': true } }
    );
  }

  // Remove user from participants
  const updatedRoom = await BreakoutRoom.findByIdAndUpdate(
    req.params.id,
    {
      $pull: {
        participants: { userId: req.user.id }
      },
      $set: { lastActivity: Date.now() }
    },
    { new: true }
  );

  // If no participants left, close the room
  if (updatedRoom.participants.length === 0) {
    updatedRoom.status = 'closed';
    await updatedRoom.save();
  }

  res.status(200).json({
    success: true,
    data: updatedRoom
  });
});

// @desc    Send message in breakout room
// @route   POST /api/breakout-rooms/:id/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  
  if (!content) {
    return next(new ErrorResponse('Please provide message content', 400));
  }

  const room = await BreakoutRoom.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  // Check if user is in the room
  const isInRoom = room.participants.some(
    participant => participant.userId.toString() === req.user.id
  );

  if (!isInRoom) {
    return next(new ErrorResponse(`You are not in this breakout room`, 400));
  }

  // Add message
  const message = {
    userId: req.user.id,
    userName: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
    content,
    timestamp: Date.now()
  };

  const updatedRoom = await BreakoutRoom.findByIdAndUpdate(
    req.params.id,
    {
      $push: { messages: message },
      $set: { lastActivity: Date.now() }
    },
    { new: true }
  );

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Get messages from breakout room
// @route   GET /api/breakout-rooms/:id/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const room = await BreakoutRoom.findById(req.params.id);

  if (!room) {
    return next(new ErrorResponse(`Breakout room not found with id of ${req.params.id}`, 404));
  }

  // Check if user is in the room or is an admin
  const isInRoom = room.participants.some(
    participant => participant.userId.toString() === req.user.id
  );

  if (!isInRoom && !req.user.roles.includes('admin')) {
    return next(new ErrorResponse(`You are not in this breakout room`, 400));
  }

  res.status(200).json({
    success: true,
    count: room.messages.length,
    data: room.messages
  });
});