"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Clock, User, ArrowRight, Search, Plus, Flame, Calendar, Trophy, Bookmark, CheckCircle } from "lucide-react"
import Image from "next/image"

export function CourseDashboard() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [courses, setCourses] = useState<any[]>([])
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Giả lập fetch từ API
  useEffect(() => {
    // Trong thực tế, đây sẽ là API call
    setTimeout(() => {
      const mockCourses = [
        {
          id: 1,
          code: "MKT301",
          name: "Nguyên lý Marketing",
          instructor: "TS. Nguyễn Văn Minh",
          thumbnail: "/course-marketing.jpg",
          progress: 35,
          status: "in-progress",
          nextClass: "10/01/2024",
          assignments: 3,
          pendingAssignments: 1,
        },
        {
          id: 2,
          code: "CSC101",
          name: "Lập trình Web",
          instructor: "TS. Trần Thị Lan",
          thumbnail: "/course-webdev.jpg",
          progress: 78,
          status: "in-progress",
          nextClass: "11/01/2024",
          assignments: 5,
          pendingAssignments: 0,
        },
        {
          id: 3,
          code: "ECO201",
          name: "Kinh tế vĩ mô",
          instructor: "PGS.TS. Lê Văn Hùng",
          thumbnail: "/course-economics.jpg",
          progress: 52,
          status: "in-progress",
          nextClass: "12/01/2024",
          assignments: 4,
          pendingAssignments: 2,
        },
        {
          id: 4,
          code: "MAN202",
          name: "Quản trị nhân sự",
          instructor: "TS. Phạm Thị Mai",
          thumbnail: "/course-hrm.jpg",
          progress: 0,
          status: "upcoming",
          nextClass: "15/01/2024",
          assignments: 0,
          pendingAssignments: 0,
        },
      ]
      setCourses(mockCourses)
      setFilteredCourses(mockCourses)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Lọc khóa học theo từ khóa tìm kiếm
  useEffect(() => {
    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCourses(filtered)
  }, [searchTerm, courses])

  const handleJoinCourse = (courseId: number) => {
    // Lưu courseId vào localStorage hoặc context để sử dụng trong trang e-learning
    localStorage.setItem("currentCourseId", courseId.toString())
    router.push(`/course/${courseId}`)
  }

  const handleCreateCourse = () => {
    router.push("/admin/create-course")
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
                  E-Learning UTH
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Đại học Giao thông Vận tải TP.HCM</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {isAdmin ? "Quản lý khóa học" : "Khóa học của bạn"}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {isAdmin 
              ? "Tạo và quản lý các khóa học trong hệ thống" 
              : "Danh sách các khóa học bạn đã đăng ký"}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {isAdmin && (
            <Button onClick={handleCreateCourse} className="bg-gradient-to-r from-blue-500 to-purple-500">
              <Plus className="h-4 w-4 mr-2" />
              Tạo khóa học mới
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-md">
                    <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
                      {course.thumbnail ? (
                        <Image
                          src={course.thumbnail}
                          alt={course.name}
                          layout="fill"
                          objectFit="cover"
                          className="opacity-90 hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-white/80 text-blue-800 font-bold backdrop-blur-sm">
                          {course.code}
                        </Badge>
                      </div>
                      {course.status === "in-progress" && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-green-500 text-white">
                            <Flame className="h-3 w-3 mr-1" />
                            Đang học
                          </Badge>
                        </div>
                      )}
                      {course.status === "upcoming" && (
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-blue-500 text-white">
                            <Calendar className="h-3 w-3 mr-1" />
                            Sắp diễn ra
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{course.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {course.instructor}
                        </p>
                      </div>

                      {course.status === "in-progress" && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Tiến độ học tập</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.status === "in-progress" && course.pendingAssignments > 0 && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.pendingAssignments} bài tập đến hạn
                          </Badge>
                        )}
                        {course.status === "in-progress" && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Calendar className="h-3 w-3 mr-1" />
                            Buổi kế: {course.nextClass}
                          </Badge>
                        )}
                        {isAdmin && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Quản lý
                          </Badge>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleJoinCourse(course.id)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        {course.status === "upcoming" ? (
                          <>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Xem thông tin
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Vào học
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khóa học</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Không có khóa học nào phù hợp với từ khóa tìm kiếm. Vui lòng thử lại với từ khóa khác.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}