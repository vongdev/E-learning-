"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserHeader } from "@/components/shared/user-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen, Clock, FileText, Home, 
  LayoutDashboard, MessageSquare, Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import CourseSyllabus from "@/components/course/course-syllabus"
import CourseResources from "@/components/course/course-resources"
import CourseDiscussions from "@/components/course/course-discussions"
import CourseAssignments from "@/components/course/course-assignments"
import CourseStudents from "@/components/course/course-students"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorDisplay } from "@/components/ui/error-display"
import { useQuery } from "@tanstack/react-query"
import { courseAPI, progressAPI } from "@/service/api"

export default function CoursePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("syllabus")

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
    }
  }, [user, router])

  // Fetch course data with React Query
  const { 
    data: course, 
    isLoading: courseLoading, 
    error: courseError,
    refetch: refetchCourse
  } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseAPI.getCourseById(id as string),
    enabled: !!user && !!id,
    select: (response) => response.data
  })

  // Fetch progress data with React Query
  const { 
    data: progress, 
    isLoading: progressLoading, 
    error: progressError,
    refetch: refetchProgress,
    setQueryData: setProgressData
  } = useQuery({
    queryKey: ['progress', id],
    queryFn: () => progressAPI.getCourseProgress(id as string),
    enabled: !!user && !!id,
    select: (response) => response.data
  })

  // Update progress data when needed
  const updateProgress = (newProgress) => {
    setProgressData(newProgress)
  }

  const handleBack = () => {
    localStorage.setItem("isReturningToHome", "true")
    router.push("/")
  }

  // Combined loading state
  const isLoading = courseLoading || progressLoading
  
  // Combined error
  const error = courseError || progressError
  const errorMessage = error 
    ? (error instanceof ApiError 
        ? error.message 
        : "Không thể tải thông tin khóa học. Vui lòng thử lại sau.")
    : null

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <LoadingSpinner size="lg" message="Đang tải thông tin khóa học..." />
      </div>
    )
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-md w-full">
          <ErrorDisplay 
            message={errorMessage} 
            onRetry={() => {
              refetchCourse()
              refetchProgress()
            }} 
          />
          <Button onClick={handleBack} className="w-full">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    )
  }

  // No course found
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-4">
            <BookOpen className="h-12 w-12 mx-auto text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-700 mb-2">Không tìm thấy khóa học</h3>
          <p className="text-slate-500 mb-6">Khóa học này không tồn tại hoặc bạn không có quyền truy cập.</p>
          <Button onClick={handleBack} className="w-full">
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass-effect border-b shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              className="flex items-center text-slate-700" 
              onClick={handleBack}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Trang chủ</span>
            </Button>
            <UserHeader />
          </div>
        </div>
      </header>

      {/* Course header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-slide-up">
                {course.data.code} - {course.data.name}
              </h1>
              <p className="text-blue-100 animate-slide-up">
                {course.data.instructor}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 animate-slide-up">
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">{course.data.lectureCount} bài học</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">{course.data.enrollmentCount} học viên</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="text-sm">{progress?.data?.progress || 0}% hoàn thành</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="mb-6">
            <TabsTrigger value="syllabus" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Nội dung học</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>Bài tập</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>Tài liệu</span>
            </TabsTrigger>
            <TabsTrigger value="discussions" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Thảo luận</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Học viên</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="syllabus">
            <CourseSyllabus 
              course={course.data} 
              progress={progress?.data} 
              updateProgress={updateProgress} 
            />
          </TabsContent>

          <TabsContent value="assignments">
            <CourseAssignments courseId={course.data._id} />
          </TabsContent>

          <TabsContent value="resources">
            <CourseResources courseId={course.data._id} />
          </TabsContent>

          <TabsContent value="discussions">
            <CourseDiscussions courseId={course.data._id} />
          </TabsContent>

          <TabsContent value="students">
            <CourseStudents courseId={course.data._id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}