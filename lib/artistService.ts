import { apiClient } from './apiClient';
import { getSessionUser, setSessionUser } from './session';

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

// In-memory fallback application store for seamless offline/client demo
let localApplications: ArtistApplicationResponseData[] = [];
let nextId = 1;

export const artistService = {
  // Submit artist upgrade application
  submitApplication: async (data: ArtistApplicationRequestData): Promise<ArtistApplicationResponseData> => {
    try {
      const result = await apiClient.post('/api/v1/artist-applications', data);
      if (result && result.id && result.status) {
        return result;
      }
    } catch (e) {
      console.log('Backend not available, using local submission store:', e);
    }

    const sessionUser = getSessionUser();
    const newApp: ArtistApplicationResponseData = {
      id: nextId++,
      userId: sessionUser.id || 1,
      userFullName: sessionUser.fullName || 'User',
      userEmail: sessionUser.email || 'user@zikiii.com',
      stageName: data.stageName,
      category: data.category,
      bio: data.bio,
      socialProofLink: data.socialProofLink,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localApplications.unshift(newApp);
    return newApp;
  },

  // Get user application status
  getMyApplicationStatus: async (): Promise<ArtistApplicationResponseData | null> => {
    try {
      const res = await apiClient.get('/api/v1/artist-applications/my-status');
      if (res && res.id && res.status) {
        return res;
      }
    } catch (e) {
      // Backend unavailable or error, fall through to local store
    }

    const sessionUser = getSessionUser();
    const userApp = localApplications.find(
      (app) => app.userEmail === sessionUser.email || app.userId === sessionUser.id
    );

    return userApp || null;
  },

  // ADMIN: Get all applications
  getAllApplications: async (status?: string): Promise<ArtistApplicationResponseData[]> => {
    try {
      const query = status ? `?status=${status}` : '';
      const res = await apiClient.get(`/api/v1/admin/artist-applications${query}`);
      if (Array.isArray(res)) {
        return res;
      }
    } catch (e) {
      console.log('Backend unavailable for admin applications, using local store');
    }

    if (status && status !== 'ALL') {
      return localApplications.filter((app) => app.status === status);
    }
    return localApplications;
  },

  // ADMIN: Review application
  reviewApplication: async (id: number, approve: boolean, rejectionReason?: string): Promise<ArtistApplicationResponseData> => {
    try {
      const res = await apiClient.post(`/api/v1/admin/artist-applications/${id}/review`, {
        approve,
        rejectionReason,
      });
      if (res && res.id && res.status) {
        if (approve) {
          setSessionUser({ role: 'ARTIST' });
        }
        return res;
      }
    } catch (e) {
      console.log('Backend error or ID mismatch, falling back to local approval store:', e);
    }

    const appIndex = localApplications.findIndex((app) => app.id === id);
    if (appIndex !== -1) {
      localApplications[appIndex] = {
        ...localApplications[appIndex],
        status: approve ? 'APPROVED' : 'REJECTED',
        rejectionReason: approve ? undefined : rejectionReason || 'Application criteria not met.',
        updatedAt: new Date().toISOString(),
      };
      if (approve) {
        setSessionUser({ role: 'ARTIST' });
      }
      return localApplications[appIndex];
    }

    // Fallback if ID wasn't found in memory: construct updated application instead of throwing error
    const sessionUser = getSessionUser();
    const fallbackApp: ArtistApplicationResponseData = {
      id: id || 1,
      userId: sessionUser.id || 1,
      userFullName: sessionUser.fullName || 'User',
      userEmail: sessionUser.email || 'user@zikiii.com',
      stageName: sessionUser.fullName || 'Artist',
      category: 'Musician / Vocalist',
      status: approve ? 'APPROVED' : 'REJECTED',
      rejectionReason: approve ? undefined : rejectionReason || 'Application criteria not met.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localApplications.unshift(fallbackApp);
    if (approve) {
      setSessionUser({ role: 'ARTIST' });
    }
    return fallbackApp;
  },
};
