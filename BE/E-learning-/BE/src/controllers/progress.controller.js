const Progress = require('../models/progress.model');
const Course = require('../models/course.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user progress for a course
// @route   GET /api/courses/:courseId/progress
// @access  Private
exports.getCourseProgress = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${courseId}`, 404));
  }

  // Get progress
  const progress = await Progress.findOne({
    userId: req.user.id,
    courseId
  });

  // If no progress record, create one
  if (!progress) {
    const newProgress = await Progress.create({
      userId: req.user.id,
      courseId,
      progress: 0,
      sectionsProgress: {},
      contentsProgress: {},
      completedContents: [],
      startedAt: Date.now(),
      lastAccessedAt: Date.now()
    });

    return res.status(200).json({
      success: true,
      data: newProgress
    });
  }

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Update content progress in a course
// @route   PUT /api/courses/:courseId/contents/:contentId/progress
// @access  Private
exports.updateContentProgress = asyncHandler(async (req, res, next) => {
  const { courseId, contentId } = req.params;
  const { progress: progressValue } = req.body;

  if (progressValue === undefined) {
    return next(new ErrorResponse('Please provide progress value', 400));
  }

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${courseId}`, 404));
  }

  // Find the section and content
  let contentFound = false;
  let sectionId = null;

  course.sections.forEach(section => {
    const content = section.contents.find(c => c._id.toString() === contentId);
    if (content) {
      contentFound = true;
      sectionId = section._id.toString();
    }
  });

  if (!contentFound) {
    return next(new ErrorResponse(`Content not found in course`, 404));
  }

  // Find progress record or create if not exists
  let progress = await Progress.findOne({
    userId: req.user.id,
    courseId
  });

  if (!progress) {
    progress = await Progress.create({
      userId: req.user.id,
      courseId,
      progress: 0,
      sectionsProgress: {},
      contentsProgress: {},
      completedContents: [],
      startedAt: Date.now()
    });
  }

  // Update content progress
  progress.contentsProgress.set(contentId, progressValue);
  progress.lastAccessedAt = Date.now();

  // Calculate overall course progress
  let totalContents = 0;
  let completedOrInProgressContents = 0;

  course.sections.forEach(section => {
    section.contents.forEach(content => {
      totalContents++;
      const contentProgress = progress.contentsProgress.get(content._id.toString()) || 0;
      if (contentProgress > 0) {
        completedOrInProgressContents++;
      }
    });
  });

  progress.progress = Math.round((completedOrInProgressContents / totalContents) * 100);

  // Calculate section progress
  course.sections.forEach(section => {
    let sectionTotal = section.contents.length;
    let sectionCompleted = 0;
    
    section.contents.forEach(content => {
      const contentProgress = progress.contentsProgress.get(content._id.toString()) || 0;
      if (contentProgress > 0) {
        sectionCompleted++;
      }
    });
    
    const sectionProgress = Math.round((sectionCompleted / sectionTotal) * 100);
    progress.sectionsProgress.set(section._id.toString(), sectionProgress);
  });

  await progress.save();

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Mark content as completed
// @route   PUT /api/courses/:courseId/contents/:contentId/complete
// @access  Private
exports.markContentCompleted = asyncHandler(async (req, res, next) => {
  const { courseId, contentId } = req.params;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${courseId}`, 404));
  }

  // Find the content
  let contentFound = false;
  let sectionId = null;

  course.sections.forEach(section => {
    const content = section.contents.find(c => c._id.toString() === contentId);
    if (content) {
      contentFound = true;
      sectionId = section._id.toString();
    }
  });

  if (!contentFound) {
    return next(new ErrorResponse(`Content not found in course`, 404));
  }

  // Find progress record or create if not exists
  let progress = await Progress.findOne({
    userId: req.user.id,
    courseId
  });

  if (!progress) {
    progress = await Progress.create({
      userId: req.user.id,
      courseId,
      progress: 0,
      sectionsProgress: {},
      contentsProgress: {},
      completedContents: [],
      startedAt: Date.now()
    });
  }

  // Mark content as completed if not already completed
  if (!progress.completedContents.includes(contentId)) {
    progress.completedContents.push(contentId);
    progress.contentsProgress.set(contentId, 100);
    progress.lastAccessedAt = Date.now();

    // Calculate overall course progress
    const totalContents = course.sections.reduce((sum, section) => sum + section.contents.length, 0);
    const completedPercentage = (progress.completedContents.length / totalContents) * 100;
    progress.progress = Math.round(completedPercentage);

    // Update section progress
    course.sections.forEach(section => {
      const sectionContents = section.contents.map(c => c._id.toString());
      const completedSectionContents = progress.completedContents.filter(c => sectionContents.includes(c));
      const sectionProgress = Math.round((completedSectionContents.length / sectionContents.length) * 100);
      progress.sectionsProgress.set(section._id.toString(), sectionProgress);
    });

    // Check if course is fully completed
    if (progress.progress === 100) {
      progress.completedAt = Date.now();
    }

    await progress.save();
  }

  res.status(200).json({
    success: true,
    data: progress
  });
});

// @desc    Get all user progress for a course (for instructors)
// @route   GET /api/courses/:courseId/all-progress
// @access  Private/Instructor
exports.getAllCourseProgress = asyncHandler(async (req, res, next) => {
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
        `User ${req.user.id} is not authorized to view all progress for this course`,
        401
      )
    );
  }

  // Get all progress records for the course
  const progress = await Progress.find({ courseId })
    .populate('userId', 'profile.firstName profile.lastName username');

  res.status(200).json({
    success: true,
    count: progress.length,
    data: progress
  });
});

// @desc    Get all progress for a user (for admins)
// @route   GET /api/users/:userId/progress
// @access  Private/Admin
exports.getUserProgress = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Make sure user is owner or admin
  if (userId !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this user's progress`,
        401
      )
    );
  }

  // Get all progress records for the user
  const progress = await Progress.find({ userId })
    .populate('courseId', 'name code instructor');

  res.status(200).json({
    success: true,
    count: progress.length,
    data: progress
  });
});

// @desc    Reset user progress for a course
// @route   DELETE /api/courses/:courseId/progress
// @access  Private
exports.resetCourseProgress = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${courseId}`, 404));
  }

  // Delete the progress record
  await Progress.findOneAndDelete({
    userId: req.user.id,
    courseId
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});