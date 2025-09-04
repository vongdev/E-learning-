const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  updatePreferences,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience
} = require('../controllers/user.controller');

const router = express.Router();

// Import middlewares
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/user.model');

// Define routes with authorization
router.use(protect);

// Profile and preference routes (for any authenticated user)
router.put('/profile', updateProfile);
router.put('/preferences', updatePreferences);

// Education routes
router.post('/education', addEducation);
router.put('/education/:eduId', updateEducation);
router.delete('/education/:eduId', deleteEducation);

// Experience routes
router.post('/experience', addExperience);
router.put('/experience/:expId', updateExperience);
router.delete('/experience/:expId', deleteExperience);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;