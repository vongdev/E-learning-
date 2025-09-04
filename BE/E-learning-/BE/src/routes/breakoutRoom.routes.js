const express = require('express');
const {
  getBreakoutRooms,
  getBreakoutRoom,
  createBreakoutRoom,
  updateBreakoutRoom,
  deleteBreakoutRoom,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  sendMessage,
  getMessages
} = require('../controllers/breakoutRoom.controller');

const router = express.Router({ mergeParams: true });

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const BreakoutRoom = require('../models/breakoutRoom.model');

// Define routes
router.use(protect);

router.route('/')
  .get(advancedResults(BreakoutRoom, {
    path: 'participants.userId',
    select: 'profile.firstName profile.lastName profile.avatar'
  }), getBreakoutRooms)
  .post(authorize('instructor', 'admin'), createBreakoutRoom);

router.route('/:id')
  .get(getBreakoutRoom)
  .put(authorize('instructor', 'admin'), updateBreakoutRoom)
  .delete(authorize('instructor', 'admin'), deleteBreakoutRoom);

// Participation routes
router.put('/:id/join', joinBreakoutRoom);
router.put('/:id/leave', leaveBreakoutRoom);

// Message routes
router.post('/:id/messages', sendMessage);
router.get('/:id/messages', getMessages);

module.exports = router;