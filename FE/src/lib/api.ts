// Placeholder for API client - will be implemented when building the backend

// Default API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.uth-elearning.com/api'

// Types
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions {
  method?: RequestMethod
  body?: any
  headers?: Record<string, string>
}

// Generic API client function
async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  // Default headers
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
  
  // Add auth token if available
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  // Merge headers
  const requestHeaders = { ...defaultHeaders, ...headers }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add body if needed
  if (body) {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions)
    
    // Parse the response
    const data = await response.json()
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) => 
    apiClient('/auth/login', { method: 'POST', body: { email, password } }),
  
  logout: () => 
    apiClient('/auth/logout', { method: 'POST' }),
  
  getCurrentUser: () => 
    apiClient('/auth/me')
}

// Course APIs
export const courseApi = {
  getAll: () => 
    apiClient('/courses'),
  
  getById: (id: string) => 
    apiClient(`/courses/${id}`),
  
  create: (data: any) => 
    apiClient('/courses', { method: 'POST', body: data }),
  
  update: (id: string, data: any) => 
    apiClient(`/courses/${id}`, { method: 'PUT', body: data }),
  
  delete: (id: string) => 
    apiClient(`/courses/${id}`, { method: 'DELETE' })
}

// User APIs
export const userApi = {
  getAll: () => 
    apiClient('/users'),
  
  getById: (id: string) => 
    apiClient(`/users/${id}`),
  
  create: (data: any) => 
    apiClient('/users', { method: 'POST', body: data }),
  
  update: (id: string, data: any) => 
    apiClient(`/users/${id}`, { method: 'PUT', body: data }),
  
  delete: (id: string) => 
    apiClient(`/users/${id}`, { method: 'DELETE' })
}

// Quiz APIs
export const quizApi = {
  getAll: () => 
    apiClient('/quizzes'),
  
  getById: (id: string) => 
    apiClient(`/quizzes/${id}`),
  
  getByVideoId: (videoId: string) => 
    apiClient(`/videos/${videoId}/quizzes`),
  
  create: (data: any) => 
    apiClient('/quizzes', { method: 'POST', body: data }),
  
  update: (id: string, data: any) => 
    apiClient(`/quizzes/${id}`, { method: 'PUT', body: data }),
  
  delete: (id: string) => 
    apiClient(`/quizzes/${id}`, { method: 'DELETE' }),
  
  submitAnswer: (quizId: string, answers: any) => 
    apiClient(`/quizzes/${quizId}/submit`, { method: 'POST', body: { answers } })
}

// Assignment APIs
export const assignmentApi = {
  getAll: () => 
    