const express = require('express');
const router = express.Router();

// Import individual route files
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const courseRoutes = require('./course.routes');
const enrollmentRoutes = require('./enrollment.routes');
const quizRoutes = require('./quiz.routes');
const assignmentRoutes = require('./assignment.routes');
const submissionRoutes = require('./submission.routes');
const breakoutRoomRoutes = require('./breakoutRoom.routes');
const progressRoutes = require('./progress.routes');

// Mount routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api/enrollments', enrollmentRoutes);
router.use('/api/quizzes', quizRoutes);
router.use('/api/assignments', assignmentRoutes);
router.use('/api/submissions', submissionRoutes);
router.use('/api/breakout-rooms', breakoutRoomRoutes);
router.use('/api/progress', progressRoutes);

// API status endpoint
router.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    version: '1.0.0',
    timestamp: new Date()
  });
});

module.exports = router;