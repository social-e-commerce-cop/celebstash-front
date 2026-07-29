import { apiClient } from './apiClient';

export interface StoryItem {
  id: number;
  userId: number;
  userName?: string;
  userAvatarUrl?: string;
  mediaUrl: string;
  caption?: string;
  type: 'IMAGE' | 'VIDEO' | 'TEXT' | 'PRODUCT';
  productId?: number;
  createdAt: string;
  expiresAt: string;
  isViewed?: boolean;
}

export const storiesService = {
  getActiveStories: async () => {
    return apiClient.get<StoryItem[]>('/api/stories');
  },

  getUnviewedStories: async () => {
    return apiClient.get<StoryItem[]>('/api/stories/unviewed');
  },

  getStoryById: async (id: number) => {
    return apiClient.get<StoryItem>(`/api/stories/${id}`);
  },

  createStory: async (story: { mediaUrl: string; caption?: string; type?: string; productId?: number }) => {
    return apiClient.post<StoryItem>('/api/stories', story);
  },

  deleteStory: async (id: number) => {
    return apiClient.delete(`/api/stories/${id}`);
  },
};
