"use client"

import { useEffect, useState } from "react"
import { use } from "react" // Thêm import này
import { MainClassroom } from "@/components/classroom/main-classroom"
import { BreakoutRooms } from "@/components/classroom/breakout-rooms"
import { Schedule } from "@/components/schedule/schedule"
import { Assignments } from "@/components/assignments/assignments"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { LoginForm } from "@/components/shared/login-form"
import { UserHeader } from "@/components/shared/user-header"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, MessageSquare, CalendarDays, ClipboardList, Settings, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// Định nghĩa kiểu dữ liệu cho props
interface CoursePageProps {
  params: { id: string }
}

// Định nghĩa kiểu dữ liệu cho khóa học
interface Course {
  id: number
  code: string
  name: string
  instructor: string
  description: string
}
interface BreakoutRoomsProps {
  userRole: "admin" | "student"
  assignedRoomId: number | null
  courseId: number
}

export default function CoursePage({ params }: CoursePageProps) {
  const [activeTab, setActiveTab] = useState<string>("classroom")
  const { user, isAdmin, isStudent } = useAuth()
  const router = useRouter()
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Sửa lỗi params.id - unwrap bằng React.use()
  const courseId = params.id

  // Khi phát hiện là admin, tự động chuyển sang tab "admin"
  useEffect(() => {
    if (isAdmin) setActiveTab("admin")
  }, [isAdmin])

  // Lấy dữ liệu khóa học
  useEffect(() => {
    if (!user) return

    const fetchCourse = async () => {
      try {
        // Mô phỏng fetch API
        setTimeout(() => {
          // Mock data - trong thực tế sẽ là API call
          if (parseInt(courseId) > 10) {
            throw new Error("Khóa học không tồn tại")
          }
          
          setCourseData({
            id: parseInt(courseId),
            code: parseInt(courseId) === 1 ? "MKT301" : `COURSE${courseId}`,
            name: parseInt(courseId) === 1 ? "Nguyên lý Marketing" : `Khóa học ${courseId}`,
            instructor: "TS. Nguyễn Văn Minh",
            description: "Tìm hiểu về các nguyên lý cơ bản của marketing và cách áp dụng trong thực tế",
          })
          setIsLoading(false)
        }, 800)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi")
        setIsLoading(false)
      }
    }

    localStorage.setItem("currentCourseId", courseId)
    fetchCourse()
  }, [courseId, user])

  const userAssignedRoom = isStudent ? 1 : null

  const handleJoinBreakout = () => {
    setActiveTab("breakout")
  }

  // Sửa lỗi không thể quay về danh sách khóa học
  const handleBackToDashboard = () => {
    localStorage.removeItem("currentCourseId")
    // Thêm cờ đánh dấu quay về trang chủ
    localStorage.setItem("isReturningToHome", "true")
    router.push("/")
  }

  if (!user) {
    return <LoginForm />
  }

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

  if (error || !courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Không thể tải khóa học</h2>
          <p className="text-gray-600 mb-6">{error || "Khóa học không tồn tại hoặc bạn không có quyền truy cập"}</p>
          <Button onClick={handleBackToDashboard}>Quay về trang chủ</Button>
        </div>
      </div>
    )
  }

  if (isAdmin && activeTab === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                  <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent leading-tight">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">Quản lý hệ thống E-Learning</p>
                </div>
              </div>
              <UserHeader />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <AdminDashboard courseId={parseInt(courseId)} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
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
                  {courseData.code} - {courseData.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{courseData.instructor}</p>
              </div>
            </div>
            <UserHeader />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 animate-slide-up">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard} 
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Trở về danh sách khóa học
          </Button>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isAdmin ? "Quản lý khóa học" : courseData.name}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {isAdmin
              ? "Quản lý và giám sát các hoạt động học tập trong khóa học"
              : courseData.description}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
          <TabsList
            className={`grid w-full ${isAdmin ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"} mb-6 h-12 glass-effect border border-slate-200 rounded-xl p-1`}
          >
            <TabsTrigger
              value="classroom"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-700 rounded-lg transition-all duration-200 interactive-scale focus-ring"
            >
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Lớp học</span>
              <span className="sm:hidden">Lớp</span>
            </TabsTrigger>
            <TabsTrigger
              value="breakout"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-700 rounded-lg transition-all duration-200 interactive-scale focus-ring"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Nhóm thảo luận</span>
              <span className="sm:hidden">Nhóm</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-700 rounded-lg transition-all duration-200 interactive-scale focus-ring"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Lịch học</span>
              <span className="sm:hidden">Lịch</span>
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-teal-700 rounded-lg transition-all duration-200 interactive-scale focus-ring"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Bài tập</span>
              <span className="sm:hidden">BT</span>
            </TabsTrigger>

            {isAdmin && (
              <TabsTrigger
                value="admin"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-red-700 rounded-lg transition-all duration-200 interactive-scale focus-ring"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Quản lý</span>
                <span className="sm:hidden">QL</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="classroom" className="animate-fade-in">
            <MainClassroom 
              onJoinBreakout={handleJoinBreakout} 
              userAssignedRoom={userAssignedRoom}
              courseData={courseData}
            />
          </TabsContent>

          <TabsContent value="breakout" className="animate-fade-in">
            <BreakoutRooms 
              userRole={isAdmin ? "admin" : "student"} 
              assignedRoomId={userAssignedRoom}
              courseId={parseInt(courseId)}
            />
          </TabsContent>

          <TabsContent value="schedule" className="animate-fade-in">
            <Schedule courseId={parseInt(courseId)} />
          </TabsContent>

          <TabsContent value="assignments" className="animate-fade-in">
            <Assignments courseId={parseInt(courseId)} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="animate-fade-in">
              <AdminDashboard courseId={parseInt(courseId)} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}