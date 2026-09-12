import { apiClient } from './apiClient';

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

export const artistService = {
  /**
   * Submit artist upgrade application directly to backend
   */
  submitApplication: async (data: ArtistApplicationRequestData): Promise<ArtistApplicationResponseData> => {
    return await apiClient.post<ArtistApplicationResponseData>('/api/v1/artist-applications', data);
  },

  /**
   * Get current user's application status from backend
   */
  getMyApplicationStatus: async (): Promise<ArtistApplicationResponseData | null> => {
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
    return await apiClient.post<ArtistApplicationResponseData>(`/api/v1/admin/artist-applications/${id}/review`, {
      approve,
      rejectionReason,
    });
  },
};
