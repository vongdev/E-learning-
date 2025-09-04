"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { courseAPI, progressAPI } from "@/service/api"
import { UserHeader } from "@/components/shared/user-header"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  AlertCircle, 
  BookOpen, 
  Clock, 
  FileText, 
  Home, 
  LayoutDashboard, 
  Loader2, 
  MessageSquare, 
  Users
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import CourseSyllabus from "@/components/course/course-syllabus"
import CourseResources from "@/components/course/course-resources"
import CourseDiscussions from "@/components/course/course-discussions"
import CourseAssignments from "@/components/course/course-assignments"
import CourseStudents from "@/components/course/course-students"

export default function CoursePage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<any>(null)
  const [progress, setProgress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("syllabus")

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/")
      return
    }

    fetchCourseData()
  }, [id, user, router])

  const fetchCourseData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch course details
      const courseResponse = await courseAPI.getCourseById(id as string)
      setCourse(courseResponse.data.data)

      // Fetch course progress
      const progressResponse = await progressAPI.getCourseProgress(id as string)
      setProgress(progressResponse.data.data)
    } catch (err) {
      console.error("Error fetching course data:", err)
      setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    localStorage.setItem("isReturningToHome", "true")
    router.push("/")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khóa học...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
                {course.code} - {course.name}
              </h1>
              <p className="text-blue-100 animate-slide-up">
                {course.instructor}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 animate-slide-up">
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-sm">{course.lectureCount} bài học</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <Users className="h-4 w-4 mr-2" />
                <span className="text-sm">{course.enrollmentCount} học viên</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="text-sm">{progress?.progress || 0}% hoàn thành</span>
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
              course={course} 
              progress={progress} 
              updateProgress={setProgress} 
            />
          </TabsContent>

          <TabsContent value="assignments">
            <CourseAssignments courseId={course._id} />
          </TabsContent>

          <TabsContent value="resources">
            <CourseResources courseId={course._id} />
          </TabsContent>

          <TabsContent value="discussions">
            <CourseDiscussions courseId={course._id} />
          </TabsContent>

          <TabsContent value="students">
            <CourseStudents courseId={course._id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}