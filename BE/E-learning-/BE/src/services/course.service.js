const Course = require('../models/course.model');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('cloudinary').v2;
const { ObjectId } = require('mongoose').Types;

/**
 * Service layer for course-related operations
 */
class CourseService {
  /**
   * Get all courses with pagination and filtering
   */
  async getAllCourses(query = {}) {
    return await Course.find(query);
  }

  /**
   * Get course by ID
   */
  async getCourseById(id) {
    const course = await Course.findById(id)
      .populate('authors', 'profile.firstName profile.lastName profile.title profile.avatar')
      .populate('createdBy', 'profile.firstName profile.lastName');

    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${id}`, 404);
    }
    
    return course;
  }

  /**
   * Create new course
   */
  async createCourse(courseData, userId) {
    // Add createdBy field
    courseData.createdBy = userId;
    
    // Add user as an author by default if authors not specified
    if (!courseData.authors || courseData.authors.length === 0) {
      courseData.authors = [userId];
    }
    
    return await Course.create(courseData);
  }

  /**
   * Update course details
   */
  async updateCourse(id, updateData, userId) {
    const course = await Course.findById(id);
    
    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${id}`, 404);
    }
    
    // Check ownership if not admin
    if (course.createdBy.toString() !== userId && !updateData.isAdminUpdate) {
      throw new ErrorResponse(`User not authorized to update this course`, 401);
    }
    
    // Remove isAdminUpdate from update data
    delete updateData.isAdminUpdate;
    
    return await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
  }

  /**
   * Delete course
   */
  async deleteCourse(id, userId) {
    const course = await Course.findById(id);
    
    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${id}`, 404);
    }
    
    // Check ownership if not admin
    if (course.createdBy.toString() !== userId && !isAdmin) {
      throw new ErrorResponse(`User not authorized to delete this course`, 401);
    }
    
    // Delete course thumbnail from cloudinary if exists
    if (course.thumbnail && course.thumbnail.includes('cloudinary')) {
      try {
        const publicId = course.thumbnail.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting course thumbnail:', error);
      }
    }
    
    await course.deleteOne();
    return true;
  }

  /**
   * Add/update course section
   */
  async updateSection(courseId, sectionData, userId) {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${courseId}`, 404);
    }
    
    // Check ownership if not admin
    if (course.createdBy.toString() !== userId && !isAdmin) {
      throw new ErrorResponse(`User not authorized to update this course`, 401);
    }
    
    // If sectionId exists, update existing section
    if (sectionData._id) {
      const sectionIndex = course.sections.findIndex(
        section => section._id.toString() === sectionData._id
      );
      
      if (sectionIndex === -1) {
        throw new ErrorResponse(`Section not found in course`, 404);
      }
      
      course.sections[sectionIndex] = {
        ...course.sections[sectionIndex].toObject(),
        ...sectionData
      };
    } else {
      // Add new section
      sectionData._id = new ObjectId();
      course.sections.push(sectionData);
    }
    
    await course.save();
    return course;
  }

  /**
   * Delete course section
   */
  async deleteSection(courseId, sectionId, userId) {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${courseId}`, 404);
    }
    
    // Check ownership if not admin
    if (course.createdBy.toString() !== userId && !isAdmin) {
      throw new ErrorResponse(`User not authorized to update this course`, 401);
    }
    
    // Filter out the section
    course.sections = course.sections.filter(
      section => section._id.toString() !== sectionId
    );
    
    await course.save();
    return course;
  }

  /**
   * Add/update content in a section
   */
  async updateContent(courseId, sectionId, contentData, userId) {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${courseId}`, 404);
    }
    
    // Check ownership if not admin
    if (course.createdBy.toString() !== userId && !isAdmin) {
      throw new ErrorResponse(`User not authorized to update this course`, 401);
    }
    
    const sectionIndex = course.sections.findIndex(
      section => section._id.toString() === sectionId
    );
    
    if (sectionIndex === -1) {
      throw new ErrorResponse(`Section not found in course`, 404);
    }
    
    // If contentId exists, update existing content
    if (contentData._id) {
      const contentIndex = course.sections[sectionIndex].contents.findIndex(
        content => content._id.toString() === contentData._id
      );
      
      if (contentIndex === -1) {
        throw new ErrorResponse(`Content not found in section`, 404);
      }
      
      course.sections[sectionIndex].contents[contentIndex] = {
        ...course.sections[sectionIndex].contents[contentIndex].toObject(),
        ...contentData
      };
    } else {
      // Add new content
      contentData._id = new ObjectId();
      course.sections[sectionIndex].contents.push(contentData);
    }
    
    await course.save();
    return course;
  }

  /**
   * Delete content from a section
   */
  async deleteContent(courseId, sectionId, contentId, userId) {
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new ErrorResponse(`Course not found with id of ${courseId}`, 404);
    }
    
    // Check ownership if not admin
    if (course.createdBy.toString() !== userId && !isAdmin) {
      throw new ErrorResponse(`User not authorized to update this course`, 401);
    }
    
    const sectionIndex = course.sections.findIndex(
      section => section._id.toString() === sectionId
    );
    
    if (sectionIndex === -1) {
      throw new ErrorResponse(`Section not found in course`, 404);
    }
    
    // Filter out the content
    course.sections[sectionIndex].contents = course.sections[sectionIndex].contents.filter(
      content => content._id.toString() !== contentId
    );
    
    await course.save();
    return course;
  }
  
  /**
   * Get enrolled courses for a user
   */
  async getEnrolledCourses(userId) {
    // This would typically use the Enrollment model to find enrollments
    // For now, we'll use a direct query on courses with enrolled users
    const courses = await Course.find({ 
      'enrolledUsers.userId': userId 
    });
    
    return courses;
  }
}

module.exports = new CourseService();