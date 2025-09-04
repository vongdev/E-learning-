import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  private instance: AxiosInstance;
  
  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const status = error.response?.status || 500;
        let message = 'Đã có lỗi xảy ra';
        
        if (status === 401) {
          message = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
          // Thêm logic tự động logout nếu cần
          localStorage.removeItem('authToken');
          window.location.href = '/auth/login';
        } else if (status === 404) {
          message = 'Không tìm thấy dữ liệu yêu cầu';
        } else if (status === 403) {
          message = 'Bạn không có quyền thực hiện hành động này';
        } else if (status === 500) {
          message = 'Lỗi hệ thống, vui lòng thử lại sau';
        }
        
        return Promise.reject(
          new ApiError(
            message,
            status,
            error.response?.data
          )
        );
      }
    );
  }
  
  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }
  
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }
  
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }
  
  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
  
  // Retry mechanism
  async withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }
}

// Create and export a default instance
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');