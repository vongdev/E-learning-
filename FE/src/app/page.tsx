"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/shared/login-form"
import { UserHeader } from "@/components/shared/user-header"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { BookOpen } from "lucide-react"
import { ErrorDisplay } from "@/components/ui/error-display"
import { Input } from "@/components/ui/input"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useEnrolledCourses } from "@/hooks/useEnrolledCourses"
import { useSearchFilter } from "@/hooks/useSearchFilter"
import { CourseCard } from "@/components/course/CourseCard"
import { useToast } from "@/components/ui/use-toast"
import { CourseStatus, EnrollmentStatus } from "@/types/course"

export default function HomePage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [returning, setReturning] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Sử dụng custom hook để lấy danh sách khóa học
  const { 
    data: coursesData, 
    isLoading, 
    error, 
    refetch 
  } = useEnrolledCourses(user?.id);

  // Sử dụng custom hook để lọc khóa học với debounce
  const { 
    filteredItems: filteredCourses,
    inputValue,
    setInputValue
  } = useSearchFilter(
    coursesData,
    searchTerm,
    ['name', 'code', 'instructor'],
    300 // 300ms debounce
  );

  useEffect(() => {
    // Ensure we're running on the client before accessing localStorage
    if (typeof window === "undefined") return;

    try {
      // Kiểm tra nếu đang quay về từ trang chi tiết
      const isReturning = localStorage.getItem("isReturningToHome")
      if (isReturning) {
        // Xóa cờ
        localStorage.removeItem("isReturningToHome")
        setReturning(true)
      } else {
        // Kiểm tra đăng nhập và phục hồi khóa học đang xem
        const savedCourseId = localStorage.getItem("currentCourseId")
        if (user && savedCourseId) {
          router.push(`/course/${savedCourseId}`)
          return
        }
      }
    } catch (err) {
      console.error("Error in homepage initialization:", err);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi khởi tạo trang chủ",
        variant: "destructive"
      });
    }
  }, [user, router, toast]);

  // Xử lý khi click vào khóa học
  const handleCourseClick = (courseId: string) => {
    try {
      localStorage.setItem("currentCourseId", courseId)
      // Xóa cờ quay về trước khi chuyển đến trang chi tiết
      localStorage.removeItem("isReturningToHome")
      router.push(`/course/${courseId}`)
    } catch (err) {
      console.error("Error navigating to course:", err);
      toast({
        title: "Lỗi",
        description: "Không thể chuyển đến trang chi tiết khóa học",
        variant: "destructive"
      });
    }
  }

  // Nếu chưa đăng nhập, hiển thị trang đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/uth-logo.png"
            alt="UTH University Logo"
            width={180}
            height={60}
            className="mb-4 drop-shadow-md"
            priority
          />
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            E-Learning Platform
          </h1>
          <p className="text-slate-600 font-medium mt-2 text-center">
            Đại học Giao thông Vận tải TP.HCM
          </p>
        </div>
        <LoginForm />
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

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm khóa học theo tên, mã hoặc giảng viên..."
            className="pl-10 bg-white dark:bg-slate-800"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInputValue(e.target.value);
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        {/* Error message */}
        {error && (
          <ErrorDisplay 
            message="Không thể tải danh sách khóa học. Vui lòng thử lại sau." 
            onRetry={() => refetch()}
          />
        )}

        {/* Loading state with skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}

        {/* Course list */}
        {!isLoading && filteredCourses && filteredCourses.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
    {filteredCourses.map((course: any) => {
      // Tạo ID an toàn - sử dụng _id nếu có hoặc tạo một ID tạm thời từ code
      const courseId = course._id || course.id || `course-${course.code}`;
      
      return (
        <CourseCard
          key={courseId}
          course={{
            id: courseId,
            code: course.code || "",
            name: course.name || course.title || "",
            instructor: course.instructor || "Không có thông tin giảng viên",
            status: (course.status || "published") as CourseStatus,
            enrollmentStatus: (course.enrollmentStatus || "in-progress") as EnrollmentStatus,
            progress: course.progress || 0,
            nextClass: course.nextClass || "Đang cập nhật",
            assignments: course.assignments || 0,
            pendingAssignments: course.pendingAssignments || 0,
            thumbnail: course.thumbnail || undefined,
            lastAccessed: course.lastAccessed || undefined
          }}
          onJoinCourse={handleCourseClick}
        />
      );
    })}
  </div>
) : !isLoading && (
          <div className="text-center py-12">
            <div className="mb-4">
              <BookOpen className="h-12 w-12 mx-auto text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-700 mb-2">
              {searchTerm ? "Không tìm thấy khóa học phù hợp" : "Chưa có khóa học nào"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? "Vui lòng thử từ khóa khác hoặc xóa bộ lọc" 
                : "Bạn chưa được đăng ký vào khóa học nào."}
            </p>
            {searchTerm ? (
              <Button onClick={() => {
                setSearchTerm("");
                setInputValue("");
              }}>Xóa bộ lọc</Button>
            ) : (
              <Button onClick={() => router.push('/explore')}>Khám phá khóa học</Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}