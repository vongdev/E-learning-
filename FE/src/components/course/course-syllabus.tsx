"use client"

import { useState, useEffect } from 'react'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  File, 
  Film, 
  Lock, 
  PlayCircle 
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface Content {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'document' | 'quiz' | 'assignment';
  duration?: number;
  isLocked?: boolean;
  isFree?: boolean;
  fileName?: string;
  fileSize?: string;
  url?: string;
  order: number;
}

interface Section {
  _id: string;
  title: string;
  description?: string;
  order: number;
  contents: Content[];
  isExpanded?: boolean;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  sections: Section[];
  duration?: number;
}

interface CourseProgress {
  progress: number;
  sectionsProgress: Record<string, number>;
  contentsProgress: Record<string, number>;
  completedContents: string[];
}

interface CourseSyllabusProps {
  course: Course;
  progress: CourseProgress;
  updateProgress: (progress: CourseProgress) => void;
}

export default function CourseSyllabus({ 
  course, 
  progress, 
  updateProgress 
}: CourseSyllabusProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [currentContent, setCurrentContent] = useState<string | null>(null)
  const { toast } = useToast()

  // Mở section đầu tiên mặc định
  useEffect(() => {
    if (course?.sections?.length > 0) {
      setExpandedSections([course.sections[0]._id])
    }
  }, [course])

  // Xử lý khi click vào nội dung
  const handleContentClick = async (sectionId: string, contentId: string) => {
    try {
      setCurrentContent(contentId)
      setLoading(true)
      
      // Gọi API để cập nhật tiến độ
      const response = await fetch(`/api/courses/${course._id}/contents/${contentId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: 50 }) // Đánh dấu đã xem 50% nội dung
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể cập nhật tiến độ')
      }
      
      updateProgress(data.data)
      
      toast({
        title: "Tiến độ đã được cập nhật",
        description: "Bạn đã bắt đầu học nội dung này",
      })
      
      // TODO: Điều hướng đến trang nội dung chi tiết
      // router.push(`/course/${course._id}/content/${contentId}`)
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể cập nhật tiến độ. Vui lòng thử lại sau.",
        variant: "destructive"
      })
      console.error('Error updating progress:', error)
    } finally {
      setLoading(false)
    }
  }

  // Đánh dấu hoàn thành nội dung
  const markAsComplete = async (e: React.MouseEvent, sectionId: string, contentId: string) => {
    e.stopPropagation() // Ngăn không cho click vào content
    
    try {
      setLoading(true)
      
      // Gọi API để đánh dấu hoàn thành
      const response = await fetch(`/api/courses/${course._id}/contents/${contentId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể đánh dấu hoàn thành')
      }
      
      updateProgress(data.data)
      
      toast({
        title: "Nội dung đã hoàn thành",
        description: "Tiến độ của bạn đã được cập nhật",
      })
    } catch (error) {
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể đánh dấu hoàn thành. Vui lòng thử lại sau.",
        variant: "destructive"
      })
      console.error('Error marking as complete:', error)
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra nội dung đã hoàn thành chưa
  const isContentCompleted = (contentId: string) => {
    if (!progress || !progress.completedContents) return false
    return progress.completedContents.includes(contentId)
  }

  // Lấy tiến độ của nội dung
  const getContentProgress = (contentId: string) => {
    if (!progress || !progress.contentsProgress) return 0
    return progress.contentsProgress[contentId] || 0
  }

  // Hiển thị icon dựa trên loại nội dung
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Film className="h-4 w-4 text-blue-500" />
      case 'document':
        return <File className="h-4 w-4 text-green-500" />
      case 'quiz':
        return <BookOpen className="h-4 w-4 text-purple-500" />
      case 'assignment':
        return <File className="h-4 w-4 text-orange-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  if (!course || !course.sections || course.sections.length === 0) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-medium">Khóa học này chưa có nội dung</h3>
        <p className="text-gray-500 mt-2">Vui lòng liên hệ giảng viên để biết thêm chi tiết.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Nội dung khóa học</h2>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            Thời lượng: {course.duration || 'Chưa xác định'} 
          </span>
        </div>
      </div>
      
      <Accordion
        type="multiple"
        value={expandedSections}
        onValueChange={setExpandedSections}
        className="w-full"
      >
        {course.sections.map((section: Section, index: number) => {
          // Tính toán tiến độ của section
          const sectionProgress = progress?.sectionsProgress?.[section._id] || 0
          
          return (
            <AccordionItem key={section._id} value={section._id} className="border rounded-md mb-4">
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full text-left">
                  <div>
                    <span className="font-medium">
                      {index + 1}. {section.title}
                    </span>
                    {section.description && (
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-500">
                        {section.contents?.length || 0} nội dung
                      </span>
                    </div>
                    <div className="w-24">
                      <Progress value={sectionProgress} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-500">
                      {sectionProgress}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-0">
                <div className="space-y-1 pb-2">
                  {section.contents?.map((content: Content, contentIndex: number) => {
                    const isCompleted = isContentCompleted(content._id)
                    const contentProgress = getContentProgress(content._id)
                    
                    return (
                      <div 
                        key={content._id}
                        onClick={() => handleContentClick(section._id, content._id)}
                        className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 cursor-pointer ${
                          content.isLocked ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {content.isLocked ? (
                              <Lock className="h-4 w-4 text-gray-400" />
                            ) : isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              getContentIcon(content.type)
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {contentIndex + 1}. {content.title}
                              </span>
                              
                              {content.isLocked && (
                                <Badge variant="outline" className="text-xs">Khóa</Badge>
                              )}
                              
                              {content.isFree && (
                                <Badge className="bg-green-500 text-xs">Miễn phí</Badge>
                              )}
                            </div>
                            
                            {content.description && (
                              <p className="text-sm text-gray-500 mt-1">{content.description}</p>
                            )}
                            
                            {contentProgress > 0 && contentProgress < 100 && (
                              <div className="mt-2 w-full max-w-xs">
                                <Progress value={contentProgress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {content.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {content.duration} phút
                              </span>
                            </div>
                          )}
                          
                          {!content.isLocked && !isCompleted && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => markAsComplete(e, section._id, content._id)}
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Đánh dấu hoàn thành</span>
                            </Button>
                          )}
                          
                          {!content.isLocked && (
                            <Button size="icon" variant="ghost" disabled={loading}>
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}