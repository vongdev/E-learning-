const Assignment = require('../models/assignment.model');
const Submission = require('../models/submission.model');
const Course = require('../models/course.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
exports.getAssignments = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Instructor or Admin
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Check if course exists
  const course = await Course.findById(req.body.courseId);

  if (!course) {
    return next(new ErrorResponse(`No course found with id of ${req.body.courseId}`, 404));
  }

  // Make sure user is course owner or admin
  if (course.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add an assignment to this course`,
        401
      )
    );
  }

  const assignment = await Assignment.create(req.body);

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private
exports.updateAssignment = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is assignment owner or admin
  if (assignment.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this assignment`,
        401
      )
    );
  }

  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is assignment owner or admin
  if (assignment.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this assignment`,
        401
      )
    );
  }

  await assignment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get assignments by course ID
// @route   GET /api/courses/:courseId/assignments
// @access  Private
exports.getAssignmentsByCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const assignments = await Assignment.find({ courseId });

  // For each assignment, check if the user has submitted
  const assignmentsWithStatus = await Promise.all(
    assignments.map(async (assignment) => {
      const submission = await Submission.findOne({
        assignmentId: assignment._id,
        userId: req.user.id
      });

      return {
        ...assignment.toObject(),
        submitted: !!submission,
        submissionId: submission ? submission._id : null,
        submissionStatus: submission ? submission.status : null,
        score: submission && submission.grade ? submission.grade.score : null
      };
    })
  );

  res.status(200).json({
    success: true,
    count: assignmentsWithStatus.length,
    data: assignmentsWithStatus
  });
});