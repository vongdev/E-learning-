import { apiClient } from '../api-client';

export const progressAPI = {
  getCourseProgress: (courseId: string) => 
    apiClient.get(`/courses/${courseId}/progress`),
    
  updateContentProgress: (courseId: string, contentId: string, data: {progress: number}) => 
    apiClient.put(`/courses/${courseId}/contents/${contentId}/progress`, data),
    
  markContentCompleted: (courseId: string, contentId: string) => 
    apiClient.put(`/courses/${courseId}/contents/${contentId}/complete`, {}),
    
  getAllCourseProgress: (courseId: string) => 
    apiClient.get(`/courses/${courseId}/progress/all`),
    
  resetCourseProgress: (courseId: string) => 
    apiClient.delete(`/courses/${courseId}/progress`)
};