"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users as UsersIcon, 
  BookOpen as BookIcon, 
  GraduationCap, 
  BarChart3, 
  FileText,
  Settings,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { adminAPI } from "@/service/api"

// Định nghĩa interface cho dashboard stats
interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalSubmissions: number;
  activeUsers?: number;
  completionRate?: number;
  revenueData?: {
    amount: number;
    currency: string;
    trend: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await adminAPI.getDashboardStats()
      setStats(response.data.data)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Không thể tải dữ liệu quản trị. Vui lòng thử lại sau.")
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu quản trị. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check admin access and fetch data
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login")
        toast({
          title: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để tiếp tục.",
          variant: "destructive",
        })
      } else if (!user.roles.includes('admin')) {
        router.push("/")
        toast({
          title: "Không có quyền truy cập",
          description: "Bạn không có quyền truy cập vào trang này.",
          variant: "destructive",
        })
      } else {
        fetchDashboardData()
      }
    }
  }, [user, authLoading, router, toast])

  // If loading auth or dashboard data
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Đang tải dữ liệu quản trị...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex dark:bg-slate-900">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        
        <main className="flex-1 p-6">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý và theo dõi hoạt động của hệ thống E-learning
            </p>
          </div>
          
          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
              <Button variant="outline" size="sm" className="ml-auto" onClick={fetchDashboardData}>
                Thử lại
              </Button>
            </Alert>
          )}

          {/* Stats overview */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng người dùng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString('vi-VN')}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng khóa học
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BookIcon className="h-4 w-4 text-green-500 mr-2" />
                    <div className="text-2xl font-bold">{stats.totalCourses.toLocaleString('vi-VN')}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tổng học viên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <GraduationCap className="h-4 w-4 text-purple-500 mr-2" />
                    <div className="text-2xl font-bold">{stats.totalEnrollments.toLocaleString('vi-VN')}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Bài tập đã nộp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-amber-500 mr-2" />
                    <div className="text-2xl font-bold">{stats.totalSubmissions.toLocaleString('vi-VN')}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Dashboard tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>Tổng quan</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2" />
                <span>Người dùng</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center">
                <BookIcon className="h-4 w-4 mr-2" />
                <span>Khóa học</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>Cài đặt</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Tổng quan hệ thống</CardTitle>
                  <CardDescription>
                    Số liệu thống kê và báo cáo về hoạt động hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Hiển thị biểu đồ từ API hoặc component SystemOverview */}
                  <div className="h-80 bg-slate-100 rounded-md flex items-center justify-center dark:bg-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Biểu đồ thống kê sẽ hiển thị ở đây</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý người dùng</CardTitle>
                  <CardDescription>
                    Danh sách và quản lý tài khoản người dùng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Hiển thị bảng người dùng hoặc component UserTable */}
                  <div className="h-80 bg-slate-100 rounded-md flex items-center justify-center dark:bg-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Bảng quản lý người dùng sẽ hiển thị ở đây</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Quản lý khóa học</CardTitle>
                  <CardDescription>
                    Danh sách và quản lý khóa học trong hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Hiển thị bảng khóa học hoặc component CourseTable */}
                  <div className="h-80 bg-slate-100 rounded-md flex items-center justify-center dark:bg-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Bảng quản lý khóa học sẽ hiển thị ở đây</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt hệ thống</CardTitle>
                  <CardDescription>
                    Cấu hình và thiết lập cho hệ thống
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Hiển thị form cài đặt hoặc component SystemSettings */}
                  <div className="h-80 bg-slate-100 rounded-md flex items-center justify-center dark:bg-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Form cài đặt sẽ hiển thị ở đây</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}