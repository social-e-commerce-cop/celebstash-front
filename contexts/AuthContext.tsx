import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthResponse, AuthRequest, SignupRequest, OtpVerificationRequest, PasswordResetRequest, ApiResponse } from '../types/api';
import { authService } from '../services/authService';

interface AuthContextType {
  // State
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: AuthRequest) => Promise<AuthResponse>;
  signup: (signupData: SignupRequest) => Promise<ApiResponse>;
  verifyOtp: (otpData: OtpVerificationRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  initiatePasswordReset: (identifier: string) => Promise<ApiResponse>;
  verifyPasswordResetOtp: (otpData: OtpVerificationRequest) => Promise<ApiResponse>;
  completePasswordReset: (resetData: PasswordResetRequest) => Promise<ApiResponse>;
  refreshToken: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is already authenticated
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isUserAuthenticated();
      
      if (currentUser && isAuth) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AuthRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        setUser(response);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData: SignupRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      return await authService.signup(signupData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otpData: OtpVerificationRequest): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await authService.verifyOtp(otpData);
      
      if (response.success) {
        setUser(response);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const initiatePasswordReset = async (identifier: string): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      return await authService.initiatePasswordReset(identifier);
    } catch (error) {
      console.error('Password reset initiation error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPasswordResetOtp = async (otpData: OtpVerificationRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      return await authService.verifyPasswordResetOtp(otpData);
    } catch (error) {
      console.error('Password reset OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const completePasswordReset = async (resetData: PasswordResetRequest): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      return await authService.completePasswordReset(resetData);
    } catch (error) {
      console.error('Password reset completion error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<AuthResponse> => {
    try {
      const response = await authService.refreshToken();
      
      if (response.success) {
        setUser(response);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    verifyOtp,
    logout,
    initiatePasswordReset,
    verifyPasswordResetOtp,
    completePasswordReset,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
