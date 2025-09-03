"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  ReactNode 
} from "react"

// Course types
export type CourseContentType = "video" | "document" | "quiz" | "assignment"
export type CourseStatus = "published" | "draft" | "archived"
export type EnrollmentStatus = "enrolled" | "completed" | "in-progress" | "not-enrolled"

// Course content interface
export interface CourseContent {
  id: string
  title: string
  type: CourseContentType
  duration?: number // in minutes, for videos
  description: string
  url?: string
  thumbnail?: string
  order: number
  isCompleted: boolean
  lastAccessed?: Date
  progress?: number // 0-100
}

// Course section interface
export interface CourseSection {
  id: string
  title: string
  description?: string
  order: number
  contents: CourseContent[]
  isExpanded?: boolean
  progress: number // 0-100
}

// Assignment interface
export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  submissionDate?: Date
  isSubmitted: boolean
  score?: number
  maxScore: number
  feedback?: string
  attachments?: string[]
}

// Quiz interface
export interface Quiz {
  id: string
  title: string
  description: string
  timeLimit?: number // in minutes
  passingScore: number
  questions: QuizQuestion[]
  userScore?: number
  isCompleted: boolean
  lastAttempt?: Date
  attemptsLeft?: number
  maxAttempts: number
}

// Quiz question interface
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctOption: number
  userAnswer?: number
  explanation?: string
}

// Student progress interface
export interface StudentProgress {
  userId: string
  courseId: string
  overallProgress: number // 0-100
  sectionsCompleted: number
  totalSections: number
  contentsCompleted: number
  totalContents: number
  lastAccessed?: Date
  startDate?: Date
  completionDate?: Date
  certificateIssued: boolean
  score?: number // Overall score
}

// Course interface
export interface Course {
  id: string
  title: string
  code: string
  description: string
  shortDescription?: string
  instructor: string
  instructorTitle?: string
  instructorAvatar?: string
  thumbnail: string
  coverImage?: string
  startDate?: Date
  endDate?: Date
  enrollmentStatus: EnrollmentStatus
  status: CourseStatus
  sections: CourseSection[]
  progress: number // 0-100
  assignments: Assignment[]
  quizzes: Quiz[]
  studentProgress?: StudentProgress
  tags?: string[]
  category?: string
  level?: "beginner" | "intermediate" | "advanced"
  prerequisites?: string[]
  duration?: number // Total course duration in minutes
  enrolledStudents?: number
  maxStudents?: number
  rating?: number
  reviewCount?: number
  lastUpdated?: Date
  certificate?: {
    isAvailable: boolean
    requirements: string[]
    template?: string
  }
}

// Context interface
interface CourseContextType {
  // State
  courses: Course[]
  activeCourse: Course | null
  activeSectionId: string | null
  activeContentId: string | null
  isLoading: boolean
  error: string | null
  
  // Methods
  setCourses: (courses: Course[]) => void
  setCourse: (course: Course) => void
  setActiveCourse: (courseId: string | null) => void
  setActiveSection: (sectionId: string | null) => void
  setActiveContent: (contentId: string | null) => void
  
  // Course methods
  fetchCourses: () => Promise<Course[]>
  fetchCourseById: (courseId: string) => Promise<Course>
  enrollInCourse: (courseId: string) => Promise<boolean>
  unenrollFromCourse: (courseId: string) => Promise<boolean>
  
  // Progress tracking
  markContentAsCompleted: (courseId: string, contentId: string) => Promise<void>
  markContentAsIncomplete: (courseId: string, contentId: string) => Promise<void>
  updateContentProgress: (courseId: string, contentId: string, progress: number) => Promise<void>
  resetProgress: (courseId: string) => Promise<void>
  
  // Assignments
  submitAssignment: (courseId: string, assignmentId: string, submission: any) => Promise<boolean>
  getAssignmentFeedback: (courseId: string, assignmentId: string) => Promise<string | null>
  
