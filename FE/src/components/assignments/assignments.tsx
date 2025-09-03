"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText, Clock, CheckCircle, AlertCircle, Upload, Eye } from "lucide-react"

interface AssignmentsProps {
  courseId?: number;
}

export function Assignments({ courseId }: AssignmentsProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)

  const assignments = [
    {
      id: 1,
      title: "Case Study: Phân tích chiến lược marketing của Vinamilk",
      description:
        "Nghiên cứu và phân tích chiến lược marketing của thương hiệu Vinamilk trong 5 năm gần đây. Đánh giá hiệu quả và đưa ra đề xuất cải thiện.",
      detailedRequirements: `
        **Yêu cầu chi tiết:**
        1. Phân tích SWOT của Vinamilk (2019-2024)
        2. Đánh giá chiến lược 4P Marketing Mix
        3. Phân tích đối thủ cạnh tranh chính
        4. Đề xuất 3-5 cải tiến cụ thể
        5. Trình bày bằng PowerPoint (15-20 slides)
        
        **Tiêu chí chấm điểm:**
        - Độ chính xác phân tích: 40%
        - Tính sáng tạo đề xuất: 30%
        - Chất lượng trình bày: 20%
        - Tham khảo nguồn: 10%
      `,
      dueDate: "2024-01-20",
      status: "pending",
      type: "essay",
      maxScore: 100,
      submitted: false,
      timeRemaining: "5 ngày",
    },
    {
      id: 2,
      title: "Bài tập: Xây dựng kế hoạch marketing cho sản phẩm mới",
      description:
        "Tạo một kế hoạch marketing hoàn chỉnh cho một sản phẩm công nghệ mới, bao gồm phân tích thị trường, định vị thương hiệu và chiến lược truyền thông.",
      detailedRequirements: `
        **Yêu cầu chi tiết:**
        1. Chọn 1 sản phẩm công nghệ cụ thể
        2. Phân tích thị trường mục tiêu
        3. Xây dựng buyer persona
        4. Định vị thương hiệu và USP
        5. Lập kế hoạch truyền thông 6 tháng
        
        **Định dạng nộp bài:**
        - File Word hoặc PDF
        - Tối thiểu 2000 từ
        - Có biểu đồ minh họa
      `,
      dueDate: "2024-01-25",
      status: "in-progress",
      type: "project",
      maxScore: 150,
      submitted: false,
      timeRemaining: "10 ngày",
      progress: 60,
    },
    {
      id: 3,
      title: "Quiz: Nguyên lý Marketing cơ bản",
      description:
        "Bài kiểm tra trắc nghiệm về các khái niệm cơ bản trong marketing, 4P marketing mix và hành vi người tiêu dùng.",
      detailedRequirements: `
        **Yêu cầu tham gia:**
        1. Nghiên cứu trước 5 xu hướng Digital Marketing 2024
        2. Chuẩn bị 3 câu hỏi thảo luận
        3. Chia sẻ 1 case study thực tế
        4. Tương tác tích cực với bạn học
        
        **Thời gian:** 90 phút
        **Hình thức:** Online qua Zoom
      `,
      dueDate: "2024-01-15",
      status: "completed",
      type: "quiz",
      maxScore: 50,
      submitted: true,
      score: 45,
      timeRemaining: "Đã hoàn thành",
      progress: 85,
    },
    {
      id: 4,
      title: "Thảo luận nhóm: Xu hướng Digital Marketing 2024",
      description:
        "Tham gia thảo luận nhóm về các xu hướng marketing số mới nhất và tác động của chúng đến doanh nghiệp.",
      detailedRequirements: `
        **Yêu cầu tham gia:**
        1. Nghiên cứu trước 5 xu hướng Digital Marketing 2024
        2. Chuẩn bị 3 câu hỏi thảo luận
        3. Chia sẻ 1 case study thực tế
        4. Tương tác tích cực với bạn học
        
        **Thời gian:** 90 phút
        **Hình thức:** Online qua Zoom
      `,
      dueDate: "2024-01-30",
      status: "upcoming",
      type: "essay",
      maxScore: 75,
      submitted: false,
      timeRemaining: "15 ngày",
    },
  ]
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "destructive"
      case "in-progress":
        return "secondary"
      case "upcoming":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "upcoming":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Đã hoàn thành"
      case "pending":
        return "Chưa làm"
      case "in-progress":
        return "Đang làm"
      case "upcoming":
        return "Sắp tới"
      default:
        return "Chưa xác định"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bài tập áp dụng{courseId ? ` - Khóa học #${courseId}` : ''}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {assignments.length} bài tập
        </div>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Đang làm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Chưa làm</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Sắp tới</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                </div>
                <Badge variant={getStatusColor(assignment.status)} className="flex items-center gap-1">
                  {getStatusIcon(assignment.status)}
                  {getStatusText(assignment.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}
                  </div>
                  <div>Điểm tối đa: {assignment.maxScore}</div>
                  {assignment.score && (
                    <div className="text-green-600 font-medium">
                      Điểm đạt được: {assignment.score}/{assignment.maxScore}
                    </div>
                  )}
                </div>
                <div className="text-muted-foreground">{assignment.timeRemaining}</div>
              </div>

              {assignment.progress && assignment.type === "quiz" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ hoàn thành</span>
                    <span>{assignment.progress}%</span>
                  </div>
                  <Progress value={assignment.progress} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {assignment.status === "completed" ? (
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <CheckCircle className="h-4 w-4" />
                    Xem kết quả
                  </Button>
                ) : (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 bg-transparent"
                          onClick={() => setSelectedAssignment(assignment)}
                        >
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{assignment.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Mô tả:</h4>
                            <p className="text-sm text-muted-foreground">{assignment.description}</p>
                          </div>
                          {assignment.detailedRequirements && (
                            <div>
                              <h4 className="font-semibold mb-2">Yêu cầu chi tiết:</h4>
                              <div className="text-sm whitespace-pre-line bg-muted p-4 rounded-lg">
                                {assignment.detailedRequirements}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <div>Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}</div>
                            <div>Điểm tối đa: {assignment.maxScore}</div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Nộp bài
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}