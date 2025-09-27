import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './apiClient';
import {
  AuthRequest,
  AuthResponse,
  SignupRequest,
  OtpVerificationRequest,
  RefreshTokenRequest,
  PasswordResetRequest,
  ApiResponse,
} from '../types/api';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

class AuthService {
  private isAuthenticated = false;
  private currentUser: AuthResponse | null = null;

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = await this.getStoredToken();
      if (token) {
        const userData = await this.getStoredUserData();
        if (userData) {
          this.currentUser = userData;
          this.isAuthenticated = true;
          apiClient.setAuthToken(token);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await this.clearAuth();
    }
  }

  // Authentication Methods
  async login(credentials: AuthRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', credentials);
      
      if (response.success) {
        await this.setAuthData(response);
        this.currentUser = response;
        this.isAuthenticated = true;
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(signupData: SignupRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/v1/auth/signup/initiate', signupData);
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async verifyOtp(otpData: OtpVerificationRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/api/v1/auth/signup/verify', otpData);
      
      if (response.success) {
        await this.setAuthData(response);
        this.currentUser = response;
        this.isAuthenticated = true;
      }
      
      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<AuthResponse>('/api/v1/auth/refresh-token', {
        refreshToken,
      } as RefreshTokenRequest);

      if (response.success) {
        await this.setAuthData(response);
        this.currentUser = response;
      }

      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.logout();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await this.getStoredRefreshToken();
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout', {
          refreshToken,
        } as RefreshTokenRequest);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuth();
    }
  }

  async initiatePasswordReset(identifier: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>(`/api/v1/auth/password-reset/initiate?identifier=${encodeURIComponent(identifier)}`);
      return response;
    } catch (error) {
      console.error('Password reset initiation error:', error);
      throw error;
    }
  }

  async verifyPasswordResetOtp(otpData: OtpVerificationRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/v1/auth/password-reset/verify-otp', otpData);
      return response;
    } catch (error) {
      console.error('Password reset OTP verification error:', error);
      throw error;
    }
  }

  async completePasswordReset(resetData: PasswordResetRequest): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/api/v1/auth/password-reset/complete', resetData);
      return response;
    } catch (error) {
      console.error('Password reset completion error:', error);
      throw error;
    }
  }

  // Token Management
  private async setAuthData(authResponse: AuthResponse): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, authResponse.accessToken),
        AsyncStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken),
        AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse)),
      ]);
      
      apiClient.setAuthToken(authResponse.accessToken);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  private async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to get stored refresh token:', error);
      return null;
    }
  }

  private async getStoredUserData(): Promise<AuthResponse | null> {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get stored user data:', error);
      return null;
    }
  }

  private async clearAuth(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(AUTH_STORAGE_KEYS.USER_DATA),
      ]);
      
      this.currentUser = null;
      this.isAuthenticated = false;
      apiClient.clearAuthToken();
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Getters
  getCurrentUser(): AuthResponse | null {
    return this.currentUser;
  }

  isUserAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getAccessToken(): string | null {
    return this.currentUser?.accessToken || null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
