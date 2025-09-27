import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV } from '../config/environment';
import { ApiError, ValidationErrorResponse } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Get token from AsyncStorage
        const token = await this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get stored access token:', error);
      return null;
    }
  }


  private handleError(error: AxiosError): Promise<never> {
    let apiError: ApiError;

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 400 && data && typeof data === 'object' && 'errors' in data) {
        // Validation errors
        const validationError = data as ValidationErrorResponse;
        apiError = {
          message: validationError.message,
          status,
          timestamp: new Date().toISOString(),
          path: error.config?.url || '',
        };
      } else {
        // General API error
        const errorData = data as any;
        apiError = {
          message: errorData?.message || errorData?.error || error.message || 'An error occurred',
          status,
          timestamp: new Date().toISOString(),
          path: error.config?.url || '',
        };
      }
    } else if (error.request) {
      // Network error
      apiError = {
        message: 'Network error - please check your connection',
        status: 0,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
      };
    } else {
      // Other error
      apiError = {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
      };
    }

    return Promise.reject(apiError);
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Method to update auth token
  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Method to clear auth token
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
