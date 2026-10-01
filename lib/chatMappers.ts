/**
 * chatMappers.ts — the single place backend chat DTOs become the local UI types.
 *
 * Every chat screen used to carry its own copy of this mapping, which is how the "my own
 * messages render as incoming" bug appeared: the components decide direction by comparing an id
 * against the literal 'me', but the mappers were passing through the numeric backend id, so only
 * optimistic messages ever matched. Mapping in one place, with the signed-in user's id supplied,
 * keeps that convention correct everywhere.
 *
 * The real backend id is never thrown away — it stays on `userId` so member management can call
 * the API with it.
 */
import { Conversation, ChatUser, Message, SharedMediaItem } from '@/types/chatTypes';
import { ConversationDto, MessageDto, ParticipantDto } from './chatService';
import { resolveImageUrl } from './apiClient';

const FALLBACK_AVATAR = require('../assets/images/storyItem.jpg');

/** Components compare against this literal to decide "mine vs theirs". */
export const ME = 'me';

const localId = (id: number, myId: number) => (id === myId ? ME : String(id));

/**
 * Asks Cloudinary to deliver a format the device can actually decode.
 *
 * Uploads keep their original extension, and real listings in this database include `.heic`
 * files from iPhones, which Android cannot render at all — the card would show an empty box
 * with no error. `f_auto` makes Cloudinary negotiate the format per client and `q_auto` trims
 * the payload. Only `/image/upload/` accepts transformations; `/raw/upload/` and non-Cloudinary
 * URLs are passed through untouched.
 */
function deliverable(url: string): string {
  if (!url.includes('/image/upload/')) return url;
  if (/\/image\/upload\/[^/]*[fq]_auto/.test(url)) return url;   // already transformed
  return url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
}

function imageUri(url: string): string {
  return deliverable(resolveImageUrl(url));
}

function avatarOf(url: string | null | undefined) {
  return url ? { uri: imageUri(url) } : FALLBACK_AVATAR;
}

export function toLocalParticipant(p: ParticipantDto, myId: number): ChatUser {
  return {
    id: localId(p.id, myId),
    userId: p.id,
    name: p.id === myId ? 'You' : p.fullName,
    username: p.username,
    avatar: avatarOf(p.profilePicture),
    isOnline: false,
  };
}

export function toLocalConversation(dto: ConversationDto, myId: number): Conversation {
  return {
    id: String(dto.id),
    type: dto.type === 'GROUP' ? 'group' : 'direct',
    participants: dto.participants.map(p => toLocalParticipant(p, myId)),
    lastMessage: dto.lastMessage
      ? {
          text: dto.lastMessage.text ?? '',
          timestamp: dto.lastMessage.sentAt,
          senderId: localId(dto.lastMessage.senderId, myId),
          type: (dto.lastMessage.type?.toLowerCase() as any) ?? 'text',
        }
      : undefined,
    unreadCount: dto.unreadCount,
    isPinned: dto.isPinned,
    isMuted: dto.isMuted,
    isArchived: dto.isArchived,
    isFavorite: dto.isFavorite,
    hasStory: false,
    isTyping: false,
    groupInfo:
      dto.type === 'GROUP'
        ? {
            name: dto.groupName ?? 'Group',
            avatar: dto.groupAvatar ? { uri: imageUri(dto.groupAvatar) } : undefined,
            description: dto.groupDescription ?? '',
            adminIds: dto.participants.filter(p => p.isAdmin).map(p => localId(p.id, myId)),
            createdAt: dto.updatedAt,
            createdBy: dto.createdById != null ? localId(dto.createdById, myId) : '',
          }
        : undefined,
  };
}

