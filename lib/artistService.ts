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
  // Submit artist upgrade application
  submitApplication: async (data: ArtistApplicationRequestData): Promise<ArtistApplicationResponseData> => {
    return apiClient.post('/api/v1/artist-applications', data);
  },

  // Get user application status
  getMyApplicationStatus: async (): Promise<ArtistApplicationResponseData | null> => {
    try {
      return await apiClient.get('/api/v1/artist-applications/my-status');
    } catch {
      return null;
    }
  },

  // ADMIN: Get all applications
  getAllApplications: async (status?: string): Promise<ArtistApplicationResponseData[]> => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get(`/api/v1/admin/artist-applications${query}`);
  },

  // ADMIN: Review application
  reviewApplication: async (id: number, approve: boolean, rejectionReason?: string): Promise<ArtistApplicationResponseData> => {
    return apiClient.post(`/api/v1/admin/artist-applications/${id}/review`, {
      approve,
      rejectionReason,
    });
  },
};
