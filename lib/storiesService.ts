import { apiClient } from './apiClient';

export interface StoryItem {
  id: number;
  userId: number;
  userName: string;
  userFullName?: string;
  userAvatarUrl?: any;
  userRole?: string;
  mediaUrl: any;
  thumbnailUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS';
  productId?: number;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  reactionCount: number;
  replyCount: number;
  shareCount: number;
  allowReplies: boolean;
  allowReactions: boolean;
  isArchived: boolean;
  isViewedByMe: boolean;
  myReaction?: string;
  hasSticker?: boolean;
}

export interface StoryGroup {
  userId: number;
  username: string;
  userFullName?: string;
  userAvatar: any;
  userRole?: string;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export const storiesService = {
  getFeedStories: async (): Promise<StoryItem[]> => {
    try {
      const res = await apiClient.get<StoryItem[]>('/api/stories/feed');
      return res;
    } catch {
      // Fallback mock stories if backend API is offline
      return MOCK_STORIES;
    }
  },

  createStory: async (data: {
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    caption?: string;
    visibility?: 'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS';
    allowReplies?: boolean;
    allowReactions?: boolean;
  }) => {
    try {
      return await apiClient.post<StoryItem>('/api/stories', data);
    } catch {
      const newStory: StoryItem = {
        id: Date.now(),
        userId: 99,
        userName: 'You',
        mediaUrl: data.mediaUrl || require('../assets/images/storyItem.jpg'),
        mediaType: data.mediaType || 'IMAGE',
        caption: data.caption,
        visibility: data.visibility || 'PUBLIC',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        viewCount: 0,
        reactionCount: 0,
        replyCount: 0,
        shareCount: 0,
        allowReplies: data.allowReplies !== false,
        allowReactions: data.allowReactions !== false,
        isArchived: false,
        isViewedByMe: true,
      };
      MOCK_STORIES.unshift(newStory);
      return newStory;
    }
  },

  recordView: async (storyId: number, watchDuration = 5, completed = true) => {
    try {
      await apiClient.post(`/api/stories/${storyId}/view`, { watchDuration, completed });
    } catch {
      const found = MOCK_STORIES.find((s) => s.id === storyId);
      if (found) {
        found.isViewedByMe = true;
        found.viewCount += 1;
      }
    }
  },

  reactToStory: async (storyId: number, emoji: string) => {
    try {
      await apiClient.post(`/api/stories/${storyId}/react`, { emoji });
    } catch {
      const found = MOCK_STORIES.find((s) => s.id === storyId);
      if (found) {
        found.myReaction = emoji;
        found.reactionCount += 1;
      }
    }
  },

  replyToStory: async (storyId: number, message: string) => {
    try {
      await apiClient.post(`/api/stories/${storyId}/reply`, { message });
    } catch {
      const found = MOCK_STORIES.find((s) => s.id === storyId);
      if (found) {
        found.replyCount += 1;
      }
    }
  },

  deleteStory: async (storyId: number) => {
    try {
      await apiClient.delete(`/api/stories/${storyId}`);
    } catch {
      const idx = MOCK_STORIES.findIndex((s) => s.id === storyId);
      if (idx !== -1) MOCK_STORIES.splice(idx, 1);
    }
  },

  getArchivedStories: async (): Promise<StoryItem[]> => {
    try {
      return await apiClient.get<StoryItem[]>('/api/stories/archive');
    } catch {
      return MOCK_STORIES.filter((s) => s.isArchived);
    }
  },
};

const MOCK_STORIES: StoryItem[] = [
  {
    id: 1,
    userId: 101,
    userName: 'Kenny K Shot',
    userFullName: 'Kenny K Shot',
    userAvatarUrl: require('../assets/images/story1.png'),
    userRole: 'ARTIST',
    mediaUrl: require('../assets/images/feed6.jpg'),
    mediaType: 'IMAGE',
    caption: 'Eras Tour opening night crystal jacket! 🔥 Tap to shop',
    visibility: 'PUBLIC',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewCount: 1420,
    reactionCount: 312,
    replyCount: 45,
    shareCount: 88,
    allowReplies: true,
    allowReactions: true,
    isArchived: false,
    isViewedByMe: false,
    hasSticker: true,
  },
  {
    id: 2,
    userId: 102,
    userName: 'blue_boy',
    userFullName: 'Blue Boy',
    userAvatarUrl: require('../assets/images/storyItem.jpg'),
    userRole: 'USER',
    mediaUrl: require('../assets/images/drop1.jpg'),
    mediaType: 'IMAGE',
    caption: 'Late night studio sessions producing ambient soundscapes 🌊',
    visibility: 'PUBLIC',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewCount: 450,
    reactionCount: 89,
    replyCount: 12,
    shareCount: 19,
    allowReplies: true,
    allowReactions: true,
    isArchived: false,
    isViewedByMe: true,
  },
];
