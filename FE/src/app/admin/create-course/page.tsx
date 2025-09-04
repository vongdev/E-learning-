"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { courseAPI } from "@/service/api";
import { CreateCourseDTO } from "@/types/course";
import { Loader2, ArrowLeft, Upload } from "lucide-react";

// Định nghĩa schema cho form - đã bổ sung các trường code và language
const formSchema = z.object({
  code: z.string().min(2, {
    message: "Mã khóa học phải có ít nhất 2 ký tự",
  }),
  title: z.string().min(5, {
    message: "Tiêu đề khóa học phải có ít nhất 5 ký tự",
  }),
  description: z.string().min(20, {
    message: "Mô tả khóa học phải có ít nhất 20 ký tự",
  }),
  shortDescription: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Vui lòng chọn cấp độ khóa học",
  }),
  category: z.string().min(1, {
    message: "Vui lòng chọn danh mục khóa học",
  }),
  language: z.string().min(1, {
    message: "Vui lòng chọn ngôn ngữ khóa học",
  }),
  duration: z.string().min(1, {
    message: "Vui lòng nhập thời lượng khóa học",
  }),
  thumbnail: z.string().url({
    message: "Vui lòng nhập URL hình ảnh hợp lệ",
  }),
  price: z.string().optional(),
  discount: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  visibility: z.enum(["public", "private"]).default("public"),
});

// Định nghĩa kiểu dữ liệu cho form
type FormValues = z.infer<typeof formSchema>;

// Định nghĩa kiểu dữ liệu cho Category
interface Category {
  id: string;
  name: string;
}

// Hàm tạo slug từ text (loại bỏ dấu tiếng Việt)
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Hàm tạo mã khóa học từ tiêu đề
function generateCourseCode(title: string): string {
  // Lấy chữ cái đầu tiên của mỗi từ và viết hoa
  const code = title
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  // Đảm bảo mã khóa học có ít nhất 2 ký tự
  return code.length < 2 ? code + '1' : code;
}

