import { apiClient } from './apiClient';
import { parseServerDate } from './time';

/** Mirrors the backend StoryResponse (com.celebstash.backend.dto.StoryResponse). */
export interface StoryItem {
  id: number;
  userId: number;
  /** Public handle; null for accounts without one (use userFullName). */
  username?: string | null;
  userFullName?: string;
  userAvatar?: string | null;
  userRole?: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string | null;
  visibility: 'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS';
  productId?: number | null;
  /** UTC instants; expiry is set by the server (24h after creation). */
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
  myReaction?: string | null;
}

/** One artist's active stories, oldest first (the order they are watched in). */
export interface StoryGroup {
  userId: number;
  username: string;
  userFullName?: string;
  userAvatar?: string | null;
  userRole?: string;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export interface StoryViewer {
  userId: number;
  fullName: string;
  username?: string | null;
  avatar?: string | null;
  viewedAt: string;
  reaction?: string | null;
}

export const STORY_REACTIONS = ['❤️', '😂', '😍', '😮', '👏', '🔥'];

/** Only artists (and admins) publish stories; the backend enforces the same rule. */
export const canPostStories = (role?: string) => role === 'ARTIST' || role === 'ADMIN';

/**
 * The server only returns unexpired stories, but a list fetched earlier can age past expiry while
 * the app is open, so the client drops those too.
 */
export const isStoryActive = (s: StoryItem, now = Date.now()) => {
  const exp = parseServerDate(s.expiresAt);
  return !s.isArchived && (!exp || exp.getTime() > now);
};

/**
 * Groups stories by artist. Artists with unseen stories come first, then the most recently
 * updated; the viewer's own group (if any) is pinned to the front.
 */
export function groupStories(stories: StoryItem[], myUserId?: number): StoryGroup[] {
  const byUser = new Map<number, StoryItem[]>();
  for (const s of stories) {
    if (!isStoryActive(s)) continue;
    const list = byUser.get(s.userId) ?? [];
    list.push(s);
    byUser.set(s.userId, list);
  }

  const latest = (g: StoryGroup) => parseServerDate(g.stories[g.stories.length - 1]?.createdAt)?.getTime() ?? 0;

  const groups: StoryGroup[] = Array.from(byUser.values()).map((list) => {
    const sorted = [...list].sort(
      (a, b) => (parseServerDate(a.createdAt)?.getTime() ?? 0) - (parseServerDate(b.createdAt)?.getTime() ?? 0)
    );
    const first = sorted[0];
    return {
      userId: first.userId,
      username: first.username || first.userFullName || 'artist',
      userFullName: first.userFullName,
      userAvatar: first.userAvatar,
      userRole: first.userRole,
      hasUnseen: sorted.some((s) => !s.isViewedByMe),
      stories: sorted,
    };
  });

  return groups.sort((a, b) => {
    if (myUserId !== undefined) {
      if (Number(a.userId) === Number(myUserId)) return -1;
      if (Number(b.userId) === Number(myUserId)) return 1;
    }
    if (a.hasUnseen !== b.hasUnseen) return a.hasUnseen ? -1 : 1;
    return latest(b) - latest(a);
  });
}

export const storiesService = {
  /** Active stories from all artists. Throws on failure — there is no offline fallback data. */
  getFeedStories: (): Promise<StoryItem[]> => apiClient.get<StoryItem[]>('/api/stories/feed'),

  getUserStories: (userId: number): Promise<StoryItem[]> =>
    apiClient.get<StoryItem[]>(`/api/stories/user/${userId}`),

  /** Artists only; the server rejects other roles with 403. */
  createStory: (data: {
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    caption?: string;
    visibility?: 'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS';
    allowReplies?: boolean;
    allowReactions?: boolean;
  }): Promise<StoryItem> => apiClient.post<StoryItem>('/api/stories', data),

  /** Counted once per viewer by the server; the author's own views are not counted. */
  recordView: async (storyId: number, watchDuration = 5, completed = true): Promise<void> => {
    await apiClient.post(`/api/stories/${storyId}/view`, { watchDuration, completed });
  },

  /** One reaction per user per story; reacting again replaces it. */
  reactToStory: (storyId: number, emoji: string): Promise<{ myReaction: string; reactionCount: number }> =>
    apiClient.post(`/api/stories/${storyId}/react`, { emoji }),

  removeReaction: (storyId: number): Promise<{ reactionCount: number }> =>
    apiClient.delete(`/api/stories/${storyId}/react`),

  replyToStory: async (storyId: number, message: string): Promise<void> => {
    await apiClient.post(`/api/stories/${storyId}/reply`, { message });
  },

  /** Author only. */
  getViewers: (storyId: number): Promise<StoryViewer[]> =>
    apiClient.get<StoryViewer[]>(`/api/stories/${storyId}/viewers`),

  deleteStory: async (storyId: number): Promise<void> => {
    await apiClient.delete(`/api/stories/${storyId}`);
  },

  getArchivedStories: (): Promise<StoryItem[]> => apiClient.get<StoryItem[]>('/api/stories/archive'),
};
