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
  const course = await Course.findById(req.params.id)
    .populate('authors', 'profile.firstName profile.lastName profile.title profile.avatar')
    .populate('createdBy', 'profile.firstName profile.lastName');

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
  // Validate required fields
  const { name, code, description, category, level, thumbnail } = req.body;
  
  if (!name || !code || !description || !category || !level || !thumbnail) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }
  
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Add user as an author by default if authors not specified
  if (!req.body.authors || req.body.authors.length === 0) {
    req.body.authors = [req.user.id];
  }

  // Check for course with same code
  const existingCourse = await Course.findOne({ code: req.body.code });

  if (existingCourse) {
    return next(
      new ErrorResponse(`A course with code ${req.body.code} already exists`, 400)
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

  // If updating code, check if new code already exists
  if (req.body.code && req.body.code !== course.code) {
    const codeExists = await Course.findOne({ code: req.body.code });
    if (codeExists) {
      return next(
        new ErrorResponse(`A course with code ${req.body.code} already exists`, 400)
      );
    }
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

  // Check if there are enrollments for this course
  const enrollmentsCount = await Enrollment.countDocuments({ courseId: req.params.id });
  
  if (enrollmentsCount > 0 && !req.query.force) {
    return next(
      new ErrorResponse(
        `Cannot delete course with active enrollments. Use ?force=true to override.`,
        400
      )
    );
  }

  // Delete associated resources (enrollments, assignments, submissions, etc.)
  await Promise.all([
    Enrollment.deleteMany({ courseId: req.params.id }),
    // Add other cleanup operations here
  ]);

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
    .populate({
      path: 'courseId',
      select: 'name code description thumbnail level category enrollmentCount rating createdBy',
      populate: {
        path: 'createdBy',
        select: 'profile.firstName profile.lastName profile.avatar'
      }
    });

  const courses = enrollments.map(enrollment => ({
    ...enrollment.courseId._doc,
    progress: enrollment.progress,
    enrollmentStatus: enrollment.status,
    enrollmentId: enrollment._id,
    lastAccessedAt: enrollment.lastAccessedAt
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

  // Check if course is published
  if (course.status !== 'published') {
    return next(new ErrorResponse(`Cannot enroll in an unpublished course`, 400));
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
    progress: 0,
    enrollmentDate: Date.now(),
    lastAccessedAt: Date.now()
  });

  // Increment enrollmentCount in the course
  course.enrollmentCount += 1;
  await course.save();

  res.status(200).json({
    success: true,
    data: enrollment
  });
});