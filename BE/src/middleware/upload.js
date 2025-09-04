const { uploadSingle, uploadMultiple } = require('../utils/fileUpload');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware for handling file uploads with error handling
 * @param {string} resourceType - Type of resource (e.g., 'avatar', 'course')
 * @param {string} fieldName - Field name in the request
 */
exports.uploadFile = (resourceType, fieldName = 'file') => {
  return (req, res, next) => {
    const upload = uploadSingle(resourceType, fieldName);
    
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse(`File size is too large`, 400));
        }
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      }
      next();
    });
  };
};

/**
 * Middleware for handling multiple file uploads with error handling
 * @param {string} resourceType - Type of resource
 * @param {string} fieldName - Field name in the request
 * @param {number} maxCount - Maximum number of files
 */
exports.uploadFiles = (resourceType, fieldName = 'files', maxCount = 5) => {
  return (req, res, next) => {
    const upload = uploadMultiple(resourceType, fieldName, maxCount);
    
    upload(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse(`One or more files are too large`, 400));
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ErrorResponse(`Too many files. Maximum allowed: ${maxCount}`, 400));
        }
        return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
      }
      next();
    });
  };
};