import { apiClient } from './apiClient';
import { setSessionAuth, clearSession, getRefreshToken } from './session';

export interface LoginParams {
  emailOrPhone: string;
  password?: string;
}

export interface InitiateSignupParams {
  fullName: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

export interface VerifyOtpParams {
  identifier: string;
  otp: string;
  type: 'SIGNUP' | 'PASSWORD_RESET';
  username?: string;
}

export interface AuthResponseData {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  userId?: string;
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  status?: string;
  user?: {
    id: number;
    fullName: string;
    username?: string;
    email: string;
    phoneNumber?: string;
    role?: string;
    status?: string;
  };
}

export const authService = {
  // Initiate Signup (sends OTP)
  initiateSignup: async (params: InitiateSignupParams) => {
    const identifier = params.email || params.phoneNumber || '';
    return apiClient.post('/api/v1/auth/signup/initiate', {
      fullName: params.fullName,
      username: params.username,
      identifier: identifier,
      password: params.password,
      confirmPassword: params.password,
    });
  },

  // Complete Signup (verifies OTP)
  completeSignup: async (params: VerifyOtpParams): Promise<AuthResponseData> => {
    const response: any = await apiClient.post('/api/v1/auth/signup/verify', params);
    if (response.success && response.accessToken) {
      const userFullName = response.fullName || response.user?.fullName || '';
      const userEmail = response.email || response.user?.email || (params.identifier.includes('@') ? params.identifier : '');
      const userPhone = response.phoneNumber || response.user?.phoneNumber || (!params.identifier.includes('@') ? params.identifier : '');
      const userHandle = response.username || response.user?.username || params.username || '';
      const userRole = response.role || response.user?.role || 'USER';
      const userStatus = response.status || response.user?.status || 'ACTIVE';

      setSessionAuth(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        {
          id: response.userId ? parseInt(response.userId) : response.user?.id,
          fullName: userFullName,
          email: userEmail,
          phoneNumber: userPhone,
          username: userHandle,
          role: userRole,
          status: userStatus,
        }
      );
    }
    return response;
  },

  // Login with credentials
  login: async (params: LoginParams): Promise<AuthResponseData> => {
    const response: any = await apiClient.post('/api/v1/auth/login', {
      identifier: params.emailOrPhone,
      password: params.password,
    });
    if (response.success && response.accessToken) {
      const userFullName = response.fullName || response.user?.fullName || '';
      const userEmail = response.email || response.user?.email || (params.emailOrPhone.includes('@') ? params.emailOrPhone : '');
      const userPhone = response.phoneNumber || response.user?.phoneNumber;
      const userHandle = response.username || response.user?.username || '';
      const userRole = response.role || response.user?.role || 'USER';
      const userStatus = response.status || response.user?.status || 'ACTIVE';

      setSessionAuth(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        {
          id: response.userId ? parseInt(response.userId) : response.user?.id,
          fullName: userFullName,
          email: userEmail,
          phoneNumber: userPhone,
          username: userHandle,
          role: userRole,
          status: userStatus,
        }
      );
    }
    return response;
  },

  // Refresh Token
  refreshToken: async (): Promise<AuthResponseData> => {
    const token = getRefreshToken();
    if (!token) throw new Error('No refresh token available');

    const response: AuthResponseData = await apiClient.post('/api/v1/auth/refresh-token', {
      refreshToken: token,
    });
    if (response.success && response.accessToken) {
      setSessionAuth(
        { accessToken: response.accessToken, refreshToken: response.refreshToken },
        response.user
      );
    }
    return response;
  },

  // Logout
  logout: async () => {
    const token = getRefreshToken();
    if (token) {
      try {
        await apiClient.post('/api/v1/auth/logout', { refreshToken: token });
      } catch (e) {
        console.warn('Logout request error:', e);
      }
    }
    clearSession();
  },

  // Initiate Password Reset
  initiatePasswordReset: async (identifier: string) => {
    return apiClient.post(`/api/v1/auth/password-reset/initiate?identifier=${encodeURIComponent(identifier)}`, {});
  },

  // Verify Password Reset OTP
  verifyPasswordResetOtp: async (identifier: string, otp: string) => {
    return apiClient.post('/api/v1/auth/password-reset/verify-otp', {
      identifier,
      otp,
      type: 'PASSWORD_RESET',
    });
  },

  // Complete Password Reset
  completePasswordReset: async (params: { identifier: string; otp: string; newPassword: string; confirmPassword: string }) => {
    return apiClient.post('/api/v1/auth/password-reset/complete', params);
  },
};
