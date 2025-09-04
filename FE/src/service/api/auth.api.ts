import { apiClient } from '../api-client';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    isAdmin: boolean;
    isStudent: boolean;
  };
}

export const authAPI = {
  login: (data: LoginRequest) => 
    apiClient.post<AuthResponse>('/auth/login', data),
    
  register: (data: RegisterRequest) => 
    apiClient.post<AuthResponse>('/auth/register', data),
    
  logout: () => 
    apiClient.get<{success: boolean, data: {}}>('/auth/logout'),
    
  getMe: () => 
    apiClient.get<{success: boolean, data: any}>('/auth/me'),
    
  updateDetails: (data: {email?: string, profile?: any}) => 
    apiClient.put<{success: boolean, data: any}>('/auth/updatedetails', data),
    
  updatePassword: (data: {currentPassword: string, newPassword: string}) => 
    apiClient.put<AuthResponse>('/auth/updatepassword', data),
    
  forgotPassword: (data: {email: string}) => 
    apiClient.post<{success: boolean, data: string}>('/auth/forgotpassword', data),
    
  resetPassword: (resetToken: string, data: {password: string}) => 
    apiClient.put<AuthResponse>(`/auth/resetpassword/${resetToken}`, data)
};