const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user.model');
const asyncHandler = require('./async');

// Middleware bảo vệ các routes yêu cầu đăng nhập
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Lấy token từ header Authorization
    token = req.headers.authorization.split(' ')[1];
  } 
  // Uncomment nếu bạn muốn hỗ trợ token qua cookie
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Kiểm tra token có tồn tại không
  if (!token) {
    return next(new ErrorResponse('Không có quyền truy cập, vui lòng đăng nhập', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Thêm thông tin user vào request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('Người dùng không tồn tại', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Không có quyền truy cập, token không hợp lệ', 401));
  }
});

// Middleware cho phép truy cập dựa trên role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Không có quyền truy cập', 401));
    }
    
    // Sửa lỗi logic: req.user.roles là một mảng
    const hasRequiredRole = req.user.roles.some(role => roles.includes(role));

    if (!hasRequiredRole) {
      return next(
        new ErrorResponse(
          `Vai trò người dùng (${req.user.roles.join(', ')}) không được phép truy cập tài nguyên này`,
          403
        )
      );
    }
    next();
  };
};

// Middleware kiểm tra quyền sở hữu tài nguyên
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findById(req.params.id);
    
    if (!resource) {
      return next(new ErrorResponse(`Không tìm thấy tài nguyên với id ${req.params.id}`, 404));
    }
    
    // Admin có thể truy cập mọi tài nguyên
    if (req.user.roles.includes('admin')) {
      return next();
    }
    
    // Kiểm tra người dùng có phải là chủ sở hữu
    // Giả định trường sở hữu là 'user' hoặc 'createdBy'
    const ownerField = resource.user || resource.createdBy;
    if (ownerField && ownerField.toString() !== req.user.id) {
      return next(
        new ErrorResponse(`Bạn không có quyền truy cập tài nguyên này`, 403)
      );
    }
    
    next();
  } catch (err) {
    next(err);
  }
};