  // Quizzes
  startQuiz: (courseId: string, quizId: string) => Promise<Quiz>
  submitQuizAnswer: (courseId: string, quizId: string, questionId: string, answer: number) => Promise<boolean>
  completeQuiz: (courseId: string, quizId: string) => Promise<number> // Returns score
  
  // Certificates
  generateCertificate: (courseId: string) => Promise<string>
  
  // Helper getters
  getActiveCourseProgress: () => number
  getActiveCourseSections: () => CourseSection[]
  getActiveSection: () => CourseSection | null
  getActiveContent: () => CourseContent | null
  
  // Calendar & scheduling
  getUpcomingDeadlines: () => { title: string; date: Date; courseId: string; type: 'assignment' | 'quiz' | 'deadline' }[]
}

// Create the context
const CourseContext = createContext<CourseContextType | null>(null)

// Mock data for example implementation
const MOCK_COURSES: Course[] = [
  {
    id: "course-1",
    title: "Nguyên lý Marketing",
    code: "MKT301",
    description: "Khóa học giúp sinh viên hiểu về các nguyên lý cơ bản trong marketing, từ nghiên cứu thị trường đến phát triển chiến lược marketing toàn diện. Sinh viên sẽ học cách phân tích hành vi người tiêu dùng, phân khúc thị trường, và áp dụng mô hình 4P của marketing mix.",
    shortDescription: "Các nguyên lý nền tảng của marketing hiện đại",
    instructor: "TS. Nguyễn Văn Minh",
    instructorTitle: "Tiến sĩ Marketing, Đại học UTH",
    thumbnail: "/course-marketing.jpg",
    enrollmentStatus: "enrolled",
    status: "published",
    level: "intermediate",
    duration: 1200, // 20 hours
    enrolledStudents: 45,
    maxStudents: 60,
    rating: 4.7,
    reviewCount: 32,
    progress: 35,
    tags: ["marketing", "business", "strategy"],
    category: "Business",
    sections: [
      {
        id: "section-1",
        title: "Giới thiệu về Marketing",
        description: "Tổng quan về ngành Marketing và lịch sử phát triển",
        order: 1,
        progress: 80,
        contents: [
          {
            id: "content-1",
            title: "Bài 1: Giới thiệu về Marketing",
            type: "video",
            duration: 45,
            description: "Tổng quan về ngành Marketing và lịch sử phát triển",
            url: "/videos/marketing-intro.mp4",
            thumbnail: "/thumbnails/marketing-intro.jpg",
            order: 1,
            isCompleted: true,
            progress: 100,
            lastAccessed: new Date(2023, 7, 25)
          },
          {
            id: "content-2",
            title: "Tài liệu: Lịch sử Marketing",
            type: "document",
            description: "Tài liệu tham khảo về lịch sử phát triển ngành Marketing",
            url: "/documents/marketing-history.pdf",
            order: 2,
            isCompleted: true,
            progress: 100
          },
          {
            id: "content-3",
            title: "Quiz: Kiến thức cơ bản",
            type: "quiz",
            description: "Bài kiểm tra nhanh các kiến thức cơ bản về Marketing",
            order: 3,
            isCompleted: false,
            progress: 0
          }
        ],
        isExpanded: true
      },
      {
        id: "section-2",
        title: "Nghiên cứu thị trường",
        description: "Phương pháp nghiên cứu và phân tích thị trường",
        order: 2,
        progress: 50,
        contents: [
          {
            id: "content-4",
            title: "Bài 2: Nghiên cứu thị trường",
            type: "video",
            duration: 55,
            description: "Các phương pháp nghiên cứu thị trường hiện đại",
            url: "/videos/market-research.mp4",
            thumbnail: "/thumbnails/market-research.jpg",
            order: 1,
            isCompleted: true,
            progress: 100,
            lastAccessed: new Date(2023, 8, 1)
          },
          {
            id: "content-5",
            title: "Tài liệu: Bảng khảo sát mẫu",
            type: "document",
            description: "Các mẫu bảng khảo sát nghiên cứu thị trường",
            url: "/documents/survey-templates.pdf",
            order: 2,
            isCompleted: false,
            progress: 0
          }
        ],
        isExpanded: false
      },
      {
        id: "section-3",
        title: "Marketing Mix - 4P",
        description: "Chiến lược 4P trong Marketing Mix",
        order: 3,
        progress: 0,
        contents: [
          {
            id: "content-6",
            title: "Bài 3: Marketing Mix - 4P",
            type: "video",
            duration: 50,
            description: "Giới thiệu về mô hình 4P trong Marketing Mix",
            url: "/videos/4p-marketing.mp4",
            thumbnail: "/thumbnails/4p-marketing.jpg",
            order: 1,
            isCompleted: false,
            progress: 0
          }
        ],
        isExpanded: false
      }
    ],
    assignments: [
      {
        id: "assignment-1",
        title: "Case Study: Phân tích chiến lược marketing của Vinamilk",
        description: "Phân tích chiến lược marketing của thương hiệu Vinamilk trong 5 năm gần đây. Đánh giá hiệu quả và đưa ra đề xuất cải thiện.",
        dueDate: new Date(2024, 0, 20),
        isSubmitted: false,
        maxScore: 100
      },
      {
        id: "assignment-2",
        title: "Bài tập: Xây dựng kế hoạch marketing cho sản phẩm mới",
        description: "Tạo một kế hoạch marketing hoàn chỉnh cho một sản phẩm công nghệ mới, bao gồm phân tích thị trường, định vị thương hiệu và chiến lược truyền thông.",
        dueDate: new Date(2024, 0, 25),
        isSubmitted: false,
        maxScore: 150
      }
    ],
    quizzes: [
      {
        id: "quiz-1",
        title: "Quiz 1: Nguyên lý Marketing cơ bản",
        description: "Bài kiểm tra về các khái niệm cơ bản trong marketing",
        passingScore: 70,
        isCompleted: false,
        maxAttempts: 3,
        attemptsLeft: 3,
        questions: [
          {
            id: "q1",
            question: "Marketing mix bao gồm bao nhiêu yếu tố P?",
            options: ["3P", "4P", "5P", "7P"],
            correctOption: 1
          },
          {
            id: "q2",
            question: "Khái niệm 'positioning' trong marketing là gì?",
            options: [
              "Vị trí đặt sản phẩm trong cửa hàng",
              "Vị thế sản phẩm trong tâm trí khách hàng",
              "Vị trí công ty trong ngành",
              "Cách sắp xếp quảng cáo"
            ],
            correctOption: 1,
            explanation: "Positioning là chiến lược định vị sản phẩm trong tâm trí khách hàng so với các sản phẩm cạnh tranh."
          }
        ]
      }
    ],
    studentProgress: {
      userId: "user-1",
      courseId: "course-1",
      overallProgress: 35,
      sectionsCompleted: 1,
      totalSections: 3,
      contentsCompleted: 3,
      totalContents: 6,
      lastAccessed: new Date(2023, 8, 5),
      startDate: new Date(2023, 7, 15),
      certificateIssued: false
    },
    certificate: {
      isAvailable: true,
      requirements: ["Complete 85% of course content", "Score at least 70% on final exam"]
    }
  },
  {
    id: "course-2",
    title: "Kỹ năng thuyết trình chuyên nghiệp",
    code: "COMM202",
    description: "Khóa học cung cấp các kỹ năng thuyết trình chuyên nghiệp trong môi trường học thuật và doanh nghiệp.",
    instructor: "TS. Phạm Thị Lan",
    thumbnail: "/course-presentation.jpg",
    enrollmentStatus: "not-enrolled",
    status: "published",
    level: "beginner",
    progress: 0,
    enrolledStudents: 37,
    maxStudents: 50,
    sections: [
      {
        id: "section-1",
        title: "Chuẩn bị thuyết trình",
        order: 1,
        progress: 0,
        contents: [
          {
            id: "content-1",
            title: "Bài 1: Phương pháp chuẩn bị",
            type: "video",
            duration: 35,
            description: "Các bước chuẩn bị cho một bài thuyết trình hiệu quả",
            order: 1,
            isCompleted: false,
            progress: 0
          }
        ]
      }
    ],
    assignments: [],
    quizzes: []
  }
]