export default function CreateCoursePage() {
  const { user, userName, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Khởi tạo form với các giá trị mặc định đã bổ sung
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      shortDescription: "",
      language: "Vietnamese",
      level: "beginner",
      category: "",
      duration: "",
      thumbnail: "https://placehold.co/600x400?text=Course+Thumbnail",
      price: "",
      discount: "",
      status: "draft",
      visibility: "public",
    },
  });

  // Tự động tạo mã khóa học khi người dùng nhập tiêu đề
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !form.getValues('code')) {
        const generatedCode = generateCourseCode(value.title);
        form.setValue('code', generatedCode, { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Tải danh mục từ API khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await courseAPI.getCategories();
        if (response.data?.data) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục khóa học:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh mục khóa học. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();

    // Tải dữ liệu form đã lưu
    const savedForm = localStorage.getItem('courseFormDraft');
    if (savedForm) {
      try {
        const formData = JSON.parse(savedForm);
        form.reset(formData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu form:", error);
      }
    }
  }, [form, toast]);

  // Lưu draft form tự động khi có thay đổi
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (Object.values(value).some(val => val)) {
        localStorage.setItem('courseFormDraft', JSON.stringify(value));
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Xử lý khi submit form - đã cập nhật để phù hợp với CreateCourseDTO
  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Đảm bảo thumbnail luôn có giá trị
      const thumbnail = values.thumbnail || "https://placehold.co/600x400?text=Course+Thumbnail";
      
      // Tạo slug từ tiêu đề
      const slug = createSlug(values.title);
      
      // Chuyển đổi giá trị price và discount từ string sang number nếu có
      const price = values.price ? parseFloat(values.price) : undefined;
      const discount = values.discount ? parseFloat(values.discount) : undefined;
      
      // Tạo đối tượng khóa học theo định dạng CreateCourseDTO
      const courseData: CreateCourseDTO = {
        code: values.code,
        name: values.title, // Backend yêu cầu trường name
        title: values.title, // Frontend sử dụng title
        slug: slug,
        description: values.description,
        shortDescription: values.shortDescription || values.description.substring(0, 150) + "...",
        language: values.language,
        level: values.level,
        category: values.category,
        thumbnail: thumbnail,
        duration: values.duration,
        status: values.status,
        visibility: values.visibility,
        price,
        discount,
        instructor: {
          id: user.id,
          name: userName || `${user.profile.firstName} ${user.profile.lastName}`.trim() || "Giảng viên"
        }
      };
      
      const response = await courseAPI.createCourse(courseData);
      
      // Hiển thị thông báo thành công
      toast({
        title: "Thành công",
        description: "Khóa học đã được tạo thành công!",
        variant: "default",
      });
      
      // Xóa draft sau khi tạo thành công
      localStorage.removeItem('courseFormDraft');
      
      // Chuyển hướng đến trang chi tiết khóa học
      router.push(`/admin/courses/${response.data.data._id}`);
    } catch (error: any) {
      console.error("Lỗi khi tạo khóa học:", error);
      
      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi",
        description: error.response?.data?.error || "Không thể tạo khóa học. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Chuyển hướng nếu chưa đăng nhập hoặc không phải admin
  useEffect(() => {
    if (!authLoading && (!user || !user.roles.includes('admin'))) {
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập vào trang này",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [user, authLoading, router, toast]);

  // Xử lý upload ảnh thumbnail
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.includes('image')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      // Hiển thị trạng thái đang tải
      toast({
        title: "Đang tải lên",
        description: "Đang tải ảnh thumbnail lên server...",
      });

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await courseAPI.uploadImage(formData);
      const imageUrl = response.data.data.url;
      
      // Cập nhật giá trị form
      form.setValue('thumbnail', imageUrl, { shouldValidate: true });
      
      toast({
        title: "Thành công",
        description: "Ảnh thumbnail đã được tải lên",
      });
    } catch (error) {
      console.error("Lỗi khi tải ảnh:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tạo khóa học mới</CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin để tạo một khóa học mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "title"> }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề khóa học</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề khóa học" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tiêu đề nên ngắn gọn, rõ ràng và hấp dẫn.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Thêm trường mã khóa học */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "code"> }) => (
                    <FormItem>
                      <FormLabel>Mã khóa học</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã khóa học (ví dụ: CS101)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Mã khóa học dùng để nhận diện nhanh (tự động tạo từ tiêu đề).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }: { field: ControllerRenderProps<FormValues, "description"> }) => (
                  <FormItem>
                    <FormLabel>Mô tả khóa học</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả chi tiết về khóa học" 
                        className="min-h-32" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả những gì người học sẽ đạt được sau khi hoàn thành khóa học.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Thêm trường mô tả ngắn */}
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }: { field: ControllerRenderProps<FormValues, "shortDescription"> }) => (
                  <FormItem>
                    <FormLabel>Mô tả ngắn (tùy chọn)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Mô tả ngắn gọn về khóa học" 
                        className="min-h-20" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Mô tả ngắn gọn sẽ hiển thị ở trang danh sách khóa học.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "level"> }) => (
                    <FormItem>
                      <FormLabel>Cấp độ</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn cấp độ khóa học" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Người mới bắt đầu</SelectItem>
                          <SelectItem value="intermediate">Trung cấp</SelectItem>
                          <SelectItem value="advanced">Nâng cao</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Cấp độ kiến thức yêu cầu cho khóa học.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "category"> }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoadingCategories}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn danh mục"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Đang tải danh mục...</span>
                            </div>
                          ) : (
                            categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Phân loại khóa học của bạn.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thêm trường ngôn ngữ */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "language"> }) => (
                    <FormItem>
                      <FormLabel>Ngôn ngữ</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn ngôn ngữ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Vietnamese">Tiếng Việt</SelectItem>
                          <SelectItem value="English">Tiếng Anh</SelectItem>
                          <SelectItem value="French">Tiếng Pháp</SelectItem>
                          <SelectItem value="Chinese">Tiếng Trung</SelectItem>
                          <SelectItem value="Japanese">Tiếng Nhật</SelectItem>
                          <SelectItem value="Korean">Tiếng Hàn</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Ngôn ngữ chính của khóa học.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "duration"> }) => (
                    <FormItem>
                      <FormLabel>Thời lượng</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: 10 giờ" {...field} />
                      </FormControl>
                      <FormDescription>
                        Tổng thời gian để hoàn thành khóa học.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thêm trường giá và giảm giá */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "price"> }) => (
                    <FormItem>
                      <FormLabel>Giá (để trống nếu miễn phí)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ví dụ: 499000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Giá của khóa học (VND).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "discount"> }) => (
                    <FormItem>
                      <FormLabel>Giảm giá (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ví dụ: 20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Phần trăm giảm giá (nếu có).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "status"> }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="published">Xuất bản</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Khóa học bản nháp sẽ không hiển thị cho người dùng.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }: { field: ControllerRenderProps<FormValues, "visibility"> }) => (
                    <FormItem>
                      <FormLabel>Quyền riêng tư</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quyền riêng tư" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Công khai</SelectItem>
                          <SelectItem value="private">Riêng tư</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Khóa học riêng tư chỉ có thể truy cập qua đường dẫn trực tiếp.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }: { field: ControllerRenderProps<FormValues, "thumbnail"> }) => (
                  <FormItem>
                    <FormLabel>Ảnh bìa</FormLabel>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <FormControl>
                        <Input placeholder="URL hình ảnh" {...field} />
                      </FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleThumbnailUpload}
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <FormDescription>
                      Liên kết đến ảnh bìa hoặc tải lên hình ảnh mới.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Preview hình ảnh thumbnail */}
              {form.watch('thumbnail') && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-2">Xem trước ảnh bìa:</p>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={form.watch('thumbnail')} 
                      alt="Thumbnail preview" 
                      className="w-full h-auto object-cover max-h-[200px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('courseFormDraft');
                    form.reset({
                      code: "",
                      title: "",
                      description: "",
                      shortDescription: "",
                      language: "Vietnamese",
                      level: "beginner",
                      category: "",
                      duration: "",
                      thumbnail: "https://placehold.co/600x400?text=Course+Thumbnail",
                      price: "",
                      discount: "",
                      status: "draft",
                      visibility: "public",
                    });
                    toast({
                      title: "Thông báo",
                      description: "Đã xóa dữ liệu form",
                    });
                  }}
                >
                  Xóa dữ liệu
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Đang tạo khóa học...
                    </>
                  ) : (
                    "Tạo khóa học"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}