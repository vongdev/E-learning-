import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  CollectionResponse, 
  CourseDTO, 
  CreateCourseDTO,
  CourseLevel
} from "@/types/course";

// Định nghĩa các kiểu dữ liệu cho user
export interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  dateOfBirth?: string;
  gender?: string;
  organization?: string;
  title?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  location?: {
    country?: string;
    city?: string;
    address?: string;
    zipCode?: string;
  };
  phoneNumber?: string;
  displayName?: string;
}

export interface UserEducation {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  activities?: string;
  description?: string;
}

export interface UserExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  skills?: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoPlayVideos: boolean;
  subtitlesEnabled: boolean;
  subtitlesLanguage?: string;
  playbackSpeed: number;
  videoQuality: 'auto' | 'low' | 'medium' | 'high';
  downloadEnabled: boolean;
  timezone: string;
  calendarIntegration?: 'google' | 'outlook' | 'apple' | 'none';
  notificationTypes: string[];
}

export interface User {
  id: string;
  email: string;
  username?: string;
  profile: UserProfile;
  roles: string[];
  status: string;
  preferences: UserPreferences;
  education?: UserEducation[];
  experience?: UserExperience[];
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa kiểu dữ liệu cho courses
// Sử dụng CourseDTO và CreateCourseDTO từ /types/course.ts

export interface CourseContent {
  _id: string;
  courseId: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  content: string;
  duration?: number;
  order: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa kiểu dữ liệu cho assignment
export interface Assignment {
  _id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  assignmentId: string;
  userId: string;
  content: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submittedAt: string;
  gradedAt?: string;
}

// Định nghĩa kiểu dữ liệu cho Quiz
export interface Quiz {
  _id: string;
  courseId: string;
  contentId?: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: Array<{
    _id: string;
    text: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correctAnswer: string | string[];
    points: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa kiểu dữ liệu cho Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalSubmissions: number;
  activeUsers?: number;
  completionRate?: number;
  revenueData?: {
    amount: number;
    currency: string;
    trend: number;
  };
}

// Định nghĩa kiểu dữ liệu cho Breakout Room
export interface BreakoutRoom {
  _id: string;
  courseId: string;
  name: string;
  description?: string;
  capacity: number;
  participants: Array<{
    userId: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'moderator';
    joinedAt: string;
  }>;
  status: 'active' | 'inactive' | 'full';
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  attachments?: string[];
  createdAt: string;
}

// Định nghĩa kiểu dữ liệu cho Progress
export interface Progress {
  courseId: string;
  userId: string;
  completedContents: string[];
  contentProgress: Record<string, number>;
  overallProgress: number;
  lastAccessed: string;
  updatedAt: string;
}

// Tạo instance axios với cấu hình mặc định
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 giây
});

// Error handling helper với thêm timeout và network error handling
const handleApiError = (error: AxiosError): never => {
  if (error.response) {
    // Lỗi trả về từ server (status không phải 2xx)
    console.error('API Error Response:', error.response.data);
    
    // Xử lý lỗi cụ thể dựa vào status code
    switch(error.response.status) {
      case 401:
        // Unauthorized - Token không hợp lệ hoặc hết hạn
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          
          // Redirect về trang đăng nhập nếu không phải đang ở trang đăng nhập
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
          }
        }
        break;
      case 403:
        // Forbidden - Không có quyền truy cập
        console.error('Bạn không có quyền truy cập vào tài nguyên này');
        break;
      case 404:
        // Not Found - Tài nguyên không tồn tại
        console.error('Tài nguyên không tồn tại');
        break;
      case 422:
        // Unprocessable Entity - Validation error
        console.error('Dữ liệu gửi lên không hợp lệ');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        console.error('Lỗi máy chủ, vui lòng thử lại sau');
        break;
    }
  } else if (error.request) {
    // Request được gửi nhưng không nhận được response
    console.error('Không thể kết nối đến máy chủ', error.request);
    
    // Kiểm tra nếu là lỗi timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Kết nối bị ngắt do timeout');
    }
  } else {
    // Lỗi khi thiết lập request
    console.error('Lỗi:', error.message);
  }
  
  throw error;
};

// Interceptor xử lý thêm token vào header mỗi request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Thêm token vào header nếu có
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý response
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return handleApiError(error);
  }
);

