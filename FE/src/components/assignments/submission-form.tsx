"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Upload, File, Paperclip, AlertCircle, Save, Check, X, Loader2, FileText } from "lucide-react"
import type { Assignment } from "./assignment-card"

interface SubmissionFormProps {
  assignment: Assignment
  onSubmit: (files: File[] | null, text: string | null) => void
  onCancel: () => void
}

export function SubmissionForm({ assignment, onSubmit, onCancel }: SubmissionFormProps) {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file")
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState("")
  const [uploading, setUploading] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      
      // Validate file size (10MB limit per file)
      const invalidFiles = newFiles.filter(file => file.size > 10 * 1024 * 1024)
      if (invalidFiles.length > 0) {
        setValidationError(`File ${invalidFiles[0].name} vượt quá kích thước cho phép (10MB)`)
        return
      }
      
      // Validate file count (max 5 files)
      if (files.length + newFiles.length > 5) {
        setValidationError("Bạn chỉ được phép tải lên tối đa 5 file")
        return
      }
      
      setFiles([...files, ...newFiles])
      setValidationError(null)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    setFiles(newFiles)
  }

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (e.target.value.length > 0) {
      setValidationError(null)
    }
  }

  const handleSubmit = async () => {
    if (activeTab === "file" && files.length === 0) {
      setValidationError("Vui lòng chọn ít nhất một file để nộp")
      return
    }
    
    if (activeTab === "text" && text.trim() === "") {
      setValidationError("Vui lòng nhập nội dung bài làm")
      return
    }
    
    setValidationError(null)
    setUploading(true)
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // In a real application, we would upload the files here
    setTimeout(() => {
      setUploading(false)
      setUploadProgress(null)
      onSubmit(
        activeTab === "file" ? files : null,
        activeTab === "text" ? text : null
      )
    }, 1000)
  }

  const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Assignment Info */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base">{assignment.title}</h3>
            <div className="flex items-center gap-1 text-sm text-orange-600 font-medium">
              <Calendar className="h-4 w-4" />
              Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString("vi-VN")}
            </div>
          </div>
          <p className="text-sm text-gray-600">{assignment.description}</p>
        </CardContent>
      </Card>

      {/* Submission Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "text")} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Nộp file
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Nộp văn bản
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-4">
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
            />
            <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <div className="space-y-1">
              <p className="font-medium text-gray-800">Tải file lên</p>
              <p className="text-sm text-gray-500">
                Kéo thả hoặc click để chọn file
                <br />
                Định dạng: PDF, Word, Excel, PowerPoint, hình ảnh, ZIP (tối đa 10MB/file)
              </p>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Đã chọn {files.length} file:</p>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            * Bạn có thể tải lên tối đa 5 file, mỗi file không quá 10MB
          </div>
        </TabsContent>
        
        <TabsContent value="text" className="space-y-4">
          <div>
            <Label htmlFor="submission-text">Nội dung bài làm</Label>
            <Textarea 
              id="submission-text"
              value={text}
              onChange={handleTextChange}
              placeholder="Nhập nội dung bài làm của bạn tại đây..."
              className="min-h-[200px]"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500">
              Bạn có thể sử dụng định dạng Markdown cơ bản.
            </div>
            <div className="text-gray-500">{text.length} ký tự</div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4" />
          {validationError}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Đang tải lên...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={uploading} className="bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>
        <Button
          variant="outline"
          disabled={uploading}
          className="bg-transparent border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <Save className="h-4 w-4 mr-2" />
          Lưu nháp
        </Button>
        <Button onClick={handleSubmit} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Nộp bài
            </>
          )}
        </Button>
      </div>
    </div>
  )
}