export function toLocalMessage(dto: MessageDto, myId: number): Message {
  return {
    id: String(dto.id),
    conversationId: String(dto.conversationId),
    senderId: localId(dto.senderId, myId),
    senderName: dto.senderName,
    type: (dto.type?.toLowerCase() as any) ?? 'text',
    text: dto.content ?? undefined,
    imageUri: dto.mediaUrl && dto.type === 'IMAGE' ? { uri: imageUri(dto.mediaUrl) } : undefined,
    videoUri: dto.mediaUrl && dto.type === 'VIDEO' ? imageUri(dto.mediaUrl) : undefined,
    voiceUri: dto.mediaUrl && dto.type === 'VOICE' ? imageUri(dto.mediaUrl) : undefined,
    voiceDuration: dto.voiceDuration ?? undefined,
    document: dto.documentName
      ? { name: dto.documentName, size: dto.documentSize ?? '', type: 'pdf', uri: dto.mediaUrl ?? undefined }
      : undefined,
    systemText: dto.systemText ?? undefined,
    timestamp: dto.sentAt,
    readStatus: (dto.readStatus?.toLowerCase() as any) ?? 'sent',
    replyTo: dto.replyTo
      ? { messageId: String(dto.replyTo.messageId), text: dto.replyTo.text, sender: dto.replyTo.senderName }
      : undefined,
    reactions: dto.reactions.map(r => ({ emoji: r.emoji, count: r.count, reactedByMe: r.reactedByMe })),
    isEdited: dto.isEdited,
    isDeleted: dto.isDeleted,
    isPinned: dto.isPinned,
    isStarred: dto.isStarred,
    // Shared product/post arrive as live references, so a card always shows the catalogue's
    // current name and price rather than a copy taken when the message was sent.
    product: dto.sharedProduct
      ? {
          id: String(dto.sharedProduct.id),
          name: dto.sharedProduct.name,
          price: dto.sharedProduct.price,
          image: avatarOf(dto.sharedProduct.imageUrl),
          artistName: dto.sharedProduct.sellerName ?? undefined,
        }
      : undefined,
    sharedPost: dto.sharedPost
      ? {
          id: dto.sharedPost.id,
          userName: dto.sharedPost.authorName ?? 'Unknown',
          userImage: FALLBACK_AVATAR,
          timeAgo: '',
          verified: false,
          postText: dto.sharedPost.description ?? '',
          mainImage: avatarOf(dto.sharedPost.imageUrl),
          price: '',
          likes: 0,
          comments: 0,
          shares: 0,
          trending: '',
        }
      : undefined,
  };
}

/** Turns an attachment message into a gallery entry for the shared-media screens. */
export function toSharedMediaItem(dto: MessageDto, myId: number): SharedMediaItem | null {
  const m = toLocalMessage(dto, myId);
  switch (dto.type) {
    case 'IMAGE':
      return m.imageUri ? { id: m.id, type: 'photo', uri: m.imageUri, timestamp: m.timestamp } : null;
    case 'VIDEO':
      return m.videoUri
        ? { id: m.id, type: 'video', uri: { uri: m.videoUri }, timestamp: m.timestamp }
        : null;
    case 'DOCUMENT':
      return m.document
        ? {
            id: m.id,
            type: 'document',
            document: m.document,
            title: m.document.name,
            size: m.document.size,
            timestamp: m.timestamp,
          }
        : null;
    case 'LINK':
      return { id: m.id, type: 'link', title: m.text ?? '', timestamp: m.timestamp };
    default:
      return null;
  }
}

// ── Display helpers ──────────────────────────────────────────────────────────
// Pure functions over an already-mapped Conversation. They live here rather than beside the
// fixtures they were originally written for, so no screen has to import mock data to render a
// real conversation.

export const getOtherUser = (conv: Conversation): ChatUser =>
  conv.participants.find(p => p.id !== ME) ?? conv.participants[0];

export const getConversationName = (conv: Conversation): string => {
  if (conv.type === 'group' && conv.groupInfo) return conv.groupInfo.name;
  return getOtherUser(conv)?.name ?? 'Chat';
};

export const getConversationAvatar = (conv: Conversation): any => {
  if (conv.type === 'group' && conv.groupInfo?.avatar) return conv.groupInfo.avatar;
  return getOtherUser(conv)?.avatar ?? FALLBACK_AVATAR;
};

export const isGroupAdmin = (conv: Conversation, participantId: string): boolean =>
  !!conv.groupInfo?.adminIds.includes(participantId);
