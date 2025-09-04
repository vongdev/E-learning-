"use client"

import { useState, useRef } from 'react'
import { 
  Upload, 
  File, 
  FileText, 
  Paperclip, 
  X, 
  Clock, 
  Loader2, 
  CheckCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface AssignmentDetails {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  courseId: string;
}

interface AssignmentSubmissionProps {
  assignment: AssignmentDetails;
  onSubmitSuccess?: () => void;
}

export default function AssignmentSubmission({ 
  assignment, 
  onSubmitSuccess 
}: AssignmentSubmissionProps) {
  const [submissionText, setSubmissionText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    
    if (!selectedFiles || selectedFiles.length === 0) return
    
    // Chuyển FileList thành mảng và thêm vào state
    const newFiles = Array.from(selectedFiles)
    setFiles(prev => [...prev, ...newFiles])
    
    // Reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'zip':
      case 'rar':
        return <File className="h-5 w-5 text-purple-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="h-5 w-5 text-pink-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async () => {
    // Kiểm tra hợp lệ
    if (!submissionText.trim() && files.length === 0) {
      toast({
        title: "Không thể nộp bài",
        description: "Vui lòng viết nội dung hoặc đính kèm tệp trước khi nộp bài.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('submissionText', submissionText)
      formData.append('assignmentId', assignment.id)
      formData.append('courseId', assignment.courseId)
      
      files.forEach(file => {
        formData.append('files', file)
      })
      
      // Gọi API để nộp bài
      const response = await fetch(`/api/assignments/${assignment.id}/submissions`, {
        method: 'POST',
        body: formData,
        // Headers không cần 'Content-Type', trình duyệt sẽ tự đặt khi dùng FormData
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nộp bài thất bại');
      }
      
      setSubmitted(true)
      
      toast({
        title: "Nộp bài thành công",
        description: "Bài làm của bạn đã được nộp.",
      })
      
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      console.error('Error submitting assignment:', error)
      toast({
        title: "Lỗi khi nộp bài",
        description: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  // Kiểm tra đã quá hạn nộp bài chưa
  const isDueDatePassed = new Date(assignment.dueDate) < new Date()

  if (submitted) {
    return (
      <Card className="w-full border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            Bài làm đã được nộp thành công
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">
            Bài làm của bạn đã được nộp thành công và đang chờ giảng viên chấm điểm.
          </p>
          <div className="mt-4 space-y-3">
            <h3 className="font-medium">Thông tin nộp bài:</h3>
            <div className="text-sm space-y-2">
              <div><span className="font-medium">Ngày nộp:</span> {format(new Date(), 'HH:mm - dd/MM/yyyy', { locale: vi })}</div>
              <div><span className="font-medium">Trạng thái:</span> Đã nộp</div>
              <div><span className="font-medium">Số tệp đính kèm:</span> {files.length}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Nộp bài: {assignment.title}</CardTitle>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <Clock className="h-4 w-4 mr-2" />
          <span>Hạn nộp: {format(new Date(assignment.dueDate), 'HH:mm - dd/MM/yyyy', { locale: vi })}</span>
          {isDueDatePassed && <span className="ml-2 text-red-500 font-medium">(Đã quá hạn)</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-2">Mô tả bài tập</h3>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{assignment.description}</p>
        </div>

        <div>
          <h3 className="font-medium mb-2">Nội dung bài làm</h3>
          <Textarea
            placeholder="Nhập nội dung bài làm của bạn tại đây..."
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            className="min-h-[150px]"
            disabled={uploading}
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Tệp đính kèm</h3>
          <div className="border border-dashed rounded-lg p-4 text-center">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-transparent"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Chọn tệp
            </Button>
            <p className="text-xs text-gray-500 mt-2">Bạn có thể đính kèm nhiều tệp.</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Các tệp đã chọn:</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file.name)}
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmit} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang nộp bài...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Nộp bài
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}