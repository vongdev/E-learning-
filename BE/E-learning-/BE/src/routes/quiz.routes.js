const express = require('express');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesByVideoId
} = require('../controllers/quiz.controller');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Quiz = require('../models/quiz.model');

router.route('/')
  .get(advancedResults(Quiz, {
    path: 'courseId',
    select: 'name code'
  }), getQuizzes)
  .post(protect, authorize('instructor', 'admin'), createQuiz);

router.route('/:id')
  .get(getQuiz)
  .put(protect, authorize('instructor', 'admin'), updateQuiz)
  .delete(protect, authorize('instructor', 'admin'), deleteQuiz);

// Route mới để lấy quiz theo videoId, hữu ích cho việc hiển thị quiz trong video
router.get('/video/:videoId', protect, getQuizzesByVideoId);

module.exports = router;