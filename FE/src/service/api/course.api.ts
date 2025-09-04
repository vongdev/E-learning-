import { apiClient } from '../api-client';

export const courseAPI = {
  getCourses: (params?: any) => 
    apiClient.get('/courses', { params }),
    
  getCourseById: (id: string) => 
    apiClient.get(`/courses/${id}`),
    
  createCourse: (data: any) => 
    apiClient.post('/courses', data),
    
  updateCourse: (id: string, data: any) => 
    apiClient.put(`/courses/${id}`, data),
    
  deleteCourse: (id: string) => 
    apiClient.delete(`/courses/${id}`),
    
  getEnrolledCourses: () => 
    apiClient.get('/courses/enrolled'),
    
  enrollCourse: (id: string) => 
    apiClient.post(`/courses/${id}/enroll`)
};