import { useQuery } from "@tanstack/react-query";
import { assignmentAPI, courseAPI, progressAPI } from "@/service/api";
import { ApiResponse, CollectionResponse, CourseDTO, EnrollmentStatus, CourseStatus } from "@/types/course";
import { AxiosResponse } from "axios";

export interface EnhancedCourseData {
  id: string;
  code: string;
  name: string;
  instructor: string;
  thumbnail?: string;
  progress?: number;
  status: CourseStatus;
  enrollmentStatus: EnrollmentStatus;
  nextClass?: string;
  assignments?: number;
  pendingAssignments?: number;
  lastAccessed?: string;
  totalStudents?: number;
}

export function useEnrolledCourses(userId: string | undefined) {
  return useQuery({
    queryKey: ['enrolled-courses', userId],
    queryFn: async () => {
      try {
        // Lấy danh sách khóa học đã đăng ký
        const response: AxiosResponse<CollectionResponse<CourseDTO>> = await courseAPI.getEnrolledCourses();
        const courses: CourseDTO[] = response.data.data;
        
        if (!courses.length) {
          return [] as EnhancedCourseData[];
        }
        
        // Tối ưu: Sử dụng Promise.allSettled để đảm bảo không bị fail nếu một API lỗi
        const [assignmentsResults, progressResults] = await Promise.allSettled([
          Promise.all(courses.map(course => 
            assignmentAPI.getAssignmentsByCourse(course._id)
              .then(res => ({ courseId: course._id, count: res.data.data.length }))
              .catch(() => ({ courseId: course._id, count: 0 }))
          )),
          Promise.all(courses.map(course =>
            progressAPI.getCourseProgress(course._id)
              .then(res => ({ courseId: course._id, progress: res.data.data.overallProgress }))
              .catch(() => ({ courseId: course._id, progress: 0 }))
          ))
        ]);
        
        // Xử lý kết quả từ Promise.allSettled
        const assignmentsMap: Record<string, number> = {};
        if (assignmentsResults.status === 'fulfilled') {
          assignmentsResults.value.forEach(item => {
            assignmentsMap[item.courseId] = item.count;
          });
        }
        
        const progressMap: Record<string, number> = {};
        if (progressResults.status === 'fulfilled') {
          progressResults.value.forEach(item => {
            progressMap[item.courseId] = item.progress;
          });
        }
        
        // Transform API response to match the expected format
        return courses.map((course) => {
          // Xác định trạng thái đăng ký dựa trên dữ liệu từ API
          let enrollmentStatus: EnrollmentStatus = "enrolled";
          if (course.completed) enrollmentStatus = "completed";
          else if (progressMap[course._id] > 0 || course.progress) enrollmentStatus = "in-progress";
          
          return {
            id: course._id,
            code: course.code,
            name: course.name || course.title || "",
            instructor: course.instructor,
            status: (course.status || "published") as CourseStatus,
            enrollmentStatus,
            progress: progressMap[course._id] || course.progress || 0,
            nextClass: "Đang cập nhật", // Lấy từ API lịch học nếu có
            assignments: assignmentsMap[course._id] || 0,
            pendingAssignments: 0, // Sẽ cần API để lấy bài tập sắp đến hạn
            thumbnail: course.thumbnail,
            lastAccessed: course.lastAccessed,
            totalStudents: course.enrollmentCount
          } as EnhancedCourseData;
        });
      } catch (error) {
        console.error("Error fetching course data:", error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}