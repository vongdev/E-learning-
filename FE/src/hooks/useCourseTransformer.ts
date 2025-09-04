// src/hooks/useCourseTransformer.ts
import { CourseDTO, CourseStatus, EnrollmentStatus } from "@/types/course";

export function useCourseTransformer() {
  const transformCourseData = (course: CourseDTO) => ({
    id: course._id,
    code: course.code,
    name: course.name || course.title || "",
    instructor: course.instructor,
    status: (course.status || "published") as CourseStatus,
    enrollmentStatus: determineEnrollmentStatus(course),
    progress: course.progress || 0,
    nextClass: "Đang cập nhật", // Lấy từ API nếu có
    assignments: 0, // Sẽ được cập nhật từ API
    pendingAssignments: 0, // Sẽ được cập nhật từ API
    thumbnail: course.thumbnail || ""
  });

  const determineEnrollmentStatus = (course: CourseDTO): EnrollmentStatus => {
    if (course.completed) return "completed";
    if (course.progress && course.progress > 0) return "in-progress";
    return "enrolled";
  };

  return { transformCourseData };
}