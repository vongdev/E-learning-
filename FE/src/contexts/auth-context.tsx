"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authAPI } from "@/service/api";
import { AxiosError } from "axios";
import { User, UserRole, getUserName, isUserAdmin, isUserStudent, isUserInstructor, getUserAvatarUrl } from "@/types/user";

// Interface cho context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isStudent: boolean;
  isInstructor: boolean;
  userName: string | null;
  userAvatarUrl: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  updateUser: (userData: any) => Promise<void>;
  clearError: () => void;
}

// Adapter function để chuyển đổi từ API response sang User type
const adaptUserFromAPI = (apiUser: any): User => {
  return {
    id: apiUser.id || apiUser._id,
    email: apiUser.email,
    username: apiUser.username,
    profile: apiUser.profile || {
      firstName: apiUser.firstName || '',
      lastName: apiUser.lastName || '',
      displayName: apiUser.name || '',
      avatar: apiUser.avatarUrl || ''
    },
    roles: apiUser.roles || [],
    status: apiUser.status || 'active',
    preferences: apiUser.preferences || {
      theme: 'system',
      language: 'vi',
      emailNotifications: true,
      pushNotifications: true,
      autoPlayVideos: true,
      subtitlesEnabled: false,
      playbackSpeed: 1.0,
      videoQuality: 'auto',
      downloadEnabled: true,
      timezone: 'Asia/Ho_Chi_Minh',
      notificationTypes: ['email', 'in-app']
    },
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
    updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : new Date(),
    emailVerified: apiUser.emailVerified || false,
    twoFactorEnabled: apiUser.twoFactorEnabled || false,
    profileVisibility: apiUser.profileVisibility || 'public',
    activityVisibility: apiUser.activityVisibility || 'connections-only',
  };
};

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  isAdmin: false,
  isStudent: false,
  isInstructor: false,
  userName: null,
  userAvatarUrl: null,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateUser: async () => {},
  clearError: () => {},
});

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties sử dụng helper functions
  const isAdmin = user ? isUserAdmin(user) : false;
  const isStudent = user ? isUserStudent(user) : false;
  const isInstructor = user ? isUserInstructor(user) : false;
  const userName = user ? getUserName(user) : null;
  const userAvatarUrl = user ? getUserAvatarUrl(user) : null;

  // Tải thông tin người dùng khi component mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await authAPI.getMe();
        const adaptedUser = adaptUserFromAPI(response.data.data);
        setUser(adaptedUser);
      } catch (err) {
        console.error("Error loading user", err);
        // Xóa token nếu không hợp lệ
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Hàm đăng nhập
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      const { token, user: apiUser } = response.data;
      
      // Lưu token và thông tin người dùng
      localStorage.setItem("token", token);
      
      // Chuyển đổi user từ API sang đúng cấu trúc User interface
      const adaptedUser = adaptUserFromAPI(apiUser);
      setUser(adaptedUser);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setError(error.response?.data?.error || "Đăng nhập thất bại");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentCourseId");
    setUser(null);
  };

  // Hàm đăng ký
  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(userData);
      const { token, user: apiUser } = response.data;
      
      // Lưu token và thông tin người dùng
      localStorage.setItem("token", token);
      
      // Chuyển đổi user từ API sang đúng cấu trúc User interface
      const adaptedUser = adaptUserFromAPI(apiUser);
      setUser(adaptedUser);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setError(error.response?.data?.error || "Đăng ký thất bại");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm cập nhật thông tin người dùng
  const updateUser = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.updateDetails(userData);
      
      // Chuyển đổi user từ API sang đúng cấu trúc User interface
      const adaptedUser = adaptUserFromAPI(response.data.data);
      setUser(adaptedUser);
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      setError(error.response?.data?.error || "Cập nhật thông tin thất bại");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa lỗi
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAdmin,
        isStudent,
        isInstructor,
        userName,
        userAvatarUrl,
        login,
        logout,
        register,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng context
export const useAuth = () => useContext(AuthContext);