import { apiClient } from './apiClient';

export interface NotificationResponse {
  id: number;
  title: string;
  content: string;
  read: boolean;
  type: string;
  createdAt: string;
  relatedEntityId?: number;
}

export const notificationService = {
  /** Get all notifications for the current user */
  getMyNotifications: async (): Promise<NotificationResponse[]> => {
    return apiClient.get<NotificationResponse[]>('/api/notifications');
  },

  /** Mark a notification as read */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/api/notifications/${id}/read`);
  },
};
