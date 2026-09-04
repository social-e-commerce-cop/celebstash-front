import { apiClient, API_BASE_URL } from './apiClient';
import { getSessionToken, setSessionUser } from './session';

export interface UserProfile {
  id: number;
  fullName: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  profilePicture?: string;
  role?: string;
  accountVerified?: boolean;
  fandomName?: string;
  gender?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface UpdateProfileData {
  fullName?: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
  fandomName?: string;
  gender?: string;
}

export const profileService = {
  /** Get current authenticated user's full profile */
  getMyProfile: async (): Promise<UserProfile | null> => {
    const token = getSessionToken();
    if (!token) {
      return null;
    }
    try {
      const data = await apiClient.get<UserProfile>('/api/v1/users/me');
      if (data && data.id) {
        setSessionUser({
          id: data.id,
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber,
          role: data.role,
        });
        return data;
      }
      return null;
    } catch (e: any) {
      if (e?.status === 403 || e?.status === 401) {
        return null;
      }
      throw e;
    }
  },

  /** Update current user's profile */
  updateMyProfile: async (profileData: UpdateProfileData): Promise<UserProfile> => {
    const data = await apiClient.put<UserProfile>('/api/v1/users/me', profileData);
    setSessionUser({
      id: data.id,
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });
    return data;
  },

  /** Upload a profile picture and return the URL */
  uploadProfilePicture: async (imageUri: string): Promise<string> => {
    const token = getSessionToken();
    const formData = new FormData();

    const fileName = imageUri.split('/').pop() || 'avatar.jpg';
    const mimeType = fileName.endsWith('.png') ? 'image/png' : 'image/jpeg';

    // React Native requires this shape for FormData file appending
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Profile picture upload failed with status ${response.status}: ${errorText}`);
    }

    // Backend returns the file URL as a plain string
    return response.text();
  },

  /** Get any user's public profile by their ID */
  getUserById: async (id: number): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`/api/v1/users/${id}`);
  },

  /** Get any user's public profile by their username */
  getUserByUsername: async (username: string): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`/api/v1/users/by-username/${encodeURIComponent(username)}`);
  },
};
