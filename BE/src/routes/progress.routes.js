const express = require('express');
const {
  getCourseProgress,
  updateContentProgress,
  markContentCompleted,
  getAllCourseProgress,
  getUserProgress,
  resetCourseProgress
} = require('../controllers/progress.controller'); // Đảm bảo tên file controller đúng

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Tất cả các route này đều cần người dùng đăng nhập
router.use(protect);

// Lấy tiến độ của user hiện tại cho một khóa học
router.route('/').get(getCourseProgress).delete(resetCourseProgress);

// Cập nhật/đánh dấu hoàn thành một nội dung
router.put('/contents/:contentId/progress', updateContentProgress);
router.put('/contents/:contentId/complete', markContentCompleted);

// Route cho instructor/admin
router.get('/all', authorize('instructor', 'admin'), getAllCourseProgress);

// Route lấy toàn bộ tiến độ của một user (cho admin hoặc chính user đó)
// Lưu ý: route này nên được đặt trong user.routes.js để nhất quán hơn
// Ví dụ: router.get('/api/users/:userId/progress', ...)
// Tuy nhiên, để ở đây vẫn hoạt động
router.get('/user/:userId', authorize('admin'), getUserProgress);


module.exports = router;