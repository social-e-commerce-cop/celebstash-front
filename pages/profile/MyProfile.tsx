import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import TabBar from '@/components/Tabbar';
import { FollowListModal } from '@/components/Profile/FollowListModal';
import Post from '@/components/home/Post';
import { fetchMyPosts, fetchSavedPosts, fetchRepostedPosts, BackendPost } from '@/lib/postService';
import { resolveImageUrl } from '@/lib/apiClient';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const getTabIconName = (tabName: string, isActive: boolean): keyof typeof Ionicons.glyphMap => {
  switch (tabName) {
    case 'Feed':
      return isActive ? 'grid' : 'grid-outline';
    case 'Shop':
      return isActive ? 'bag-handle' : 'bag-handle-outline';
    case 'Music':
      return isActive ? 'musical-notes' : 'musical-notes-outline';
    case 'Concerts':
    case 'Event':
      return isActive ? 'ticket' : 'ticket-outline';
    case 'Analytics':
      return isActive ? 'stats-chart' : 'stats-chart-outline';
    case 'Saved':
      return isActive ? 'bookmark' : 'bookmark-outline';
    case 'Orders':
      return isActive ? 'receipt' : 'receipt-outline';
    case 'Tribes':
      return isActive ? 'people' : 'people-outline';
    case 'Reposts':
      return isActive ? 'repeat' : 'repeat-outline';
    case 'Auction':
      return isActive ? 'sparkles' : 'sparkles-outline';
    default:
      return isActive ? 'grid' : 'grid-outline';
  }
};

export type UserRole = 'artist' | 'user';

interface ProductItem {
  id: string;
  title: string;
  artist: string;
  price: string;
  badge?: 'NEW' | 'LTD';
  image: any;
}

interface ReleaseItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  badge?: 'EARLY';
  image: any;
}

interface OrderItem {
  id: string;
  orderNo: string;
  title: string;
  price: string;
  status: 'In Transit' | 'Delivered' | 'Processing';
  image: any;
}

const ARTIST_PRODUCTS: ProductItem[] = [
  {
    id: '1',
    title: 'Ethereal Tide Heavyweight...',
    artist: 'by Anelia',
    price: '$38',
    badge: 'NEW',
    image: require('../../assets/images/product1.jpg'),
  },
  {
    id: '2',
    title: 'Ethereal Tide Purple Vinyl',
    artist: 'by Anelia',
    price: '$38',
    badge: 'LTD',
    image: require('../../assets/images/drop1.jpg'),
  },
  {
    id: '3',
    title: 'Slow Soundscapes (Hardco...',
    artist: 'by Anelia',
    price: '$38',
    image: require('../../assets/images/product3.jpg'),
  },
  {
    id: '4',
    title: 'Ambient Ocean Poster Print',
    artist: 'by Anelia',
    price: '$38',
    image: require('../../assets/images/product4.jpg'),
  },
];

const USER_SAVED_ITEMS: ProductItem[] = [
  {
    id: 's1',
    title: 'Vintage Tour Hoodie',
    artist: 'by Kenny K Shot',
    price: '$59',
    badge: 'NEW',
    image: require('../../assets/images/product2.png'),
  },
  {
    id: 's2',
    title: 'Signed Vinyl LP',
    artist: 'by Kenny K Shot',
    price: '$45',
    image: require('../../assets/images/drop1.jpg'),
  },
];

const MUSIC_RELEASES: ReleaseItem[] = [
  {
    id: 'r1',
    title: 'Glow in the Mist',
    artist: 'Anelia',
    duration: '5:42',
    badge: 'EARLY',
    image: require('../../assets/images/drop1.jpg'),
  },
  {
    id: 'r2',
    title: 'Ambient Ocean Drift',
    artist: 'Anelia',
    duration: '4:15',
    image: require('../../assets/images/story2.png'),
  },
  {
    id: 'r3',
    title: 'Slow Soundscapes LP',
    artist: 'Anelia',
    duration: '6:01',
    image: require('../../assets/images/story3.png'),
  },
];

const USER_ORDERS: OrderItem[] = [
  {
    id: 'o1',
    orderNo: '#STASH-8921',
    title: 'Ethereal Tide Purple Vinyl',
    price: '$38.00',
    status: 'In Transit',
    image: require('../../assets/images/drop1.jpg'),
  },
  {
    id: 'o2',
    orderNo: '#STASH-4102',
    title: 'Ink Art Merch Tee',
    price: '$34.00',
    status: 'Delivered',
    image: require('../../assets/images/product1.jpg'),
  },
];

import { getSessionUser } from '@/lib/session';
import { artistService } from '@/lib/artistService';
import { profileService, UserProfile } from '@/lib/profileService';
import { followService } from '@/lib/followService';
import { postsService, PostItem } from '@/lib/postsService';
import { productsService, ProductItem as RealProductItem } from '@/lib/productsService';
import { musicService, MusicReleaseItem } from '@/lib/musicService';
import FollowersFollowingModal from '@/components/Profile/FollowersFollowingModal';
import AddPostModal from '@/components/home/AddPostModal';

