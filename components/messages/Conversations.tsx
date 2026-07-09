import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

const AVATAR_SIZE = 52;
const STORY_WIDTH = 3;
const STORY_PAD = 3;

interface ConversationItemProps {
  isGroup?: boolean;
  groupMembers?: { avatar: any }[];
  name: string;
  lastMessage: string;
  unreadCount?: number;
  hasStory?: boolean;
  isOnline?: boolean;
  timestamp?: string;
  isPinned?: boolean;
  isMuted?: boolean;
  isTyping?: boolean;
  senderPrefix?: string; // "You: " or "Name: " for group
  isRead?: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  isGroup,
  groupMembers = [],
  name,
  lastMessage,
  unreadCount = 0,
  hasStory = false,
  isOnline = false,
  timestamp,
  isPinned = false,
  isMuted = false,
  isTyping = false,
  senderPrefix,
  isRead = true,
}) => {
  const hasUnread = unreadCount > 0;

  const renderAvatar = () => {
    if (isGroup && groupMembers.length > 1) {
      return (
        <View style={styles.groupContainer}>
          {groupMembers.slice(0, 3).map((m, i) => (
            <View
              key={i}
              style={[styles.groupAvatarWrap, { left: i * 18, zIndex: 3 - i }]}
            >
              <Image source={m.avatar} style={styles.groupAvatar} />
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.avatarWrapper}>
        <View style={[styles.singleWrap, hasStory && styles.storyRing]}>
          <Image
            source={groupMembers[0]?.avatar ?? require('../../assets/images/feed6.jpg')}
            style={styles.singleAvatar}
          />
        </View>
        {isOnline && !isGroup && <View style={styles.onlineDot} />}
      </View>
    );
  };

  return (
    <View style={[styles.row, hasUnread && styles.rowUnread]}>
      {renderAvatar()}

      <View style={styles.body}>
        <View style={styles.topLine}>
          <View style={styles.nameRow}>
            {isPinned && (
              <Text style={styles.pinIcon}>📌 </Text>
            )}
            <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
              {name}
            </Text>
            {isMuted && (
              <Text style={styles.mutedIcon}> 🔇</Text>
            )}
          </View>
          <Text style={[styles.timestamp, hasUnread && styles.timestampUnread]}>
            {timestamp ?? ''}
          </Text>
        </View>

        <View style={styles.bottomLine}>
          {isTyping ? (
            <Text style={styles.typingText} numberOfLines={1}>typing…</Text>
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.preview, hasUnread && styles.previewUnread]}
            >
              {senderPrefix ? (
                <Text style={styles.senderPrefix}>{senderPrefix}</Text>
              ) : null}
              {lastMessage}
            </Text>
          )}

          {hasUnread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : (
            isRead && <Text style={styles.readTick}>✓✓</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
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
    top: 0,
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
  pinIcon: {
    fontSize: 11,
  },
  mutedIcon: {
    fontSize: 11,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    flexShrink: 1,
  },
  nameUnread: {
    color: '#000',
  },
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
