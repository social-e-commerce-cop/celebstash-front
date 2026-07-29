import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { SharedPostData } from '@/types/chatTypes';

const BUBBLE_WIDTH = Dimensions.get('window').width * 0.72;
const PURPLE = '#7126D0';

// ── Icons (same as PostCard) ──

const PurpleVerifiedBadge = () => (
  <Svg width="12" height="12" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724ZM6.50256 15.462L5.51556 13.8119L3.65481 13.419C3.50581 13.3914 3.38706 13.3115 3.29856 13.179C3.21006 13.047 3.17356 12.9065 3.18906 12.7575L3.36681 10.8405L2.10456 9.40045C1.99856 9.29195 1.94556 9.15845 1.94556 8.99995C1.94556 8.84145 1.99856 8.70795 2.10456 8.59945L3.36681 7.15945L3.18906 5.2432C3.17406 5.0937 3.21056 4.95295 3.29856 4.82095C3.38706 4.68895 3.50581 4.60895 3.65481 4.58095L5.51481 4.1887L6.50181 2.5387C6.58281 2.4047 6.69156 2.3122 6.82806 2.2612C6.96456 2.2097 7.10581 2.21645 7.25181 2.28145L9.00006 3.0202L10.7476 2.28145C10.8941 2.21645 11.0356 2.2097 11.1721 2.2612C11.3086 2.3122 11.4173 2.4047 11.4983 2.5387L12.4846 4.1887L14.3453 4.58095C14.4943 4.60895 14.6131 4.68895 14.7016 4.82095C14.7901 4.95295 14.8266 5.0937 14.8111 5.2432L14.6341 7.15945L15.8956 8.59945C16.0016 8.70795 16.0546 8.84145 16.0546 8.99995C16.0546 9.15845 16.0016 9.2922 15.8956 9.4012L14.6341 10.8405L14.8111 12.7567C14.8261 12.9062 14.7896 13.047 14.7016 13.179C14.6131 13.3115 14.4943 13.3914 14.3453 13.419L12.4853 13.8119L11.4983 15.462C11.4173 15.5954 11.3086 15.688 11.1721 15.7395C11.0356 15.791 10.8943 15.784 10.7483 15.7185L9.00006 14.9797L7.25256 15.7185C7.10606 15.7835 6.96456 15.7902 6.82806 15.7387C6.69156 15.6877 6.58281 15.5952 6.50181 15.4612"
      fill={PURPLE}
    />
  </Svg>
);

const CommentIcon = ({ color = '#000', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

const NodeShareIcon = ({ color = '#000', size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
  </Svg>
);

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

interface SharedPostBubbleProps {
  post: SharedPostData;
  isOutgoing: boolean;
  onPress?: () => void;
}

const SharedPostBubble: React.FC<SharedPostBubbleProps> = ({ post, isOutgoing, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, isOutgoing ? styles.containerOut : styles.containerIn]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Shared label */}
      <View style={styles.sharedLabel}>
        <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isOutgoing ? 'rgba(255,255,255,0.6)' : '#9CA3AF'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M17 1l4 4-4 4" />
          <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <Path d="M7 23l-4-4 4-4" />
          <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </Svg>
        <Text style={[styles.sharedLabelText, isOutgoing && { color: 'rgba(255,255,255,0.6)' }]}>
          Shared a post
        </Text>
      </View>

      {/* Post card (looks like feed) */}
      <View style={styles.postCard}>
        {/* Post header */}
        <View style={styles.postHeader}>
          <Image source={post.userImage} style={styles.postAvatar} />
          <View style={styles.postUserInfo}>
            <View style={styles.postUserRow}>
              <Text style={styles.postUserName} numberOfLines={1}>{post.userName}</Text>
              {post.verified && <PurpleVerifiedBadge />}
            </View>
            <Text style={styles.postTimeAgo}>{post.timeAgo} ago</Text>
          </View>
        </View>

        {/* Post caption */}
        <Text style={styles.postCaption} numberOfLines={2}>{post.postText}</Text>

        {/* Post image */}
        <View style={styles.postImageContainer}>
          <Image source={post.mainImage} style={styles.postImage} />
        </View>

        {/* Post engagement stats */}
        <View style={styles.postFooter}>
          <View style={styles.postStats}>
            {/* Likes */}
            <View style={styles.statItem}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </Svg>
              <Text style={styles.statText}>{formatCount(post.likes)}</Text>
            </View>

            {/* Comments */}
            <View style={styles.statItem}>
              <CommentIcon color="#666" size={14} />
              <Text style={styles.statText}>{formatCount(post.comments)}</Text>
            </View>

            {/* Shares */}
            <View style={styles.statItem}>
              <NodeShareIcon color="#666" size={14} />
              <Text style={styles.statText}>{formatCount(post.shares)}</Text>
            </View>
          </View>

          {post.trending ? (
            <Text style={styles.trendingText}>{post.trending}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SharedPostBubble;

const styles = StyleSheet.create({
  container: {
    width: BUBBLE_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
  },
  containerIn: {
    backgroundColor: '#F3F4F6',
  },
  containerOut: {
    backgroundColor: '#7126D0',
  },
  sharedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  sharedLabelText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 6,
    marginBottom: 6,
    borderRadius: 12,
    overflow: 'hidden',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
  },
  postAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  postUserInfo: {
    flex: 1,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  postUserName: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  postTimeAgo: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginTop: -1,
  },
  postCaption: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 17,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  postImageContainer: {
    width: '100%',
    height: BUBBLE_WIDTH * 0.55,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#555',
  },
  trendingText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
});
