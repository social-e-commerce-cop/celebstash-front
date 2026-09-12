import { apiClient } from './apiClient';

export interface PostItem {
  id: number;
  description: string;
  videoUrl: string;
  photoUrls?: string[];
  userId: number;
  userFullName?: string;
  userAvatarUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  /** Matches the backend PostResponse wire format. */
  isLiked?: boolean;
  createdAt: string;
}

export const postsService = {
  getAllPosts: async (page = 0, size = 10) => {
    return apiClient.get(`/api/posts?page=${page}&size=${size}`);
  },

  getPostById: async (id: number) => {
    return apiClient.get(`/api/posts/${id}`);
  },

  likePost: async (id: number) => {
    return apiClient.post(`/api/posts/${id}/like`);
  },

  unlikePost: async (id: number) => {
    return apiClient.delete(`/api/posts/${id}/like`);
  },
};