// Provider component
interface CourseProviderProps {
  children: ReactNode
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [activeCourse, setActiveCourseState] = useState<Course | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [activeContentId, setActiveContentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize with mock data
  useEffect(() => {
    setCourses(MOCK_COURSES)
  }, [])
  
  // Methods
  const fetchCourses = useCallback(async (): Promise<Course[]> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch('/api/courses')
      // const data = await response.json()
      // setCourses(data)
      // return data
      
      // Using mock data for demo
      setCourses(MOCK_COURSES)
      setIsLoading(false)
      return MOCK_COURSES
    } catch (err) {
      setError("Failed to fetch courses")
      setIsLoading(false)
      return []
    }
  }, [])
  
  const fetchCourseById = useCallback(async (courseId: string): Promise<Course> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${courseId}`)
      // const data = await response.json()
      // return data
      
      // Using mock data for demo
      const course = MOCK_COURSES.find(c => c.id === courseId)
      if (!course) {
        throw new Error("Course not found")
      }
      setIsLoading(false)
      return course
    } catch (err) {
      setError("Failed to fetch course")
      setIsLoading(false)
      throw err
    }
  }, [])
  
  const enrollInCourse = useCallback(async (courseId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, enrollmentStatus: "enrolled" } 
            : course
        )
      )
      
      setIsLoading(false)
      return true
    } catch (err) {
      setError("Failed to enroll in course")
      setIsLoading(false)
      return false
    }
  }, [])
  
  const unenrollFromCourse = useCallback(async (courseId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/courses/${courseId}/unenroll`, { method: 'POST' })
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, enrollmentStatus: "not-enrolled" } 
            : course
        )
      )
      
      setIsLoading(false)
      return true
    } catch (err) {
      setError("Failed to unenroll from course")
      setIsLoading(false)
      return false
    }
  }, [])
  
  const markContentAsCompleted = useCallback(async (courseId: string, contentId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/courses/${courseId}/contents/${contentId}/complete`, { method: 'POST' })
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id !== courseId) return course
          
          // Find the section containing this content
          const updatedSections = course.sections.map(section => {
            const contentIndex = section.contents.findIndex(c => c.id === contentId)
            if (contentIndex === -1) return section
            
            // Update the content
            const updatedContents = [...section.contents]
            updatedContents[contentIndex] = {
              ...updatedContents[contentIndex],
              isCompleted: true,
              progress: 100,
              lastAccessed: new Date()
            }
            
            // Calculate new section progress
            const completedContents = updatedContents.filter(c => c.isCompleted).length
            const sectionProgress = Math.round((completedContents / updatedContents.length) * 100)
            
            return {
              ...section,
              contents: updatedContents,
              progress: sectionProgress
            }
          })
          
          // Calculate new overall course progress
          const totalContents = updatedSections.reduce((sum, section) => sum + section.contents.length, 0)
          const completedContents = updatedSections.reduce(
            (sum, section) => sum + section.contents.filter(c => c.isCompleted).length, 0
          )
          const courseProgress = Math.round((completedContents / totalContents) * 100)
          
          // Update student progress
          const updatedStudentProgress = course.studentProgress ? {
            ...course.studentProgress,
            overallProgress: courseProgress,
            contentsCompleted: completedContents,
            totalContents,
            lastAccessed: new Date()
          } : undefined
          
          return {
            ...course,
            sections: updatedSections,
            progress: courseProgress,
            studentProgress: updatedStudentProgress
          }
        })
      )
      
      setIsLoading(false)
    } catch (err) {
      setError("Failed to mark content as completed")
      setIsLoading(false)
    }
  }, [])
  
  const markContentAsIncomplete = useCallback(async (courseId: string, contentId: string): Promise<void> => {
    // Similar implementation to markContentAsCompleted, but marking as incomplete
    setIsLoading(true)
    setError(null)
    try {
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id !== courseId) return course
          
          // Find the section containing this content
          const updatedSections = course.sections.map(section => {
            const contentIndex = section.contents.findIndex(c => c.id === contentId)
            if (contentIndex === -1) return section
            
            // Update the content
            const updatedContents = [...section.contents]
            updatedContents[contentIndex] = {
              ...updatedContents[contentIndex],
              isCompleted: false,
              progress: 0,
              lastAccessed: new Date()
            }
            
            // Calculate new section progress
            const completedContents = updatedContents.filter(c => c.isCompleted).length
            const sectionProgress = Math.round((completedContents / updatedContents.length) * 100)
            
            return {
              ...section,
              contents: updatedContents,
              progress: sectionProgress
            }
          })
          
          // Calculate new overall course progress
          const totalContents = updatedSections.reduce((sum, section) => sum + section.contents.length, 0)
          const completedContents = updatedSections.reduce(
            (sum, section) => sum + section.contents.filter(c => c.isCompleted).length, 0
          )
          const courseProgress = Math.round((completedContents / totalContents) * 100)
          
          // Update student progress
          const updatedStudentProgress = course.studentProgress ? {
            ...course.studentProgress,
            overallProgress: courseProgress,
            contentsCompleted: completedContents,
            totalContents,
            lastAccessed: new Date()
          } : undefined
          
          return {
            ...course,
            sections: updatedSections,
            progress: courseProgress,
            studentProgress: updatedStudentProgress
          }
        })
      )
      
      setIsLoading(false)
    } catch (err) {
      setError("Failed to mark content as incomplete")
      setIsLoading(false)
    }
  }, [])
  
  const updateContentProgress = useCallback(async (courseId: string, contentId: string, progress: number): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id !== courseId) return course
          
          // Find the section containing this content
          const updatedSections = course.sections.map(section => {
            const contentIndex = section.contents.findIndex(c => c.id === contentId)
            if (contentIndex === -1) return section
            
            // Update the content
            const updatedContents = [...section.contents]
            const isCompleted = progress >= 100
            
            updatedContents[contentIndex] = {
              ...updatedContents[contentIndex],
              isCompleted,
              progress,
              lastAccessed: new Date()
            }
            
            // Calculate new section progress
            const sectionProgress = Math.round(
              updatedContents.reduce((sum, content) => sum + (content.progress || 0), 0) / updatedContents.length
            )
            
            return {
              ...section,
              contents: updatedContents,
              progress: sectionProgress
            }
          })
          
          // Calculate new overall course progress
          const totalContents = updatedSections.reduce((sum, section) => sum + section.contents.length, 0)
          const totalProgress = updatedSections.reduce(
            (sum, section) => sum + section.contents.reduce((s, c) => s + (c.progress || 0), 0), 0
          )
          const courseProgress = Math.round(totalProgress / totalContents)
          
          // Update student progress
          const completedContents = updatedSections.reduce(
            (sum, section) => sum + section.contents.filter(c => c.isCompleted).length, 0
          )
          
          const updatedStudentProgress = course.studentProgress ? {
            ...course.studentProgress,
            overallProgress: courseProgress,
            contentsCompleted: completedContents,
            totalContents,
            lastAccessed: new Date()
          } : undefined
          
          return {
            ...course,
            sections: updatedSections,
            progress: courseProgress,
            studentProgress: updatedStudentProgress
          }
        })
      )
      
      setIsLoading(false)
    } catch (err) {
      setError("Failed to update content progress")
      setIsLoading(false)
    }
  }, [])
  
  const resetProgress = useCallback(async (courseId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/courses/${courseId}/reset-progress`, { method: 'POST' })
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id !== courseId) return course
          
          // Reset all content progress
          const updatedSections = course.sections.map(section => ({
            ...section,
            progress: 0,
            contents: section.contents.map(content => ({
              ...content,
              isCompleted: false,
              progress: 0
            }))
          }))
          
          // Reset student progress
          const updatedStudentProgress = course.studentProgress ? {
            ...course.studentProgress,
            overallProgress: 0,
            contentsCompleted: 0,
            sectionsCompleted: 0,
            lastAccessed: new Date()
          } : undefined
          
          return {
            ...course,
            sections: updatedSections,
            progress: 0,
            studentProgress: updatedStudentProgress
          }
        })
      )
      
      setIsLoading(false)
    } catch (err) {
      setError("Failed to reset progress")
      setIsLoading(false)
    }
  }, [])
  
  const submitAssignment = useCallback(async (courseId: string, assignmentId: string, submission: any): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/submit`, {
      //   method: 'POST',
      //   body: JSON.stringify(submission)
      // })
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id !== courseId) return course
          
          const updatedAssignments = course.assignments.map(assignment => 
            assignment.id === assignmentId
              ? { ...assignment, isSubmitted: true, submissionDate: new Date() }
              : assignment
          )
          
          return {
            ...course,
            assignments: updatedAssignments
          }
        })
      )
      
      setIsLoading(false)
      return true
    } catch (err) {
      setError("Failed to submit assignment")
      setIsLoading(false)
      return false
    }
  }, [])
  
  const getAssignmentFeedback = useCallback(async (courseId: string, assignmentId: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/feedback`)
      // const data = await response.json()
      // return data.feedback
      
      // Mock implementation
      const course = courses.find(c => c.id === courseId)
      const assignment = course?.assignments.find(a => a.id === assignmentId)
      
      setIsLoading(false)
      return assignment?.feedback || null
    } catch (err) {
      setError("Failed to get assignment feedback")
      setIsLoading(false)
      return null
    }
  }, [courses])
  
  const startQuiz = useCallback(async (courseId: string, quizId: string): Promise<Quiz> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${courseId}/quizzes/${quizId}/start`, { method: 'POST' })
      // const data = await response.json()
      // return data
      
      // Mock implementation
      const course = courses.find(c => c.id === courseId)
      const quiz = course?.quizzes.find(q => q.id === quizId)
      
      if (!quiz) {
        throw new Error("Quiz not found")
      }
      
      // Update attempts
      if (quiz.attemptsLeft && quiz.attemptsLeft > 0) {
        setCourses(prevCourses => 
          prevCourses.map(c => {
            if (c.id !== courseId) return c
            
            return {
              ...c,
              quizzes: c.quizzes.map(q => 
                q.id === quizId
                  ? { ...q, attemptsLeft: (q.attemptsLeft || 0) - 1, lastAttempt: new Date() }
                  : q
              )
            }
          })
        )
      }
      
      setIsLoading(false)
      
      // Return a copy of the quiz with user answers reset
      return {
        ...quiz,
        questions: quiz.questions.map(q => ({ ...q, userAnswer: undefined }))
      }
    } catch (err) {
      setError("Failed to start quiz")
      setIsLoading(false)
      throw err
    }
  }, [courses])
  
  const submitQuizAnswer = useCallback(async (courseId: string, quizId: string, questionId: string, answer: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/courses/${courseId}/quizzes/${quizId}/questions/${questionId}/answer`, {
      //   method: 'POST',
      //   body: JSON.stringify({ answer })
      // })
      
      // Update local state
      setCourses(prevCourses => 
        prevCourses.map(course => {
          if (course.id !== courseId) return course
          
          return {
            ...course,
            quizzes: course.quizzes.map(quiz => {
              if (quiz.id !== quizId) return quiz
              
              return {
                ...quiz,
                questions: quiz.questions.map(question => 
                  question.id === questionId
                    ? { ...question, userAnswer: answer }
                    : question
                )
              }
            })
          }
        })
      )
      
      setIsLoading(false)
      
      // Check if answer is correct
      const course = courses.find(c => c.id === courseId)
      const quiz = course?.quizzes.find(q => q.id === quizId)
      const question = quiz?.questions.find(q => q.id === questionId)
      
      return question?.correctOption === answer
    } catch (err) {
      setError("Failed to submit answer")
      setIsLoading(false)
      return false
    }
  }, [courses])
  
  const completeQuiz = useCallback(async (courseId: string, quizId: string): Promise<number> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${courseId}/quizzes/${quizId}/complete`, { method: 'POST' })
      // const data = await response.json()
      // return data.score
      
      // Calculate score
      const course = courses.find(c => c.id === courseId)
      const quiz = course?.quizzes.find(q => q.id === quizId)
      
      if (!quiz) {
        throw new Error("Quiz not found")
      }
      
      const totalQuestions = quiz.questions.length
      const correctAnswers = quiz.questions.filter(q => q.userAnswer === q.correctOption).length
      const score = Math.round((correctAnswers / totalQuestions) * 100)
      
      // Update quiz status
      setCourses(prevCourses => 
        prevCourses.map(c => {
          if (c.id !== courseId) return c
          
          return {
            ...c,
            quizzes: c.quizzes.map(q => 
              q.id === quizId
                ? { 
                    ...q, 
                    isCompleted: true, 
                    userScore: score 
                  }
                : q
            )
          }
        })
      )
      
      // If the quiz is part of a course content, mark it as completed
      const quizContent = course?.sections.flatMap(s => s.contents).find(c => 
        c.type === "quiz" && c.title.includes(quiz.title)
      )
      
      if (quizContent) {
        await markContentAsCompleted(courseId, quizContent.id)
      }
      
      setIsLoading(false)
      return score
    } catch (err) {
      setError("Failed to complete quiz")
      setIsLoading(false)
      return 0
    }
  }, [courses, markContentAsCompleted])
  
  const generateCertificate = useCallback(async (courseId: string): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`/api/courses/${courseId}/certificate`, { method: 'POST' })
      // const data = await response.json()
      // return data.certificateUrl
      
      // Mock implementation
      const course = courses.find(c => c.id === courseId)
      
      if (!course) {
        throw new Error("Course not found")
      }
      
      // Check if student is eligible for certificate
      if (!course.certificate?.isAvailable) {
        throw new Error("Certificate is not available for this course")
      }
      
      if (course.progress < 85) {
        throw new Error("You need to complete at least 85% of the course to get a certificate")
      }
      
      // Update certificate status
      setCourses(prevCourses => 
        prevCourses.map(c => {
          if (c.id !== courseId) return c
          
          return {
            ...c,
            studentProgress: c.studentProgress
              ? { ...c.studentProgress, certificateIssued: true }
              : undefined
          }
        })
      )
      
      setIsLoading(false)
      return `/certificates/${courseId}_${Date.now()}.pdf`
    } catch (err) {
      setError("Failed to generate certificate")
      setIsLoading(false)
      throw err
    }
  }, [courses])
  
  // Helper methods
  const getActiveCourseProgress = useCallback(() => {
    return activeCourse?.progress || 0
  }, [activeCourse])
  
  const getActiveCourseSections = useCallback(() => {
    return activeCourse?.sections || []
  }, [activeCourse])
  
  const getActiveSection = useCallback(() => {
    if (!activeCourse || !activeSectionId) return null
    return activeCourse.sections.find(s => s.id === activeSectionId) || null
  }, [activeCourse, activeSectionId])
  
  const getActiveContent = useCallback(() => {
    if (!activeCourse || !activeSectionId || !activeContentId) return null
    const section = activeCourse.sections.find(s => s.id === activeSectionId)
    if (!section) return null
    return section.contents.find(c => c.id === activeContentId) || null
  }, [activeCourse, activeSectionId, activeContentId])
  
  const getUpcomingDeadlines = useCallback(() => {
    const now = new Date()
    const deadlines: { title: string; date: Date; courseId: string; type: 'assignment' | 'quiz' | 'deadline' }[] = []
    
    courses.forEach(course => {
      // Add assignment deadlines
      course.assignments.forEach(assignment => {
        if (assignment.dueDate > now && !assignment.isSubmitted) {
          deadlines.push({
            title: assignment.title,
            date: assignment.dueDate,
            courseId: course.id,
            type: 'assignment'
          })
        }
      })
      
      // Add quiz deadlines if applicable
      // In a real app, quizzes might have deadlines too
    })
    
    // Sort by date
    return deadlines.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [courses])
  
  // Set methods
  const setCourse = useCallback((course: Course) => {
    setCourses(prevCourses => 
      prevCourses.map(c => c.id === course.id ? course : c)
    )
  }, [])
  
  const setActiveCourse = useCallback((courseId: string | null) => {
    if (!courseId) {
      setActiveCourseState(null)
      setActiveSectionId(null)
      setActiveContentId(null)
      return
    }
    
    const course = courses.find(c => c.id === courseId)
    setActiveCourseState(course || null)
    
    // Set the first section as active by default
    if (course && course.sections.length > 0) {
      setActiveSectionId(course.sections[0].id)
      
      // Set the first content as active by default
      if (course.sections[0].contents.length > 0) {
        setActiveContentId(course.sections[0].contents[0].id)
      }
    }
  }, [courses])
  
  const setActiveSection = useCallback((sectionId: string | null) => {
    setActiveSectionId(sectionId)
    
    // Reset active content
    if (sectionId && activeCourse) {
      const section = activeCourse.sections.find(s => s.id === sectionId)
      if (section && section.contents.length > 0) {
        setActiveContentId(section.contents[0].id)
      } else {
        setActiveContentId(null)
      }
    } else {
      setActiveContentId(null)
    }
  }, [activeCourse])
  
  const setActiveContent = useCallback((contentId: string | null) => {
    setActiveContentId(contentId)
  }, [])
  
  // Create value object
  const value = useMemo(() => ({
    // State
    courses,
    activeCourse,
    activeSectionId,
    activeContentId,
    isLoading,
    error,
    
    // Methods
    setCourses,
    setCourse,
    setActiveCourse,
    setActiveSection,
    setActiveContent,
    
    // Course methods
    fetchCourses,
    fetchCourseById,
    enrollInCourse,
    unenrollFromCourse,
    
    // Progress tracking
    markContentAsCompleted,
    markContentAsIncomplete,
    updateContentProgress,
    resetProgress,
    
    // Assignments
    submitAssignment,
    getAssignmentFeedback,
    
    // Quizzes
    startQuiz,
    submitQuizAnswer,
    completeQuiz,
    
    // Certificates
    generateCertificate,
    
    // Helper getters
    getActiveCourseProgress,
    getActiveCourseSections,
    getActiveSection,
    getActiveContent,
    
    // Calendar & scheduling
    getUpcomingDeadlines
  }), [
    courses, activeCourse, activeSectionId, activeContentId, isLoading, error,
    setCourse, setActiveCourse, setActiveSection, setActiveContent,
    fetchCourses, fetchCourseById, enrollInCourse, unenrollFromCourse,
    markContentAsCompleted, markContentAsIncomplete, updateContentProgress, resetProgress,
    submitAssignment, getAssignmentFeedback,
    startQuiz, submitQuizAnswer, completeQuiz,
    generateCertificate,
    getActiveCourseProgress, getActiveCourseSections, getActiveSection, getActiveContent,
    getUpcomingDeadlines
  ])
  
  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  )
}

// Custom hook to use the context
export function useCourse() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider")
  }
  return context
}