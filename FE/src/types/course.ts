export type CourseLevel = "beginner" | "intermediate" | "advanced"
export type CourseStatus = "draft" | "published" | "archived" | "private"
export type EnrollmentStatus = "not-enrolled" | "enrolled" | "in-progress" | "completed" | "expired"
export type ContentType = "video" | "document" | "quiz" | "assignment" | "discussion" | "interactive"

export interface Author {
  id: string
  name: string
  title?: string
  avatar?: string
  bio?: string
  organization?: string
}

export interface CourseSection {
  id: string
  title: string
  description?: string
  order: number
  isLocked?: boolean
  isFree?: boolean
  duration?: number // in minutes
  contents: CourseContent[]
}

export interface CourseContent {
  id: string
  title: string
  description?: string
  type: ContentType
  order: number
  duration?: number // in minutes
  isLocked?: boolean
  isFree?: boolean
  url?: string
  videoUrl?: string
  documentUrl?: string
  thumbnail?: string
  quizId?: string
  assignmentId?: string
  isCompleted?: boolean
  progress?: number // 0-100
  lastAccessed?: Date
}

export interface CourseReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number // 1-5
  comment?: string
  date: Date
  isVerified: boolean
  isHelpful?: number // number of users who found this review helpful
}

export interface CourseEnrollment {
  id: string
  userId: string
  courseId: string
  enrollmentDate: Date
  expiryDate?: Date
  status: EnrollmentStatus
  progress: number // 0-100
  certificate?: {
    id: string
    issueDate: Date
    downloadUrl: string
  }
}

export interface CoursePrice {
  amount: number
  currency: string
  discountAmount?: number
  discountPercentage?: number
  isOnSale?: boolean
  saleEndDate?: Date
}

export interface CourseLearningOutcome {
  id: string
  description: string
  order: number
}

export interface CourseRequirement {
  id: string
  description: string
  order: number
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  shortDescription?: string
  language: string
  level: CourseLevel
  category: string
  subcategory?: string
  tags: string[]
  thumbnail: string
  coverImage?: string
  previewVideo?: string
  duration: number // in minutes
  lectureCount: number
  sections: CourseSection[]
  status: CourseStatus
  visibility: "public" | "private" | "password-protected"
  password?: string
  price?: CoursePrice
  authors: Author[]
  requirements: CourseRequirement[]
  learningOutcomes: CourseLearningOutcome[]
  rating: number // average rating 1-5
  reviewCount: number
  enrollmentCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  certificate?: {
    isEnabled: boolean
    template?: string
    requiredCompletionPercentage: number
  }
  completionCriteria?: {
    requiredPercentage: number
    requiredQuizScore?: number
    requiredAssignments?: string[]
  }
}

export interface CourseProgress {
  userId: string
  courseId: string
  progress: number // 0-100
  sectionsProgress: Record<string, number> // sectionId -> progress (0-100)
  contentsProgress: Record<string, number> // contentId -> progress (0-100)
  completedContents: string[] // array of contentIds
  startedAt: Date
  lastAccessedAt: Date
  completedAt?: Date
  timeSpent: number // in seconds
  quizScores: Record<string, number> // quizId -> score
  assignmentGrades: Record<string, number> // assignmentId -> grade
  certificateIssued: boolean
  certificateUrl?: string
}
