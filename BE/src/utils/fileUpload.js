const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const ErrorResponse = require('./errorResponse');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Setup file upload for different resource types
 * @param {string} resourceType - Type of resource (e.g., 'avatar', 'course', 'assignment')
 * @returns {Object} - Multer upload configuration
 */
const setupFileUpload = (resourceType) => {
  // Cloudinary folder based on resource type
  const folder = `elearning/${resourceType}`;

  // Define allowed file types based on resource type
  let fileFilter;
  let limits = {};

  switch (resourceType) {
    case 'avatar':
      // Only allow images for avatars
      fileFilter = (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new ErrorResponse(`Only image files are allowed for avatars`, 400));
      };
      limits = { fileSize: 1 * 1024 * 1024 }; // 1MB
      break;
      
    case 'course':
      // Allow images and videos for courses
      fileFilter = (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new ErrorResponse(`Only image and video files are allowed for courses`, 400));
      };
      limits = { fileSize: 50 * 1024 * 1024 }; // 50MB
      break;
      
    case 'lecture':
      // Allow videos, PDFs, and PPTs for lectures
      fileFilter = (req, file, cb) => {
        const filetypes = /mp4|webm|mov|pdf|ppt|pptx/;
        const mimetype = /video\/|application\/pdf|application\/vnd.ms-powerpoint|application\/vnd.openxmlformats-officedocument.presentationml.presentation/.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
          return cb(null, true);
        }
        cb(new ErrorResponse(`Only video, PDF, and PowerPoint files are allowed for lectures`, 400));
      };
      limits = { fileSize: 200 * 1024 * 1024 }; // 200MB
      break;
      
    case 'assignment':
      // Allow various document formats for assignments
      fileFilter = (req, file, cb) => {
        const filetypes = /pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx|zip|rar/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
          return cb(null, true);
        }
        cb(new ErrorResponse(`Only document files are allowed for assignments`, 400));
      };
      limits = { fileSize: 20 * 1024 * 1024 }; // 20MB
      break;
      
    case 'submission':
      // Allow various document formats for submissions
      fileFilter = (req, file, cb) => {
        const filetypes = /pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx|zip|rar|jpg|jpeg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
          return cb(null, true);
        }
        cb(new ErrorResponse(`Only document and image files are allowed for submissions`, 400));
      };
      limits = { fileSize: 50 * 1024 * 1024 }; // 50MB
      break;
      
    default:
      // Default file filter for general purposes
      fileFilter = (req, file, cb) => {
        cb(null, true);
      };
      limits = { fileSize: 10 * 1024 * 1024 }; // 10MB
  }

  // Create Cloudinary storage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      resource_type: 'auto', // auto-detect file type
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'webm', 'mov', 'zip', 'rar'],
      public_id: (req, file) => {
        // Create unique filename: timestamp-original_filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        const filename = file.originalname.split('.')[0];
        return `${filename}-${uniqueSuffix}`;
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
  cloudinary
};