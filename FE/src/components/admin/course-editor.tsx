"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  BookOpen, Save, X, Upload, FileText, Video, Plus, Edit, Trash2, Eye, 
  RotateCw, Clock, CheckCircle2, Info, Globe, Users, Calendar, GraduationCap,
  ClipboardList, Trophy, AlertTriangle
} from "lucide-react"

interface Lecture {
  id: string
  title: string
  description: string
  type: "video" | "document" | "quiz"
  duration?: number // in minutes, for videos
  fileName?: string
  fileSize?: string
  url?: string
  thumbnail?: string
  order: number
  status: "draft" | "published" | "archived"
  createdAt: Date
  updatedAt: Date
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  points: number
  status: "draft" | "published" | "archived"
}

interface CourseSection {
  id: string
  title: string
  description?: string
  lectures: Lecture[]
  order: number
  isExpanded?: boolean
}

interface Course {
  id: string
  title: string
  code: string
  description: string
  thumbnail: string
  instructor: string
  startDate: Date
  endDate: Date
  enrolledStudents: number
  maxStudents: number
  status: "draft" | "published" | "archived"
  sections: CourseSection[]
  assignments: Assignment[]
}

export function CourseEditor({ courseId }: { courseId?: string }) {
  // Mock data for example course
  const [course, setCourse] = useState<Course>({
    id: courseId || "course-123",
    title: "Nguyên lý Marketing",
    code: "MKT301",
    description: "Khóa học giúp sinh viên hiểu về các nguyên lý cơ bản trong marketing, từ nghiên cứu thị trường đến phát triển chiến lược marketing toàn diện. Sinh viên sẽ học cách phân tích hành vi người tiêu dùng, phân khúc thị trường, và áp dụng mô hình 4P của marketing mix.",
    thumbnail: "/course-marketing.jpg",
    instructor: "TS. Nguyễn Văn Minh",
    startDate: new Date(2023, 8, 1), // September 1, 2023
    endDate: new Date(2024, 0, 15), // January 15, 2024
    enrolledStudents: 45,
    maxStudents: 60,
    status: "published",
    sections: [
      {
        id: "section-1",
        title: "Giới thiệu về Marketing",
        description: "Tổng quan về ngành Marketing và lịch sử phát triển",
        order: 1,
        isExpanded: true,
        lectures: [
          {
            id: "lecture-1",
            title: "Bài 1: Giới thiệu về Marketing",
            description: "Tổng quan về ngành Marketing và lịch sử phát triển",
            type: "video",
            duration: 45,
            fileName: "marketing-intro.mp4",
            fileSize: "256 MB",
            url: "/videos/marketing-intro.mp4",
            thumbnail: "/thumbnails/marketing-intro.jpg",
            order: 1,
            status: "published",
            createdAt: new Date(2023, 7, 15),
            updatedAt: new Date(2023, 7, 25)
          },
          {
            id: "lecture-2",
            title: "Tài liệu: Lịch sử Marketing",
            description: "Tài liệu tham khảo về lịch sử phát triển ngành Marketing",
            type: "document",
            fileName: "marketing-history.pdf",
            fileSize: "2.3 MB",
            url: "/documents/marketing-history.pdf",
            order: 2,
            status: "published",
            createdAt: new Date(2023, 7, 15),
            updatedAt: new Date(2023, 7, 15)
          },
          {
            id: "lecture-3",
            title: "Quiz: Kiểm tra kiến thức cơ bản",
            description: "Bài kiểm tra nhanh các kiến thức cơ bản về Marketing",
            type: "quiz",
            order: 3,
            status: "published",
            createdAt: new Date(2023, 7, 16),
            updatedAt: new Date(2023, 7, 16)
          }
        ]
      },
      {
        id: "section-2",
        title: "Nghiên cứu thị trường",
        description: "Phương pháp nghiên cứu và phân tích thị trường",
        order: 2,
        isExpanded: false,
        lectures: [
          {
            id: "lecture-4",
            title: "Bài 2: Nghiên cứu thị trường",
            description: "Các phương pháp nghiên cứu thị trường hiện đại",
            type: "video",
            duration: 55,
            fileName: "market-research.mp4",
            fileSize: "320 MB",
            url: "/videos/market-research.mp4",
            thumbnail: "/thumbnails/market-research.jpg",
            order: 1,
            status: "published",
            createdAt: new Date(2023, 8, 1),
            updatedAt: new Date(2023, 8, 1)
          },
          {
            id: "lecture-5",
            title: "Tài liệu: Bảng khảo sát mẫu",
            description: "Các mẫu bảng khảo sát nghiên cứu thị trường",
            type: "document",
            fileName: "survey-templates.pdf",
            fileSize: "1.5 MB",
            url: "/documents/survey-templates.pdf",
            order: 2,
            status: "published",
            createdAt: new Date(2023, 8, 1),
            updatedAt: new Date(2023, 8, 1)
          }
        ]
      },
      {
        id: "section-3",
        title: "Marketing Mix - 4P",
        description: "Chiến lược 4P trong Marketing Mix",
        order: 3,
        isExpanded: false,
        lectures: [
          {
            id: "lecture-6",
            title: "Bài 3: Marketing Mix - 4P",
            description: "Giới thiệu về mô hình 4P trong Marketing Mix",
            type: "video",
            duration: 50,
            fileName: "4p-marketing.mp4",
            fileSize: "280 MB",
            url: "/videos/4p-marketing.mp4",
            thumbnail: "/thumbnails/4p-marketing.jpg",
            order: 1,
            status: "draft",
            createdAt: new Date(2023, 8, 15),
            updatedAt: new Date(2023, 8, 15)
          }
        ]
      }
    ],
    assignments: [
      {
        id: "assignment-1",
        title: "Case Study: Phân tích chiến lược marketing của Vinamilk",
        description: "Phân tích chiến lược marketing của thương hiệu Vinamilk trong 5 năm gần đây. Đánh giá hiệu quả và đưa ra đề xuất cải thiện.",
        dueDate: new Date(2024, 0, 20),
        points: 100,
        status: "published"
      },
      {
        id: "assignment-2",
        title: "Bài tập: Xây dựng kế hoạch marketing cho sản phẩm mới",
        description: "Tạo một kế hoạch marketing hoàn chỉnh cho một sản phẩm công nghệ mới, bao gồm phân tích thị trường, định vị thương hiệu và chiến lược truyền thông.",
        dueDate: new Date(2024, 0, 25),
        points: 150,
        status: "published"
      }
    ]
  })

  // State for UI controls
  const [editMode, setEditMode] = useState<'basic' | 'content' | 'assignments' | null>(null)
  const [showAddSectionDialog, setShowAddSectionDialog] = useState(false)
  const [showAddLectureDialog, setShowAddLectureDialog] = useState(false)
  const [showAddAssignmentDialog, setShowAddAssignmentDialog] = useState(false)
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null)
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null)
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    action: () => {}
  })
  const [uploadState, setUploadState] = useState<{
    file: File | null;
    progress: number;
    error: string | null;
  }>({
    file: null,
    progress: 0,
    error: null
  })
  
  // Form states
  const [courseForm, setCourseForm] = useState({ ...course })
  const [newSection, setNewSection] = useState({ title: "", description: "" })
  const [newLecture, setNewLecture] = useState<Partial<Lecture>>({
    title: "",
    description: "",
    type: "video"
  })
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    dueDate: new Date(),
    points: 100,
    status: "draft"
  })
  const [formErrors, setFormErrors] = useState<{
    courseForm: Record<string, string>;
    newSection: Record<string, string>;
    newLecture: Record<string, string>;
    newAssignment: Record<string, string>;
  }>({
    courseForm: {},
    newSection: {},
    newLecture: {},
    newAssignment: {}
  })

  // Helper functions
  const findSectionById = useCallback((id: string): CourseSection | undefined => {
    return course.sections.find(section => section.id === id);
  }, [course.sections]);

  const findLectureById = useCallback((id: string): {lecture: Lecture, sectionId: string} | undefined => {
    for (const section of course.sections) {
      const lecture = section.lectures.find(lecture => lecture.id === id);
      if (lecture) return { lecture, sectionId: section.id };
    }
    return undefined;
  }, [course.sections]);

  const validateField = (value: string, fieldName: string, minLength = 3): string => {
    if (!value.trim()) return `${fieldName} không được để trống`;
    if (value.trim().length < minLength) return `${fieldName} phải có ít nhất ${minLength} ký tự`;
    return '';
  };

  // Toggle section expand/collapse
  const toggleSection = (sectionId: string) => {
    setCourse(prevCourse => ({
      ...prevCourse,
      sections: prevCourse.sections.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    }));
  }

  // Create a new section
  const handleAddSection = () => {
    try {
      // Validate form
      const titleError = validateField(newSection.title, 'Tên phần học');
      if (titleError) {
        setFormErrors(prev => ({
          ...prev,
          newSection: { ...prev.newSection, title: titleError }
        }));
        return;
      }

      const newSectionObj: CourseSection = {
        id: `section-${Date.now()}`,
        title: newSection.title.trim(),
        description: newSection.description ? newSection.description.trim() : undefined,
        order: course.sections.length + 1,
        lectures: [],
        isExpanded: true
      }

      setCourse(prevCourse => ({
        ...prevCourse,
        sections: [...prevCourse.sections, newSectionObj]
      }));

      setNewSection({ title: "", description: "" });
      setFormErrors(prev => ({ ...prev, newSection: {} }));
      setShowAddSectionDialog(false);
    } catch (error) {
      console.error("Error adding section:", error);
    }
  }
  
  // Create a new lecture
  const handleAddLecture = () => {
    try {
      // Validate form
      const errors: Record<string, string> = {};
      if (!newLecture.title?.trim()) errors.title = 'Tên bài giảng không được để trống';
      if (!currentSectionId) errors.general = 'Không tìm thấy phần học';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(prev => ({
          ...prev,
          newLecture: errors
        }));
        return;
      }

      const section = findSectionById(currentSectionId!);
      if (!section) return;

      const order = section.lectures.length + 1;
      const now = new Date();

      const newLectureObj: Lecture = {
        id: `lecture-${Date.now()}`,
        title: newLecture.title!.trim(),
        description: newLecture.description?.trim() || "",
        type: newLecture.type as "video" | "document" | "quiz",
        order,
        status: "draft",
        createdAt: now,
        updatedAt: now
      };
      
      // Add specific fields based on type
      if (newLecture.type === "video") {
        newLectureObj.duration = newLecture.duration || 0;
        newLectureObj.fileName = newLecture.fileName || `video-${Date.now()}.mp4`;
        newLectureObj.fileSize = newLecture.fileSize || "0 MB";
        newLectureObj.url = newLecture.url || "";
      } else if (newLecture.type === "document") {
        newLectureObj.fileName = newLecture.fileName || `document-${Date.now()}.pdf`;
        newLectureObj.fileSize = newLecture.fileSize || "0 MB";
        newLectureObj.url = newLecture.url || "";
      }

      setCourse(prevCourse => ({
        ...prevCourse,
        sections: prevCourse.sections.map(section =>
          section.id === currentSectionId
            ? { ...section, lectures: [...section.lectures, newLectureObj] }
            : section
        )
      }));

      setNewLecture({
        title: "",
        description: "",
        type: "video"
      });
      setFormErrors(prev => ({ ...prev, newLecture: {} }));
      setShowAddLectureDialog(false);
    } catch (error) {
      console.error("Error adding lecture:", error);
    }
  }
  
  // Create a new assignment
  const handleAddAssignment = () => {
    try {
      // Validate form
      const errors: Record<string, string> = {};
      if (!newAssignment.title?.trim()) errors.title = 'Tên bài tập không được để trống';
      if (!newAssignment.dueDate) errors.dueDate = 'Hạn nộp không được để trống';
      if (!newAssignment.points || newAssignment.points <= 0) errors.points = 'Điểm tối đa phải lớn hơn 0';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(prev => ({
          ...prev,
          newAssignment: errors
        }));
        return;
      }

      const newAssignmentObj: Assignment = {
        id: `assignment-${Date.now()}`,
        title: newAssignment.title!.trim(),
        description: newAssignment.description?.trim() || "",
        dueDate: newAssignment.dueDate || new Date(),
        points: newAssignment.points || 100,
        status: newAssignment.status as "draft" | "published" | "archived" || "draft"
      };

      setCourse(prevCourse => ({
        ...prevCourse,
        assignments: [...prevCourse.assignments, newAssignmentObj]
      }));

      setNewAssignment({
        title: "",
        description: "",
        dueDate: new Date(),
        points: 100,
        status: "draft"
      });
      setFormErrors(prev => ({ ...prev, newAssignment: {} }));
      setShowAddAssignmentDialog(false);
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  }

  // Update lecture details
  const handleUpdateLecture = () => {
    try {
      if (!currentLecture) return;

      // Validate form
      const titleError = validateField(currentLecture.title, 'Tên bài giảng');
      if (titleError) {
        // Handle error
        return;
      }

      // Update updatedAt timestamp
      const updatedLecture = {
        ...currentLecture,
        updatedAt: new Date()
      };

      setCourse(prevCourse => ({
        ...prevCourse,
        sections: prevCourse.sections.map(section => ({
          ...section,
          lectures: section.lectures.map(lecture => 
            lecture.id === currentLecture.id ? updatedLecture : lecture
          )
        }))
      }));

      setCurrentLecture(null);
    } catch (error) {
      console.error("Error updating lecture:", error);
    }
  }
  
  // Update assignment details
  const handleUpdateAssignment = () => {
    try {
      if (!currentAssignment) return;

      // Validate form
      const titleError = validateField(currentAssignment.title, 'Tên bài tập');
      if (titleError) {
        // Handle error
        return;
      }

      setCourse(prevCourse => ({
        ...prevCourse,
        assignments: prevCourse.assignments.map(assignment => 
          assignment.id === currentAssignment.id ? currentAssignment : assignment
        )
      }));

      setCurrentAssignment(null);
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  }

  // Confirm delete operations
  const confirmDeleteAction = (title: string, message: string, action: () => void) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      action
    });
  }

  // Delete a lecture
  const handleDeleteLecture = (lectureId: string, sectionId: string) => {
    confirmDeleteAction(
      "Xóa bài giảng",
      "Bạn có chắc chắn muốn xóa bài giảng này? Hành động này không thể hoàn tác.",
      () => {
        try {
          setCourse(prevCourse => ({
            ...prevCourse,
            sections: prevCourse.sections.map(section =>
              section.id === sectionId
                ? { 
                    ...section, 
                    lectures: section.lectures.filter(lecture => lecture.id !== lectureId) 
                  }
                : section
            )
          }));
          setConfirmDialog(prev => ({ ...prev, show: false }));
        } catch (error) {
          console.error("Error deleting lecture:", error);
        }
      }
    );
  }
  
  // Delete a section
  const handleDeleteSection = (sectionId: string) => {
    const section = findSectionById(sectionId);
    if (!section) return;

    const message = section.lectures.length > 0 
      ? `Phần học này có ${section.lectures.length} bài giảng. Tất cả bài giảng sẽ bị xóa. Bạn có chắc chắn muốn xóa?`
      : "Bạn có chắc chắn muốn xóa phần học này?";

    confirmDeleteAction("Xóa phần học", message, () => {
      try {
        setCourse(prevCourse => ({
          ...prevCourse,
          sections: prevCourse.sections.filter(section => section.id !== sectionId)
            .map((section, index) => ({ ...section, order: index + 1 }))
        }));
        setConfirmDialog(prev => ({ ...prev, show: false }));
      } catch (error) {
        console.error("Error deleting section:", error);
      }
    });
  }
  
  // Delete an assignment
  const handleDeleteAssignment = (assignmentId: string) => {
    confirmDeleteAction(
      "Xóa bài tập",
      "Bạn có chắc chắn muốn xóa bài tập này? Hành động này không thể hoàn tác.",
      () => {
        try {
          setCourse(prevCourse => ({
            ...prevCourse,
            assignments: prevCourse.assignments.filter(assignment => assignment.id !== assignmentId)
          }));
          setConfirmDialog(prev => ({ ...prev, show: false }));
        } catch (error) {
          console.error("Error deleting assignment:", error);
        }
      }
    );
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'document' | 'image') => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      const file = files[0];
      const allowedTypes: Record<string, string[]> = {
        video: ['video/mp4', 'video/webm'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        image: ['image/jpeg', 'image/png', 'image/jpg']
      };
      
      if (!allowedTypes[fileType].includes(file.type)) {
        setUploadState({
          file: null,
          progress: 0,
          error: `Chỉ chấp nhận file định dạng: ${allowedTypes[fileType].join(', ')}`
        });
        return;
      }
      
      // Simulating upload progress
      setUploadState({
        file,
        progress: 0,
        error: null
      });
      
      // Mock upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadState(prev => ({ ...prev, progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Update form based on file type
          if (fileType === 'video' && newLecture.type === 'video') {
            setNewLecture(prev => ({
              ...prev,
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              url: URL.createObjectURL(file)
            }));
          } else if (fileType === 'document' && newLecture.type === 'document') {
            setNewLecture(prev => ({
              ...prev,
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              url: URL.createObjectURL(file)
            }));
          } else if (fileType === 'image') {
            setCourseForm(prev => ({
              ...prev,
              thumbnail: URL.createObjectURL(file)
            }));
          }
        }
      }, 300);
      
      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadState({
        file: null,
        progress: 0,
        error: "Có lỗi xảy ra khi tải lên file. Vui lòng thử lại."
      });
    }
  };

  // Save course changes
  const handleSaveCourse = () => {
    try {
      // Validate form
      const errors: Record<string, string> = {};
      if (!courseForm.title.trim()) errors.title = 'Tên khóa học không được để trống';
      if (!courseForm.code.trim()) errors.code = 'Mã khóa học không được để trống';
      if (!courseForm.description.trim()) errors.description = 'Mô tả không được để trống';
      if (!courseForm.instructor.trim()) errors.instructor = 'Giảng viên không được để trống';
      if (courseForm.maxStudents < courseForm.enrolledStudents) {
        errors.maxStudents = 'Số sinh viên tối đa phải lớn hơn hoặc bằng số sinh viên đã đăng ký';
      }
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(prev => ({
          ...prev,
          courseForm: errors
        }));
        return;
      }
      
      // Update course with form data
      setCourse({
        ...courseForm,
        title: courseForm.title.trim(),
        code: courseForm.code.trim(),
        description: courseForm.description.trim(),
        instructor: courseForm.instructor.trim()
      });
      setEditMode(null);
      setFormErrors(prev => ({ ...prev, courseForm: {} }));
      
      // In a real app, we would make an API call here
      console.log("Course saved:", courseForm);
    } catch (error) {
      console.error("Error saving course:", error);
    }
  }
  
  // Format file size for display
  const formatFileSize = (size?: string): string => {
    if (!size) return '0 B';
    return size;
  }

  // Format date for display
  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return new Intl.DateTimeFormat('vi-VN').format(date);
  }

  // Reset upload state
  const resetUploadState = () => {
    setUploadState({
      file: null,
      progress: 0,
      error: null
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {editMode ? "Chỉnh sửa khóa học" : course.title}
            <span className="ml-2 text-base font-normal text-muted-foreground">({course.code})</span>
          </h1>
          <p className="text-muted-foreground">{editMode ? "Chỉnh sửa thông tin và nội dung khóa học" : "Quản lý thông tin và nội dung khóa học"}</p>
        </div>

        <div className="flex items-center gap-3">
          {!editMode ? (
            <>
              <Badge variant={
                course.status === "published" 
                  ? "default" 
                  : course.status === "draft" 
                    ? "secondary" 
                    : "outline"
              }>
                {course.status === "published" ? "Đã xuất bản" : course.status === "draft" ? "Bản nháp" : "Đã lưu trữ"}
              </Badge>
              <Button onClick={() => setEditMode('basic')} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500">
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditMode(null)} className="flex items-center gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Hủy
              </Button>
              <Button onClick={handleSaveCourse} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500">
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Basic Course Information Editor */}
      {editMode === 'basic' && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              Thông tin cơ bản
            </CardTitle>
            <CardDescription>Chỉnh sửa thông tin cơ bản của khóa học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course-title">
                  Tên khóa học <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                  className={formErrors.courseForm.title ? "border-red-500" : ""}
                />
                {formErrors.courseForm.title && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.courseForm.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-code">
                  Mã khóa học <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-code"
                  value={courseForm.code}
                  onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                  className={formErrors.courseForm.code ? "border-red-500" : ""}
                />
                {formErrors.courseForm.code && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.courseForm.code}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-instructor">
                  Giảng viên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="course-instructor"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({...courseForm, instructor: e.target.value})}
                  className={formErrors.courseForm.instructor ? "border-red-500" : ""}
                />
                {formErrors.courseForm.instructor && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.courseForm.instructor}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-status">Trạng thái</Label>
                <Select
                  value={courseForm.status}
                  onValueChange={(value: "draft" | "published" | "archived") => setCourseForm({...courseForm, status: value})}
                >
                  <SelectTrigger id="course-status">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="archived">Đã lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-description">
                Mô tả khóa học <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="course-description"
                value={courseForm.description}
                onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                rows={5}
                className={formErrors.courseForm.description ? "border-red-500" : ""}
              />
              {formErrors.courseForm.description && (
                <p className="text-red-500 text-xs mt-1">{formErrors.courseForm.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course-start">Ngày bắt đầu</Label>
                <Input
                  id="course-start"
                  type="date"
                  value={courseForm.startDate ? courseForm.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCourseForm({...courseForm, startDate: new Date(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-end">Ngày kết thúc</Label>
                <Input
                  id="course-end"
                  type="date"
                  value={courseForm.endDate ? courseForm.endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setCourseForm({...courseForm, endDate: new Date(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-enrolled">Số sinh viên đã đăng ký</Label>
                <Input
                  id="course-enrolled"
                  type="number"
                  value={courseForm.enrolledStudents}
                  onChange={(e) => setCourseForm({...courseForm, enrolledStudents: parseInt(e.target.value) || 0})}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-max">Số sinh viên tối đa</Label>
                <Input
                  id="course-max"
                  type="number"
                  value={courseForm.maxStudents}
                  onChange={(e) => setCourseForm({...courseForm, maxStudents: parseInt(e.target.value) || 0})}
                  min={1}
                  className={formErrors.courseForm.maxStudents ? "border-red-500" : ""}
                />
                {formErrors.courseForm.maxStudents && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.courseForm.maxStudents}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-thumbnail">Ảnh thumbnail</Label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 bg-gray-100 rounded-md overflow-hidden">
                  {courseForm.thumbnail && (
                    <img 
                      src={courseForm.thumbnail} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    id="thumbnail-upload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 bg-transparent"
                    onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    disabled={uploadState.progress > 0 && uploadState.progress < 100}
                  >
                    {uploadState.progress > 0 && uploadState.progress < 100 ? (
                      <>
                        <RotateCw className="h-4 w-4 animate-spin" />
                        Đang tải... {uploadState.progress}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Tải ảnh lên
                      </>
                    )}
                  </Button>
                  {uploadState.error && (
                    <p className="text-red-500 text-xs">{uploadState.error}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Editor */}
      {editMode === 'content' && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              Quản lý nội dung khóa học
            </CardTitle>
            <CardDescription>Thêm và chỉnh sửa các phần học và bài giảng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => setShowAddSectionDialog(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm phần học mới
            </Button>
            
            {course.sections.length === 0 ? (
              <div className="text-center p-8 bg-white/50 rounded-lg border border-dashed border-indigo-300">
                <BookOpen className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-indigo-600 mb-1">Chưa có phần học nào</h3>
                <p className="text-sm text-indigo-400 mb-4">Thêm các phần học và bài giảng để bắt đầu khóa học</p>
                <Button 
                  onClick={() => setShowAddSectionDialog(true)}
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo phần học đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.sections.map((section) => (
                  <Card key={section.id} className="border hover:shadow-md transition-all">
                    <CardHeader className="py-3 cursor-pointer" onClick={() => toggleSection(section.id)}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-indigo-500" />
                          {section.title}
                          <span className="text-xs text-muted-foreground">({section.lectures.length} bài)</span>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id);
                                  }}
                                  className="h-8 text-red-600 hover:text-red-700 bg-transparent border-red-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xóa phần học</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 bg-transparent"
                          >
                            {section.isExpanded ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {section.description && (
                        <CardDescription>{section.description}</CardDescription>
                      )}
                    </CardHeader>
                    
                    {section.isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-4 mb-4">
                          {section.lectures.map((lecture) => (
                            <div key={lecture.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {lecture.type === 'video' ? (
                                    <Video className="h-5 w-5 text-blue-500" />
                                  ) : lecture.type === 'document' ? (
                                    <FileText className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                                  )}
                                  <div>
                                    <p className="font-medium">{lecture.title}</p>
                                    <p className="text-xs text-muted-foreground">{lecture.description}</p>
                                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                                      {lecture.type === 'video' && lecture.duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {lecture.duration} phút
                                        </span>
                                      )}
                                      {(lecture.type === 'video' || lecture.type === 'document') && lecture.fileName && (
                                        <span>Tên file: {lecture.fileName}</span>
                                      )}
                                      {(lecture.type === 'video' || lecture.type === 'document') && lecture.fileSize && (
                                        <span>{formatFileSize(lecture.fileSize)}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-8 bg-transparent"
                                          onClick={() => {
                                            setCurrentLecture(lecture);
                                          }}
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Chỉnh sửa bài giảng</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-8 text-red-600 hover:text-red-700 bg-transparent"
                                          onClick={() => handleDeleteLecture(lecture.id, section.id)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Xóa bài giảng</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 bg-transparent"
                          onClick={() => {
                            setCurrentSectionId(section.id);
                            setShowAddLectureDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm bài giảng mới
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignments Editor */}
      {editMode === 'assignments' && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-purple-500" />
              Quản lý bài tập
            </CardTitle>
            <CardDescription>Thêm và chỉnh sửa bài tập và quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => setShowAddAssignmentDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm bài tập mới
            </Button>
            
            {course.assignments.length === 0 ? (
              <div className="text-center p-8 bg-white/50 rounded-lg border border-dashed border-purple-300">
                <ClipboardList className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-purple-600 mb-1">Chưa có bài tập nào</h3>
                <p className="text-sm text-purple-400 mb-4">Thêm các bài tập để đánh giá học viên</p>
                <Button 
                  onClick={() => setShowAddAssignmentDialog(true)}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài tập đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {course.assignments.map((assignment) => (
                  <Card key={assignment.id} className="border hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{assignment.title}</h3>
                            <Badge variant={
                              assignment.status === "published" 
                                ? "default" 
                                : assignment.status === "draft" 
                                  ? "secondary" 
                                  : "outline"
                            }>
                              {assignment.status === "published" ? "Đã xuất bản" : assignment.status === "draft" ? "Bản nháp" : "Đã lưu trữ"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{assignment.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Hạn nộp: {formatDate(assignment.dueDate)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5" />
                              {assignment.points} điểm
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 bg-transparent"
                                  onClick={() => {
                                    setCurrentAssignment(assignment);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Chỉnh sửa bài tập</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 text-red-600 hover:text-red-700 bg-transparent"
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xóa bài tập</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Overview */}
      {!editMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Tổng quan khóa học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-gradient-to-r from-gray-900 to-blue-900 rounded-lg overflow-hidden">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-16 w-16 text-white/50" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-white/80">{course.instructor}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Thời gian</p>
                        <p className="font-medium">
                          {formatDate(course.startDate)} - {formatDate(course.endDate)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sinh viên</p>
                        <p className="font-medium">
                          {course.enrolledStudents}/{course.maxStudents} người
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nội dung</p>
                        <p className="font-medium">
                          {course.sections.reduce((acc, section) => acc + section.lectures.length, 0)} bài học
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Mô tả khóa học</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{course.description}</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="text-lg">Quản lý khóa học</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={() => setEditMode('basic')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa thông tin khóa học
                </Button>
                <Button 
                  onClick={() => setEditMode('content')} 
                  variant="outline" 
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Quản lý nội dung
                </Button>
                <Button 
                  onClick={() => setEditMode('assignments')} 
                  variant="outline" 
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Quản lý bài tập
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tài nguyên khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-blue-500" />
                    <p className="text-sm font-medium">Video bài giảng</p>
                  </div>
                  <p className="text-sm font-bold">{course.sections.reduce((acc, section) => 
                    acc + section.lectures.filter(l => l.type === "video").length, 0
                  )}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium">Tài liệu</p>
                  </div>
                  <p className="text-sm font-bold">{course.sections.reduce((acc, section) => 
                    acc + section.lectures.filter(l => l.type === "document").length, 0
                  )}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-purple-500" />
                    <p className="text-sm font-medium">Bài tập</p>
                  </div>
                  <p className="text-sm font-bold">{course.assignments.length}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    <p className="text-sm font-medium">Quiz</p>
                  </div>
                  <p className="