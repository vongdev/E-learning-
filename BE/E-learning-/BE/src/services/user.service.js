const User = require('../models/user.model');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Service layer for user-related operations
 */
class UserService {
  /**
   * Get all users with pagination and filtering
   */
  async getAllUsers(query) {
    return await User.find(query);
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${id}`, 404);
    }
    return user;
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    // Check if user with same email exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ErrorResponse(`User with email ${userData.email} already exists`, 400);
    }

    return await User.create(userData);
  }

  /**
   * Update user details
   */
  async updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${id}`, 404);
    }

    // If trying to update email, check if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        throw new ErrorResponse(`User with email ${updateData.email} already exists`, 400);
      }
    }

    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${id}`, 404);
    }

    await user.deleteOne();
    return true;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    user.profile = {
      ...user.profile,
      ...profileData
    };

    await user.save();
    return user;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId, preferencesData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    user.preferences = {
      ...user.preferences,
      ...preferencesData
    };

    await user.save();
    return user;
  }

  /**
   * Add education to user profile
   */
  async addEducation(userId, educationData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    user.education = user.education || [];
    user.education.push(educationData);
    
    await user.save();
    return user.education;
  }

  /**
   * Update education record
   */
  async updateEducation(userId, eduId, educationData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    const educationIndex = user.education.findIndex(edu => edu._id.toString() === eduId);
    if (educationIndex === -1) {
      throw new ErrorResponse('Education record not found', 404);
    }
    
    user.education[educationIndex] = {
      ...user.education[educationIndex].toObject(),
      ...educationData,
      _id: eduId
    };
    
    await user.save();
    return user.education;
  }

  /**
   * Delete education record
   */
  async deleteEducation(userId, eduId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    user.education = user.education.filter(edu => edu._id.toString() !== eduId);
    
    await user.save();
    return user.education;
  }

  /**
   * Add experience to user profile
   */
  async addExperience(userId, experienceData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    user.experience = user.experience || [];
    user.experience.push(experienceData);
    
    await user.save();
    return user.experience;
  }

  /**
   * Update experience record
   */
  async updateExperience(userId, expId, experienceData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    const experienceIndex = user.experience.findIndex(exp => exp._id.toString() === expId);
    if (experienceIndex === -1) {
      throw new ErrorResponse('Experience record not found', 404);
    }
    
    user.experience[experienceIndex] = {
      ...user.experience[experienceIndex].toObject(),
      ...experienceData,
      _id: expId
    };
    
    await user.save();
    return user.experience;
  }

  /**
   * Delete experience record
   */
  async deleteExperience(userId, expId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(`User not found with id of ${userId}`, 404);
    }

    user.experience = user.experience.filter(exp => exp._id.toString() !== expId);
    
    await user.save();
    return user.experience;
  }
}

module.exports = new UserService();