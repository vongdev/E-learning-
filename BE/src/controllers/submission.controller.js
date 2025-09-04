const Submission = require('../models/submission.model');
const Assignment = require('../models/assignment.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private/Admin
exports.getSubmissions = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private/Instructor
exports.getSubmissionsByAssignment = asyncHandler(async (req, res, next) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    return next(new ErrorResponse(`No assignment found with id of ${assignmentId}`, 404));
  }

  // Make sure user is assignment owner or admin
  if (assignment.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view submissions for this assignment`,
        401
      )
    );
  }

  const submissions = await Submission.find({ assignmentId })
    .populate('userId', 'profile.firstName profile.lastName username');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Get submissions by a user
// @route   GET /api/users/:userId/submissions
// @access  Private
exports.getSubmissionsByUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  // Make sure user is owner or admin
  if (userId !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view these submissions`,
        401
      )
    );
  }

  const submissions = await Submission.find({ userId })
    .populate('assignmentId', 'title dueDate maxScore');

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

// @desc    Get a specific submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id)
    .populate('assignmentId', 'title dueDate maxScore')
    .populate('userId', 'profile.firstName profile.lastName username');

  if (!submission) {
    return next(new ErrorResponse(`No submission found with id of ${req.params.id}`, 404));
  }

  // Make sure user is owner, assignment creator, or admin
  const assignment = await Assignment.findById(submission.assignmentId);

  if (
    submission.userId.toString() !== req.user.id &&
    assignment.createdBy.toString() !== req.user.id &&
    !req.user.roles.includes('admin')
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this submission`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Create new submission
// @route   POST /api/assignments/:assignmentId/submissions
// @access  Private
exports.createSubmission = asyncHandler(async (req, res, next) => {
  const { assignmentId } = req.params;
  
  // Add user id and assignment id to req.body
  req.body.userId = req.user.id;
  req.body.assignmentId = assignmentId;
  req.body.status = 'submitted';
  
  // Check if assignment exists
  const assignment = await Assignment.findById(assignmentId);
  
  if (!assignment) {
    return next(new ErrorResponse(`No assignment found with id of ${assignmentId}`, 404));
  }
  
  // Check if due date has passed
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  
  if (dueDate < now) {
    req.body.isLate = true;
    req.body.status = 'late';
  }
  
  // Check if user already submitted this assignment
  const existingSubmission = await Submission.findOne({
    assignmentId,
    userId: req.user.id
  });
  
  if (existingSubmission) {
    return next(new ErrorResponse(`You have already submitted this assignment`, 400));
  }

  // Create the submission
  const submission = await Submission.create(req.body);

  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private
exports.updateSubmission = asyncHandler(async (req, res, next) => {
  let submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(new ErrorResponse(`No submission found with id of ${req.params.id}`, 404));
  }

  // Make sure user is submission owner
  if (submission.userId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this submission`,
        401
      )
    );
  }

  // Check if submission is already graded - if so, don't allow updates unless admin
  if (submission.status === 'graded' && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `Cannot update submission after it has been graded`,
        400
      )
    );
  }

  submission = await Submission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Grade a submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Instructor
exports.gradeSubmission = asyncHandler(async (req, res, next) => {
  const { score, feedback, rubricEvaluation } = req.body;
  
  let submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(new ErrorResponse(`No submission found with id of ${req.params.id}`, 404));
  }

  // Get the assignment
  const assignment = await Assignment.findById(submission.assignmentId);
  
  if (!assignment) {
    return next(new ErrorResponse(`No assignment found for this submission`, 404));
  }

  // Make sure user is assignment creator or admin
  if (assignment.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to grade this submission`,
        401
      )
    );
  }

  // Calculate percentage
  const percentage = (score / assignment.maxScore) * 100;

  const gradeData = {
    grade: {
      score,
      maxScore: assignment.maxScore,
      percentage,
      feedback,
      rubricEvaluation,
      gradedBy: req.user.id,
      gradedAt: Date.now()
    },
    status: 'graded'
  };

  // Update submission with grade
  submission = await Submission.findByIdAndUpdate(req.params.id, gradeData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private
exports.deleteSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(new ErrorResponse(`No submission found with id of ${req.params.id}`, 404));
  }

  // Make sure user is submission owner or admin
  if (submission.userId.toString() !== req.user.id && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this submission`,
        401
      )
    );
  }

  // Check if submission is already graded - if so, don't allow deletion unless admin
  if (submission.status === 'graded' && !req.user.roles.includes('admin')) {
    return next(
      new ErrorResponse(
        `Cannot delete submission after it has been graded`,
        400
      )
    );
  }

  await submission.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add feedback to submission
// @route   POST /api/submissions/:id/feedback
// @access  Private/Instructor
exports.addFeedback = asyncHandler(async (req, res, next) => {
  const { comment } = req.body;
  
  let submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(new ErrorResponse(`No submission found with id of ${req.params.id}`, 404));
  }

  // Get assignment
  const assignment = await Assignment.findById(submission.assignmentId);
  
  // Make sure user is assignment creator, submission owner or admin
  if (
    assignment.createdBy.toString() !== req.user.id && 
    submission.userId.toString() !== req.user.id && 
    !req.user.roles.includes('admin')
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add feedback to this submission`,
        401
      )
    );
  }

  // Create feedback object
  const feedback = {
    author: `${req.user.profile.firstName} ${req.user.profile.lastName}`,
    date: new Date().toISOString(),
    comment
  };

  // Add feedback to submission
  submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { $push: { feedbacks: feedback } },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: submission
  });
});