const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getEnrolledCourses,
  enrollCourse
} = require('../controllers/course.controller');

const router = express.Router();

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/course.model');

// Include other resource routers
const quizRouter = require('./quiz.routes');
const assignmentRouter = require('./assignment.routes');
const breakoutRoomRouter = require('./breakoutRoom.routes');
const progressRouter = require('./progress.routes');

// Re-route into other resource routers
router.use('/:courseId/quizzes', quizRouter);
router.use('/:courseId/assignments', assignmentRouter);
router.use('/:courseId/breakout-rooms', breakoutRoomRouter);
router.use('/:courseId/progress', progressRouter);

// Define routes
router.route('/')
  .get(advancedResults(Course, {
    path: 'authors',
    select: 'profile.firstName profile.lastName profile.title profile.avatar'
  }), getCourses)
  .post(protect, authorize('instructor', 'admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('instructor', 'admin'), updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

// Enrollment routes
router.get('/enrolled', protect, getEnrolledCourses);
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;