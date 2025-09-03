"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, BookOpen, User, Calendar, Clock, Flame, Bookmark, CheckCircle } from "lucide-react"
import Image from "next/image"

interface CourseCardProps {
  course: {
    id: number
    code: string
    name: string
    instructor: string
    thumbnail?: string
    progress?: number
    status: "in-progress" | "upcoming" | "completed"
    nextClass?: string
    assignments?: number
    pendingAssignments?: number
  }
  isAdmin?: boolean
  onJoinCourse: (courseId: number) => void
}

export function CourseCard({ course, isAdmin = false, onJoinCourse }: CourseCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-md">
      <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.name}
            layout="fill"
            objectFit="cover"
            className="opacity-90 hover:opacity-100 transition-opacity"
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
        {course.status === "in-progress" && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-green-500 text-white">
              <Flame className="h-3 w-3 mr-1" />
              Đang học
            </Badge>
          </div>
        )}
        {course.status === "upcoming" && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="bg-blue-500 text-white">
              <Calendar className="h-3 w-3 mr-1" />
              Sắp diễn ra
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{course.name}</h3>
          <p className="text-sm text-gray-600 flex items-center">
            <User className="h-3.5 w-3.5 mr-1" />
            {course.instructor}
          </p>
        </div>

        {course.status === "in-progress" && course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tiến độ học tập</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {course.status === "in-progress" && course.pendingAssignments && course.pendingAssignments > 0 && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Clock className="h-3 w-3 mr-1" />
              {course.pendingAssignments} bài tập đến hạn
            </Badge>
          )}
          {course.status === "in-progress" && course.nextClass && (
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

        <Button 
          onClick={() => onJoinCourse(course.id)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          {course.status === "upcoming" ? (
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
      </CardContent>
    </Card>
  );
}