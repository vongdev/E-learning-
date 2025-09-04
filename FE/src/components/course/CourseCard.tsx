"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowRight, BookOpen, User, Calendar, Clock, 
  Flame, Bookmark, CheckCircle, Lock, Eye
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { CourseStatus, EnrollmentStatus } from "@/types/course"

// Interface cho props của component
export interface CourseCardProps {
  course: {
    id: string;
    code: string;
    name: string;
    instructor: string;
    thumbnail?: string;
    progress?: number;
    status: CourseStatus;                 // Trạng thái quản lý
    enrollmentStatus?: EnrollmentStatus;  // Trạng thái đăng ký
    nextClass?: string;
    assignments?: number;
    pendingAssignments?: number;
    lastAccessed?: string;
    totalStudents?: number;
  }
  isAdmin?: boolean;
  onJoinCourse: (courseId: string) => void;
  onBookmark?: (courseId: string) => void;
}

export function CourseCard({ 
  course, 
  isAdmin = false, 
  onJoinCourse,
  onBookmark 
}: CourseCardProps) {
  const [imageError, setImageError] = useState(false);

  // Xử lý khi image load lỗi
  const handleImageError = () => {
    setImageError(true);
  };

  // Helper để lấy badge phù hợp với trạng thái đăng ký
  const getEnrollmentBadge = () => {
    if (!course.enrollmentStatus) return null;

    switch (course.enrollmentStatus) {
      case "in-progress":
        return (
          <Badge variant="secondary" className="bg-green-500 text-white">
            <Flame className="h-3 w-3 mr-1" />
            Đang học
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-emerald-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã hoàn thành
          </Badge>
        );
      case "enrolled":
        return (
          <Badge variant="secondary" className="bg-blue-500 text-white">
            <Calendar className="h-3 w-3 mr-1" />
            Đã đăng ký
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="secondary" className="bg-amber-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Đã hết hạn
          </Badge>
        );
      default:
        return null;
    }
  };

  // Helper để lấy badge phù hợp với trạng thái khóa học
  const getStatusBadge = () => {
    if (isAdmin) {
      switch (course.status) {
        case "draft":
          return (
            <Badge variant="secondary" className="bg-amber-500 text-white">
              <BookOpen className="h-3 w-3 mr-1" />
              Bản nháp
            </Badge>
          );
        case "private":
          return (
            <Badge variant="secondary" className="bg-gray-600 text-white">
              <Lock className="h-3 w-3 mr-1" />
              Riêng tư
            </Badge>
          );
        case "archived":
          return (
            <Badge variant="secondary" className="bg-gray-500 text-white">
              <BookOpen className="h-3 w-3 mr-1" />
              Đã lưu trữ
            </Badge>
          );
        case "published":
          return (
            <Badge variant="secondary" className="bg-green-600 text-white">
              <Eye className="h-3 w-3 mr-1" />
              Đã xuất bản
            </Badge>
          );
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-md">
      <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
        {course.thumbnail && !imageError ? (
          <Image
            src={course.thumbnail}
            alt={`Thumbnail của khóa học: ${course.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            className="opacity-90 hover:opacity-100 transition-opacity object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/80 text-blue-800 font-bold backdrop-blur-sm">
            {course.code}
          </Badge>
        </div>
        
        {/* Hiển thị badge trạng thái */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {getEnrollmentBadge()}
          {getStatusBadge()}
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{course.name}</h3>
          <p className="text-sm text-gray-600 flex items-center">
            <User className="h-3.5 w-3.5 mr-1" />
            {course.instructor}
            {course.totalStudents && (
              <span className="ml-auto text-xs text-gray-500">
                {course.totalStudents} học viên
              </span>
            )}
          </p>
        </div>

        {course.enrollmentStatus === "in-progress" && course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tiến độ học tập</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
                role="progressbar" 
                aria-valuenow={course.progress} 
                aria-valuemin={0} 
                aria-valuemax={100}
              ></div>
            </div>
            {course.lastAccessed && (
              <p className="text-xs text-gray-500 mt-1">
                Truy cập gần nhất: {course.lastAccessed}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {course.enrollmentStatus === "in-progress" && course.pendingAssignments && course.pendingAssignments > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Clock className="h-3 w-3 mr-1" />
              {course.pendingAssignments} bài tập đến hạn
            </Badge>
          )}
          {course.enrollmentStatus === "in-progress" && course.nextClass && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Calendar className="h-3 w-3 mr-1" />
              Buổi kế: {course.nextClass}
            </Badge>
          )}
          {isAdmin && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Quản lý
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onJoinCourse(course.id)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {course.enrollmentStatus === "not-enrolled" || !course.enrollmentStatus ? (
              <>
                <Bookmark className="h-4 w-4 mr-2" />
                Xem thông tin
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Vào học
              </>
            )}
          </Button>
          
          {onBookmark && (
            <Button 
              onClick={() => onBookmark(course.id)}
              variant="outline"
              className="px-3"
              aria-label="Đánh dấu khóa học"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}