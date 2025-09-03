"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Download,
  Settings,
  Trash2,
  CheckCircle,
  Clock,
  Award,
  UserPlus,
  Shuffle,
  UserCheck,
  MessageSquare,
} from "lucide-react"

interface AdminDashboardProps {
  courseId?: number;
}

export function AdminDashboard({ courseId }: AdminDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [showCreateQuiz, setShowCreateQuiz] = useState(false)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showGroupManager, setShowGroupManager] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const contextTitle = courseId 
    ? `Quản lý khóa học #${courseId}` 
    : "Quản lý tất cả khóa học";

  const [breakoutGroups, setBreakoutGroups] = useState([
    {
      id: 1,
      name: "Nhóm 1 - Thảo luận Case A",
      members: [
        { id: 1, name: "Nguyễn Văn A", isLeader: true },
        { id: 2, name: "Trần Thị B", isLeader: false },
        { id: 4, name: "Phạm Thị D", isLeader: false },
      ],
      topic: "Phân tích yêu cầu hệ thống",
      status: "active",
      maxMembers: 4,
    },
    {
      id: 2,
      name: "Nhóm 2 - Thảo luận Case A",
      members: [
        { id: 3, name: "Lê Văn C", isLeader: true },
        { id: 5, name: "Hoàng Văn E", isLeader: false },
      ],
      topic: "Thiết kế giao diện người dùng",
      status: "active",
      maxMembers: 4,
    },
    {
      id: 3,
      name: "Nhóm 3 - Thảo luận Case A",
      members: [],
      topic: "Kiểm thử và triển khai",
      status: "waiting",
      maxMembers: 4,
    },
  ])

  const [unassignedStudents, setUnassignedStudents] = useState([
    { id: 6, name: "Võ Thị F", email: "vothif@uth.edu.vn" },
    { id: 7, name: "Đặng Văn G", email: "dangvang@uth.edu.vn" },
    { id: 8, name: "Bùi Thị H", email: "buithih@uth.edu.vn" },
  ])

  const stats = [
    {
      title: "Tổng sinh viên",
      value: "1,234",
      icon: Users,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      change: "+12%",
    },
    {
      title: "Khóa học",
      value: "45",
      icon: BookOpen,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      change: "+5%",
    },
    {
      title: "Bài tập",
      value: "128",
      icon: FileText,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      change: "+18%",
    },
    {
      title: "Buổi học",
      value: "89",
      icon: Calendar,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      change: "+8%",
    },
  ]

  const recentActivities = [
    { action: "Sinh viên Nguyễn Văn A hoàn thành Quiz 1", time: "5 phút trước", type: "quiz", status: "success" },
    { action: "Tạo breakout room mới cho lớp CS101", time: "15 phút trước", type: "room", status: "info" },
    { action: "Cập nhật lịch Q&A tuần tới", time: "1 giờ trước", type: "schedule", status: "warning" },
    { action: "23 sinh viên tham gia buổi học trực tuyến", time: "2 giờ trước", type: "class", status: "success" },
  ]

  const students = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@uth.edu.vn",
      status: "active",
      progress: 85,
      lastActive: "2 giờ trước",
      courses: 3,
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@uth.edu.vn",
      status: "active",
      progress: 92,
      lastActive: "1 giờ trước",
      courses: 4,
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@uth.edu.vn",
      status: "inactive",
      progress: 67,
      lastActive: "1 ngày trước",
      courses: 2,
    },
    {
      id: 4,
      name: "Phạm Thị D",
      email: "phamthid@uth.edu.vn",
      status: "active",
      progress: 78,
      lastActive: "30 phút trước",
      courses: 3,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      email: "hoangvane@uth.edu.vn",
      status: "pending",
      progress: 45,
      lastActive: "3 ngày trước",
      courses: 1,
    },
  ]

  const courses = [
    { id: 1, name: "Lập trình Web", students: 45, progress: 78, status: "active", instructor: "TS. Nguyễn Văn X" },
    { id: 2, name: "Cơ sở dữ liệu", students: 38, progress: 65, status: "active", instructor: "PGS. Trần Thị Y" },
    { id: 3, name: "Mạng máy tính", students: 52, progress: 82, status: "active", instructor: "TS. Lê Văn Z" },
    { id: 4, name: "Trí tuệ nhân tạo", students: 29, progress: 45, status: "draft", instructor: "PGS. Phạm Văn W" },
  ]

  const assignments = [
    {
      id: 1,
      title: "Bài tập HTML/CSS",
      course: "Lập trình Web",
      dueDate: "2024-01-15",
      submitted: 42,
      total: 45,
      status: "active",
    },
    {
      id: 2,
      title: "Thiết kế CSDL",
      course: "Cơ sở dữ liệu",
      dueDate: "2024-01-20",
      submitted: 35,
      total: 38,
      status: "active",
    },
    {
      id: 3,
      title: "Cấu hình Router",
      course: "Mạng máy tính",
      dueDate: "2024-01-25",
      submitted: 48,
      total: 52,
      status: "active",
    },
    {
      id: 4,
      title: "Thuật toán ML",
      course: "Trí tuệ nhân tạo",
      dueDate: "2024-01-30",
      submitted: 0,
      total: 29,
      status: "draft",
    },
  ]

  const handleCreateQuiz = () => {
    setShowCreateQuiz(true)
  }

  const handleCreateClass = () => {
    setShowCreateClass(true)
  }

  const handleViewStudent = (studentId: number) => {
    console.log("[v0] Viewing student:", studentId)
    // Navigate to student detail page
  }

  const handleEditStudent = (studentId: number) => {
    console.log("[v0] Editing student:", studentId)
    // Open edit student modal
  }

  const handleDeleteStudent = (studentId: number) => {
    console.log("[v0] Deleting student:", studentId)
    // Show confirmation dialog
  }