// API service cho authentication
export const authAPI = {
  login: (email: string, password: string): Promise<AxiosResponse<ApiResponse<{token: string, user: User}>>> => 
    api.post('/auth/login', { email, password }),
    
  register: (userData: Partial<User>): Promise<AxiosResponse<ApiResponse<{token: string, user: User}>>> => 
    api.post('/auth/register', userData),
    
  forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse<{resetToken: string}>>> => 
    api.post('/auth/forgotpassword', { email }),
    
  resetPassword: (resetToken: string, password: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.put(`/auth/resetpassword/${resetToken}`, { password }),
    
  getMe: (): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.get('/auth/me'),
    
  updateDetails: (userData: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.put('/auth/updatedetails', userData),
    
  updatePassword: (currentPassword: string, newPassword: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.put('/auth/updatepassword', { currentPassword, newPassword }),
};

// API service cho users
export const userAPI = {
  getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.get('/users/profile'),
    
  updateProfile: (profileData: Partial<UserProfile>): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.put('/users/profile', { profile: profileData }),
    
  updatePreferences: (preferencesData: Partial<UserPreferences>): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.put('/users/preferences', { preferences: preferencesData }),
    
  addEducation: (educationData: Omit<UserEducation, 'id'>): Promise<AxiosResponse<ApiResponse<UserEducation>>> => 
    api.post('/users/education', educationData),
    
  updateEducation: (eduId: string, educationData: Partial<UserEducation>): Promise<AxiosResponse<ApiResponse<UserEducation>>> => 
    api.put(`/users/education/${eduId}`, educationData),
    
  deleteEducation: (eduId: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/users/education/${eduId}`),
    
  addExperience: (experienceData: Omit<UserExperience, 'id'>): Promise<AxiosResponse<ApiResponse<UserExperience>>> => 
    api.post('/users/experience', experienceData),
    
  updateExperience: (expId: string, experienceData: Partial<UserExperience>): Promise<AxiosResponse<ApiResponse<UserExperience>>> => 
    api.put(`/users/experience/${expId}`, experienceData),
    
  deleteExperience: (expId: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/users/experience/${expId}`),
};

// Định nghĩa interface cho tham số lọc khóa học
export interface CourseFilterParams {
  keyword?: string;
  category?: string;
  level?: CourseLevel;
  instructor?: string;
  sortBy?: 'newest' | 'oldest' | 'title' | 'rating' | 'price';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API service cho courses
export const courseAPI = {
  getAllCourses: (params?: CourseFilterParams): Promise<AxiosResponse<CollectionResponse<CourseDTO>>> => 
    api.get('/courses', { params }),
    
  getCourseById: (id: string): Promise<AxiosResponse<ApiResponse<CourseDTO>>> => 
    api.get(`/courses/${id}`),
    
  getEnrolledCourses: (): Promise<AxiosResponse<CollectionResponse<CourseDTO>>> => 
    api.get('/courses/enrolled'),
    
  enrollCourse: (courseId: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.post(`/courses/${courseId}/enroll`),
    
  createCourse: (courseData: CreateCourseDTO): Promise<AxiosResponse<ApiResponse<CourseDTO>>> => 
    api.post('/courses', courseData),

  updateCourse: (id: string, courseData: Partial<CreateCourseDTO>): Promise<AxiosResponse<ApiResponse<CourseDTO>>> => 
    api.put(`/courses/${id}`, courseData),
    
  deleteCourse: (id: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/courses/${id}`),
    
  getCategories: (): Promise<AxiosResponse<ApiResponse<{id: string, name: string}[]>>> => 
    api.get('/courses/categories'),
    
  uploadImage: (formData: FormData): Promise<AxiosResponse<ApiResponse<{url: string}>>> => 
    api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    
  // Các endpoints khóa học đặc biệt
  getFeaturedCourses: (limit?: number): Promise<AxiosResponse<ApiResponse<CourseDTO[]>>> => 
    api.get('/courses/featured', { params: { limit } }),
    
  getNewestCourses: (limit?: number): Promise<AxiosResponse<ApiResponse<CourseDTO[]>>> => 
    api.get('/courses/newest', { params: { limit } }),
    
  getPopularCourses: (limit?: number): Promise<AxiosResponse<ApiResponse<CourseDTO[]>>> => 
    api.get('/courses/popular', { params: { limit } }),
    
  getCourseContents: (courseId: string): Promise<AxiosResponse<ApiResponse<CourseContent[]>>> => 
    api.get(`/courses/${courseId}/contents`),
    
  createCourseContent: (
    courseId: string, 
    contentData: Omit<CourseContent, '_id' | 'courseId' | 'createdAt' | 'updatedAt'>
  ): Promise<AxiosResponse<ApiResponse<CourseContent>>> => 
    api.post(`/courses/${courseId}/contents`, contentData),
    
  updateCourseContent: (
    courseId: string, 
    contentId: string, 
    contentData: Partial<CourseContent>
  ): Promise<AxiosResponse<ApiResponse<CourseContent>>> => 
    api.put(`/courses/${courseId}/contents/${contentId}`, contentData),
    
  deleteCourseContent: (courseId: string, contentId: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/courses/${courseId}/contents/${contentId}`),
};

// API service cho assignments
export const assignmentAPI = {
  getAssignments: (params?: {courseId?: string; status?: string}): Promise<AxiosResponse<ApiResponse<Assignment[]>>> => 
    api.get('/assignments', { params }),
    
  getAssignmentById: (id: string): Promise<AxiosResponse<ApiResponse<Assignment>>> => 
    api.get(`/assignments/${id}`),
    
  getAssignmentsByCourse: (courseId: string): Promise<AxiosResponse<ApiResponse<Assignment[]>>> => 
    api.get(`/courses/${courseId}/assignments`),
    
  createAssignment: (assignmentData: Omit<Assignment, '_id' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<ApiResponse<Assignment>>> => 
    api.post('/assignments', assignmentData),
    
  updateAssignment: (id: string, assignmentData: Partial<Assignment>): Promise<AxiosResponse<ApiResponse<Assignment>>> => 
    api.put(`/assignments/${id}`, assignmentData),
    
  deleteAssignment: (id: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/assignments/${id}`),
};

// API service cho dashboard admin
export const adminAPI = {
  getDashboardStats: (): Promise<AxiosResponse<ApiResponse<DashboardStats>>> => 
    api.get('/admin/dashboard/stats'),
  
  getUsersStats: (params?: { period?: string; limit?: number }): Promise<AxiosResponse<ApiResponse<any>>> => 
    api.get('/admin/users/stats', { params }),
  
  getCoursesStats: (params?: { period?: string; limit?: number }): Promise<AxiosResponse<ApiResponse<any>>> => 
    api.get('/admin/courses/stats', { params }),
    
  getSystemSettings: (): Promise<AxiosResponse<ApiResponse<any>>> => 
    api.get('/admin/settings'),
    
  updateSystemSettings: (data: any): Promise<AxiosResponse<ApiResponse<any>>> => 
    api.put('/admin/settings', data),
    
  // Thêm các API quản lý người dùng
  getAllUsers: (params?: {
    role?: string;
    status?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<ApiResponse<User[]>>> => 
    api.get('/admin/users', { params }),
    
  getUserById: (id: string): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.get(`/admin/users/${id}`),
    
  updateUser: (id: string, userData: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> => 
    api.put(`/admin/users/${id}`, userData),
    
  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/admin/users/${id}`),
    
  // Quản lý khóa học dành cho admin
  approveCourse: (id: string): Promise<AxiosResponse<ApiResponse<CourseDTO>>> => 
    api.put(`/admin/courses/${id}/approve`),
    
  rejectCourse: (id: string, reason: string): Promise<AxiosResponse<ApiResponse<CourseDTO>>> => 
    api.put(`/admin/courses/${id}/reject`, { reason }),
};

// API service cho submissions
export const submissionAPI = {
  getSubmissionById: (id: string): Promise<AxiosResponse<ApiResponse<Submission>>> => 
    api.get(`/submissions/${id}`),
    
  getSubmissionsByAssignment: (assignmentId: string): Promise<AxiosResponse<ApiResponse<Submission[]>>> => 
    api.get(`/assignments/${assignmentId}/submissions`),
    
  getSubmissionsByUser: (userId: string): Promise<AxiosResponse<ApiResponse<Submission[]>>> => 
    api.get(`/submissions/user/${userId}`),
    
  createSubmission: (
    assignmentId: string, 
    submissionData: Omit<Submission, '_id' | 'assignmentId' | 'userId' | 'status' | 'submittedAt' | 'gradedAt'>
  ): Promise<AxiosResponse<ApiResponse<Submission>>> => 
    api.post(`/assignments/${assignmentId}/submissions`, submissionData),
    
  updateSubmission: (id: string, submissionData: Partial<Submission>): Promise<AxiosResponse<ApiResponse<Submission>>> => 
    api.put(`/submissions/${id}`, submissionData),
    
  gradeSubmission: (
    id: string, 
    gradeData: {grade: number; feedback?: string}
  ): Promise<AxiosResponse<ApiResponse<Submission>>> => 
    api.put(`/submissions/${id}/grade`, gradeData),
    
  addFeedback: (id: string, feedbackData: {feedback: string}): Promise<AxiosResponse<ApiResponse<Submission>>> => 
    api.post(`/submissions/${id}/feedback`, feedbackData),
    
  deleteSubmission: (id: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/submissions/${id}`),
};

// API service cho progress tracking
export const progressAPI = {
  getCourseProgress: (courseId: string): Promise<AxiosResponse<ApiResponse<Progress>>> => 
    api.get(`/courses/${courseId}/progress`),
    
  updateContentProgress: (
    courseId: string, 
    contentId: string, 
    progress: number
  ): Promise<AxiosResponse<ApiResponse<Progress>>> => 
    api.put(`/courses/${courseId}/contents/${contentId}/progress`, { progress }),
    
  markContentCompleted: (courseId: string, contentId: string): Promise<AxiosResponse<ApiResponse<Progress>>> => 
    api.put(`/courses/${courseId}/contents/${contentId}/complete`),
    
  resetCourseProgress: (courseId: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/courses/${courseId}/progress`),
};

// API service cho quizzes
export const quizAPI = {
  getQuizzes: (params?: {courseId?: string}): Promise<AxiosResponse<ApiResponse<Quiz[]>>> => 
    api.get('/quizzes', { params }),
    
  getQuizById: (id: string): Promise<AxiosResponse<ApiResponse<Quiz>>> => 
    api.get(`/quizzes/${id}`),
    
  getQuizzesByVideo: (videoId: string): Promise<AxiosResponse<ApiResponse<Quiz[]>>> => 
    api.get(`/quizzes/video/${videoId}`),
    
  createQuiz: (quizData: Omit<Quiz, '_id' | 'createdAt' | 'updatedAt'>): Promise<AxiosResponse<ApiResponse<Quiz>>> => 
    api.post('/quizzes', quizData),
    
  updateQuiz: (id: string, quizData: Partial<Quiz>): Promise<AxiosResponse<ApiResponse<Quiz>>> => 
    api.put(`/quizzes/${id}`, quizData),
    
  deleteQuiz: (id: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/quizzes/${id}`),
    
  submitQuizAnswers: (
    quizId: string, 
    answers: Array<{questionId: string; answer: string | string[]}>
  ): Promise<AxiosResponse<ApiResponse<{score: number; totalPoints: number; percentage: number}>>> => 
    api.post(`/quizzes/${quizId}/submit`, { answers }),
};

// API service cho breakout rooms
export const breakoutRoomAPI = {
  getRooms: (params?: {courseId?: string; status?: string}): Promise<AxiosResponse<ApiResponse<BreakoutRoom[]>>> => 
    api.get('/breakout-rooms', { params }),
    
  getRoomById: (id: string): Promise<AxiosResponse<ApiResponse<BreakoutRoom>>> => 
    api.get(`/breakout-rooms/${id}`),
    
  createRoom: (
    courseId: string, 
    roomData: Omit<BreakoutRoom, '_id' | 'courseId' | 'participants' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<AxiosResponse<ApiResponse<BreakoutRoom>>> => 
    api.post(`/courses/${courseId}/breakout-rooms`, roomData),
    
  updateRoom: (id: string, roomData: Partial<BreakoutRoom>): Promise<AxiosResponse<ApiResponse<BreakoutRoom>>> => 
    api.put(`/breakout-rooms/${id}`, roomData),
    
  deleteRoom: (id: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete(`/breakout-rooms/${id}`),
    
  joinRoom: (id: string): Promise<AxiosResponse<ApiResponse<BreakoutRoom>>> => 
    api.put(`/breakout-rooms/${id}/join`),
    
  leaveRoom: (id: string): Promise<AxiosResponse<ApiResponse<BreakoutRoom>>> => 
    api.put(`/breakout-rooms/${id}/leave`),
    
  sendMessage: (id: string, content: string): Promise<AxiosResponse<ApiResponse<Message>>> => 
    api.post(`/breakout-rooms/${id}/messages`, { content }),
    
  getMessages: (id: string, params?: {limit?: number; before?: string}): Promise<AxiosResponse<ApiResponse<Message[]>>> => 
    api.get(`/breakout-rooms/${id}/messages`, { params }),
};

// API service cho file uploads
export const uploadAPI = {
  uploadFile: (formData: FormData): Promise<AxiosResponse<ApiResponse<{url: string}>>> => 
    api.post('/uploads/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    
  uploadMultipleFiles: (formData: FormData): Promise<AxiosResponse<ApiResponse<{urls: string[]}>>> => 
    api.post('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    
  deleteFile: (fileUrl: string): Promise<AxiosResponse<ApiResponse<{success: boolean}>>> => 
    api.delete('/uploads/file', { data: { url: fileUrl } }),
};

// API helper cho việc gọi API với tham số tùy chỉnh
export const apiCall = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.get(url, config),
    
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.post(url, data, config),
    
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.put(url, data, config),
    
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => 
    api.delete(url, config),
};

export default api;