const express = require('express');
const {
  getEnrollments,
  getEnrollment,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentsByCourse,
  getEnrollmentsByUser
} = require('../controllers/enrollment.controller');

const router = express.Router({ mergeParams: true });

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Enrollment = require('../models/enrollment.model');

// Define routes
router.use(protect);

router.route('/')
  .get(authorize('admin'), advancedResults(Enrollment, [
    { path: 'userId', select: 'profile.firstName profile.lastName' },
    { path: 'courseId', select: 'name code instructor' }
  ]), getEnrollments)
  .post(createEnrollment);

router.route('/:id')
  .get(getEnrollment)
  .put(authorize('admin'), updateEnrollment)
  .delete(authorize('admin'), deleteEnrollment);

// Get enrollments by course
router.get('/course/:courseId', authorize('instructor', 'admin'), getEnrollmentsByCourse);

// Get enrollments by user
router.get('/user/:userId', getEnrollmentsByUser);

module.exports = router;