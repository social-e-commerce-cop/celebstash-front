import { apiClient } from './apiClient';

/** Mirrors the backend NotificationResponse. */
export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  read: boolean;
  type: string;
  /** UTC instant, e.g. "2026-10-01T14:30:00Z". Format with lib/time. */
  createdAt: string;
  /**
   * What the notification is about: the post (LIKE, COMMENT, REPOST, STORY_POST_ACTIVITY,
   * LIKE_COMMENT_ACTIVITY), the conversation (NEW_MESSAGE), the follower (NEW_FOLLOWER) or the
   * story (STORY_INTERACTION).
   */
  relatedEntityId?: number | null;
  /** The user whose action caused it; null for system notifications (orders, KYC, …). */
  actorId?: number | null;
  actorName?: string | null;
  actorUsername?: string | null;
  actorAvatar?: string | null;
}

export const notificationService = {
  /** The most recent notifications, newest first. */
  getMyNotifications: async (): Promise<NotificationResponse[]> => {
    return apiClient.get<NotificationResponse[]>('/api/notifications');
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>('/api/notifications/unread-count');
    return Number(res?.count ?? 0);
  },

  /** Mark one notification as read (when the user opens it). */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/api/notifications/${id}/read`);
  },

  /** Explicit "Mark all as read" action. */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/api/notifications/read-all');
  },
};
