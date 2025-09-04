const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByCourse
} = require('../controllers/assignment.controller');

const router = express.Router({ mergeParams: true });

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Assignment = require('../models/assignment.model');

// Include other resource routers
const submissionRouter = require('./submission.routes');

// Re-route into submission router
// URL sẽ là /api/assignments/:assignmentId/submissions
router.use('/:assignmentId/submissions', submissionRouter);

// Define assignment routes
router.route('/')
  .get(advancedResults(Assignment), getAssignments)
  .post(protect, authorize('instructor', 'admin'), createAssignment);

router.route('/:id')
  .get(getAssignment)
  .put(protect, authorize('instructor', 'admin'), updateAssignment)
  .delete(protect, authorize('instructor', 'admin'), deleteAssignment);

// Get assignments by course ID (giữ lại để tương thích nếu FE đã dùng)
// Tuy nhiên, route chuẩn hơn là /api/courses/:courseId/assignments
router.get('/course/:courseId', protect, getAssignmentsByCourse);

module.exports = router;