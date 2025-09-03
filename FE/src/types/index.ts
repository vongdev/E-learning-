// Export all models
export * from './course'
export * from './user'
export * from './quiz'

// Export types used across multiple models
export type ID = string
export type Timestamp = Date

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'deleted'
export type VisibilityType = 'public' | 'private' | 'restricted'
export type ContentAccessType = 'free' | 'premium' | 'restricted'

// Result interfaces
export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasMore: boolean
}

// Utility type to make some properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Progress tracking types
export interface ProgressData {
  progress: number // 0-100
  isCompleted: boolean
  lastUpdated: Date
}

// Analytics types
export interface UserAnalytics {
  userId: string
  viewCount: number
  completionRate: number
  averageScore: number
  timeSpent: number // in seconds
  lastActive: Date
}

export interface CourseAnalytics {
  courseId: string
  enrollmentCount: number
  completionCount: number
  averageProgress: number
  averageRating: number
  popularSections: string[] // section IDs
  revenue?: number
}