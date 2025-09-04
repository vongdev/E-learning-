"use client"

import { useState } from "react"
import { CourseCard } from "./CourseCard"
import { Input } from "@/components/ui/input"
import { Search, BookOpen } from "lucide-react"

interface Course {
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

interface CourseListProps {
  courses: Course[]
  isLoading?: boolean
  isAdmin?: boolean
  onJoinCourse: (courseId: number) => void
}

export function CourseList({ courses, isLoading = false, isAdmin = false, onJoinCourse }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6 bg-white rounded-b-lg border border-gray-200">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isAdmin={isAdmin} 
                  onJoinCourse={onJoinCourse} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy khóa học</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Không có khóa học nào phù hợp với từ khóa tìm kiếm. Vui lòng thử lại với từ khóa khác.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}