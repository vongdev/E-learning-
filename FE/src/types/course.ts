// Enum types
export type CourseLevel = "beginner" | "intermediate" | "advanced"
export type CourseStatus = "draft" | "published" | "archived" | "private"
export type EnrollmentStatus = "not-enrolled" | "enrolled" | "in-progress" | "completed" | "expired"
export type ContentType = "video" | "document" | "quiz" | "assignment" | "discussion" | "interactive"

export interface CourseCardData {
  id: string;
  code: string;
  name: string;
  instructor: string;
  thumbnail?: string;
  progress?: number;
  status: CourseStatus;                 // Trạng thái quản lý khóa học
  enrollmentStatus?: EnrollmentStatus;  // Trạng thái đăng ký/tiến độ học tập
  nextClass?: string;
  assignments?: number;
  pendingAssignments?: number;
  lastAccessed?: string;
  totalStudents?: number;
}
// DTO - Data transfer objects dari API
export interface CourseDTO {
  _id: string;
  code: string;
  name: string;
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  language?: string;
  level?: CourseLevel;
  category?: string;
  subcategory?: string;
  tags?: string[];
  thumbnail?: string;
  coverImage?: string;
  previewVideo?: string;
  duration?: number; // in minutes
  lectureCount?: number;
  status?: CourseStatus;
  visibility?: "public" | "private" | "password-protected";
  price?: number;
  discount?: number;
  currency?: string;
  instructor: string;
  instructorId?: string;
  progress?: number;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Data untuk membuat course baru - dikirim ke API
export interface CreateCourseDTO {
  code: string;
  name: string; // Backend menggunakan name, bukan title
  title?: string; // Untuk penggunaan frontend
  slug?: string;
  description: string;
  shortDescription?: string;
  language: string;
  level: CourseLevel;
  category: string;
  subcategory?: string;
  tags?: string[];
  thumbnail: string;
  coverImage?: string;
  previewVideo?: string;
  duration: number | string; // Support both number (minutes) or string format
  lectureCount?: number;
  status?: CourseStatus;
  visibility?: "public" | "private" | "password-protected";
  price?: number;
  discount?: number;
  instructor: {
    id: string;
    name: string;
  };
}

// API Response structures
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Collection response structure
export interface CollectionResponse<T> extends ApiResponse<T[]> {
  count: number;
}

// Models - Kiểu dữ liệu được sử dụng trong ứng dụng
export interface Author {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  bio?: string;
  organization?: string;
}

export interface CoursePrice {
  amount: number;
  currency: string;
  discountAmount?: number;
  discountPercentage?: number;
  isOnSale?: boolean;
  saleEndDate?: Date | string;
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  isLocked?: boolean;
  isFree?: boolean;
  duration?: number; // in minutes
  contents: CourseContent[];
}

export interface CourseContent {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  order: number;
  duration?: number; // in minutes
  isLocked?: boolean;
  isFree?: boolean;
  url?: string;
  videoUrl?: string;
  documentUrl?: string;
  thumbnail?: string;
  quizId?: string;
  assignmentId?: string;
  isCompleted?: boolean;
  progress?: number; // 0-100
  lastAccessed?: string;
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment?: string;
  date: string;
  isVerified: boolean;
  isHelpful?: number; // number of users who found this review helpful
}

export interface CourseRequirement {
  id: string;
  description: string;
  order: number;
}

export interface CourseLearningOutcome {
  id: string;
  description: string;
  order: number;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  expiryDate?: string;
  status: EnrollmentStatus;
  progress: number; // 0-100
  certificate?: {
    id: string;
    issueDate: string;
    downloadUrl: string;
  };
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  progress: number; // 0-100
  sectionsProgress: Record<string, number>; // sectionId -> progress (0-100)
  contentsProgress: Record<string, number>; // contentId -> progress (0-100)
  completedContents: string[]; // array of contentIds
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  quizScores: Record<string, number>; // quizId -> score
  assignmentGrades: Record<string, number>; // assignmentId -> grade
  certificateIssued: boolean;
  certificateUrl?: string;
}

// Main Course Model - Digunakan di aplikasi frontend
export interface Course {
  id: string;        // Untuk frontend
  _id?: string;      // Dari backend, tersedia untuk compatibility
  code: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  shortDescription?: string;
  language: string;
  level: CourseLevel;
  category: string;
  subcategory?: string;
  tags: string[];
  thumbnail: string;
  coverImage?: string;
  previewVideo?: string;
  duration: number; // in minutes
  lectureCount: number;
  sections: CourseSection[];
  status: CourseStatus;
  visibility: "public" | "private" | "password-protected";
  password?: string;
  price?: CoursePrice;
  authors: Author[];
  requirements: CourseRequirement[];
  learningOutcomes: CourseLearningOutcome[];
  rating: number; // average rating 1-5
  reviewCount: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  certificate?: {
    isEnabled: boolean;
    template?: string;
    requiredCompletionPercentage: number;
  };
  completionCriteria?: {
    requiredPercentage: number;
    requiredQuizScore?: number;
    requiredAssignments?: string[];
  };
}

// View Models - Dữ liệu được sử dụng để hiển thị UI
// Khóa học trong trang chủ/danh sách
export interface CourseCardViewModel {
  id: string;
  code: string;
  slug: string;
  title: string;
  instructor: string;
  instructorAvatar?: string;
  description: string;
  thumbnail: string;
  level: CourseLevel;
  category: string;
  duration: number; // in minutes
  price: number;
  discountPrice?: number;
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  tags?: string[];
  isBestseller?: boolean;
  isNew?: boolean;
}

// Khóa học đã đăng ký hiển thị trong trang chủ
export interface EnrolledCourseViewModel {
  id: string;
  code: string;
  name: string;
  instructor: string;
  description: string;
  progress: number;
  nextClass: string;
  assignments: number;
  unread: number;
  thumbnail?: string;
  lastAccessed?: string;
  expiryDate?: string;
  certificateUrl?: string;
}

// Chuyển đổi từ DTO sang Model
export function mapCourseDTOToModel(dto: CourseDTO): Partial<Course> {
  return {
    id: dto._id,
    _id: dto._id,         // Lưu trữ cả _id cho compatibility
    code: dto.code,
    slug: dto.slug || dto.code.toLowerCase().replace(/\s+/g, '-'),
    title: dto.title || dto.name,
    description: dto.description || '',
    shortDescription: dto.shortDescription,
    level: dto.level || 'beginner',
    category: dto.category || 'Uncategorized',
    tags: dto.tags || [],
    thumbnail: dto.thumbnail || '',
    duration: dto.duration || 0,
    lectureCount: dto.lectureCount || 0,
    status: dto.status || 'draft',
    visibility: dto.visibility || 'public',
    rating: dto.rating || 0,
    reviewCount: dto.reviewCount || 0,
    enrollmentCount: dto.enrollmentCount || 0,
    authors: dto.instructorId ? [{
      id: dto.instructorId,
      name: dto.instructor
    }] : [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    publishedAt: dto.publishedAt,
    language: dto.language || 'Vietnamese',
    sections: [],          // Default empty array
    requirements: [],      // Default empty array
    learningOutcomes: [],  // Default empty array
  };
}

// Chuyển đổi từ DTO sang ViewModel cho danh sách khóa học
export function mapCourseDTOToCardViewModel(dto: CourseDTO): CourseCardViewModel {
  return {
    id: dto._id,
    code: dto.code,
    slug: dto.slug || dto.code.toLowerCase().replace(/\s+/g, '-'),
    title: dto.title || dto.name,
    instructor: dto.instructor,
    description: dto.shortDescription || dto.description || '',
    thumbnail: dto.thumbnail || '',
    level: dto.level || 'beginner',
    category: dto.category || 'Uncategorized',
    duration: dto.duration || 0,
    price: dto.price || 0,
    discountPrice: dto.discount ? dto.price ? dto.price * (1 - dto.discount/100) : 0 : undefined,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    enrollmentCount: dto.enrollmentCount,
    tags: dto.tags,
    isNew: new Date(dto.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // Khóa học tạo trong 30 ngày gần đây
  };
}

// Chuyển đổi CourseDTO sang EnrolledCourseViewModel
export function mapToEnrolledCourseViewModel(
  dto: CourseDTO, 
  progress?: number, 
  assignmentsCount?: number, 
  unreadCount?: number
): EnrolledCourseViewModel {
  return {
    id: dto._id,
    code: dto.code,
    name: dto.name || dto.title || '',
    instructor: dto.instructor,
    description: dto.shortDescription || dto.description || '',
    progress: progress || dto.progress || 0,
    nextClass: "Đang cập nhật", // Would come from a schedule API
    assignments: assignmentsCount || 0,
    unread: unreadCount || 0,
    thumbnail: dto.thumbnail
  };
}

export interface CourseViewModel {
  id: string;
  code: string;
  name: string;
  instructor: string;
  status: CourseStatus;
  enrollmentStatus: EnrollmentStatus;
  progress?: number;
  nextClass?: string;
  assignments?: number;
  pendingAssignments?: number;
  thumbnail?: string;
}

// Chuyển đổi dữ liệu từ form tạo khóa học thành CreateCourseDTO
export function prepareCreateCourseData(
  formData: any,
  instructorId: string,
  instructorName: string
): CreateCourseDTO {
  // Tạo slug từ title
  const slug = formData.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/[^a-z0-9]+/g, "-")     // Thay thế ký tự không phải chữ và số bằng dấu gạch ngang
    .replace(/^-+|-+$/g, "");        // Xóa dấu gạch ngang ở đầu và cuối

  return {
    code: formData.code,
    name: formData.title,         // Backend sử dụng name
    title: formData.title,        // Frontend sử dụng title
    slug: slug,
    description: formData.description,
    shortDescription: formData.shortDescription || (formData.description?.substring(0, 150) + "..."),
    language: formData.language || "Vietnamese",
    level: formData.level,
    category: formData.category,
    subcategory: formData.subcategory,
    tags: Array.isArray(formData.tags) ? formData.tags : 
          (formData.tags ? formData.tags.split(",").map((tag: string) => tag.trim()) : []),
    thumbnail: formData.thumbnail,
    coverImage: formData.coverImage,
    previewVideo: formData.previewVideo,
    duration: typeof formData.duration === 'number' ? formData.duration : 
              (formData.duration ? parseInt(formData.duration, 10) || 0 : 0),
    lectureCount: formData.lectureCount || 0,
    status: formData.status || "draft",
    visibility: formData.visibility || "public",
    price: typeof formData.price === 'number' ? formData.price : 
           (formData.price ? parseFloat(formData.price) || 0 : undefined),
    discount: typeof formData.discount === 'number' ? formData.discount : 
              (formData.discount ? parseFloat(formData.discount) || 0 : undefined),
    instructor: {
      id: instructorId,
      name: instructorName
    }
  };
}