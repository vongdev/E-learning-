"use client"

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Loader2, 
  AlertCircle, 
  UserCog, 
  Mail, 
  UserPlus, 
  UserMinus 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface CourseStudentsProps {
  courseId: string;
}

export default function CourseStudents({ courseId }: CourseStudentsProps) {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch students data from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // API call to get enrolled students for this course
        const response = await fetch(`/api/courses/${courseId}/enrollments`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Không thể tải danh sách học viên')
        }
        
        // Format student data
        const formattedStudents = data.data.map((enrollment: any) => ({
          id: enrollment.userId._id,
          name: `${enrollment.userId.profile.firstName} ${enrollment.userId.profile.lastName}`,
          email: enrollment.userId.email,
          avatar: enrollment.userId.profile.avatar,
          status: enrollment.status,
          progress: enrollment.progress,
          lastActive: new Date(enrollment.lastAccessedAt).toLocaleDateString('vi-VN'),
          completedAssignments: 0, // This should come from your API
          totalAssignments: 0 // This should come from your API
        }))
        
        setStudents(formattedStudents)
      } catch (error) {
        console.error('Error fetching students:', error)
        setError('Không thể tải danh sách học viên. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }
    
    if (courseId) {
      fetchStudents()
    }
  }, [courseId])

  // Lọc học viên theo từ khóa tìm kiếm
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Xử lý khi click vào nút xem chi tiết
  const handleViewDetails = (studentId: string) => {
    toast({
      title: "Đang phát triển",
      description: "Tính năng xem chi tiết học viên đang được phát triển.",
    })
  }

  // Xử lý khi click vào nút gửi email
  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  // Xử lý khi xóa học viên khỏi khóa học
  const handleRemoveStudent = (studentId: string) => {
    toast({
      title: "Đang phát triển",
      description: "Tính năng xóa học viên đang được phát triển.",
    })
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách học viên...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => setLoading(true)}
            variant="outline" 
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có học viên</h3>
        <p className="text-gray-500 mb-4">
          Khóa học này chưa có học viên nào đăng ký.
        </p>
        {user?.isAdmin && (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm học viên
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Học viên ({students.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm học viên..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {user?.isAdmin && (
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Học viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Bài tập</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Không tìm thấy học viên phù hợp với từ khóa tìm kiếm
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar || `https://ui-avatars.com/api/?name=${student.name}`} />
                        <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Badge className={`${student.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}>
                        {student.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </Badge>
                      <span className="text-xs text-gray-500 ml-2">
                        Truy cập: {student.lastActive}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-[150px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{student.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{student.completedAssignments}</span>
                      <span className="text-gray-500">/{student.totalAssignments}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(student.id)}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSendEmail(student.email)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      {user?.isAdmin && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}