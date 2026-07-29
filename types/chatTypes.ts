// ─── Chat Module Types ───────────────────────────────────────────────────────

// ── User ──
export interface ChatUser {
  id: string;
  name: string;
  avatar: any; // require() image or { uri: string }
  isOnline: boolean;
  lastSeen?: string; // ISO timestamp
  phone?: string;
  email?: string;
  bio?: string;
}

// ── Message Read Status ──
export type ReadStatus = 'sending' | 'sent' | 'delivered' | 'read';

// ── Message Content Types ──
export type MessageContentType =
  | 'text'
  | 'image'
  | 'video'
  | 'voice'
  | 'document'
  | 'link'
  | 'product'
  | 'post'
  | 'sticker'
  | 'gif'
  | 'system';

// ── Reaction ──
export interface Reaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

// ── Reply Reference ──
export interface ReplyReference {
  messageId: string;
  text: string;
  sender: string;
  type?: MessageContentType;
}

// ── Product Card Data ──
export interface ProductCardData {
  id: string;
  name: string;
  price: string | number;
  image: any;
  artistName?: string;
  verified?: boolean;
  description?: string;
}

// ── Shared Post Data (for posts shared in chat) ──
export interface SharedPostData {
  id: number;
  userName: string;
  userImage: any;
  timeAgo: string;
  verified: boolean;
  postText: string;
  mainImage: any;
  price: string;
  likes: number;
  comments: number;
  shares: number;
  trending: string;
}

// ── Document Data ──
export interface DocumentData {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'xls' | 'ppt' | 'zip' | 'txt' | 'other';
  uri?: string;
}

// ── Link Preview Data ──
export interface LinkPreviewData {
  url: string;
  title: string;
  description?: string;
  image?: any;
  domain: string;
}

// ── Message ──
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string; // for display in groups
  type: MessageContentType;
  text?: string;
  imageUri?: any;
  videoUri?: string;
  voiceUri?: string;
  voiceDuration?: number; // seconds
  document?: DocumentData;
  linkPreview?: LinkPreviewData;
  product?: ProductCardData;
  sharedPost?: SharedPostData; // for shared feed posts
  stickerUri?: string;
  gifUri?: string;
  systemText?: string; // for system messages
  timestamp: string; // ISO
  readStatus: ReadStatus;
  replyTo?: ReplyReference;
  reactions: Reaction[];
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  isStarred: boolean;
  mentions?: string[]; // user IDs mentioned with @
}

// ── Group Info ──
export interface GroupInfo {
  name: string;
  avatar?: any;
  description?: string;
  adminIds: string[];
  createdAt: string;
  createdBy: string;
}

// ── Conversation ──
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: ChatUser[];
  lastMessage?: {
    text: string;
    timestamp: string;
    senderId: string;
    type: MessageContentType;
  };
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  hasStory: boolean;
  isTyping: boolean;
  typingUser?: string; // name of who's typing
  groupInfo?: GroupInfo;
}

// ── Chat Filter Tab ──
export type ChatFilterTab = 'All' | 'Unread' | 'Favorites' | 'Groups' | 'Archived';

// ── Notification Types ──
export type ChatNotificationType =
  | 'new_message'
  | 'message_reaction'
  | 'mention'
  | 'group_activity'
  | 'missed_voice_call'
  | 'missed_video_call';

export interface ChatNotification {
  id: string;
  type: ChatNotificationType;
  fromUser: ChatUser;
  conversationId?: string;
  message?: string;
  timestamp: string;
  isRead: boolean;
  groupName?: string;
  reactionEmoji?: string;
}

// ── Shared Media ──
export interface SharedMediaItem {
  id: string;
  type: 'photo' | 'video' | 'document' | 'link' | 'voice' | 'product';
  uri?: any;
  thumbnail?: any;
  title?: string;
  size?: string;
  duration?: number;
  timestamp: string;
  document?: DocumentData;
  linkPreview?: LinkPreviewData;
  product?: ProductCardData;
}

// ── Search ──
export type SearchCategory = 'messages' | 'people' | 'media' | 'documents' | 'links' | 'voice';

export interface SearchResult {
  category: SearchCategory;
  id: string;
  title: string;
  subtitle?: string;
  avatar?: any;
  timestamp?: string;
  conversationId?: string;
  messageId?: string;
  highlightText?: string;
}

// ── Message Action ──
export type MessageAction =
  | 'reply'
  | 'forward'
  | 'copy'
  | 'edit'
  | 'delete_for_me'
  | 'delete_for_everyone'
  | 'react'
  | 'pin'
  | 'star'
  | 'report';

// ── Call ──
export interface CallData {
  id: string;
  type: 'voice' | 'video';
  callerName: string;
  callerAvatar: any;
  status: 'ringing' | 'connected' | 'ended' | 'missed';
  duration?: number;
  timestamp: string;
}
