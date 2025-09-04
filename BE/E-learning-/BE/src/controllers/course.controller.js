const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Check for published course
  const publishedCourse = await Course.findOne({ name: req.body.name, status: 'published' });

  // If the user is not an admin, they can only add one published course with same name
  if (publishedCourse && req.user.roles.indexOf('admin') === -1) {
    return next(
      new ErrorResponse(`You have already published a course with name ${req.body.name}`, 400)
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course owner or admin
  if (course.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this course`,
        401
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is course owner or admin
  if (course.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this course`,
        401
      )
    );
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get enrolled courses for a user
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const enrollments = await Enrollment.find({ userId: req.user.id })
    .populate('courseId');

  const courses = enrollments.map(enrollment => ({
    ...enrollment.courseId._doc,
    progress: enrollment.progress,
    enrollmentStatus: enrollment.status,
    enrollmentId: enrollment._id
  }));

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    userId: req.user.id,
    courseId: req.params.id
  });

  if (existingEnrollment) {
    return next(new ErrorResponse(`Already enrolled in this course`, 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    userId: req.user.id,
    courseId: req.params.id,
    status: 'enrolled',
    progress: 0
  });

  // Increment enrollmentCount in the course
  course.enrollmentCount += 1;
  await course.save();

  res.status(200).json({
    success: true,
    data: enrollment
  });
});