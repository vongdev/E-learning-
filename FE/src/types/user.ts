export type UserRole = 'student' | 'instructor' | 'admin' | 'moderator' | 'guest'
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned'
export type UserPreferenceTheme = 'light' | 'dark' | 'system'
export type NotificationType = 'email' | 'push' | 'in-app'
export type UserGender = 'male' | 'female' | 'other' | 'prefer-not-to-say'

export interface UserProfile {
  firstName: string
  lastName: string
  bio?: string
  avatar?: string
  coverImage?: string
  dateOfBirth?: Date
  gender?: UserGender
  organization?: string
  title?: string
  website?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    facebook?: string
    github?: string
    youtube?: string
    instagram?: string
  }
  location?: {
    country?: string
    city?: string
    address?: string
    zipCode?: string
  }
  phoneNumber?: string
  displayName?: string
}

export interface UserPreferences {
  theme: UserPreferenceTheme
  language: string
  emailNotifications: boolean
  pushNotifications: boolean
  autoPlayVideos: boolean
  subtitlesEnabled: boolean
  subtitlesLanguage?: string
  playbackSpeed: number // default 1.0
  videoQuality: 'auto' | 'low' | 'medium' | 'high'
  downloadEnabled: boolean
  timezone: string
  calendarIntegration?: 'google' | 'outlook' | 'apple' | 'none'
  notificationTypes: NotificationType[]
}

export interface UserEducation {
  id: string
  institution: string
  degree?: string
  fieldOfStudy?: string
  startDate?: Date
  endDate?: Date
  grade?: string
  activities?: string
  description?: string
}

export interface UserExperience {
  id: string
  title: string
  company: string
  location?: string
  startDate: Date
  endDate?: Date
  isCurrent?: boolean
  description?: string
  skills?: string[]
}

export interface UserSkill {
  name: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
  endorsements?: number
}

export interface UserCertificate {
  id: string
  name: string
  issuedBy: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  credentialUrl?: string
  skills?: string[]
}

export interface UserAchievement {
  id: string
  title: string
  description?: string
  earnedDate: Date
  image?: string
  type: 'badge' | 'certificate' | 'award' | 'milestone'
  points?: number
  level?: number
}

export interface User {
  id: string
  email: string
  username?: string
  profile: UserProfile
  roles: UserRole[]
  status: UserStatus
  preferences: UserPreferences
  
  // Educational and professional background
  education?: UserEducation[]
  experience?: UserExperience[]
  skills?: UserSkill[]
  certificates?: UserCertificate[]
  
  // Gamification & Achievements
  achievements?: UserAchievement[]
  totalPoints?: number
  level?: number
  streak?: number
  
  // Learning stats
  coursesEnrolled?: number
  coursesCompleted?: number
  averageScore?: number
  totalLearningTime?: number // in minutes
  
  // Account info
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  lastActive?: Date
  emailVerified: boolean
  twoFactorEnabled: boolean
  
  // Privacy & Visibility
  profileVisibility: 'public' | 'private' | 'connections-only'
  activityVisibility: 'public' | 'private' | 'connections-only'
  
  // Flags
  isVerifiedInstructor?: boolean
  isFeatured?: boolean
}

export interface UserSession {
  id: string
  userId: string
  ip: string
  userAgent: string
  device: string
  browser: string
  os: string
  loginAt: Date
  expiresAt: Date
  isActive: boolean
  lastActiveAt: Date
}

export interface UserNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'course' | 'assignment' | 'discussion' | 'announcement' | 'system'
  relatedId?: string
  relatedType?: string
  isRead: boolean
  createdAt: Date
  expiresAt?: Date
  actions?: Array<{
    label: string
    url: string
  }>
}

// Helper functions để thay thế getter methods
export const getUserName = (user: User): string => {
  return user.profile.displayName || `${user.profile.firstName} ${user.profile.lastName}`.trim();
};

export const isUserAdmin = (user: User): boolean => {
  return user.roles.includes('admin');
};

export const isUserStudent = (user: User): boolean => {
  return user.roles.includes('student');
};

export const isUserInstructor = (user: User): boolean => {
  return user.roles.includes('instructor');
};

export const getUserAvatarUrl = (user: User): string => {
  return user.profile.avatar || '';
};