const MyProfile: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const [sessionUser, setSessionUser] = useState(getSessionUser());
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [addPostVisible, setAddPostVisible] = useState(false);

  // Determine if viewing own profile or someone else's profile
  const paramUserId = route.params?.userId ? Number(route.params.userId) : null;
  const paramUsername = route.params?.username ? String(route.params.username).trim().toLowerCase() : null;
  const sessionUsername = sessionUser?.username ? String(sessionUser.username).trim().toLowerCase() : null;

  const isMatchingSelf = !!(
    (paramUserId && sessionUser?.id && (paramUserId === sessionUser.id || String(paramUserId) === String(sessionUser.id))) ||
    (paramUsername && sessionUsername && paramUsername === sessionUsername)
  );

  const isOtherUser = isMatchingSelf
    ? false
    : !!(
        route.params?.isOtherUser ||
        (paramUserId && sessionUser?.id && paramUserId !== sessionUser.id) ||
        (paramUsername && sessionUsername && paramUsername !== sessionUsername)
      );
  const isOwnProfile = !isOtherUser;

  // Real profile data state
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);

  // Real posts state
  const [feedPosts, setFeedPosts] = useState<PostItem[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Real products state
  const [realProducts, setRealProducts] = useState<RealProductItem[]>([]);

  // Real music releases state
  const [musicReleases, setMusicReleases] = useState<MusicReleaseItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const user = getSessionUser();
      setSessionUser(user);

      const targetId = paramUserId || Number(route.params?.userId);

      // Fetch music releases for this artist
      musicService.getReleases()
        .then((releases) => {
          if (Array.isArray(releases)) {
            const currentUserId = targetId || profileData?.id || user?.id;
            const currentUsername = (route.params?.username || profileData?.username || user?.username || '').toLowerCase();
            const currentEmail = (profileData?.email || user?.email || '').toLowerCase();
            const currentFullName = (route.params?.name || profileData?.fullName || user?.fullName || '').toLowerCase();

            const artistReleases = releases.filter(r => {
              if (!r.artist) return true;
              if (currentUserId && String(r.artist.id) === String(currentUserId)) return true;
              if (currentUsername && r.artist.username && r.artist.username.toLowerCase() === currentUsername) return true;
              if (currentEmail && (r.artist as any).email && (r.artist as any).email.toLowerCase() === currentEmail) return true;
              if (currentFullName && (r.artist as any).fullName && (r.artist as any).fullName.toLowerCase() === currentFullName) return true;
              return false;
            });
            setMusicReleases(artistReleases.length > 0 ? artistReleases : releases);
          } else {
            setMusicReleases([]);
          }
        })
        .catch(() => setMusicReleases([]));

      // Fetch my products for shop tab
      productsService.getMyProducts()
        .then((prods) => {
          if (Array.isArray(prods)) {
            setRealProducts(prods);
          }
        })
        .catch(() => {});

      if (isOtherUser && targetId) {
        // Load OTHER user's profile from backend
        setProfileLoading(true);
        profileService.getUserById(targetId)
          .then((profile) => {
            setProfileData(profile);
            setFollowersCount(profile.followersCount || 0);
            setFollowingCount(profile.followingCount || 0);
            if (profile.role === 'ARTIST' || route.params?.role === 'artist') setRole('artist');

            // Fetch products for this target artist (display all products normally)
            productsService.getAllProducts()
              .then((allProds) => {
                if (Array.isArray(allProds)) {
                  const targetName = (profile.fullName || route.params?.name || '').toLowerCase();
                  const targetUser = (profile.username || route.params?.username || '').toLowerCase();
                  const artistProds = allProds.filter((p) => {
                    const matchesId = targetId && String(p.sellerId) === String(targetId);
                    const sName = (p.sellerName || '').toLowerCase();
                    const matchesName = Boolean(
                      (targetName && sName && (sName.includes(targetName) || targetName.includes(sName))) ||
                      (targetUser && sName && (sName.includes(targetUser) || targetUser.includes(sName)))
                    );
                    return matchesId || matchesName;
                  });
                  setRealProducts(artistProds);
                }
              })
              .catch(() => {});
          })
          .catch(() => {})
          .finally(() => setProfileLoading(false));

        // Check follow status from backend
        followService.checkFollowStatus(targetId)
          .then(setIsFollowing)
          .catch(() => {});

      } else {
        // Load OWN profile from backend
        setProfileLoading(true);
        profileService.getMyProfile()
          .then((profile) => {
            setProfileData(profile);
            setFollowersCount(profile?.followersCount || 0);
            setFollowingCount(profile?.followingCount || 0);
            if (profile?.role === 'ARTIST') setRole('artist');

            // Fetch live follow counts directly
            if (user?.id) {
              followService.getFollowCounts(user.id)
                .then((counts) => {
                  if (counts && typeof counts.followingCount === 'number') {
                    setFollowingCount(counts.followingCount);
                    setFollowersCount(counts.followersCount);
                  }
                })
                .catch(() => {});
            }
          })
          .catch(() => {})
          .finally(() => setProfileLoading(false));

        // Check artist application status
        if (user?.role === 'ARTIST') setRole('artist');
        artistService.getMyApplicationStatus().then((status) => {
          if (status) {
            setAppStatus(status.status);
            if (status.status === 'APPROVED' || user?.role === 'ARTIST') setRole('artist');
            else setRole('user');
          } else if (user?.role === 'ARTIST') {
            setRole('artist');
          } else {
            setRole('user');
          }
        });
      }
    }, [route.params?.userId, isOtherUser])
  );

  // Determine role based on session and route params
  const targetRole = isOtherUser
    ? (route.params?.role || 'user')
    : (sessionUser.role === 'ARTIST' ? 'artist' : (route.params?.role || 'user'));

  const [role, setRole] = useState<UserRole>(targetRole);

  React.useEffect(() => {
    if (!isOtherUser) {
      setRole(sessionUser.role === 'ARTIST' ? 'artist' : 'user');
    } else if (route.params?.role) {
      setRole(route.params.role);
    }
  }, [sessionUser.role, route.params?.role, isOtherUser]);

  // Active Tab per role
  const [artistTab, setArtistTab] = useState<'Feed' | 'Shop' | 'Music' | 'Concerts' | 'Analytics' | 'Reposts'>('Feed');
  const [userTab, setUserTab] = useState<'Feed' | 'Saved' | 'Orders' | 'Tribes' | 'Reposts'>('Feed');

  const [isFollowing, setIsFollowing] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [myRealPosts, setMyRealPosts] = useState<BackendPost[]>([]);
  const [savedRealPosts, setSavedRealPosts] = useState<BackendPost[]>([]);
  const [repostedRealPosts, setRepostedRealPosts] = useState<BackendPost[]>([]);

  // Followers & Following Instagram-style Modal State
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<'Followers' | 'Following'>('Followers');

  const openFollowModal = (tab: 'Followers' | 'Following') => {
    setFollowModalTab(tab);
    setFollowModalVisible(true);
  };

  // Load own posts, saved posts & reposted posts from real backend API
  useFocusEffect(
    React.useCallback(() => {
      fetchMyPosts(0, 20)
        .then((res) => {
          if (res?.content) setMyRealPosts(res.content);
        })
        .catch((err) => console.error('Error fetching my posts:', err));

      fetchSavedPosts(0, 20)
        .then((res) => {
          if (res?.content) setSavedRealPosts(res.content);
        })
        .catch((err) => console.error('Error fetching saved posts:', err));

      fetchRepostedPosts(0, 20)
        .then((res) => {
          if (res?.content) setRepostedRealPosts(res.content);
        })
        .catch((err) => console.error('Error fetching reposted posts:', err));
    }, [])
  );

  // Use real profile data when available, fallback to params/session
  const displayName = profileData?.fullName ||
    (isOtherUser ? (route.params?.name || 'User') : (sessionUser.fullName || 'User'));

  const displayHandle = profileData?.username
    ? `@${profileData.username}`
    : (isOtherUser ? `@${route.params?.username || 'user'}` : `@${sessionUser.username || 'user'}`);

  const profilePictureUri = profileData?.profilePicture || null;
  const avatarSource = profilePictureUri
    ? { uri: profilePictureUri }
    : (isOtherUser
      ? (route.params?.avatar || require('../../assets/images/feed6.jpg'))
      : (role === 'artist' ? require('../../assets/images/black-man.png') : require('../../assets/images/profile.jpg')));

  // The numeric user ID for API calls
  const targetUserId: number = isOtherUser
    ? (Number(route.params?.userId) || 0)
    : (sessionUser?.id || 0);

  const handleShareStash = async () => {
    try {
      const handle = profileData?.username || (isOtherUser ? (route.params?.username || 'user') : (sessionUser.username || 'user'));
      const shareUrl = `https://celebstash.com/@${handle}`;
      await Share.share({
        title: `Check out ${displayName}'s CelebStash Profile!`,
        message: `Hey! Check out @${handle}'s profile and Stash on CelebStash: ${shareUrl}`,
        url: shareUrl,
      });
    } catch (error: any) {
      Alert.alert('Share Error', error?.message || 'Unable to open share sheet.');
    }
  };

  const handleFollowToggle = async () => {
    if (!targetUserId) return;
    // Optimistic update
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowersCount((prev) => wasFollowing ? prev - 1 : prev + 1);
    try {
      if (wasFollowing) {
        await followService.unfollowUser(targetUserId);
      } else {
        await followService.followUser(targetUserId);
      }
    } catch {
      // Revert on error
      setIsFollowing(wasFollowing);
      setFollowersCount((prev) => wasFollowing ? prev + 1 : prev - 1);
    }
  };


  const artistTabList = isOwnProfile
    ? (['Feed', 'Shop', 'Music', 'Analytics', 'Reposts'] as const)
    : (['Feed', 'Shop', 'Music', 'Reposts'] as const);

  const userTabList = isOwnProfile
    ? (['Feed', 'Saved', 'Orders', 'Tribes', 'Reposts'] as const)
    : (['Feed', 'Reposts', 'Tribes'] as const);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Unified Profile Header ── */}
        <View style={styles.headerContainer}>
          {/* Top Row: Avatar + Info + Hamburger Menu */}
          <View style={styles.profileTopRow}>
            <Image
              source={avatarSource}
              style={styles.avatar}
            />

            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.artistName}>
                  {displayHandle}
                </Text>
                {role === 'artist' && (
                  <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.handle}>{displayName}</Text>

              {/* Dynamic Clickable Stats Row (Single Row Layout) */}
              <View style={styles.statsRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openFollowModal('Followers')}
                >
                  <Text style={styles.statText}>
                    <Text style={styles.statNumber}>{followersCount.toLocaleString()}</Text> Followers
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openFollowModal('Following')}
                >
                  <Text style={styles.statText}>
                    <Text style={styles.statNumber}>{followingCount.toLocaleString()}</Text> Following
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => (role === 'artist' ? setArtistTab('Shop') : setUserTab(isOwnProfile ? 'Orders' : 'Tribes'))}
                >
                  <Text style={styles.statText}>
                    <Text style={styles.statNumber}>{role === 'artist' ? myRealPosts.length : '0'}</Text> {role === 'artist' ? 'Posts' : 'Orders'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons Row: Own Profile (Edit/Share) vs Someone Else (Follow/Message) */}
              <View style={styles.actionButtonsRow}>
                {isOwnProfile ? (
                  <>
                    <TouchableOpacity
                      style={styles.mateBtn}
                      onPress={() => navigation.navigate('EditProfile')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.mateBtnText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.messageBtn}
                      onPress={handleShareStash}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.messageBtnText}>Share Profile</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.mateBtn, isFollowing && styles.matedBtn]}
                      onPress={handleFollowToggle}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.mateBtnText, isFollowing && styles.matedBtnText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.messageBtn}
                      onPress={() => navigation.navigate('MessagesScreen')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.messageBtnText}>Message</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Bio Paragraph */}
              <Text style={styles.bioText}>
                {profileData?.bio || 'No bio provided yet.'}
              </Text>



              {/* Community Badges (Placed Directly Under Bio) */}
              {profileData?.fandomName ? (
                <View style={styles.communityBadgesRow}>
                  <TouchableOpacity
                    style={styles.communityBadgePill}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('MessagesScreen')}
                  >
                    <Ionicons name="flash" size={13} color="#7126D0" />
                    <Text style={styles.communityBadgeText}>{profileData.fandomName} Tribe</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="menu-outline" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Artist Exclusive Tribe Broadcast Channel */}
          {role === 'artist' && profileData?.fandomName && (
            <TouchableOpacity
              style={styles.tribeChannelCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MessagesScreen')}
            >
              <View style={styles.tribeIconContainer}>
                <Ionicons name="people" size={20} color="#7126D0" />
              </View>
              <View style={styles.tribeInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.tribeTitle}>{profileData.fandomName} Tribe Channel</Text>
                  <View style={styles.officialBadge}>
                    <Text style={styles.officialBadgeText}>Official</Text>
                  </View>
                </View>
                <Text style={styles.tribeSub}>Exclusive fan chatter & drops</Text>
              </View>
              <View style={styles.joinTribeBtn}>
                <Text style={styles.joinTribeText}>Join</Text>
              </View>
            </TouchableOpacity>
          )}



          {/* Banners: ONLY DISPLAYED ON YOUR OWN PROFILE */}
          {isOwnProfile && (
            <>
              {role === 'artist' ? (
                /* 1. APPROVED ARTIST -> Professional Dashboard Banner */
                <TouchableOpacity
                  style={styles.premiumBanner}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('Dashboard')}
                >
                  <View style={styles.premiumTextWrap}>
                    <View style={styles.premiumTagRow}>
                      {/* <Text style={styles.premiumTag}>PROFESSIONAL DASHBOARD</Text> */}
                    </View>
                    <Text style={styles.premiumTitle}>Professional Creator Tools & Analytics</Text>
                    <Text style={styles.premiumSubtitle}>View insights & manage your Stash store</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.claimBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('Dashboard')}
                  >
                    <Text style={styles.claimBtnText}>Dashboard</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : appStatus === 'PENDING' ? (
                /* 2. PENDING APPLICATION -> Application Under Review Banner */
                <TouchableOpacity 
                  style={styles.pendingBanner}
                  onPress={() => navigation.navigate('BecomeArtist')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="time-outline" size={22} color="#D97706" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.pendingBannerTitle}>Artist Application Under Review</Text>
                    <Text style={styles.pendingBannerSub}>Tap to view your submission & social proof status.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D97706" />
                </TouchableOpacity>
              ) : (
                /* 3. DEFAULT OR REJECTED -> Become an Artist (Claim Now) Banner */
                <TouchableOpacity
                  style={styles.premiumBanner}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('BecomeArtist')}
                >
                  <View style={styles.premiumTextWrap}>
                    <View style={styles.premiumTagRow}>
                      <View style={styles.purpleDot} />
                      <Text style={styles.premiumTag}>BECOME AN ARTIST</Text>
                    </View>
                    <Text style={styles.premiumTitle}>Start your Stash store & sell merch to your fans</Text>
                    <Text style={styles.premiumSubtitle}>Claim your artist badge & unlock seller tools</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.claimBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('BecomeArtist')}
                  >
                    <Text style={styles.claimBtnText}>Claim Now</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* ── Role-based Sub-Tabs Bar ── */}
        <View style={styles.tabsBar}>
          {role === 'artist'
            ? artistTabList.map(tab => {
                const isActive = artistTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, isActive && styles.activeTabItem]}
                    onPress={() => setArtistTab(tab as any)}
                  >
                    <Ionicons name={getTabIconName(tab, isActive)} size={22} color={isActive ? PURPLE : '#6B7280'} />
                  </TouchableOpacity>
                );
              })
            : userTabList.map(tab => {
                const isActive = userTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabItem, isActive && styles.activeTabItem]}
                    onPress={() => setUserTab(tab as any)}
                  >
                    <Ionicons name={getTabIconName(tab, isActive)} size={22} color={isActive ? PURPLE : '#6B7280'} />
                  </TouchableOpacity>
                );
              })}
        </View>

        {/* ── Tab Content Views ── */}
        {((role === 'artist' && artistTab === 'Feed') || (role === 'user' && userTab === 'Feed')) && (
          <View style={styles.tabContent}>
            <Post 
              posts={myRealPosts} 
              onAddPostPress={() => navigation.navigate('CreatePost')}
              isArtist={isOwnProfile && role === 'artist'}
              emptyMessage={isOwnProfile ? "No posts yet. Share your first drop with your fans!" : "No posts yet."}
            />
          </View>
        )}

        {/* 2. Shop Tab (Artist) */}
        {role === 'artist' && artistTab === 'Shop' && (
          <View style={{ width: '100%', paddingHorizontal: 16 }}>
            {realProducts.length === 0 ? (
              <View style={styles.emptyShopState}>
                <Text style={styles.emptyShopText}>
                  {isOwnProfile ? "No products yet. Share your first merch or product!" : "This creator has no products listed yet."}
                </Text>
                {isOwnProfile && (
                  <TouchableOpacity
                    style={styles.addShopItemBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('CreateProduct')}
                  >
                    <Text style={styles.addShopItemBtnText}>Add Product</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.shopGrid}>
                {realProducts.map((item) => {
                  const rawMainImg = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : item.imageUrl;
                  const mainImg = rawMainImg ? resolveImageUrl(rawMainImg) : null;
                  const resolvedImageUrls = Array.isArray(item.imageUrls) && item.imageUrls.length > 0
                    ? item.imageUrls.map(u => resolveImageUrl(u))
                    : (mainImg ? [mainImg] : []);
                  const isApproved = item.status === 'APPROVED';
                  const isRejected = item.status === 'REJECTED';

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.productCard}
                      activeOpacity={0.85}
                      onPress={() =>
                        navigation.navigate('ProductDetails', {
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: mainImg ? { uri: mainImg } : require('../../assets/images/product1.jpg'),
                          imageUrls: resolvedImageUrls,
                          description: item.description,
                          artistName: item.sellerName || profileData?.username || displayName,
                          verified: true,
                          stockQuantity: item.stockQuantity,
                          sizeStock: item.sizeStock,
                          availableColors: item.availableColors,
                          status: item.status,
                          adminNotes: item.adminNotes,
                          category: item.category,
                          isSeller: isOwnProfile,
                        })
                      }
                    >
                      {/* Floating Price Tag matching ShopScreen */}
                      <View style={styles.shopPriceTag}>
                        <Text style={styles.shopPriceTagText}>${item.price}</Text>
                      </View>

                      <View style={styles.productImgWrap}>
                        <Image
                          source={mainImg ? { uri: mainImg } : require('../../assets/images/product1.jpg')}
                          style={styles.productImg}
                        />
                      </View>

                      <View style={styles.productInfo}>
                        <Text style={styles.productTitle} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Text style={styles.productArtist} numberOfLines={1}>{profileData?.username || item.sellerName || displayName}</Text>
                          <Ionicons name="checkmark-circle" size={13} color="#7126D0" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* 3. Saved Tab (User) */}
        {role === 'user' && userTab === 'Saved' && (
          <View style={{ width: '100%' }}>
            {savedRealPosts.length > 0 ? (
              <Post posts={savedRealPosts} />
            ) : (
              <View style={styles.shopGrid}>
                {USER_SAVED_ITEMS.map(item => (
                  <View key={item.id} style={styles.productCard}>
                    <View style={styles.productImgWrap}>
                      <Image source={item.image} style={styles.productImg} />
                      {item.badge && (
                        <View style={[styles.badgePill, styles.badgeNew]}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.productArtist}>{item.artist}</Text>

                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>{item.price}</Text>
                        <TouchableOpacity style={styles.cartIconBtn}>
                          <Ionicons name="bag-handle-outline" size={16} color={PURPLE} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 4. Music Tab (Artist) */}
        {role === 'artist' && artistTab === 'Music' && (
          <View style={styles.tabContent}>
            {musicReleases.length > 0 ? (
              <>
                {/* Featured LP Player Hero */}
                {(() => {
                  const featured = musicReleases[0];
                  const coverUri = featured.coverArtUrl ? resolveImageUrl(featured.coverArtUrl) : null;
                  const trackCount = featured.tracks?.length || 1;
                  const artistName = featured.artist?.username || featured.artist?.fullName || profileData?.username || displayName;

                  return (
                    <View style={styles.lpCard}>
                      <Image
                        source={coverUri ? { uri: coverUri } : require('../../assets/images/drop1.jpg')}
                        style={styles.lpHeroImg}
                      />
                      <View style={styles.lpOverlay}>
                        <TouchableOpacity
                          style={styles.lpPlayCircle}
                          onPress={() => navigation.navigate('MusicDetail', { id: featured.id })}
                        >
                          <Ionicons name="play" size={24} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.lpFooter}>
                          <View style={styles.lpTextWrap}>
                            <Text style={styles.lpTitle}>{featured.title}</Text>
                            <Text style={styles.lpSub}>
                              {artistName} • {trackCount} {trackCount === 1 ? 'track' : 'tracks'} • {featured.releaseType || 'RELEASE'}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.streamBtn}
                            onPress={() => navigation.navigate('MusicDetail', { id: featured.id })}
                          >
                            <Text style={styles.streamBtnText}>STREAM</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })()}

                {/* Releases Section */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 }}>
                  <Text style={styles.sectionHeading}>ALL RELEASES ({musicReleases.length})</Text>
                  {isOwnProfile && (
                    <TouchableOpacity
                      style={{ backgroundColor: PURPLE, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }}
                      onPress={() => navigation.navigate('UploadMusic')}
                      activeOpacity={0.85}
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'Poppins-Bold' }}>Upload Music</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.releasesList}>
                  {musicReleases.map((rel) => {
                    const coverUri = rel.coverArtUrl ? resolveImageUrl(rel.coverArtUrl) : null;
                    const artistName = rel.artist?.username || rel.artist?.fullName || profileData?.username || displayName;
                    const trackCount = rel.tracks?.length || 1;

                    return (
                      <TouchableOpacity
                        key={rel.id}
                        style={styles.releaseRow}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('MusicDetail', { id: rel.id })}
                      >
                        <Image
                          source={coverUri ? { uri: coverUri } : require('../../assets/images/drop1.jpg')}
                          style={styles.releaseThumb}
                        />
                        <View style={styles.releaseInfo}>
                          <View style={styles.releaseTitleRow}>
                            <Text style={styles.releaseTitle}>{rel.title}</Text>
                            <View style={styles.earlyBadge}>
                              <Text style={styles.earlyBadgeText}>{rel.releaseType || 'SINGLE'}</Text>
                            </View>
                          </View>
                          <Text style={styles.releaseArtist}>{artistName} • {trackCount} tracks</Text>
                        </View>
                        <Text style={styles.releaseDuration}>${rel.albumPrice?.toFixed(2) || '1.99'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: 12, backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 4, paddingHorizontal: 20 }}>

                <Text style={{ fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
                  {isOwnProfile ? "No Music Releases Yet! Publish singles, EPs, or albums directly to your fans." : "This artist has no music releases listed yet."}
                </Text>
                {isOwnProfile && (
                  <TouchableOpacity
                    style={{ backgroundColor: PURPLE, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
                    onPress={() => navigation.navigate('UploadMusic')}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: '#FFF', fontSize: 14, fontFamily: 'Poppins-Bold' }}>Upload Music</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* 5. Orders Tab (User) */}
        {role === 'user' && userTab === 'Orders' && (
          <View style={styles.tabContent}>
            {USER_ORDERS.map(order => (
              <View key={order.id} style={styles.orderCard}>
                <Image source={order.image} style={styles.orderThumb} />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNo}>{order.orderNo}</Text>
                  <Text style={styles.orderTitle} numberOfLines={1}>{order.title}</Text>
                  <Text style={styles.orderPrice}>{order.price}</Text>
                </View>
                <View style={styles.orderStatusBadge}>
                  <Text style={styles.orderStatusText}>{order.status}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 6. Tribes Tab (User) */}
        {role === 'user' && userTab === 'Tribes' && (
          <View style={styles.tabContent}>
            {[
              { name: 'CelebStash Collectors', members: '3.4k members', img: require('../../assets/images/drop1.jpg') },
              { name: 'Ambient Soundscapes Club', members: '1.2k members', img: require('../../assets/images/product1.jpg') },
            ].map((tribe, idx) => (
              <View key={idx} style={styles.releaseRow}>
                <Image source={tribe.img} style={styles.releaseThumb} />
                <View style={styles.releaseInfo}>
                  <Text style={styles.releaseTitle}>{tribe.name}</Text>
                  <Text style={styles.releaseArtist}>{tribe.members}</Text>
                </View>
                <TouchableOpacity style={styles.streamBtn}>
                  <Text style={styles.streamBtnText}>Joined</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 7. Concerts Tab (Artist) */}
        {role === 'artist' && artistTab === 'Concerts' && (
          <View style={styles.tabContent}>
            {[
              { title: 'Vortex Neon World Tour', date: 'AUG 12, 2026', venue: 'Crypto.com Arena • Los Angeles, CA', price: '$85.00' },
              { title: 'Ethereal Acoustic Sessions', date: 'SEP 04, 2026', venue: 'Radio City Music Hall • New York, NY', price: '$65.00' },
              { title: 'Slow Soundscapes Live', date: 'OCT 18, 2026', venue: 'O2 Academy Brixton • London, UK', price: '£45.00' },
            ].map((concert, idx) => (
              <View key={idx} style={styles.orderCard}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>{concert.title}</Text>
                  <Text style={styles.orderNo}>{concert.venue}</Text>
                  <Text style={styles.orderPrice}>{concert.date} • From {concert.price}</Text>
                </View>
                <TouchableOpacity style={styles.streamBtn}>
                  <Text style={styles.streamBtnText}>Tickets</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 8. Analytics & Artist Wallet Tab (Artist) */}
        {role === 'artist' && artistTab === 'Analytics' && (
          <View style={styles.tabContent}>
            {/* Artist Wallet Summary Card */}
            <View style={styles.artistWalletCard}>
              <View style={styles.walletHeaderRow}>
                <View>
                  <Text style={styles.walletLabel}>ARTIST WALLET BALANCE</Text>
                  <Text style={styles.walletAmount}>$4,820.50</Text>
                </View>
                <View style={styles.walletBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.walletBadgeText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.walletSub}>+ $640.00 pending payout from merch & ticket sales this week.</Text>
              <TouchableOpacity
                style={styles.payoutBtn}
                onPress={() => navigation.navigate('Ewallet')}
              >
                <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
                <Text style={styles.payoutBtnText}>Manage Wallet & Payouts</Text>
              </TouchableOpacity>
            </View>

            {/* Performance Analytics Grid */}
            <Text style={styles.sectionHeading}>CREATOR PERFORMANCE</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricNumber}>142.8K</Text>
                <Text style={styles.metricLabel}>Monthly Listeners</Text>
                <Text style={styles.metricGrowth}>+18.4% this month</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricNumber}>
                  {myRealPosts.reduce((acc, p) => acc + (p.repostsCount || 0), 0) || 124}
                </Text>
                <Text style={styles.metricLabel}>Total Reposts</Text>
                <Text style={styles.metricGrowth}>+15.3% virality rate</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricNumber}>$12.4K</Text>
                <Text style={styles.metricLabel}>Total Merch Sales</Text>
                <Text style={styles.metricGrowth}>+24.1% vs last month</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricNumber}>18.9K</Text>
                <Text style={styles.metricLabel}>Track Streams</Text>
                <Text style={styles.metricGrowth}>+12.0% this week</Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={styles.metricNumber}>94.2%</Text>
                <Text style={styles.metricLabel}>Fan Engagement</Text>
                <Text style={styles.metricGrowth}>Top 5% Creators</Text>
              </View>
            </View>
          </View>
        )}

        {/* 9. Reposts Tab (Artist & User) */}
        {((role === 'artist' && artistTab === 'Reposts') || (role === 'user' && userTab === 'Reposts')) && (
          <View style={styles.tabContent}>
            <Post
              posts={repostedRealPosts}
              emptyMessage={isOwnProfile ? "No reposted posts yet." : "This user hasn't reposted any posts yet."}
            />
          </View>
        )}
      </ScrollView>

      {/* Followers / Following List Modal */}
      <FollowersFollowingModal
        visible={followModalVisible}
        initialTab={followModalTab}
        userId={targetUserId}
        onClose={() => setFollowModalVisible(false)}
      />

      {/* Floating Action Button (Shows ONLY when the active tab has at least 1 item) */}
      {isOwnProfile && (role === 'artist' || sessionUser?.role === 'ARTIST' || sessionUser?.role === 'ADMIN') && (() => {
        const hasPosts = myRealPosts.length > 0;
        const hasProducts = realProducts.length > 0;
        const hasMusic = musicReleases.length > 0;

        let shouldShowFab = false;
        if (role === 'artist') {
          if (artistTab === 'Feed' && hasPosts) shouldShowFab = true;
          if (artistTab === 'Shop' && hasProducts) shouldShowFab = true;
          if (artistTab === 'Music' && hasMusic) shouldShowFab = true;
        } else {
          if (userTab === 'Feed' && hasPosts) shouldShowFab = true;
        }

        if (!shouldShowFab) return null;

        return (
          <TouchableOpacity
            style={styles.floatingCreatePostBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (role === 'artist' && artistTab === 'Shop') {
                navigation.navigate('CreateProduct');
              } else if (role === 'artist' && artistTab === 'Music') {
                navigation.navigate('UploadMusic');
              } else {
                navigation.navigate('CreatePost');
              }
            }}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        );
      })()}

      {/* Add Post Modal for Artist Profile */}
      <AddPostModal
        visible={addPostVisible}
        onClose={() => setAddPostVisible(false)}
        onPostCreated={fetchMyPosts}
        artistName={profileData?.fullName || sessionUser?.fullName || 'Artist'}
      />

      {/* Footer Navigation */}
      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
  },

  // ── Role Toggle Chips ──
  roleToggleContainer: {
    flexDirection: 'row',
    paddingTop: height * 0.05,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
  },
  roleChipActive: {
    backgroundColor: PURPLE,
  },
  roleChipText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },

  // ── Header ──
  headerContainer: {
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  profileTopRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 32,
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  handle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 14,
  },
  statText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  statNumber: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  statDot: {
    marginHorizontal: 5,
    color: '#9CA3AF',
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 14,
  },
  mateBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  matedBtn: {
    backgroundColor: '#EDE9FE',
  },
  mateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  matedBtnText: {
    color: PURPLE,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  messageBtnText: {
    color: '#111',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  bioText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 19,
    marginBottom: 14,
  },

  // ── Premium Access / Upgrade Banner ──
  premiumBanner: {
    backgroundColor: '#F5F3FF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  premiumTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  premiumTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PURPLE,
    marginRight: 6,
  },
  premiumTag: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    lineHeight: 18,
  },
  premiumSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  claimBtn: {
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexShrink: 0,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },

  // ── Sub-Tabs Bar ──
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: PURPLE,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },

  // ── Tab Content ──
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postArtistName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  postTime: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  postPlusBtn: {
    padding: 4,
  },
  postCaption: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    lineHeight: 18,
    marginBottom: 10,
  },
  mediaWrap: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  postMedia: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  shoppableTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shoppableTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  shoppablePriceBadge: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  shoppablePrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },

  // ── Shop / Saved Grid ──
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  productCard: {
    width: (width - 50) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImgWrap: {
    position: 'relative',
    width: '90%',
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shopPriceTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopPriceTagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeNew: {
    backgroundColor: PURPLE,
  },
  badgeLtd: {
    backgroundColor: '#D946EF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
  productInfo: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  productTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  productArtist: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  cartIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Music Section ──
  lpCard: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  lpHeroImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  lpPlayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 35,
  },
  lpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lpTextWrap: {
    flex: 1,
  },
  lpTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  lpSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  streamBtn: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  streamBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  sectionHeading: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  releasesList: {
    gap: 12,
  },
  releaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
  },
  releaseThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  releaseInfo: {
    flex: 1,
  },
  releaseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  releaseTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  earlyBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  earlyBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
  },
  releaseArtist: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  releaseDuration: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },

  // ── Orders Card ──
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  orderThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNo: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  orderTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  orderPrice: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  orderStatusBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  orderStatusText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  pendingBannerTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#92400E',
  },
  pendingBannerSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#B45309',
  },

  // Artist Wallet & Analytics Styles
  artistWalletCard: {
    backgroundColor: '#7126D0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  walletLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#D8B4FE',
    letterSpacing: 1,
  },
  walletAmount: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  walletBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  walletSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#F3E8FF',
    marginTop: 8,
    lineHeight: 16,
  },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 14,
    gap: 8,
  },
  payoutBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    width: (width - 44) / 2,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
  },
  metricNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginTop: 2,
  },
  metricGrowth: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#10B981',
    marginTop: 6,
  },
  communityBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  communityBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FD',
    borderWidth: 1,
    borderColor: 'rgba(113, 38, 208, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
  },
  communityBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
  },
  communityBadgeSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  tribeChannelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: 'rgba(113, 38, 208, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  tribeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EAE0F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tribeInfo: {
    flex: 1,
  },
  tribeTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  officialBadge: {
    backgroundColor: '#7126D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  officialBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
  tribeSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 1,
  },
  joinTribeBtn: {
    backgroundColor: '#7126D0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  joinTribeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  highlightsContainer: {
    marginTop: 14,
    marginBottom: 6,
  },
  highlightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightsTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  archiveLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  archiveLinkText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
  },
  highlightsScroll: {
    paddingRight: 10,
    gap: 14,
  },
  highlightItem: {
    alignItems: 'center',
    width: 62,
  },
  newHighlightCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderColor: '#7126D0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F0FD',
  },
  highlightCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 2,
  },
  highlightImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  highlightLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
  floatingCreatePostBtn: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    zIndex: 99,
  },
  addShopItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7126D0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  addShopItemBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  emptyShopState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyShopText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default MyProfile;
