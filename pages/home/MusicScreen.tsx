import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';
import TabBar from '@/components/Tabbar';
import { Ionicons } from '@expo/vector-icons';
import { musicService, MusicReleaseItem } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';
import { getSessionUser } from '@/lib/session';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

interface FeaturedArtistItem {
  id: string;
  name: string;
  username?: string;
  image: any;
}

const MusicScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const sessionUser = getSessionUser();
  const isArtist = sessionUser?.role === 'ARTIST' || sessionUser?.role === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');
  const [realReleases, setRealReleases] = useState<MusicReleaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleArtistPress = (artist: FeaturedArtistItem) => {
    const isOwn = sessionUser && (
      String(sessionUser.id) === String(artist.id) ||
      (sessionUser.username && artist.username && sessionUser.username.toLowerCase() === artist.username.toLowerCase())
    );
    navigation.navigate('MyProfile', {
      isOtherUser: !isOwn,
      userId: Number(artist.id),
      username: artist.username || artist.name,
      name: artist.name,
      avatar: artist.image,
      role: 'artist',
      initialTab: 'Music',
      activeTab: 'Music',
      tab: 'Music',
    });
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => { fetchMusicData(); });
    fetchMusicData();
    return unsubscribe;
  }, [navigation]);

  const fetchMusicData = async () => {
    setLoading(true);
    try {
      const data = await musicService.getReleases();
      setRealReleases(data || []);
    } catch (e) {
      console.warn('Failed to fetch releases:', e);
    } finally {
      setLoading(false);
    }
  };

  const featuredArtists = React.useMemo(() => {
    const artistMap = new Map<string, FeaturedArtistItem>();
    realReleases.forEach((rel) => {
      const a = rel.artist;
      if (a && a.id) {
        const idStr = String(a.id);
        if (!artistMap.has(idStr)) {
          const name = a.artistName || a.fullName || a.username || 'Artist';
          const username = a.username || '';
          const img = a.profilePicture
            ? { uri: resolveImageUrl(a.profilePicture) }
            : require('@/assets/images/prof.jpg');
          artistMap.set(idStr, { id: idStr, name, username, image: img });
        }
      }
    });
    return Array.from(artistMap.values());
  }, [realReleases]);

  const filteredReleases = searchQuery.trim()
    ? realReleases.filter(
        item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.artist?.artistName || item.artist?.username || item.artist?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : realReleases;

  const isSongOwner = (item: MusicReleaseItem) => {
    if (!sessionUser || !item.artist) return false;
    return (
      String(item.artist.id) === String(sessionUser.id) ||
      (sessionUser.username && item.artist.username && sessionUser.username.toLowerCase() === item.artist.username.toLowerCase())
    );
  };

  const handleReleasePress = (item: MusicReleaseItem) => {
    if (isSongOwner(item)) {
      navigation.navigate('ArtistSongDetail', { id: item.id });
    } else {
      navigation.navigate('MusicDetail', { id: item.id });
    }
  };

  // Horizontal card (Upcoming Exclusive Drops)
  const renderUpcoming = ({ item }: { item: MusicReleaseItem }) => {
    const coverUri = item.coverArtUrl ? resolveImageUrl(item.coverArtUrl) : null;
    const artistName = item.artist?.artistName || item.artist?.fullName || item.artist?.username || 'Artist';
    const isOwner = isSongOwner(item);
    const accessCount = item.tracks?.length || 0;

    return (
      <TouchableOpacity
        style={styles.upcomingCard}
        activeOpacity={0.9}
        onPress={() => handleReleasePress(item)}
      >
        <ImageBackground
          source={coverUri ? { uri: coverUri } : require('@/assets/images/drop1.jpg')}
          style={styles.upcomingBg}
          imageStyle={styles.upcomingImageStyle}
        >
          {/* Price / owner badge top-left */}
          <View style={styles.upcomingPriceBadge}>
            <Text style={styles.upcomingPriceText}>
              {isOwner ? '👑 Yours' : `$${item.albumPrice?.toFixed(2) || '9.99'}`}
            </Text>
          </View>

          {/* Dark gradient overlay at bottom */}
          <View style={styles.upcomingGradient}>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.upcomingArtistRow}>
                <Text style={styles.upcomingArtist}>{artistName}</Text>
                <Svg width="12" height="12" viewBox="0 0 24 24" fill={PURPLE} style={{ marginLeft: 4 }}>
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
              <View style={styles.upcomingFooter}>
                <Text style={styles.upcomingDropType}>
                  {isOwner ? '📊 Analytics' : (item.releaseType || 'Single')}
                </Text>
                <Text style={styles.upcomingAccesses}>
                  {accessCount > 0 ? `${accessCount} Access` : 'Direct Access'}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // Numbered song row — matches the screenshot layout exactly:
  // [number] [square-image] [title / artist] [price]
  const renderSong = ({ item, index }: { item: MusicReleaseItem; index: number }) => {
    const coverUri = item.coverArtUrl ? resolveImageUrl(item.coverArtUrl) : null;
    const artistName = item.artist?.artistName || item.artist?.fullName || item.artist?.username || 'Artist';
    const isOwner = isSongOwner(item);

    return (
      <TouchableOpacity
        style={styles.songRow}
        activeOpacity={0.8}
        onPress={() => handleReleasePress(item)}
      >
        {/* Track Number */}
        <Text style={styles.songNumber}>{index + 1}</Text>

        {/* Square Thumbnail */}
        <Image
          source={coverUri ? { uri: coverUri } : require('@/assets/images/products/product1.jpg')}
          style={styles.songImage}
        />

        {/* Title + Artist stacked */}
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{artistName}</Text>
        </View>

        {/* Price or owner badge */}
        <Text style={[styles.songPrice, isOwner && { color: PURPLE }]}>
          {isOwner ? '👑' : `$${item.albumPrice?.toFixed(2) || '1.99'}`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderArtist = ({ item }: { item: FeaturedArtistItem }) => (
    <TouchableOpacity
      style={styles.artistAvatarContainer}
      activeOpacity={0.8}
      onPress={() => handleArtistPress(item)}
    >
      {/* Ring border around avatar */}
      <View style={styles.artistAvatarRing}>
        <Image source={item.image} style={styles.artistAvatar} />
      </View>
      <Text style={styles.artistNameText} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unreleased Music</Text>
        <View style={styles.headerRightActions}>
          {isArtist && (
            <TouchableOpacity style={styles.libraryHeaderBtn} onPress={() => navigation.navigate('UploadMusic')}>
              <Ionicons name="cloud-upload" size={22} color={PURPLE} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.libraryHeaderBtn} onPress={() => navigation.navigate('Library')}>
            <Ionicons name="library" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Search Bar ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={styles.searchIcon}>
              <Circle cx="11" cy="11" r="8" />
              <Path d="m21 21-4.3-4.3" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for music, artist..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
              <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* ── Featured Banner (first release) ── */}
        {filteredReleases.length > 0 && (() => {
          const featured = filteredReleases[0];
          const bannerImg = featured.coverArtUrl ? resolveImageUrl(featured.coverArtUrl) : null;
          const bannerArtistName = featured.artist?.artistName || featured.artist?.fullName || featured.artist?.username || 'Featured Artist';

          return (
            <TouchableOpacity
              style={styles.bannerContainer}
              activeOpacity={0.9}
              onPress={() => handleReleasePress(featured)}
            >
              <ImageBackground
                source={bannerImg ? { uri: bannerImg } : require('@/assets/images/drop1.jpg')}
                style={styles.bannerBg}
                imageStyle={{ borderRadius: 14 }}
              >
                <View style={styles.bannerOverlay}>
                  <View style={styles.bannerArtistRow}>
                    <Text style={styles.bannerArtist}>{bannerArtistName}</Text>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill={PURPLE} style={{ marginLeft: 4 }}>
                      <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </Svg>
                  </View>
                  <Text style={styles.bannerTitle} numberOfLines={2}>{featured.title}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })()}

        {/* ── Upcoming Exclusive Drops (horizontal scroll) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Release</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllReleases' as any)}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredReleases}
          keyExtractor={item => String(item.id)}
          renderItem={renderUpcoming}
          contentContainerStyle={styles.upcomingList}
        />

        {/* ── Top Songs (numbered list matching screenshot) ── */}
        {filteredReleases.length > 0 && (
          <View style={styles.topSongsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Songs</Text>
            </View>
            <View style={styles.songsList}>
              {filteredReleases.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSong({ item, index })}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* ── Featured Artists (circular avatars) ── */}
        {featuredArtists.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Artists</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredArtists}
              keyExtractor={(item) => item.id}
              renderItem={renderArtist}
              contentContainerStyle={styles.artistsList}
            />
          </>
        )}

        {/* Empty state */}
        {filteredReleases.length === 0 && (
          <View style={styles.emptySearch}>
            <Ionicons name="musical-notes-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptySearchText}>
              {loading ? 'Loading releases...' : searchQuery ? `No results for "${searchQuery}"` : 'No releases yet'}
            </Text>
          </View>
        )}

      </ScrollView>

      {/* Floating TabBar */}
      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </View>
  );
};

export default MusicScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: height * 0.06,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  libraryHeaderBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // ── Search ──────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  filterBtn: {
    width: 46,
    height: 46,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Featured Banner ──────────────────────────────
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bannerBg: {
    width: '100%',
    height: 190,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bannerArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerArtist: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.3,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    lineHeight: 26,
    textTransform: 'uppercase',
  },

  // ── Section Headers ──────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },

  // ── Horizontal Cards (Upcoming) ──────────────────
  upcomingList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  upcomingCard: {
    width: width * 0.62,
    height: 210,
    marginRight: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upcomingBg: {
    flex: 1,
  },
  upcomingImageStyle: {
    resizeMode: 'cover',
  },
  upcomingGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  upcomingPriceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  upcomingPriceText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
  },
  upcomingInfo: {
    padding: 12,
  },
  upcomingTitle: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    lineHeight: 18,
    marginBottom: 4,
  },
  upcomingArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingArtist: {
    color: '#ccc',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  upcomingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingDropType: {
    color: PURPLE,
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  upcomingAccesses: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },

  // ── Top Songs (numbered list) ────────────────────
  topSongsSection: {
    marginBottom: 8,
  },
  songsList: {
    paddingHorizontal: 20,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  songNumber: {
    width: 20,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    textAlign: 'center',
    marginRight: 12,
  },
  songImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  songPrice: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    minWidth: 40,
    textAlign: 'right',
  },

  // ── Featured Artists ─────────────────────────────
  artistsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  artistAvatarContainer: {
    alignItems: 'center',
    marginRight: 18,
  },
  artistAvatarRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2.5,
    borderColor: PURPLE,
    padding: 2,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#E5E7EB',
  },
  artistNameText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#111',
    maxWidth: 70,
    textAlign: 'center',
  },

  // ── Tab Bar ──────────────────────────────────────
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },

  // ── Empty State ───────────────────────────────────
  emptySearch: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptySearchText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
