const mongoose = require('mongoose');
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
  const { title, description, courseId, dueDate } = req.body;
  
  // Validate required fields
  if (!title || !description || !courseId || !dueDate) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }
  
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

  // Delete all associated submissions first
  await Submission.deleteMany({ assignmentId: assignment._id });

  // Then delete the assignment
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

  // Check if courseId is valid
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new ErrorResponse(`Invalid course ID format`, 400));
  }

  // Use aggregation pipeline for better performance
  const assignmentsWithStatus = await Assignment.aggregate([
    { 
      $match: { 
        courseId: mongoose.Types.ObjectId.createFromHexString(courseId) 
      } 
    },
    {
      $lookup: {
        from: 'submissions',
        let: { assignmentId: '$_id', userId: mongoose.Types.ObjectId.createFromHexString(req.user.id) },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$assignmentId', '$$assignmentId'] },
                  { $eq: ['$userId', '$$userId'] }
                ]
              }
            }
          },
          { $project: { _id: 1, status: 1, 'grade.score': 1 } }
        ],
        as: 'submission'
      }
    },
    {
      $addFields: {
        submitted: { $gt: [{ $size: '$submission' }, 0] },
        submissionId: { $arrayElemAt: ['$submission._id', 0] },
        submissionStatus: { $arrayElemAt: ['$submission.status', 0] },
        score: { $arrayElemAt: ['$submission.grade.score', 0] }
      }
    },
    { $project: { submission: 0 } }
  ]);

  res.status(200).json({
    success: true,
    count: assignmentsWithStatus.length,
    data: assignmentsWithStatus
  });
});