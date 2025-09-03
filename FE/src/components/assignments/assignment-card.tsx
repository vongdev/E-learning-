"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SubmissionForm } from "@/components/assignments/submission-form"
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  BarChart3,
  Calendar,
  Award,
  FileUp
} from "lucide-react"

export interface AssignmentStatus {
  type: "completed" | "pending" | "in-progress" | "upcoming"
  label: string
}

export interface Assignment {
  id: number
  title: string
  description: string
  detailedRequirements?: string
  dueDate: string
  status: "completed" | "pending" | "in-progress" | "upcoming"
  type: "essay" | "quiz" | "project" | "presentation" | "discussion"
  maxScore: number
  submitted?: boolean
  score?: number
  timeRemaining: string
  progress?: number
  course?: string
  attachments?: Array<{
    name: string
    size: string
    type: string
  }>
  feedbacks?: Array<{
    author: string
    date: string
    comment: string
  }>
}

interface AssignmentCardProps {
  assignment: Assignment
  showDetailed?: boolean
  onSubmit?: (assignmentId: number) => void
}

export function AssignmentCard({ assignment, showDetailed = false, onSubmit }: AssignmentCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)

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

  const getTypeText = (type: string) => {
    switch (type) {
      case "essay":
        return "Bài luận"
      case "quiz":
        return "Trắc nghiệm"
      case "project":
        return "Dự án"
      case "presentation":
        return "Thuyết trình"
      case "discussion":
        return "Thảo luận"
      default:
        return "Bài tập"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "essay":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "quiz":
        return <Award className="h-4 w-4 text-green-500" />
      case "project":
        return <BarChart3 className="h-4 w-4 text-purple-500" />
      case "presentation":
        return <Eye className="h-4 w-4 text-orange-500" />
      case "discussion":
        return <Clock className="h-4 w-4 text-cyan-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const handleSubmit = () => {
    setShowSubmissionForm(true)
  }

  const handleSubmissionComplete = (files: File[] | null, text: string | null) => {
    if (onSubmit) {
      onSubmit(assignment.id)
    }
    setShowSubmissionForm(false)
    // In a real application, we would send this data to the server
    console.log("Submitted files:", files)
    console.log("Submitted text:", text)
  }

  return (
    <>
      <Card className={`transition-all duration-300 hover:shadow-md border ${
        assignment.status === "completed" 
          ? "border-l-4 border-l-green-500" 
          : assignment.status === "pending" 
            ? "border-l-4 border-l-red-500" 
            : assignment.status === "in-progress" 
              ? "border-l-4 border-l-blue-500" 
              : "border-l-4 border-l-gray-300"
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {getTypeIcon(assignment.type)}
                <Badge variant="outline" className="bg-gray-100 border-none">
                  {getTypeText(assignment.type)}
                </Badge>
              </div>
              <CardTitle className="text-lg">{assignment.title}</CardTitle>
              {!showDetailed && (
                <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
              )}
            </div>
            <Badge variant={getStatusColor(assignment.status)} className="flex items-center gap-1">
              {getStatusIcon(assignment.status)}
              {getStatusText(assignment.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetailed && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{assignment.description}</p>
              {assignment.course && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  Khóa học: {assignment.course}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Award className="h-4 w-4" />
                Điểm tối đa: {assignment.maxScore}
              </div>
              {assignment.score !== undefined && (
                <div className="text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Điểm đạt được: {assignment.score}/{assignment.maxScore}
                </div>
              )}
            </div>
            <div className="text-orange-600 font-medium flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {assignment.timeRemaining}
            </div>
          </div>

          {assignment.progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Tiến độ hoàn thành</span>
                <span className="font-medium">{assignment.progress}%</span>
              </div>
              <Progress value={assignment.progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            {assignment.status === "completed" ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                    <CheckCircle className="h-4 w-4" />
                    Xem kết quả
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Kết quả bài tập: {assignment.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <div className="text-4xl font-bold text-green-600">{assignment.score}/{assignment.maxScore}</div>
                      <div className="text-sm text-green-700 mt-2">Điểm đạt được</div>
                    </div>
                    
                    {assignment.feedbacks && assignment.feedbacks.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Nhận xét của giảng viên:</h3>
                        {assignment.feedbacks.map((feedback, index) => (
                          <div key={index} className="bg-gray-50 border rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium">{feedback.author}</div>
                              <div className="text-xs text-gray-500">{feedback.date}</div>
                            </div>
                            <p className="text-gray-700">{feedback.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                      onClick={() => setShowDetails(true)}
                    >
                      <Eye className="h-4 w-4" />
                      Xem chi tiết
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon(assignment.type)}
                        {assignment.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Mô tả:</h4>
                        <p className="text-gray-700">{assignment.description}</p>
                      </div>
                      {assignment.detailedRequirements && (
                        <div>
                          <h4 className="font-semibold mb-2">Yêu cầu chi tiết:</h4>
                          <div className="text-sm whitespace-pre-line bg-muted p-4 rounded-lg">
                            {assignment.detailedRequirements}
                          </div>
                        </div>
                      )}
                      
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Tài liệu đính kèm:</h4>
                          <div className="space-y-2">
                            {assignment.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border text-sm">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <span>{file.name}</span>
                                </div>
                                <div className="text-gray-500">{file.size}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span>Điểm tối đa: {assignment.maxScore}</span>
                        </div>
                      </div>
                      
                      <Button onClick={handleSubmit} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Nộp bài ngay
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button className="flex items-center gap-2" onClick={handleSubmit}>
                  <FileUp className="h-4 w-4" />
                  Nộp bài
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nộp bài tập: {assignment.title}</DialogTitle>
          </DialogHeader>
          <SubmissionForm 
            assignment={assignment} 
            onCancel={() => setShowSubmissionForm(false)}
            onSubmit={handleSubmissionComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}