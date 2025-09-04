const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter
 * More restrictive for authentication endpoints
 */
exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * User creation rate limiter
 */
exports.createUserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 user creations per hour
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Submission rate limiter
 */
exports.submissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 submissions per 5 minutes
  message: {
    success: false,
    message: 'Too many submissions, please try again after 5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});