const { validationResult, check } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

// Middleware to check validation results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};

// Course validation rules
exports.courseValidationRules = [
  check('name', 'Course name is required').notEmpty().trim(),
  check('code', 'Course code is required').notEmpty().trim(),
  check('description', 'Description is required').notEmpty(),
  check('category', 'Category is required').notEmpty(),
  check('level', 'Level is required').isIn(['beginner', 'intermediate', 'advanced']),
  check('thumbnail', 'Thumbnail URL is required').notEmpty()
];

// User validation rules
exports.userValidationRules = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('profile.firstName', 'First name is required').notEmpty(),
  check('profile.lastName', 'Last name is required').notEmpty()
];

// Assignment validation rules
exports.assignmentValidationRules = [
  check('title', 'Title is required').notEmpty().trim(),
  check('description', 'Description is required').notEmpty(),
  check('courseId', 'Course ID is required').notEmpty().isMongoId(),
  check('dueDate', 'Due date is required and must be valid').isISO8601().toDate()
];

// Submission validation rules
exports.submissionValidationRules = [
  check('assignmentId', 'Assignment ID is required').notEmpty().isMongoId(),
  check('userId', 'User ID is required').notEmpty().isMongoId(),
  check('courseId', 'Course ID is required').notEmpty().isMongoId()
];

// Quiz validation rules
exports.quizValidationRules = [
  check('title', 'Title is required').notEmpty().trim(),
  check('questions', 'At least one question is required').isArray({ min: 1 }),
  check('questions.*.text', 'Question text is required').notEmpty(),
  check('questions.*.options', 'Options are required for non-essay questions').custom((options, { req, path }) => {
    const questionIndex = path.split('.')[1];
    const questionType = req.body.questions[questionIndex].type;
    
    if (questionType !== 'essay' && (!options || options.length < 2)) {
      throw new Error('Multiple choice questions must have at least 2 options');
    }
    return true;
  })
];