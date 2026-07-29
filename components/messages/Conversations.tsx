import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation, MessageContentType } from '@/types/chatTypes';
import { getOtherUser, getConversationName, getConversationAvatar } from '@/data/mockChatData';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';
const AVATAR_SIZE = 52;
const STORY_WIDTH = 3;
const STORY_PAD = 3;

interface ConversationItemProps {
  conversation: Conversation;
  onPress?: () => void;
  onLongPress?: () => void;
}

// ── Icon hint for message type ──
const typeIcon = (type?: MessageContentType): string => {
  switch (type) {
    case 'image': return '📷 ';
    case 'video': return '🎬 ';
    case 'voice': return '🎤 ';
    case 'document': return '📄 ';
    case 'product': return '🛍️ ';
    case 'link': return '🔗 ';
    case 'sticker': return '😀 ';
    case 'gif': return 'GIF ';
    default: return '';
  }
};

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress, onLongPress }) => {
  const conv = conversation;
  const name = getConversationName(conv);
  const hasUnread = conv.unreadCount > 0;
  const isGroup = conv.type === 'group';
  const otherUser = !isGroup ? getOtherUser(conv) : null;
  const isOnline = otherUser?.isOnline ?? false;

  // ── Avatar ──
  const renderAvatar = () => {
    if (isGroup && conv.participants.length > 2) {
      const members = conv.participants.filter(p => p.id !== 'me').slice(0, 3);
      return (
        <View style={styles.groupContainer}>
          {members.map((m, i) => (
            <View key={m.id} style={[styles.groupAvatarWrap, { left: i * 18, zIndex: 3 - i }]}>
              <Image source={m.avatar} style={styles.groupAvatar} />
            </View>
          ))}
        </View>
      );
    }

    const avatar = getConversationAvatar(conv);
    return (
      <View style={styles.avatarWrapper}>
        <View style={[styles.singleWrap, conv.hasStory && styles.storyRing]}>
          <Image source={avatar} style={styles.singleAvatar} />
        </View>
        {isOnline && !isGroup && <View style={styles.onlineDot} />}
      </View>
    );
  };

  // ── Last message prefix ──
  const getSenderPrefix = (): string => {
    if (!conv.lastMessage) return '';
    if (conv.lastMessage.senderId === 'me') return 'You: ';
    if (isGroup) {
      const sender = conv.participants.find(p => p.id === conv.lastMessage!.senderId);
      return sender ? `${sender.name.split(' ')[0]}: ` : '';
    }
    return '';
  };

  const lastMsgType = conv.lastMessage?.type;
  const lastMsgText = conv.lastMessage?.text ?? '';
  const senderPrefix = getSenderPrefix();
  const isRead = conv.unreadCount === 0;

  // ── Timestamp ──
  const formatTimestamp = (ts?: string): string => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={[styles.row, hasUnread && styles.rowUnread]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={400}
    >
      {renderAvatar()}

      <View style={styles.body}>
        <View style={styles.topLine}>
          <View style={styles.nameRow}>
            {conv.isPinned && <Text style={styles.pinIcon}>📌 </Text>}
            {conv.isFavorite && <Text style={styles.favIcon}>⭐ </Text>}
            <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
              {name}
            </Text>
            {conv.isMuted && (
              <Ionicons name="volume-mute" size={14} color="#9CA3AF" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={[styles.timestamp, hasUnread && styles.timestampUnread]}>
            {formatTimestamp(conv.lastMessage?.timestamp)}
          </Text>
        </View>

        <View style={styles.bottomLine}>
          {conv.isTyping ? (
            <Text style={styles.typingText} numberOfLines={1}>
              {conv.typingUser ? `${conv.typingUser} is typing…` : 'typing…'}
            </Text>
          ) : (
            <Text numberOfLines={1} style={[styles.preview, hasUnread && styles.previewUnread]}>
              {senderPrefix ? <Text style={styles.senderPrefix}>{senderPrefix}</Text> : null}
              {typeIcon(lastMsgType)}{lastMsgText}
            </Text>
          )}

          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </Text>
            </View>
          ) : (
            conv.lastMessage?.senderId === 'me' && (
              <Text style={styles.readTick}>✓✓</Text>
            )
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  rowUnread: {
    backgroundColor: '#F8F5FF',
  },

  // ── Avatars ──
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
    flexShrink: 0,
  },
  singleWrap: {
    width: AVATAR_SIZE + (STORY_WIDTH + STORY_PAD) * 2,
    height: AVATAR_SIZE + (STORY_WIDTH + STORY_PAD) * 2,
    borderRadius: (AVATAR_SIZE + (STORY_WIDTH + STORY_PAD) * 2) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRing: {
    borderWidth: STORY_WIDTH,
    borderColor: PURPLE,
    padding: STORY_PAD,
  },
  singleAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  groupContainer: {
    width: 74,
    height: AVATAR_SIZE,
    position: 'relative',
    marginRight: 12,
    flexShrink: 0,
  },
  groupAvatarWrap: {
    position: 'absolute',
    top: 4,
  },
  groupAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#fff',
  },

  // ── Body ──
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  pinIcon: { fontSize: 11 },
  favIcon: { fontSize: 11 },
  name: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    flexShrink: 1,
  },
  nameUnread: { color: '#000' },
  timestamp: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    flexShrink: 0,
  },
  timestampUnread: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginRight: 8,
  },
  previewUnread: {
    color: '#374151',
    fontFamily: 'Poppins-Medium',
  },
  senderPrefix: {
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
  },
  typingText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    flexShrink: 0,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  readTick: {
    fontSize: 12,
    color: '#60A5FA',
    fontFamily: 'Poppins-Regular',
    flexShrink: 0,
  },
});

export default ConversationItem;
