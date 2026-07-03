import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Polyline, Line, Circle } from 'react-native-svg';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';
import { PostData } from '@/lib/postsData';

const { width } = Dimensions.get('window');

// Orange verified badge
const PurpleVerifiedBadge = () => (
  <Svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724ZM6.50256 15.462L5.51556 13.8119L3.65481 13.419C3.50581 13.3914 3.38706 13.3115 3.29856 13.179C3.21006 13.047 3.17356 12.9065 3.18906 12.7575L3.36681 10.8405L2.10456 9.40045C1.99856 9.29195 1.94556 9.15845 1.94556 8.99995C1.94556 8.84145 1.99856 8.70795 2.10456 8.59945L3.36681 7.15945L3.18906 5.2432C3.17406 5.0937 3.21056 4.95295 3.29856 4.82095C3.38706 4.68895 3.50581 4.60895 3.65481 4.58095L5.51481 4.1887L6.50181 2.5387C6.58281 2.4047 6.69156 2.3122 6.82806 2.2612C6.96456 2.2097 7.10581 2.21645 7.25181 2.28145L9.00006 3.0202L10.7476 2.28145C10.8941 2.21645 11.0356 2.2097 11.1721 2.2612C11.3086 2.3122 11.4173 2.4047 11.4983 2.5387L12.4846 4.1887L14.3453 4.58095C14.4943 4.60895 14.6131 4.68895 14.7016 4.82095C14.7901 4.95295 14.8266 5.0937 14.8111 5.2432L14.6341 7.15945L15.8956 8.59945C16.0016 8.70795 16.0546 8.84145 16.0546 8.99995C16.0546 9.15845 16.0016 9.2922 15.8956 9.4012L14.6341 10.8405L14.8111 12.7567C14.8261 12.9062 14.7896 13.047 14.7016 13.179C14.6131 13.3115 14.4943 13.3914 14.3453 13.419L12.4853 13.8119L11.4983 15.462C11.4173 15.5954 11.3086 15.688 11.1721 15.7395C11.0356 15.791 10.8943 15.784 10.7483 15.7185L9.00006 14.9797L7.25256 15.7185C7.10606 15.7835 6.96456 15.7902 6.82806 15.7387C6.69156 15.6877 6.58281 15.5952 6.50181 15.4612"
      fill="#7126D0"
    />
  </Svg>
);

// Plus icon for Mate status
const PlusIcon = () => (
  <Svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7126D0" strokeWidth="3">
    <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Check icon for Mated status
const CheckIcon = () => (
  <Svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7126D0" strokeWidth="3">
    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Feather/Lucide Share icon (three connected nodes)
const NodeShareIcon = ({ color = "#000", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
  </Svg>
);

// Speech bubble icon matching the screenshot
const CommentIcon = ({ color = "#000", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

// Inactive Repost Icon (two circular arrows forming a loop)
const RepostIcon = ({ color = "#000", size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 1l4 4-4 4" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Path d="M7 23l-4-4 4-4" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

// Active Repost Icon (purple with a tick/checkmark in the middle)
const RepostedIcon = ({ size = 22 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Purple loop */}
    <Path d="M17 1l4 4-4 4" stroke="#7126D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" stroke="#7126D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 23l-4-4 4-4" stroke="#7126D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" stroke="#7126D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Tick in the middle */}
    <Path d="M9 12l2 2 4-4" stroke="#7126D0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Compact like count formatter (15200 → 15.2K)
const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

interface PostCardProps {
  post: PostData;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [mated, setMated] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [shareCount, setShareCount] = useState(post.shares);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.profileDetails}>
          <Image source={post.userImage} style={styles.avatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.userName}</Text>
              {post.verified && <PurpleVerifiedBadge />}
            </View>
            <Text style={styles.timeAgo}>{post.timeAgo} ago</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.mateButton}
          onPress={() => setMated(m => !m)}
          activeOpacity={0.7}
        >
          <View style={styles.mateButtonContent}>
            {mated ? (
              <CheckIcon />
            ) : (
              <>
                <Text style={styles.mateText}>Mate</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('ProductDetails', {
            name: post.userName + ' Collection',
            price: post.price,
            image: post.mainImage,
            description: post.postText,
            artistName: post.userName,
            verified: post.verified,
          })
        }
      >
        <Text style={styles.caption}>{post.postText}</Text>
      </TouchableOpacity>

      {/* Post image */}
      <TouchableOpacity
        style={styles.imageContainer}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('ProductDetails', {
            name: post.userName + ' Collection',
            price: post.price,
            image: post.mainImage,
            description: post.postText,
            artistName: post.userName,
            verified: post.verified,
          })
        }
      >
        <Image source={post.mainImage} style={styles.postImage} />
      </TouchableOpacity>

      {/* Footer: like, comment, share + repost */}
      <View style={styles.footer}>
        <View style={styles.statsLeft}>
          {/* Like */}
          <TouchableOpacity style={styles.statItem} onPress={handleLike} activeOpacity={0.7}>
            <Svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={liked ? '#7126D0' : 'none'}
              stroke={liked ? '#7126D0' : '#000'}
              strokeWidth="2"
            >
              <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </Svg>
            <Text style={[styles.statNum, liked && styles.statNumLiked]}>
              {formatCount(likeCount)}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity style={styles.statItem} onPress={() => setCommentsOpen(true)} activeOpacity={0.7}>
            <CommentIcon color="#000" size={20} />
            <Text style={styles.statNum}>{formatCount(commentCount)}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.statItem} onPress={() => setShareOpen(true)} activeOpacity={0.7}>
            <NodeShareIcon color="#000" size={20} />
            <Text style={styles.statNum}>{formatCount(shareCount)}</Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions: Trending & Repost */}
        <View style={styles.rightActions}>
          {!!post.trending && (
            <Text style={styles.trending}>{post.trending}</Text>
          )}
          <TouchableOpacity
            style={styles.repostButton}
            onPress={() => setReposted(r => !r)}
            activeOpacity={0.7}
          >
            {reposted ? <RepostedIcon size={22} /> : <RepostIcon color="#000" size={22} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Modal */}
      <CommentsModal
        visible={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        currentUserImage={post.userImage}
        onCommentAdded={() => setCommentCount(prev => prev + 1)}
      />

      {/* Share Modal */}
      <ShareModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        postText={post.postText}
        onPostShared={() => {
          setShareCount(prev => prev + 1);
          setShowShareToast(true);
          setTimeout(() => {
            setShowShareToast(false);
          }, 1500);
        }}
      />

      {/* Success Toast */}
      {showShareToast && (
        <View style={styles.successToast}>
          <View style={styles.successIconCircle}>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
              <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={styles.successToastText}>Sent!</Text>
        </View>
      )}
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginVertical: 14,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileDetails: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 10 },
  userInfo: { justifyContent: 'center' },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#000' },
  timeAgo: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#888', marginTop: -1 },
  mateButton: {
    backgroundColor: '#e5d3fdff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  mateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mateText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#7126D0' },
  caption: {
    fontSize: 16, fontFamily: 'Poppins-Regular', color: '#000',
    lineHeight: 20, marginBottom: 16,
  },
  imageContainer: {
    width: '100%', height: width * 0.7, // slightly taller to match screenshot aspect ratio
    borderRadius: 12, overflow: 'hidden', marginBottom: 10,
  },
  postImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
  },
  statsLeft: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statNum: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#000' },
  statNumLiked: { color: '#7126D0' },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repostButton: {
    padding: 4,
  },
  trending: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#7126D0' },
  successToast: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  successIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  successToastText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
