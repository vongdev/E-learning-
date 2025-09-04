const express = require('express');
const {
  getSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  gradeSubmission,
  addFeedback,
  getSubmissionsByUser,
  getSubmissionsByAssignment
} = require('../controllers/submission.controller');

const router = express.Router({ mergeParams: true });

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Submission = require('../models/submission.model');
const { uploadFiles } = require('../middleware/upload'); // Sử dụng middleware upload đã tạo

// Protect all routes
router.use(protect);

// Define routes
router.route('/')
  // GET /api/assignments/:assignmentId/submissions -> Lấy tất cả bài nộp của 1 assignment
  .get(authorize('instructor', 'admin'), getSubmissionsByAssignment)
  // POST /api/assignments/:assignmentId/submissions -> Nộp bài
  .post(uploadFiles('submission', 'attachments', 5), createSubmission);

// Các route này dành cho quản lý chung, không lồng vào assignment
// GET /api/submissions -> Lấy tất cả bài nộp (admin)
router.get('/all', authorize('admin'), advancedResults(Submission, [
    { path: 'userId', select: 'profile.firstName profile.lastName' },
    { path: 'assignmentId', select: 'title dueDate maxScore' },
  ]), getSubmissions);
  
// GET /api/submissions/user/:userId -> Lấy bài nộp của 1 user
router.get('/user/:userId', getSubmissionsByUser);

router.route('/:id')
  .get(getSubmission)
  .put(uploadFiles('submission', 'attachments', 5), updateSubmission) // Cho phép cập nhật file
  .delete(deleteSubmission);

// Grade submission (instructor only)
router.put('/:id/grade', authorize('instructor', 'admin'), gradeSubmission);

// Add feedback to submission
router.post('/:id/feedback', authorize('instructor', 'admin', 'student'), addFeedback);

module.exports = router;