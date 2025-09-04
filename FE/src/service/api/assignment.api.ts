import { apiClient } from '../api-client';

export const assignmentAPI = {
  getAssignments: (params?: any) => 
    apiClient.get('/assignments', { params }),
    
  getAssignment: (id: string) => 
    apiClient.get(`/assignments/${id}`),
    
  createAssignment: (data: any) => 
    apiClient.post('/assignments', data),
    
  updateAssignment: (id: string, data: any) => 
    apiClient.put(`/assignments/${id}`, data),
    
  deleteAssignment: (id: string) => 
    apiClient.delete(`/assignments/${id}`),
    
  getAssignmentsByCourse: (courseId: string) => 
    apiClient.get(`/courses/${courseId}/assignments`)
};