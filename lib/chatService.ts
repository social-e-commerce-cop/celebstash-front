/**
 * chatService.ts — REST API layer for the chat module.
 * All calls go through the shared apiClient (JWT-authenticated).
 */
import { apiClient } from './apiClient';

// ── Types matching the backend DTOs ──────────────────────────────────────────

export interface ParticipantDto {
  id: number;
  fullName: string;
  username: string;
  profilePicture: string | null;
  isAdmin: boolean;
}

export interface LastMessageDto {
  text: string | null;
  senderId: number;
  type: string;
  sentAt: string;
}

export interface ConversationDto {
  id: number;
  type: 'DIRECT' | 'GROUP';
  groupName: string | null;
  groupAvatar: string | null;
  groupDescription: string | null;
  createdById: number | null;
  participants: ParticipantDto[];
  lastMessage: LastMessageDto | null;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  updatedAt: string;
}

export interface ReplyRefDto {
  messageId: number;
  text: string;
  senderName: string;
}

export interface ReactionDto {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  type: 'TEXT' | 'IMAGE' | 'VOICE' | 'VIDEO' | 'DOCUMENT' | 'LINK' | 'PRODUCT' | 'POST' | 'SYSTEM';
  content: string | null;
  mediaUrl: string | null;
  voiceDuration: number | null;
  documentName: string | null;
  documentSize: string | null;
  systemText: string | null;
  replyTo: ReplyRefDto | null;
  readStatus: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ';
  isPinned: boolean;
  isStarred: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  reactions: ReactionDto[];
  sentAt: string;
}

export interface PagedMessages {
  content: MessageDto[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
}

export interface UserSearchResult {
  id: number;
  fullName: string;
  username: string;
  profilePicture: string | null;
  bio: string | null;
}

// ── Requests ─────────────────────────────────────────────────────────────────

export interface SendMessageRequest {
  type: MessageDto['type'];
  content?: string;
  mediaUrl?: string;
  voiceDuration?: number;
  documentName?: string;
  documentSize?: string;
  replyToId?: number;
  systemText?: string;
}

// ── Service ──────────────────────────────────────────────────────────────────

export const chatService = {

  // ── Conversations ─────────────────────────────────────────────────────────

  getConversations: (): Promise<ConversationDto[]> =>
    apiClient.get('/api/chat/conversations'),

  startDirectConversation: (targetUserId: number): Promise<ConversationDto> =>
    apiClient.post('/api/chat/conversations', { targetUserId }),

  createGroup: (name: string, description: string, memberIds: number[], avatarUrl?: string): Promise<ConversationDto> =>
    apiClient.post('/api/chat/groups', { name, description, memberIds, avatarUrl }),

  updateGroup: (conversationId: number, name?: string, description?: string, avatarUrl?: string): Promise<ConversationDto> =>
    apiClient.put(`/api/chat/conversations/${conversationId}/group`, { name, description, avatarUrl }),

  toggleMute: (conversationId: number): Promise<void> =>
    apiClient.put(`/api/chat/conversations/${conversationId}/mute`),

  toggleArchive: (conversationId: number): Promise<void> =>
    apiClient.put(`/api/chat/conversations/${conversationId}/archive`),

  togglePin: (conversationId: number): Promise<void> =>
    apiClient.put(`/api/chat/conversations/${conversationId}/pin`),

  toggleFavorite: (conversationId: number): Promise<void> =>
    apiClient.put(`/api/chat/conversations/${conversationId}/favorite`),

  // ── Messages ──────────────────────────────────────────────────────────────

  getMessages: (conversationId: number, page = 0, size = 40): Promise<PagedMessages> =>
    apiClient.get(`/api/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`),

  sendMessage: (conversationId: number, req: SendMessageRequest): Promise<MessageDto> =>
    apiClient.post(`/api/chat/conversations/${conversationId}/messages`, req),

  editMessage: (messageId: number, content: string): Promise<MessageDto> =>
    apiClient.put(`/api/chat/messages/${messageId}`, { content }),

  deleteMessage: (messageId: number, forEveryone = false): Promise<void> =>
    apiClient.delete(`/api/chat/messages/${messageId}?forEveryone=${forEveryone}`),

  toggleMessagePin: (messageId: number): Promise<MessageDto> =>
    apiClient.put(`/api/chat/messages/${messageId}/pin`),

  toggleMessageStar: (messageId: number): Promise<MessageDto> =>
    apiClient.put(`/api/chat/messages/${messageId}/star`),

  reactToMessage: (messageId: number, emoji: string): Promise<MessageDto> =>
    apiClient.post(`/api/chat/messages/${messageId}/react?emoji=${encodeURIComponent(emoji)}`),

  // Upload file and get back a URL to attach to a message
  uploadFile: async (uri: string, mimeType: string, filename: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', { uri, type: mimeType, name: filename } as any);
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
    const text = await response.text();
    return text;
  },

  // ── User search ───────────────────────────────────────────────────────────

  searchUsers: (query: string): Promise<UserSearchResult[]> =>
    apiClient.get(`/api/chat/users/search?q=${encodeURIComponent(query)}`),
};
