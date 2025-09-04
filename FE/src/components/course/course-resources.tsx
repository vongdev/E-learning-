"use client"

import { useState, useEffect } from 'react'
import { 
  File, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  FileArchive, 
  Link, 
  ExternalLink, 
  Loader2, 
  AlertCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

interface Resource {
  id: string;
  name: string;
  description?: string;
  type: string;
  size?: string;
  url: string;
  section?: string;
}

interface CourseResourcesProps {
  courseId: string;
}

export default function CourseResources({ courseId }: CourseResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchResources = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch resources from API
        const response = await fetch(`/api/courses/${courseId}/resources`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Không thể tải tài liệu')
        }
        
        setResources(data.data)
      } catch (error) {
        console.error('Error fetching resources:', error)
        setError('Không thể tải tài liệu. Vui lòng thử lại sau.')
        
        // Fallback to demo data if API fails
        setResources([
          {
            id: '1',
            name: 'Tài liệu bài giảng tuần 1',
            description: 'Tài liệu tổng hợp các kiến thức cơ bản trong tuần 1',
            type: 'pdf',
            size: '2.5 MB',
            url: '#',
            section: 'Tuần 1'
          },
          {
            id: '2',
            name: 'Ví dụ thực hành',
            description: 'Các ví dụ thực hành để sinh viên làm theo',
            type: 'ppt',
            size: '5.8 MB',
            url: '#',
            section: 'Tuần 1'
          },
          {
            id: '3',
            name: 'Video hướng dẫn cài đặt môi trường',
            description: 'Hướng dẫn chi tiết cách cài đặt và cấu hình các công cụ cần thiết',
            type: 'video',
            size: '45 MB',
            url: '#',
            section: 'Tài liệu chuẩn bị'
          },
          {
            id: '4',
            name: 'Tài liệu tham khảo',
            description: 'Danh sách tài liệu tham khảo cho khóa học',
            type: 'link',
            url: 'https://example.com/references',
            section: 'Tài liệu tham khảo'
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [courseId])

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-10 w-10 text-blue-500" />
      case 'ppt':
      case 'pptx':
        return <FileText className="h-10 w-10 text-orange-500" />
      case 'xls':
      case 'xlsx':
        return <FileText className="h-10 w-10 text-green-500" />
      case 'image':
      case 'jpg':
      case 'png':
        return <ImageIcon className="h-10 w-10 text-purple-500" />
      case 'video':
      case 'mp4':
        return <Video className="h-10 w-10 text-blue-500" />
      case 'zip':
      case 'rar':
        return <FileArchive className="h-10 w-10 text-gray-500" />
      case 'link':
        return <Link className="h-10 w-10 text-teal-500" />
      default:
        return <File className="h-10 w-10 text-gray-500" />
    }
  }

  const handleDownload = async (resource: Resource) => {
    try {
      if (resource.type === 'link') {
        window.open(resource.url, '_blank');
        return;
      }
      
      // For actual files, initiate download
      const response = await fetch(resource.url);
      if (!response.ok) throw new Error('Tải file thất bại');
      
      // Create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = resource.name;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Tải xuống thành công",
        description: `File ${resource.name} đã được tải xuống`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Lỗi tải xuống",
        description: "Không thể tải file. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  }

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank')
  }

  // Nhóm tài liệu theo section
  const groupedResources = resources.reduce((acc, resource) => {
    const section = resource.section || 'Tài liệu khác'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  if (loading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-500">Đang tải danh sách tài liệu...</p>
        </div>
      </div>
    )
  }

  if (error && resources.length === 0) {
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

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có tài liệu</h3>
        <p className="text-gray-500 mb-4">
          Khóa học này chưa có tài liệu nào được chia sẻ.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tài liệu khóa học</h2>
      </div>
      
      {/* Hiển thị tài liệu theo nhóm */}
      {Object.entries(groupedResources).map(([section, sectionResources]) => (
        <div key={section} className="space-y-4">
          <h3 className="text-lg font-medium">{section}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sectionResources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{resource.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{resource.description}</p>
                      {resource.size && (
                        <p className="text-xs text-gray-500 mt-2">Kích thước: {resource.size}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {resource.type === 'link' ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleOpenExternal(resource.url)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Mở liên kết
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}