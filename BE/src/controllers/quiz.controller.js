const Quiz = require('../models/quiz.model');
const Course = require('../models/course.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: quiz
  });
});

// @desc    Create new quiz
// @route   POST /api/quizzes
// @access  Private/Instructor or Admin
exports.createQuiz = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Check if course exists if courseId is provided
  if (req.body.courseId) {
    const course = await Course.findById(req.body.courseId);
    
    if (!course) {
      return next(new ErrorResponse(`No course found with id of ${req.body.courseId}`, 404));
    }
    
    // Make sure user is course owner or admin
    if (course.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to add a quiz to this course`,
          401
        )
      );
    }
  }

  const quiz = await Quiz.create(req.body);

  res.status(201).json({
    success: true,
    data: quiz
  });
});

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private
exports.updateQuiz = asyncHandler(async (req, res, next) => {
  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is quiz owner or admin
  if (quiz.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this quiz`,
        401
      )
    );
  }

  quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: quiz
  });
});

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ErrorResponse(`Quiz not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is quiz owner or admin
  if (quiz.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this quiz`,
        401
      )
    );
  }

  await quiz.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get quizzes by video ID
// @route   GET /api/quizzes/video/:videoId
// @access  Private
exports.getQuizzesByVideoId = asyncHandler(async (req, res, next) => {
  const { videoId } = req.params;

  const quizzes = await Quiz.find({ videoId });

  res.status(200).json({
    success: true,
    count: quizzes.length,
    data: quizzes
  });
});