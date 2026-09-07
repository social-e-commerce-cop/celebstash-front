import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Modal, Alert, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';
import LikesModal from './LikesModal';
import { PostData } from '@/lib/postsData';
import { BackendPost, likePostApi, unlikePostApi, repostPostApi, unrepostPostApi, savePostApi, unsavePostApi } from '@/lib/postService';
import { followService } from '@/lib/followService';
import { getSessionUser } from '@/lib/session';

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

const CheckIcon = () => (
  <Svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#7126D0" strokeWidth="3">
    <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const NodeShareIcon = ({ color = "#000", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" />
  </Svg>
);

const CommentIcon = ({ color = "#000", size = 20 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
);

const RepostIcon = ({ color = "#000", size = 22 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 1l4 4-4 4" />
    <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <Path d="M7 23l-4-4 4-4" />
    <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </Svg>
);

const RepostedIcon = ({ size = 22 }: { size?: number }) => (
  <View style={{
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#7126D0',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
  </View>
);

const formatCount = (n: number): string => {
  if (!n) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

interface PostCardProps {
  post: BackendPost | PostData | any;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const isBackend = 'likesCount' in post || 'description' in post;

  const postId = post.id;
  const rawUsername = post.userUsername || (post.user && post.user.username) || post.username;
  const userName = rawUsername || post.userName || 'Artist';
  const postText = isBackend ? post.description : post.postText;
  const userVerified = isBackend ? (post.userVerified || post.userRole === 'ARTIST') : post.verified;
  
  // Image sources
  const defaultAvatar = require('../../assets/images/black-man.png');
  const defaultPostImg = require('../../assets/images/feed6.jpg');

  const userImage = post.userImageUrl ? { uri: post.userImageUrl } : (post.userImage || defaultAvatar);
  const mainImage = (post.imageUrls && post.imageUrls.length > 0)
    ? { uri: post.imageUrls[0] }
    : (post.mainImage || defaultPostImg);

  const price = post.attachedPrice || post.price || (post.product?.price ? `$${post.product.price}` : '$150');

  // Attached item parsing
  const attachedItem = post.attachedItem || (post.attachedType && post.attachedType !== 'none' ? {
    type: post.attachedType,
    title: post.attachedTitle || 'Exclusive Item',
    subtitle: post.attachedSubtitle || 'Shoppable Item',
    price: post.attachedPrice || price,
  } : (post.product ? {
    type: 'product',
    title: post.product.name,
    subtitle: 'Official Merch',
    price: `$${post.product.price}`,
    image: post.product.imageUrls?.[0] ? { uri: post.product.imageUrls[0] } : mainImage,
  } : undefined));

  const [liked, setLiked] = useState<boolean>(isBackend ? post.isLiked : post.likedByMe);
  const [likeCount, setLikeCount] = useState<number>(isBackend ? post.likesCount : post.likes || 0);
  const [reposted, setReposted] = useState<boolean>(isBackend ? post.isReposted : false);
  const [repostCount, setRepostCount] = useState<number>(isBackend ? post.repostsCount : 0);
  const [saved, setSaved] = useState<boolean>(isBackend ? post.isSaved : false);
  const [mated, setMated] = useState<boolean>(false);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [likesOpen, setLikesOpen] = useState<boolean>(false);
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(isBackend ? post.commentsCount : post.comments || 0);
  const [shareCount, setShareCount] = useState<number>(isBackend ? post.sharesCount : post.shares || 0);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  const handleSlideScroll = (event: any) => {
    const slideWidth = width - 32;
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffset / slideWidth);
    if (currentIndex !== activeSlideIndex) {
      setActiveSlideIndex(currentIndex);
    }
  };

  const targetId = post.userId || (post.user && post.user.id);
  const currentUserId = getSessionUser()?.id;

  React.useEffect(() => {
    if (targetId) {
      followService.checkFollowStatus(targetId)
        .then(isFollowing => setMated(isFollowing))
        .catch(() => {});
    }
  }, [targetId]);

  const handleLikeToggle = async () => {
    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    if (isBackend && typeof postId === 'number') {
      try {
        if (prevLiked) {
          await unlikePostApi(postId);
        } else {
          await likePostApi(postId);
        }
      } catch (err) {
        console.error('Failed to update like status:', err);
        setLiked(prevLiked);
        setLikeCount(prevCount);
      }
    }
  };

  const handleRepostToggle = async () => {
    const prevReposted = reposted;
    setReposted(!prevReposted);
    setRepostCount((prev: number) => prev + (prevReposted ? -1 : 1));

    if (isBackend && typeof postId === 'number') {
      try {
        if (prevReposted) {
          await unrepostPostApi(postId);
        } else {
          await repostPostApi(postId);
        }
      } catch (err) {
        console.error('Failed to update repost status:', err);
        setReposted(prevReposted);
      }
    }
  };

  const handleSaveToggle = async () => {
    const prevSaved = saved;
    setSaved(!prevSaved);

    if (isBackend && typeof postId === 'number') {
      try {
        if (prevSaved) {
          await unsavePostApi(postId);
        } else {
          await savePostApi(postId);
        }
      } catch (err) {
        console.error('Failed to update save status:', err);
        setSaved(prevSaved);
      }
    }
  };

  const [followOptionsOpen, setFollowOptionsOpen] = useState(false);

  const handleFollowPress = () => {
    if (mated) {
      setFollowOptionsOpen(true);
    } else {
      handleFollowToggle(true);
    }
  };

  const handleFollowToggle = async (shouldFollow: boolean) => {
    setMated(shouldFollow);

    const numericId = typeof targetId === 'number' ? targetId : parseInt(String(targetId), 10);
    if (!isNaN(numericId) && numericId > 0) {
      try {
        if (shouldFollow) {
          await followService.followUser(numericId);
        } else {
          await followService.unfollowUser(numericId);
        }
      } catch (err) {
        console.warn('Follow status notice:', err);
      }
    }
  };

  const hasMedia = (post.imageUrls && post.imageUrls.length > 0) || !!post.videoUrl || (!isBackend && !!post.mainImage);

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileDetails}
          activeOpacity={0.8}
          onPress={() => {
            const sessionUser = getSessionUser();
            if (
              (targetId && currentUserId && (targetId === currentUserId || String(targetId) === String(currentUserId))) ||
              (post.userUsername && sessionUser?.username && post.userUsername.toLowerCase() === sessionUser.username.toLowerCase())
            ) {
              navigation.navigate('MyProfile', { isOtherUser: false });
            } else {
              navigation.navigate('MyProfile', {
                isOtherUser: true,
                userId: targetId,
                name: userName,
                username: post.userUsername || userName.toLowerCase().replace(/\s+/g, ''),
                avatar: userImage,
                role: post.userRole === 'ARTIST' ? 'artist' : 'user',
              });
            }
          }}
        >
          <Image source={userImage} style={styles.avatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{userName}</Text>
              {userVerified && <PurpleVerifiedBadge />}
            </View>
            <Text style={styles.timeAgo}>Active</Text>
          </View>
        </TouchableOpacity>

        {(!targetId || !currentUserId || targetId !== currentUserId) && (
          <TouchableOpacity
            style={[styles.mateButton, mated && { backgroundColor: '#F3F4F6' }]}
            onPress={handleFollowPress}
            activeOpacity={0.7}
          >
            <View style={styles.mateButtonContent}>
              {mated ? (
                <Ionicons name="person" size={16} color="#7126D0" />
              ) : (
                <Text style={styles.mateText}>Follow</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Options Modal Sheet when tapping Person Icon */}
      <Modal
        visible={followOptionsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFollowOptionsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFollowOptionsOpen(false)}
        >
          <View style={styles.actionSheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.actionSheetTitle}>@{post.userUsername || userName.toLowerCase().replace(/\s+/g, '')}</Text>

            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={async () => {
                setFollowOptionsOpen(false);
                await handleFollowToggle(false);
              }}
            >
              <Ionicons name="person-remove-outline" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={[styles.actionSheetOptionText, { color: '#EF4444' }]}>Unfollow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={() => {
                setFollowOptionsOpen(false);
                Alert.alert('Not Interested', "Got it. We'll show fewer posts like this.");
              }}
            >
              <Ionicons name="eye-off-outline" size={20} color="#374151" style={{ marginRight: 12 }} />
              <Text style={styles.actionSheetOptionText}>Not Interested</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionSheetOption}
              onPress={() => {
                setFollowOptionsOpen(false);
                Alert.alert('Report', 'Thank you. This post has been reported for review.');
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#374151" style={{ marginRight: 12 }} />
              <Text style={styles.actionSheetOptionText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionSheetOption, { borderBottomWidth: 0, justifyContent: 'center', paddingTop: 16 }]}
              onPress={() => setFollowOptionsOpen(false)}
            >
              <Text style={{ fontSize: 15, fontFamily: 'Poppins-Bold', color: '#6B7280' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Caption & Text-Only Card */}
      {!!postText && (
        hasMedia ? (
          <Text style={styles.caption}>{postText}</Text>
        ) : (
          <View style={styles.textOnlyCard}>
            <Text style={styles.textOnlyCardText}>{postText}</Text>
          </View>
        )
      )}

      {/* Post image/gallery (Only if media exists) */}
      {hasMedia && (
        <View style={styles.imageContainer}>
          {post.imageUrls && post.imageUrls.length > 1 ? (
            <View style={{ position: 'relative' }}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleSlideScroll}
                scrollEventThrottle={16}
              >
                {post.imageUrls.map((imgUrl: string, idx: number) => (
                  <View key={idx}>
                    <Image source={{ uri: imgUrl }} style={[styles.postImage, { width: width }]} />
                  </View>
                ))}
              </ScrollView>

              {/* Instagram Slide Counter Badge (e.g. 1/4) */}
              <View style={styles.slideCounterBadge}>
                <Text style={styles.slideCounterText}>
                  {activeSlideIndex + 1}/{post.imageUrls.length}
                </Text>
              </View>

              {/* Instagram Dots Indicator */}
              <View style={styles.paginationDotsContainer}>
                {post.imageUrls.map((_: any, idx: number) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      idx === activeSlideIndex ? styles.activeDot : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={{ width: width, height: '100%' }}>
              <Image source={mainImage} style={styles.postImage} />
            </View>
          )}
        </View>
      )}

      {/* Attached Shoppable Card */}
      {attachedItem && (
        <TouchableOpacity
          style={styles.attachedCard}
          activeOpacity={0.85}
          onPress={() => {
            if (attachedItem.type === 'product' || post.product) {
              const attachedProduct = post.product;
              navigation.navigate('ProductDetails', {
                product: attachedProduct,
                id: attachedProduct?.id,
                name: attachedProduct?.name || attachedItem.title,
                price: attachedProduct?.price ? `$${attachedProduct.price}` : (attachedItem.price || price),
                image: attachedProduct?.imageUrls?.[0] ? { uri: attachedProduct.imageUrls[0] } : (attachedItem.image || mainImage),
                description: attachedProduct?.description || postText,
                artistName: userName,
                verified: userVerified,
                sellerId: attachedProduct?.seller?.id || targetId,
              });
            } else if (attachedItem.type === 'song') {
              navigation.navigate('MusicScreen');
            } else if (attachedItem.type === 'concert') {
              navigation.navigate('ConcertsScreen');
            }
          }}
        >
          <View style={styles.attachedLeft}>
            <View style={styles.attachedIconBadge}>
              <Ionicons
                name={
                  attachedItem.type === 'product'
                    ? 'bag-handle-outline'
                    : attachedItem.type === 'song'
                    ? 'musical-notes-outline'
                    : 'ticket-outline'
                }
                size={18}
                color="#7126D0"
              />
            </View>
            <View style={styles.attachedInfo}>
              <Text style={styles.attachedTitle} numberOfLines={1}>
                {attachedItem.title}
              </Text>
              <Text style={styles.attachedSubtitle} numberOfLines={1}>
                {attachedItem.subtitle || 'Shoppable Item'}
              </Text>
            </View>
          </View>

          <View style={styles.attachedActionBtn}>
            <Text style={styles.attachedActionText}>
              {attachedItem.type === 'product'
                ? 'Shop'
                : attachedItem.type === 'song'
                ? 'Listen'
                : 'Get Tickets'}
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Footer: like, comment, share, save + repost */}
      <View style={styles.footer}>
        <View style={styles.statsLeft}>
          {/* Like */}
          <TouchableOpacity style={styles.statItem} onPress={handleLikeToggle} activeOpacity={0.7}>
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

          {/* Save / Bookmark */}
          <TouchableOpacity style={styles.statItem} onPress={handleSaveToggle} activeOpacity={0.7}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={saved ? '#7126D0' : '#000'}
            />
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.statItem} onPress={() => setShareOpen(true)} activeOpacity={0.7}>
            <NodeShareIcon color="#000" size={20} />
            <Text style={styles.statNum}>{formatCount(shareCount)}</Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions: Repost */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.repostButton}
            onPress={handleRepostToggle}
            activeOpacity={0.7}
          >
            {reposted ? <RepostedIcon size={22} /> : <RepostIcon color="#000" size={22} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Instagram-style Liked By Section */}
      {likeCount > 0 && (
        <TouchableOpacity
          style={styles.likedByContainer}
          onPress={() => setLikesOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.likedByAvatars}>
            <Image source={userImage} style={[styles.likedAvatar, { zIndex: 3 }]} />
            <Image source={require('../../assets/images/black-man.png')} style={[styles.likedAvatar, styles.likedAvatarOverlap, { zIndex: 2 }]} />
          </View>
          <Text style={styles.likedByText}>
            Liked by <Text style={styles.likedByBold}>{liked ? 'you' : 'others'}</Text>{' '}
            {likeCount > 1 && (
              <>
                and <Text style={styles.likedByBold}>{likeCount - (liked ? 1 : 0)} others</Text>
              </>
            )}
          </Text>
        </TouchableOpacity>
      )}

      {/* Likes Modal */}
      <LikesModal
        visible={likesOpen}
        postId={post.id ? Number(post.id) : undefined}
        onClose={() => setLikesOpen(false)}
      />

      {/* Comments Modal */}
      {(() => {
        const sUser = getSessionUser();
        const loggedInUserAvatar = sUser?.profilePicture || sUser?.avatar;
        const validPostId = post.id && !isNaN(Number(post.id)) ? Number(post.id) : undefined;
        return (
          <CommentsModal
            visible={commentsOpen}
            onClose={() => setCommentsOpen(false)}
            currentUserImage={loggedInUserAvatar}
            postId={validPostId}
            onCommentAdded={() => setCommentCount(prev => prev + 1)}
            onCommentDeleted={() => setCommentCount(prev => Math.max(0, prev - 1))}
            postSnippet={{
              text: postText,
              imageUrl: post.imageUrls?.[0] || post.product?.imageUrls?.[0],
              userAvatar: userImage,
              userName: userName,
              userUsername: rawUsername || userName,
            }}
            postOwner={{
              id: targetId,
              username: rawUsername || userName,
              fullName: post.fullName || userName,
              profilePicture: post.userImageUrl,
            }}
            onNavigateToProfile={(uId, uName) => {
              setCommentsOpen(false);
              const sessionUser = getSessionUser();
              if (
                (uId && currentUserId && (uId === currentUserId || String(uId) === String(currentUserId))) ||
                (uName && sessionUser?.username && uName.toLowerCase() === sessionUser.username.toLowerCase())
              ) {
                navigation.navigate('MyProfile', { isOtherUser: false });
              } else {
                navigation.navigate('MyProfile', {
                  isOtherUser: true,
                  userId: uId,
                  name: uName || 'User',
                  username: uName || '',
                  role: 'user',
                });
              }
            }}
          />
        );
      })()}

      {/* Share Modal */}
      <ShareModal
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        postText={postText || 'Check out this post on Zikii'}
        postId={typeof postId === 'number' ? postId : (typeof post?.id === 'number' ? post.id : undefined)}
        onPostShared={() => {
          setShareCount((prev: number) => prev + 1);
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
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  userName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#000' },
  timeAgo: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#888', marginTop: -1 },
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
  mateText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#7126D0' },
  caption: {
    fontSize: 15, fontFamily: 'Poppins-Regular', color: '#000',
    lineHeight: 20, marginBottom: 12,
  },
  textOnlyCard: {
    backgroundColor: '#F5F0FD',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7126D0',
  },
  textOnlyCardText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
    lineHeight: 24,
  },
  imageContainer: {
    width: width,
    height: width * 0.85,
    marginLeft: -16,
    marginRight: -16,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: { width: width, height: '100%', borderRadius: 0, resizeMode: 'cover' },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
  },
  statsLeft: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statNum: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#000' },
  statNumLiked: { color: '#7126D0' },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repostButton: {
    padding: 4,
  },
  successToast: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  attachedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F2FC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(113, 38, 208, 0.15)',
  },
  attachedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  attachedIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAE0F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachedInfo: {
    flex: 1,
  },
  attachedTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  attachedSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  attachedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7126D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  attachedActionText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionSheetOptionText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#111827',
  },
  slideCounterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slideCounterText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#7126D0',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  likedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  likedByAvatars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  likedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  likedAvatarOverlap: {
    marginLeft: -8,
  },
  likedByText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  likedByBold: {
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
});
