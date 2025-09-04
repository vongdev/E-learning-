const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');
const asyncHandler = require('./async');

// Middleware to protect routes requiring login
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Get token from header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Uncomment if you want to support tokens via cookies
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Check if token exists
  if (!token) {
    return next(new ErrorResponse('Access denied, please login', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('User not found', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Access denied, invalid token', 401));
  }
});

// Middleware to authorize based on role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Access denied', 401));
    }
    
    // Ensure roles is an array before using array methods
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
    const hasRequiredRole = userRoles.some(role => roles.includes(role));

    if (!hasRequiredRole) {
      return next(
        new ErrorResponse(
          `User role (${userRoles.join(', ')}) does not have permission to access this resource`,
          403
        )
      );
    }
    next();
  };
};

// Middleware to check resource ownership
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);
    
    if (!resource) {
      return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
    }
    
    // Admin can access any resource
    if (req.user.roles.includes('admin')) {
      return next();
    }
    
    // Check if user is the owner
    const ownerField = resource.user || resource.createdBy || resource.userId;
    if (ownerField && ownerField.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`You do not have permission to access this resource`, 403)
      );
    }
    
    next();
  } catch (err) {
    next(err);
  }
};