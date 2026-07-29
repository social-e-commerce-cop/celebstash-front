import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const PURPLE = '#7126D0';
const RED_LIVE = '#EF4444';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'purchase'
  | 'mention'
  | 'tag'
  | 'share'
  | 'auction'
  | 'live'
  | 'price_drop';

export type FollowMode = 'follow' | 'follow_back';

export type NotificationItemProps = {
  id: string;
  time: string;
  user: string;
  action: string;
  type?: NotificationType;
  followMode?: FollowMode;
  avatar?: any;
  thumbnail?: any;
  comment?: string;
  actionButtonLabel?: string;
  isRead?: boolean;
  isFollowing?: boolean;
  onPress?: () => void;
  onActionButtonPress?: () => void;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  time,
  user,
  action,
  type = 'like',
  followMode = 'follow_back',
  avatar,
  thumbnail,
  comment,
  actionButtonLabel,
  isRead = true,
  isFollowing: initialFollowing = false,
  onPress,
  onActionButtonPress,
}) => {
  const [following, setFollowing] = useState(initialFollowing);
  const showFollowBtn = type === 'follow';
  const isLive = type === 'live';
  const showCustomActionBtn = !!actionButtonLabel || isLive;
  const showThumbnail = !!thumbnail && !showFollowBtn && !showCustomActionBtn;

  const getFollowText = () => {
    if (following) return 'Following';
    return followMode === 'follow_back' ? 'Follow Back' : 'Follow';
  };

  return (
    <TouchableOpacity
      style={[styles.container, !isRead && styles.containerUnread]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Avatar with optional Live ring badge */}
      <View style={styles.avatarWrapper}>
        <Image
          source={avatar ?? require('../../assets/images/feed6.jpg')}
          style={[styles.avatar, isLive && styles.avatarLiveRing]}
        />
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.textLine} numberOfLines={2}>
          <Text style={styles.userName}>{user}</Text>
          {'  '}
          <Text style={styles.action}>{action}</Text>
          {'  '}
          <Text style={styles.time}>{time}</Text>
        </Text>
        {comment && (
          <Text style={styles.commentPreview} numberOfLines={1}>
            "{comment}"
          </Text>
        )}
      </View>

      {/* Right Action: Follow / Follow Back */}
      {showFollowBtn && (
        <TouchableOpacity
          style={[styles.followBtn, following && styles.followingBtn]}
          onPress={() => setFollowing(f => !f)}
          activeOpacity={0.8}
        >
          <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
            {getFollowText()}
          </Text>
        </TouchableOpacity>
      )}

      {/* Right Action: Custom button (e.g. Join Live, Bid, View) */}
      {showCustomActionBtn && (
        <TouchableOpacity
          style={[styles.actionBtn, isLive && styles.actionBtnLive]}
          onPress={onActionButtonPress ?? onPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, isLive && styles.actionBtnTextLive]}>
            {actionButtonLabel ?? (isLive ? 'Watch' : 'View')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Right Action: Media thumbnail */}
      {showThumbnail && (
        <Image source={thumbnail} style={styles.thumbnail} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 0,
  },
  containerUnread: {
    // Subtle highlight state if needed
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
    flexShrink: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarLiveRing: {
    borderWidth: 2,
    borderColor: RED_LIVE,
  },
  liveBadge: {
    position: 'absolute',
    bottom: -3,
    alignSelf: 'center',
    backgroundColor: RED_LIVE,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  textLine: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#262626',
    lineHeight: 18,
  },
  userName: {
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  action: {
    fontFamily: 'Poppins-Regular',
    color: '#262626',
  },
  time: {
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  commentPreview: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  followBtn: {
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
    flexShrink: 0,
    minWidth: 92,
    alignItems: 'center',
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
  },
  followBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  followingBtnText: {
    color: '#111',
  },
  actionBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexShrink: 0,
  },
  actionBtnLive: {
    backgroundColor: RED_LIVE,
  },
  actionBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  actionBtnTextLive: {
    color: '#fff',
  },
  thumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    flexShrink: 0,
  },
});

export default NotificationItem;
