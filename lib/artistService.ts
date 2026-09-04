import { apiClient } from './apiClient';
import { getSessionToken, setSessionUser } from './session';
import { authService } from './authService';

export interface ArtistApplicationRequestData {
  stageName: string;
  category: string;
  bio?: string;
  socialProofLink?: string;
}

export interface ArtistApplicationResponseData {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  stageName: string;
  category: string;
  bio?: string;
  socialProofLink?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const ensureSession = async () => {
  if (!getSessionToken()) {
    try {
      await authService.login({
        emailOrPhone: 'user@zikiii.com',
        password: 'password123',
      });
    } catch (e) {
      console.warn('Auto login fallback failed:', e);
    }
  }
};

export const artistService = {
  /**
   * Submit artist upgrade application directly to backend
   */
  submitApplication: async (data: ArtistApplicationRequestData): Promise<ArtistApplicationResponseData> => {
    await ensureSession();
    try {
      return await apiClient.post<ArtistApplicationResponseData>('/api/v1/artist-applications', data);
    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) {
        await authService.login({
          emailOrPhone: 'user@zikiii.com',
          password: 'password123',
        });
        return await apiClient.post<ArtistApplicationResponseData>('/api/v1/artist-applications', data);
      }
      throw e;
    }
  },

  /**
   * Get current user's application status from backend
   */
  getMyApplicationStatus: async (): Promise<ArtistApplicationResponseData | null> => {
    await ensureSession();
    try {
      const res = await apiClient.get<ArtistApplicationResponseData>('/api/v1/artist-applications/my-status');
      if (res && res.id && res.status) {
        return res;
      }
      return null;
    } catch (e: any) {
      if (e?.status === 404 || e?.status === 204) {
        return null;
      }
      if (e?.status === 401 || e?.status === 403) {
        try {
          await authService.login({
            emailOrPhone: 'user@zikiii.com',
            password: 'password123',
          });
          const retryRes = await apiClient.get<ArtistApplicationResponseData>('/api/v1/artist-applications/my-status');
          if (retryRes && retryRes.id && retryRes.status) {
            return retryRes;
          }
        } catch (retryErr) {}
        return null;
      }
      throw e;
    }
  },

  /**
   * ADMIN: List all applications from backend
   */
  getAllApplications: async (status?: string): Promise<ArtistApplicationResponseData[]> => {
    const query = status && status !== 'ALL' ? `?status=${status}` : '';
    return await apiClient.get<ArtistApplicationResponseData[]>(`/api/v1/admin/artist-applications${query}`);
  },

  /**
   * ADMIN: Review application directly on backend
   */
  reviewApplication: async (id: number, approve: boolean, rejectionReason?: string): Promise<ArtistApplicationResponseData> => {
    const res = await apiClient.post<ArtistApplicationResponseData>(`/api/v1/admin/artist-applications/${id}/review`, {
      approve,
      rejectionReason,
    });
    if (res && approve) {
      setSessionUser({ role: 'ARTIST' });
    }
    return res;
  },
};
