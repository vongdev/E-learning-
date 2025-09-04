"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/shared/login-form"
import { UserHeader } from "@/components/shared/user-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, Calendar, ChevronRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { courseAPI } from "@/service/api"

/**
 * Trang chủ - hiển thị danh sách các khóa học hoặc form đăng nhập
 * nếu chưa đăng nhập
 */
export default function HomePage() {
  const { user, isAdmin, isStudent } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Ensure we're running on the client before accessing localStorage
    if (typeof window === "undefined") return;

    try {
      // Kiểm tra nếu đang quay về từ trang chi tiết
      const isReturning = localStorage.getItem("isReturningToHome")
      if (isReturning) {
        // Xóa cờ và tải danh sách khóa học
        localStorage.removeItem("isReturningToHome")
        setIsLoading(true)
      } else {
        // Kiểm tra đăng nhập và phục hồi khóa học đang xem
        const savedCourseId = localStorage.getItem("currentCourseId")
        if (user && savedCourseId) {
          router.push(`/course/${savedCourseId}`)
          return
        }
      }

      // Lấy danh sách khóa học khi đã đăng nhập
      if (user) {
        fetchCourses();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error in homepage initialization:", err);
      setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  }, [user, router])

  // Tách logic fetch courses ra thành function riêng
  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use actual API instead of mock data
      const response = await courseAPI.getEnrolledCourses();
      
      // Transform API response to match the expected format
      const formattedCourses = response.data.data.map((course: any) => ({
        id: course._id,
        code: course.code,
        name: course.name,
        instructor: course.instructor,
        description: course.description || course.shortDescription,
        progress: course.progress || 0,
        nextClass: "Đang cập nhật", // This would come from a schedule API
        assignments: 0, // This would need another API call
        unread: 0, // This would need a notifications API
      }));
      
      setCourses(formattedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Không thể tải danh sách khóa học. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý khi click vào khóa học
  const handleCourseClick = (courseId: string) => {
    try {
      localStorage.setItem("currentCourseId", courseId)
      // Xóa cờ quay về trước khi chuyển đến trang chi tiết
      localStorage.removeItem("isReturningToHome")
      router.push(`/course/${courseId}`)
    } catch (err) {
      console.error("Error navigating to course:", err);
      setError("Không thể mở khóa học. Vui lòng thử lại.");
    }
  }

  // Xử lý thử lại khi có lỗi
  const handleRetry = () => {
    if (user) {
      fetchCourses();
    } else {
      setError(null);
    }
  };

  // Nếu chưa đăng nhập, hiển thị trang đăng nhập
  if (!user) {
    return <LoginForm />
  }

  // Hiển thị loading state
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass-effect border-b shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-slide-up">
              <Image
                src="/uth-logo.png"
                alt="UTH University Logo"
                width={120}
                height={40}
                className="h-10 w-auto drop-shadow-sm interactive-scale"
              />
              <div className="border-l border-slate-300 pl-3">
                <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent leading-tight">
                  E-Learning Platform
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Đại học Giao thông Vận tải TP.HCM</p>
              </div>
            </div>
            <UserHeader />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isAdmin ? "Quản lý khóa học" : "Khóa học của bạn"}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {isAdmin
              ? "Quản lý và theo dõi các khóa học trong hệ thống"
              : "Các khóa học bạn đã đăng ký tham gia"}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleRetry}>
              Thử lại
            </Button>
          </Alert>
        )}

        {/* Course list */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className="overflow-hidden border-2 border-transparent hover:border-blue-300 transition-all duration-300 hover:shadow-lg cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">
                      {course.code} - {course.name}
                    </CardTitle>
                    {course.unread > 0 && (
                      <Badge className="bg-red-400 text-white">
                        {course.unread} mới
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-blue-50 mt-1">{course.instructor}</p>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium flex items-center justify-between">
                        <span>Tiến độ</span>
                        <span>{course.progress}%</span>
                      </p>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-700">{course.nextClass}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span className="text-gray-700">{course.assignments} bài tập</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Vào lớp học
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <BookOpen className="h-12 w-12 mx-auto text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-700 mb-2">Chưa có khóa học nào</h3>
            <p className="text-slate-500 mb-6">Bạn chưa được đăng ký vào khóa học nào.</p>
            {isStudent && (
              <Button>Khám phá khóa học</Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}