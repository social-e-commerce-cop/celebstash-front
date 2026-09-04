import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Post from '@/components/home/Post';
import { fetchMyPosts, BackendPost } from '@/lib/postService';
import { getSessionUser } from '@/lib/session';

import { profileService, UserProfile } from '@/lib/profileService';
import { musicService, MusicReleaseItem } from '@/lib/musicService';
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
    case 'Event':
    case 'Concerts':
      return isActive ? 'ticket' : 'ticket-outline';
    case 'Auction':
      return isActive ? 'sparkles' : 'sparkles-outline';
    default:
      return isActive ? 'grid' : 'grid-outline';
  }
};

type TabType = 'Feed' | 'Shop' | 'Music' | 'Event' | 'Auction';

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

const PRODUCTS: ProductItem[] = [];

const RELEASES: ReleaseItem[] = [];

const ArtProfile: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<TabType>('Feed');
  const [isMated, setIsMated] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [artistPosts, setArtistPosts] = useState<BackendPost[]>([]);
  const [sessionUser, setSessionUser] = useState(getSessionUser());
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [musicReleases, setMusicReleases] = useState<MusicReleaseItem[]>([]);
  const [loadingMusic, setLoadingMusic] = useState(false);

  useEffect(() => {
    const loadArtistFeed = async () => {
      try {
        const res = await fetchMyPosts(0, 20);
        if (res && res.content) {
          setArtistPosts(res.content);
        }
      } catch (err) {
        console.error('Failed to load artist posts:', err);
      }
    };

    const loadProfile = async () => {
      setSessionUser(getSessionUser());
      try {
        const prof = await profileService.getMyProfile();
        if (prof) setProfileData(prof);
      } catch {}
    };

    const loadMusic = async () => {
      setLoadingMusic(true);
      try {
        const user = getSessionUser();
        const prof = await profileService.getMyProfile().catch(() => null);
        const currentUserId = prof?.id || user?.id;
        const currentUsername = (prof?.username || user?.username || '').toLowerCase();
        const currentEmail = (prof?.email || user?.email || '').toLowerCase();
        const currentFullName = (prof?.fullName || user?.fullName || '').toLowerCase();

        const targetArtistId = profileData?.id || currentUserId;
        const releases = await musicService.getReleases();
        if (Array.isArray(releases)) {
          const artistReleases = releases.filter(r => {
            if (!r.artist) return true;
            if (targetArtistId && String(r.artist.id) === String(targetArtistId)) return true;
            if (currentUsername && r.artist.username && r.artist.username.toLowerCase() === currentUsername) return true;
            if (currentEmail && (r.artist as any).email && (r.artist as any).email.toLowerCase() === currentEmail) return true;
            if (currentFullName && (r.artist as any).fullName && (r.artist as any).fullName.toLowerCase() === currentFullName) return true;
            return false;
          });
          setMusicReleases(artistReleases.length > 0 ? artistReleases : releases);
        } else {
          setMusicReleases([]);
        }
      } catch (e) {
        console.warn('Failed to load artist music releases:', e);
        setMusicReleases([]);
      } finally {
        setLoadingMusic(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadArtistFeed();
      loadProfile();
      loadMusic();
    });
    loadArtistFeed();
    loadProfile();
    loadMusic();

    return unsubscribe;
  }, [navigation]);

  const displayName = profileData?.fullName || sessionUser?.fullName || 'Artist';
  const displayHandle = profileData?.username ? `@${profileData.username}` : (sessionUser?.username ? `@${sessionUser.username}` : '@artist');
  const avatarSource = profileData?.profilePicture ? { uri: profileData.profilePicture } : require('../../../assets/images/black-man.png');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Artist Profile Header ── */}
        <View style={styles.headerContainer}>
          {/* Top Row: Avatar + Info + Menu */}
          <View style={styles.profileTopRow}>
            <Image
              source={avatarSource}
              style={styles.avatar}
            />

            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.artistName}>{displayHandle}</Text>
                <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={styles.verifiedIcon} />
              </View>
              <Text style={styles.handle}>{displayName}</Text>

              <View style={styles.statsRow}>
                <TouchableOpacity onPress={() => alert(`${profileData?.followersCount || 0} Followers`)}>
                  <Text style={styles.statText}>
                    <Text style={styles.statNumber}>{(profileData?.followersCount || 0).toLocaleString()}</Text> Followers
                  </Text>
                </TouchableOpacity>
                <Text style={styles.statDot}>•</Text>
                <TouchableOpacity onPress={() => alert(`Following ${profileData?.followingCount || 0} creators`)}>
                  <Text style={styles.statText}>
                    <Text style={styles.statNumber}>{(profileData?.followingCount || 0).toLocaleString()}</Text> Following
                  </Text>
                </TouchableOpacity>
                <Text style={styles.statDot}>•</Text>
                <TouchableOpacity onPress={() => setActiveTab('Shop')}>
                  <Text style={styles.statText}>
                    <Text style={styles.statNumber}>{artistPosts.length}</Text> Drops
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('ArtSettings')}>
              <Ionicons name="menu-outline" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons Row: Follow + Message */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.mateBtn, isMated && styles.matedBtn]}
              onPress={() => setIsMated(!isMated)}
              activeOpacity={0.8}
            >
              <Text style={[styles.mateBtnText, isMated && styles.matedBtnText]}>
                {isMated ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => navigation.navigate('MessagesScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>

          {/* Bio paragraph */}
          <Text style={styles.bioText}>
            {profileData?.bio || 'No bio provided yet.'}
          </Text>

          {/* Creator Hub Banner */}
          <TouchableOpacity 
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('BecomeArtist')}
            activeOpacity={0.85}
          >
            <View style={styles.premiumTextWrap}>
              <View style={styles.premiumTagRow}>
                <View style={styles.purpleDot} />
                <Text style={styles.premiumTag}>CREATOR HUB</Text>
              </View>
              <Text style={styles.premiumTitle}>Explore Exclusive Drops & Music</Text>
              <Text style={styles.premiumSubtitle}>Connect with fans & manage your stash</Text>
            </View>

            <TouchableOpacity style={styles.claimBtn} onPress={() => navigation.navigate('BecomeArtist')} activeOpacity={0.85}>
              <Text style={styles.claimBtnText}>Explore</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* ── Sub-Tabs Bar: Feed | Shop | Music | Auction ── */}
        <View style={styles.tabsBar}>
          {(['Feed', 'Shop', 'Music', 'Auction'] as const).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                onPress={() => setActiveTab(tab)}
              >
                <Ionicons name={getTabIconName(tab, isActive)} size={22} color={isActive ? PURPLE : '#6B7280'} />
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'Feed' && (
          <View style={styles.tabContent}>
            <Post posts={artistPosts} emptyMessage="No posts by this artist yet." />
          </View>
        )}

        {activeTab === 'Shop' && (
          <View style={styles.shopGrid}>
            {PRODUCTS.map(item => (
              <View key={item.id} style={styles.productCard}>
                <View style={styles.productImgWrap}>
                  <Image source={item.image} style={styles.productImg} />
                  {item.badge && (
                    <View
                      style={[
                        styles.badgePill,
                        item.badge === 'LTD' ? styles.badgeLtd : styles.badgeNew,
                      ]}
                    >
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

        {activeTab === 'Music' && (
          <View style={styles.tabContent}>
            {musicReleases.length > 0 ? (
              <>
                {/* Featured LP Player Hero */}
                {(() => {
                  const featured = musicReleases[0];
                  const coverUri = featured.coverArtUrl ? resolveImageUrl(featured.coverArtUrl) : null;
                  const trackCount = featured.tracks?.length || 1;
                  const artistName = featured.artist?.username || featured.artist?.fullName || displayName;

                  return (
                    <View style={styles.lpCard}>
                      <Image
                        source={coverUri ? { uri: coverUri } : require('../../../assets/images/drop1.jpg')}
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
                  {(sessionUser?.role === 'ARTIST' || sessionUser?.role === 'ADMIN') && (
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
                    const artistName = rel.artist?.username || rel.artist?.fullName || displayName;
                    const trackCount = rel.tracks?.length || 1;

                    return (
                      <TouchableOpacity
                        key={rel.id}
                        style={styles.releaseRow}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('MusicDetail', { id: rel.id })}
                      >
                        <Image
                          source={coverUri ? { uri: coverUri } : require('../../../assets/images/drop1.jpg')}
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
              <View style={{ alignItems: 'center', paddingVertical: 36, backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 4, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111', marginTop: 4 }}>
                  No Music Releases Yet
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
                  Publish singles, EPs, or albums directly to your fans.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: PURPLE, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 16 }}
                  onPress={() => navigation.navigate('UploadMusic')}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#FFF', fontSize: 14, fontFamily: 'Poppins-Bold' }}>Upload Music</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Event' && (
          <View style={styles.tabContent}>
            {[
              { title: 'Vortex Neon World Tour', location: 'Los Angeles, CA', date: 'AUG 12 • 8:00 PM' },
              { title: 'Live Vinyl & Acoustic Session', location: 'London, UK', date: 'SEP 04 • 7:30 PM' },
              { title: 'CelebStash Exclusive Meet & Greet', location: 'New York, NY', date: 'OCT 18 • 6:00 PM' },
            ].map((event, idx) => (
              <View key={idx} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventLoc}>{event.location}</Text>
                </View>
                <TouchableOpacity style={styles.ticketBtn}>
                  <Text style={styles.ticketBtnText}>Get Tickets</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Auction' && (
          <View style={styles.tabContent}>
            {[
              { title: 'Signed Ethereal Vinyl #001', currentBid: '$340', timeLeft: '02h 14m' },
              { title: 'Worn Vortex Tour Hoodie', currentBid: '$520', timeLeft: '05h 40m' },
            ].map((auc, idx) => (
              <View key={idx} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{auc.title}</Text>
                  <Text style={styles.eventDate}>Current Bid: {auc.currentBid}</Text>
                  <Text style={styles.eventLoc}>Ends in: {auc.timeLeft}</Text>
                </View>
                <TouchableOpacity style={styles.ticketBtn}>
                  <Text style={styles.ticketBtnText}>Place Bid</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header ──
  headerContainer: {
    paddingTop: height * 0.055,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
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
    color: '#111',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  handle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  statNumber: {
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  statDot: {
    marginHorizontal: 6,
    color: '#9CA3AF',
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  mateBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 20,
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
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  messageBtnText: {
    color: '#111',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  bioText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 19,
    marginBottom: 14,
  },

  // ── Premium Access Banner ──
  premiumBanner: {
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: 13,
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

  // ── Shop Grid ──
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  productImgWrap: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  streamBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
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

  // ── Mini Player ──
  miniPlayerBar: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  miniPlayerThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
  },
  miniPlayerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Event / Auction Cards ──
  eventCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  eventDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
    marginTop: 2,
  },
  eventLoc: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  ticketBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ticketBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
});

export default ArtProfile;
