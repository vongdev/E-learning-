"use client"

import { useState, useEffect } from 'react'
import { 
  CalendarClock, 
  FileText, 
  Clock, 
  Check, 
  AlertCircle, 
  Upload, 
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useToast } from '@/components/ui/use-toast'

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  submitted: boolean;
  submissionId?: string;
  maxScore: number;
  status: string;
}

interface CourseAssignmentsProps {
  courseId: string;
}

export default function CourseAssignments({ courseId }: CourseAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchAssignments()
  }, [courseId])

  const fetchAssignments = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true)
      setError(null)
      
      // Fetch assignments from API
      const response = await fetch(`/api/courses/${courseId}/assignments`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tải danh sách bài tập')
      }
      
      setAssignments(data.data || [])
    } catch (error) {
      console.error('Error fetching assignments:', error)
      setError('Không thể tải danh sách bài tập. Vui lòng thử lại sau.')
      
      // Fallback to demo data if API fails
      setAssignments([
        {
          id: '1',
          title: 'Bài tập 1: Phân tích case study',
          description: 'Phân tích case study về chiến lược marketing của công ty X',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          submitted: false,
          maxScore: 100,
          status: 'active'
        },
        {
          id: '2',
          title: 'Bài tập 2: Xây dựng kế hoạch marketing',
          description: 'Xây dựng kế hoạch marketing cho một sản phẩm mới ra mắt',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          submitted: false,
          maxScore: 100,
          status: 'active'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleViewAssignment = (assignmentId: string) => {
    // Thực hiện điều hướng đến trang chi tiết bài tập
    // window.location.href = `/course/${courseId}/assignment/${assignmentId}`;
    toast({
      title: "Đang phát triển",
      description: "Tính năng xem chi tiết bài tập đang được phát triển.",
    })
  }

  const handleSubmitAssignment = (assignmentId: string) => {
    // Thực hiện điều hướng đến trang nộp bài
    // window.location.href = `/course/${courseId}/assignment/${assignmentId}/submit`;
    toast({
      title: "Đang phát triển",
      description: "Tính năng nộp bài tập đang được phát triển.",
    })
  }

  // Hiển thị trạng thái dựa vào deadline và trạng thái nộp bài
  const getAssignmentStatus = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()
    
    if (assignment.submitted) {
      return {
        label: 'Đã nộp',
        color: 'bg-green-500',
        icon: <Check className="h-4 w-4" />
      }
    }
    
    if (dueDate < now) {
      return {
        label: 'Quá hạn',
        color: 'bg-red-500',
        icon: <AlertCircle className="h-4 w-4" />
      }
    }
    
    // Còn 2 ngày đến deadline
    const twoDaysInMs = 2 * 24 * 60 * 60 * 1000
    if (dueDate.getTime() - now.getTime() < twoDaysInMs) {
      return {
        label: 'Sắp đến hạn',
        color: 'bg-yellow-500',
        icon: <Clock className="h-4 w-4" />
      }
    }
    
    return {
      label: 'Đang mở',
      color: 'bg-blue-500',
      icon: <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách bài tập...</p>
        </div>
      </div>
    )
  }

  if (error && assignments.length === 0) {
    return (
      <div className="w-full py-8">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Đã xảy ra lỗi</h3>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={fetchAssignments}
            variant="outline" 
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có bài tập nào</h3>
        <p className="text-gray-500 mb-4">
          Giảng viên chưa tạo bài tập nào cho khóa học này.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Bài tập ({assignments.length})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((assignment) => {
          const status = getAssignmentStatus(assignment)
          const dueDate = new Date(assignment.dueDate)
          
          return (
            <Card key={assignment.id} className="overflow-hidden border-2 hover:border-primary transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <Badge className={`${status.color} flex items-center gap-1`}>
                    {status.icon}
                    <span>{status.label}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {assignment.description}
                </p>
                
                <div className="flex flex-col space-y-2 text-sm">
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Hạn nộp: {format(dueDate, 'HH:mm - dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      Điểm tối đa: {assignment.maxScore}
                    </span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-3 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleViewAssignment(assignment.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
                
                {!assignment.submitted ? (
                  <Button 
                    onClick={() => handleSubmitAssignment(assignment.id)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Nộp bài
                  </Button>
                ) : (
                  <Button variant="outline">
                    <Check className="h-4 w-4 mr-2" />
                    Đã nộp
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}