const handleExportData = () => {
    console.log(`[v0] Exporting data for course: ${courseId || 'all courses'}`)
    // Export functionality
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case "quiz":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "room":
        return <Users className="h-4 w-4 text-blue-500" />
      case "schedule":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "class":
        return <BookOpen className="h-4 w-4 text-purple-500" />
      default:
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
    }
  }

  const handleAddToGroup = (studentId: number, groupId: number) => {
    const student = unassignedStudents.find((s) => s.id === studentId)
    if (!student) return

    setBreakoutGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId && group.members.length < group.maxMembers) {
          return {
            ...group,
            members: [...group.members, { ...student, isLeader: group.members.length === 0 }],
            status: group.members.length === 0 ? "active" : group.status,
          }
        }
        return group
      }),
    )

    setUnassignedStudents((prev) => prev.filter((s) => s.id !== studentId))
  }

  const handleRemoveFromGroup = (studentId: number, groupId: number) => {
    const group = breakoutGroups.find((g) => g.id === groupId)
    const student = group?.members.find((m) => m.id === studentId)
    if (!student) return

    setBreakoutGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newMembers = g.members.filter((m) => m.id !== studentId)
          return {
            ...g,
            members: newMembers,
            status: newMembers.length === 0 ? "waiting" : g.status,
          }
        }
        return g
      }),
    )

    setUnassignedStudents((prev) => [
      ...prev,
      { id: student.id, name: student.name, email: `${student.name.toLowerCase().replace(/\s+/g, "")}@uth.edu.vn` },
    ])
  }

  const handleRandomAssign = () => {
    const shuffled = [...unassignedStudents].sort(() => Math.random() - 0.5)
    let studentIndex = 0

    setBreakoutGroups((prev) =>
      prev.map((group) => {
        const availableSlots = group.maxMembers - group.members.length
        const studentsToAdd = shuffled.slice(studentIndex, studentIndex + availableSlots)
        studentIndex += studentsToAdd.length

        return {
          ...group,
          members: [
            ...group.members,
            ...studentsToAdd.map((student, index) => ({
              ...student,
              isLeader: group.members.length === 0 && index === 0,
            })),
          ],
          status: group.members.length === 0 && studentsToAdd.length > 0 ? "active" : group.status,
        }
      }),
    )

    setUnassignedStudents(shuffled.slice(studentIndex))
  }

  const handleSetLeader = (studentId: number, groupId: number) => {
    setBreakoutGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.map((member) => ({
              ...member,
              isLeader: member.id === studentId,
            })),
          }
        }
        return group
      }),
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">{contextTitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => console.log(`Exporting data for course: ${courseId || 'all'}`)} className="hover:bg-gray-50 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button
            onClick={() => setShowCreateQuiz(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium mt-1">{stat.change}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-white rounded-xl p-1 shadow-sm">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Tổng quan
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Sinh viên
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Khóa học
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Bài tập
          </TabsTrigger>
          <TabsTrigger
            value="breakout"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Nhóm thảo luận
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
          >
            Thống kê
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Hoạt động gần đây
                </CardTitle>
                <CardDescription>Các sự kiện mới nhất trong hệ thống</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border hover:shadow-sm transition-all"
                    >
                      {getActivityIcon(activity.type, activity.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-500" />
                  Thao tác nhanh
                </CardTitle>
                <CardDescription>Các chức năng thường dùng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all"
                    onClick={handleCreateQuiz}
                  >
                    <Plus className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-blue-700 font-medium">Tạo Quiz</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 transition-all"
                    onClick={handleCreateClass}
                  >
                    <Users className="h-6 w-6 mb-2 text-green-600" />
                    <span className="text-green-700 font-medium">Quản lý lớp</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 transition-all"
                  >
                    <Calendar className="h-6 w-6 mb-2 text-orange-600" />
                    <span className="text-orange-700 font-medium">Lên lịch</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all"
                  >
                    <BarChart3 className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-purple-700 font-medium">Báo cáo</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Quản lý sinh viên
                  </CardTitle>
                  <CardDescription>Danh sách và thông tin sinh viên</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm sinh viên
                </Button>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm sinh viên..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">Tiến độ: {student.progress}%</span>
                          <span className="text-xs text-gray-500">Khóa học: {student.courses}</span>
                          <span className="text-xs text-gray-500">Hoạt động: {student.lastActive}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(student.status)}>
                        {student.status === "active"
                          ? "Hoạt động"
                          : student.status === "inactive"
                            ? "Không hoạt động"
                            : "Chờ duyệt"}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleViewStudent(student.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditStudent(student.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-500" />
                    Quản lý khóa học
                  </CardTitle>
                  <CardDescription>Tạo và chỉnh sửa nội dung khóa học</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo khóa học
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="border hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{course.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">Giảng viên: {course.instructor}</p>
                        </div>
                        <Badge className={getStatusColor(course.status)}>
                          {course.status === "active" ? "Đang diễn ra" : "Bản nháp"}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Sinh viên:</span>
                          <span className="font-medium">{course.students}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tiến độ:</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-500" />
                    Quản lý bài tập
                  </CardTitle>
                  <CardDescription>Tạo và chấm điểm bài tập</CardDescription>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài tập
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-6 border rounded-xl hover:shadow-sm transition-all bg-gradient-to-r from-white to-orange-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Khóa học: {assignment.course}</p>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status === "active" ? "Đang mở" : "Bản nháp"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <p className="text-2xl font-bold text-blue-600">{assignment.submitted}</p>
                        <p className="text-sm text-gray-500">Đã nộp</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <p className="text-2xl font-bold text-gray-600">{assignment.total}</p>
                        <p className="text-sm text-gray-500">Tổng số</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border">
                        <p className="text-2xl font-bold text-orange-600">{assignment.dueDate}</p>
                        <p className="text-sm text-gray-500">Hạn nộp</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem bài nộp
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Award className="h-4 w-4 mr-2" />
                        Chấm điểm
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakout" className="space-y-6">
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                    Quản lý nhóm thảo luận
                  </CardTitle>
                  <CardDescription>Chia nhóm và quản lý breakout rooms</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleRandomAssign} className="bg-transparent">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Chia ngẫu nhiên
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo nhóm mới
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Các nhóm thảo luận</h3>
                  {breakoutGroups.map((group) => (
                    <Card key={group.id} className="border hover:shadow-md transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{group.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">Chủ đề: {group.topic}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {group.members.length}/{group.maxMembers} thành viên
                            </p>
                          </div>
                          <Badge
                            className={
                              group.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {group.status === "active" ? "Hoạt động" : "Chờ thành viên"}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          {group.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  {member.isLeader && (
                                    <Badge variant="outline" className="text-xs">
                                      Trưởng nhóm
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                {!member.isLeader && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetLeader(member.id, group.id)}
                                    className="text-xs bg-transparent"
                                  >
                                    <UserCheck className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveFromGroup(member.id, group.id)}
                                  className="text-xs text-red-600 hover:text-red-700 bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {group.members.length === 0 && (
                            <p className="text-sm text-gray-400 text-center py-4">Chưa có thành viên nào</p>
                          )}
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${(group.members.length / group.maxMembers) * 100}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">Sinh viên chưa phân nhóm</h3>
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {unassignedStudents.map((student) => (
                          <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                            <Select onValueChange={(groupId) => handleAddToGroup(student.id, Number.parseInt(groupId))}>
                              <SelectTrigger className="w-24 h-8 text-xs">
                                <UserPlus className="h-3 w-3" />
                              </SelectTrigger>
                              <SelectContent>
                                {breakoutGroups
                                  .filter((group) => group.members.length < group.maxMembers)
                                  .map((group) => (
                                    <SelectItem key={group.id} value={group.id.toString()}>
                                      Nhóm {group.id}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        {unassignedStudents.length === 0 && (
                          <p className="text-sm text-gray-400 text-center py-4">Tất cả sinh viên đã được phân nhóm</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                  Thống kê học tập
                </CardTitle>
                <CardDescription>Phân tích hiệu suất học tập của sinh viên</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <p className="text-3xl font-bold text-blue-600">87%</p>
                      <p className="text-sm text-blue-700">Tỷ lệ hoàn thành</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                      <p className="text-3xl font-bold text-green-600">8.5</p>
                      <p className="text-sm text-green-700">Điểm trung bình</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Lập trình Web</span>
                      <span className="text-sm text-gray-500">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: "92%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cơ sở dữ liệu</span>
                      <span className="text-sm text-gray-500">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                        style={{ width: "78%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-500" />
                  Hoạt động hệ thống
                </CardTitle>
                <CardDescription>Thống kê truy cập và sử dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                      <p className="text-3xl font-bold text-purple-600">1,234</p>
                      <p className="text-sm text-purple-700">Lượt truy cập</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                      <p className="text-3xl font-bold text-orange-600">456</p>
                      <p className="text-sm text-orange-700">Người dùng hoạt động</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Quiz hoàn thành</span>
                      <span className="text-sm font-bold text-green-600">+23%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Thời gian học trung bình</span>
                      <span className="text-sm font-bold text-blue-600">45 phút</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Tỷ lệ tham gia breakout</span>
                      <span className="text-sm font-bold text-purple-600">89%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showCreateQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>Tạo Quiz mới</CardTitle>
              <CardDescription>Tạo quiz tương tác cho sinh viên</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quiz-title">Tiêu đề Quiz</Label>
                <Input id="quiz-title" placeholder="Nhập tiêu đề quiz..." />
              </div>
              <div>
                <Label htmlFor="quiz-course">Khóa học</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Lập trình Web</SelectItem>
                    <SelectItem value="db">Cơ sở dữ liệu</SelectItem>
                    <SelectItem value="network">Mạng máy tính</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quiz-description">Mô tả</Label>
                <Textarea id="quiz-description" placeholder="Mô tả ngắn về quiz..." />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateQuiz(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setShowCreateQuiz(false)}>Tạo Quiz</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
