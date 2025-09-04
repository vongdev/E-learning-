const User = require('../models/user.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // Extract only allowed fields to update
  const { profile } = req.body;

  if (!profile) {
    return next(new ErrorResponse('No profile data provided', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id, 
    { profile },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  // Extract only allowed fields to update
  const { preferences } = req.body;

  if (!preferences) {
    return next(new ErrorResponse('No preferences data provided', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id, 
    { preferences },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Add education to user profile
// @route   POST /api/users/education
// @access  Private
exports.addEducation = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
  }
  
  user.education = user.education || [];
  user.education.push(req.body);
  
  await user.save();

  res.status(201).json({
    success: true,
    data: user.education
  });
});

// @desc    Update education item
// @route   PUT /api/users/education/:eduId
// @access  Private
exports.updateEducation = asyncHandler(async (req, res, next) => {
  const { eduId } = req.params;
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
  }

  const educationIndex = user.education.findIndex(edu => edu._id.toString() === eduId);
  
  if (educationIndex === -1) {
    return next(new ErrorResponse('Education record not found', 404));
  }
  
  user.education[educationIndex] = {
    ...user.education[educationIndex].toObject(),
    ...req.body,
    _id: eduId
  };
  
  await user.save();

  res.status(200).json({
    success: true,
    data: user.education
  });
});

// @desc    Delete education item
// @route   DELETE /api/users/education/:eduId
// @access  Private
exports.deleteEducation = asyncHandler(async (req, res, next) => {
  const { eduId } = req.params;
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
  }

  user.education = user.education.filter(edu => edu._id.toString() !== eduId);
  
  await user.save();

  res.status(200).json({
    success: true,
    data: user.education
  });
});

// @desc    Add experience to user profile
// @route   POST /api/users/experience
// @access  Private
exports.addExperience = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
  }
  
  user.experience = user.experience || [];
  user.experience.push(req.body);
  
  await user.save();

  res.status(201).json({
    success: true,
    data: user.experience
  });
});

// @desc    Update experience item
// @route   PUT /api/users/experience/:expId
// @access  Private
exports.updateExperience = asyncHandler(async (req, res, next) => {
  const { expId } = req.params;
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
  }

  const experienceIndex = user.experience.findIndex(exp => exp._id.toString() === expId);
  
  if (experienceIndex === -1) {
    return next(new ErrorResponse('Experience record not found', 404));
  }
  
  user.experience[experienceIndex] = {
    ...user.experience[experienceIndex].toObject(),
    ...req.body,
    _id: expId
  };
  
  await user.save();

  res.status(200).json({
    success: true,
    data: user.experience
  });
});

// @desc    Delete experience item
// @route   DELETE /api/users/experience/:expId
// @access  Private
exports.deleteExperience = asyncHandler(async (req, res, next) => {
  const { expId } = req.params;
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.user.id}`, 404));
  }

  user.experience = user.experience.filter(exp => exp._id.toString() !== expId);
  
  await user.save();

  res.status(200).json({
    success: true,
    data: user.experience
  });
});