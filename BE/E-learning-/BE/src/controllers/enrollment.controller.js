const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const Progress = require('../models/progress.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Private/Admin
exports.getEnrollments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single enrollment
// @route   GET /api/enrollments/:id
// @access  Private
exports.getEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('userId', 'profile.firstName profile.lastName email')
    .populate('courseId', 'name code instructor');

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is enrollment owner or admin
  if (enrollment.userId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this enrollment`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

// @desc    Create enrollment
// @route   POST /api/enrollments
// @access  Private
exports.createEnrollment = asyncHandler(async (req, res, next) => {
  // Extract enrollment data
  const { courseId } = req.body;
  
  // Add user ID
  req.body.userId = req.user.id;
  req.body.enrollmentDate = Date.now();
  req.body.status = 'enrolled';
  req.body.progress = 0;
  
  // Check if course exists
  const course = await Course.findById(courseId);
  
  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${courseId}`, 404));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    courseId,
    userId: req.user.id
  });

  if (existingEnrollment) {
    return next(new ErrorResponse(`Already enrolled in this course`, 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create(req.body);

  // Increment enrollmentCount in the course
  course.enrollmentCount += 1;
  await course.save();

  // Create initial progress record
  await Progress.create({
    userId: req.user.id,
    courseId,
    progress: 0,
    sectionsProgress: {},
    contentsProgress: {},
    completedContents: [],
    startedAt: Date.now(),
    lastAccessedAt: Date.now()
  });

  res.status(201).json({
    success: true,
    data: enrollment
  });
});

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Private/Admin
exports.updateEnrollment = asyncHandler(async (req, res, next) => {
  let enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private/Admin
exports.deleteEnrollment = asyncHandler(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new ErrorResponse(`Enrollment not found with id of ${req.params.id}`, 404));
  }

  // Get course to decrement enrollment count
  const course = await Course.findById(enrollment.courseId);
  if (course) {
    course.enrollmentCount = Math.max(0, course.enrollmentCount - 1);
    await course.save();
  }

  // Delete associated progress
  await Progress.findOneAndDelete({
    userId: enrollment.userId,
    courseId: enrollment.courseId
  });

  await enrollment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get enrollments for a course
// @route   GET /api/courses/:courseId/enrollments
// @access  Private/Instructor
exports.getEnrollmentsByCourse = asyncHandler(async (req, res, next) => {
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
        `User ${req.user.id} is not authorized to view enrollments for this course`,
        401
      )
    );
  }

  const enrollments = await Enrollment.find({ courseId })
    .populate('userId', 'profile.firstName profile.lastName email username');

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

// @desc    Get enrollments for a user
// @route   GET /api/users/:userId/enrollments
// @access  Private
exports.getEnrollmentsByUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Make sure user is owner or admin
  if (userId !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view these enrollments`,
        401
      )
    );
  }

  const enrollments = await Enrollment.find({ userId })
    .populate('courseId', 'name code instructor thumbnail createdAt');

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});