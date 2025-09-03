export type QuizType = 'self-assessment' | 'graded' | 'practice' | 'final' | 'mid-term' | 'survey'
export type QuestionType = 'multiple-choice' | 'single-choice' | 'true-false' | 'matching' | 'fill-in-blank' | 'essay'
export type QuizStatus = 'draft' | 'published' | 'archived'

export interface QuizQuestion {
  id: string
  type: QuestionType
  text: string
  explanation?: string
  points: number
  order: number
  
  // For single/multiple choice questions
  options?: QuizOption[]
  
  // For matching questions
  matchingPairs?: {
    left: string
    right: string
  }[]
  
  // For fill-in-blank questions
  blankAnswers?: string[]
  
  // Media content
  image?: string
  video?: string
  audio?: string
  
  // Difficulty level
  difficulty?: 'easy' | 'medium' | 'hard'
  
  // For essay questions
  wordLimit?: number
  
  // Categories for analytics
  categories?: string[]
}

export interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface Quiz {
  id: string
  title: string
  description?: string
  instructions?: string
  type: QuizType
  status: QuizStatus
  courseId?: string
  sectionId?: string
  contentId?: string
  
  // Questions
  questions: QuizQuestion[]
  
  // Settings
  shuffleQuestions: boolean
  shuffleOptions: boolean
  timeLimit?: number // in seconds
  passingScore: number // percentage
  maxAttempts?: number
  showCorrectAnswers: boolean
  showExplanations: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  
  // Analytics
  averageScore?: number
  attemptCount?: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  courseId?: string
  
  // Attempt data
  startedAt: Date
  completedAt?: Date
  timeSpent?: number // in seconds
  
  // Results
  score: number
  isPassed: boolean
  
  // Answers
  answers: QuizAnswer[]
  
  // For proctoring/security
  ipAddress?: string
  userAgent?: string
  suspiciousActivity?: boolean
}

export interface QuizAnswer {
  questionId: string
  
  // For single choice
  selectedOptionId?: string
  
  // For multiple choice
  selectedOptionIds?: string[]
  
  // For true/false
  booleanAnswer?: boolean
  
  // For matching
  matchingAnswers?: Record<string, string> // leftId -> rightId
  
  // For fill-in-blank
  textAnswers?: string[]
  
  // For essay
  essayAnswer?: string
  
  // Grading
  isCorrect?: boolean
  score?: number
  feedback?: string
  
  // Analytics
  timeSpent?: number // in seconds
}

export interface QuizStatistics {
  quizId: string
  attemptCount: number
  averageScore: number
  medianScore: number
  highestScore: number
  lowestScore: number
  passRate: number // percentage
  averageTimeSpent: number // in seconds
  
  // Question-specific stats
  questionStats: Array<{
    questionId: string
    correctRate: number // percentage
    averageTimeSpent: number // in seconds
  }>
  
  // Distribution of scores
  scoreDistribution: Record<string, number> // score range -> count
}