import { apiClient } from './apiClient';

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

export interface FollowUser {
  id: number;
  fullName: string;
  username: string;
  profilePicture?: string;
  accountVerified: boolean;
  relationship: string;
  isFollowing?: boolean;
}

export const followService = {
  /** Follow a user by their ID */
  followUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/follow/${userId}`);
  },

  /** Unfollow a user by their ID */
  unfollowUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/follow/${userId}`);
  },

  /** Get follower and following counts for a user */
  getFollowCounts: async (userId: number): Promise<FollowCounts> => {
    return apiClient.get<FollowCounts>(`/api/follow/users/${userId}/counts`);
  },

  /** Check if the current user is following the target user */
  checkFollowStatus: async (userId: number): Promise<boolean> => {
    const res = await apiClient.get<{ isFollowing: boolean }>(`/api/follow/users/${userId}/status`);
    return res.isFollowing;
  },

  /** Get the list of users who follow the given user */
  getFollowers: async (userId: number): Promise<FollowUser[]> => {
    return apiClient.get<FollowUser[]>(`/api/follow/users/${userId}/followers`);
  },

  /** Get the list of users the given user follows */
  getFollowing: async (userId: number): Promise<FollowUser[]> => {
    return apiClient.get<FollowUser[]>(`/api/follow/users/${userId}/following`);
  },

  /** Get suggested users to follow */
  getSuggestedUsers: async (): Promise<FollowUser[]> => {
    return apiClient.get<FollowUser[]>('/api/follow/suggestions');
  },

  /**
   * Get users for people pickers (sharing, tagging).
   * Uses the public search endpoint rather than the full admin-only directory.
   */
  getAllUsers: async (query = ''): Promise<FollowUser[]> => {
    return apiClient.get<FollowUser[]>(`/api/v1/users/search?query=${encodeURIComponent(query)}`);
  },
};
