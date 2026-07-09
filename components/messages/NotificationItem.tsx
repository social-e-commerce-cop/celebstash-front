import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

export type NotificationType = 'like' | 'comment' | 'follow' | 'purchase' | 'mention' | 'tag';

export type NotificationItemProps = {
  id: string;
  time: string;
  user: string;
  action: string;
  type?: NotificationType;
  comment?: string;
  photos?: (string | number)[];
  isRead?: boolean;
  onPress?: () => void;
};

const TYPE_CONFIG: Record<NotificationType, { icon: any; color: string; bg: string }> = {
  like:     { icon: 'heart',              color: '#E11900', bg: '#FEE2E2' },
  comment:  { icon: 'chatbubble',         color: '#2563EB', bg: '#DBEAFE' },
  follow:   { icon: 'person-add',         color: PURPLE,    bg: '#EDE9FE' },
  purchase: { icon: 'bag-check',          color: '#059669', bg: '#D1FAE5' },
  mention:  { icon: 'at',                 color: '#D97706', bg: '#FEF3C7' },
  tag:      { icon: 'pricetag',           color: '#0891B2', bg: '#CFFAFE' },
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  time, user, action, type = 'like', comment, photos, isRead = true, onPress,
}) => {
  const cfg = TYPE_CONFIG[type];
  const photoSize = width > 600 ? 72 : 56;

  return (
    <TouchableOpacity
      style={[styles.container, !isRead && styles.containerUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Unread indicator */}
      {!isRead && <View style={styles.unreadDot} />}

      {/* Avatar + badge */}
      <View style={styles.avatarWrapper}>
        <Image
          source={require('../../assets/images/feed6.jpg')}
          style={styles.avatar}
        />
        <View style={[styles.iconBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={11} color={cfg.color} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.userName} numberOfLines={1}>{user}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.action} numberOfLines={2}>{action}</Text>
        {comment && (
          <View style={styles.commentBox}>
            <Text style={styles.commentText} numberOfLines={2}>{comment}</Text>
          </View>
        )}
        {photos && photos.length > 0 && (
          <View style={styles.photosRow}>
            {photos.slice(0, 3).map((photo, i) => (
              <Image
                key={i}
                source={typeof photo === 'string' ? { uri: photo } : photo}
                style={[styles.photo, { width: photoSize, height: photoSize }]}
              />
            ))}
            {photos.length > 3 && (
              <View style={[styles.photo, styles.morePhotos, { width: photoSize, height: photoSize }]}>
                <Text style={styles.moreText}>+{photos.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    marginVertical: 3,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  containerUnread: {
    backgroundColor: '#F8F5FF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PURPLE,
    marginTop: 16,
    marginRight: 8,
    flexShrink: 0,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
    flexShrink: 0,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    flexShrink: 0,
  },
  action: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    lineHeight: 18,
  },
  commentBox: {
    marginTop: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderLeftWidth: 3,
    borderLeftColor: PURPLE,
  },
  commentText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 17,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  photo: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  morePhotos: {
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  moreText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
});

export default NotificationItem;
