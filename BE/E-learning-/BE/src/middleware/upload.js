const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const ErrorResponse = require('./errorResponse');
const crypto = require('crypto');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Validate file type using file extension and mime type
 * @param {Object} file - The uploaded file
 * @param {Array} allowedTypes - Array of allowed file extensions
 * @returns {Boolean} - Whether file is valid
 */
const validateFileType = (file, allowedTypes) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isValidExtension = allowedTypes.includes(extension.substring(1));
  
  // Basic mime type check
  let isValidMimeType = false;
  
  // Map extensions to mime types
  const mimeTypes = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed'
  };
  
  // Check if file's mime type matches its extension
  if (mimeTypes[extension.substring(1)] === file.mimetype) {
    isValidMimeType = true;
  }
  
  return isValidExtension && isValidMimeType;
};

/**
 * Setup file upload for different resource types
 * @param {string} resourceType - Type of resource (e.g., 'avatar', 'course', 'assignment')
 * @returns {Object} - Multer upload configuration
 */
const setupFileUpload = (resourceType) => {
  // Cloudinary folder based on resource type
  const folder = `elearning/${resourceType}`;

  // Define allowed file types based on resource type
  let allowedTypes = [];
  let fileFilter;
  let limits = {};

  switch (resourceType) {
    case 'avatar':
      allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      limits = { fileSize: 1 * 1024 * 1024 }; // 1MB
      break;
      
    case 'course':
      allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov'];
      limits = { fileSize: 50 * 1024 * 1024 }; // 50MB
      break;
      
    case 'lecture':
      allowedTypes = ['mp4', 'webm', 'mov', 'pdf', 'ppt', 'pptx'];
      limits = { fileSize: 200 * 1024 * 1024 }; // 200MB
      break;
      
    case 'assignment':
      allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'];
      limits = { fileSize: 20 * 1024 * 1024 }; // 20MB
      break;
      
    case 'submission':
      allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'jpg', 'jpeg', 'png'];
      limits = { fileSize: 50 * 1024 * 1024 }; // 50MB
      break;
      
    default:
      allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
      limits = { fileSize: 10 * 1024 * 1024 }; // 10MB
  }

  fileFilter = (req, file, cb) => {
    if (!validateFileType(file, allowedTypes)) {
      return cb(new ErrorResponse(`File type not allowed. Accepted types: ${allowedTypes.join(', ')}`, 400));
    }
    cb(null, true);
  };

  // Create Cloudinary storage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: allowedTypes,
      public_id: (req, file) => {
        // Create unique filename with hash for security
        const hash = crypto.randomBytes(8).toString('hex');
        const filename = file.originalname.split('.')[0];
        return `${filename}-${hash}-${Date.now()}`;
      }
    }
  });

  // Return configured multer instance
  return multer({
    storage,
    fileFilter,
    limits
  });
};

// Helper for uploading a single file
const uploadSingle = (resourceType, fieldName = 'file') => {
  return setupFileUpload(resourceType).single(fieldName);
};

// Helper for uploading multiple files
const uploadMultiple = (resourceType, fieldName = 'files', maxCount = 5) => {
  return setupFileUpload(resourceType).array(fieldName, maxCount);
};

// Helper for uploading multiple files with different field names
const uploadFields = (resourceType, fields) => {
  return setupFileUpload(resourceType).fields(fields);
};

module.exports = {
  setupFileUpload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  cloudinary,
  validateFileType
};