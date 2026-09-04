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

const { width, height } = Dimensions.get('window');

const upcomingReleases = [
  { id: '1', title: "I don't want to loose your love i cannot afford to say you see me no forget me ogege choos cweeeh", artist: 'Justin Timberlake', price: 10.25, accesses: 3, image: require('@/assets/images/drop1.jpg') },
  { id: '2', title: "I don't want to loose your love i cannot afford to say you see me no forget me ogege choos cweeeh", artist: 'Justin Timberlake', price: 10.25, accesses: 3, image: require('@/assets/images/storyItem.jpg') },
];

const songsData = [
  { id: '0', name: 'If the world was ending ft T-Pain', artist: 'Justin Timberlake', price: 3.0, image: require('@/assets/images/products/product1.jpg'), artistImage: require('@/assets/images/prof.jpg') },
  { id: '1', name: 'If the world was ending ft T-Pain', artist: 'Justin Timberlake', price: 3.0, image: require('@/assets/images/products/product2.jpg'), artistImage: require('@/assets/images/profile.jpg') },
  { id: '2', name: 'If the world was ending ft T-Pain', artist: 'Justin Timberlake', price: 3.0, image: require('@/assets/images/products/product3.jpg'), artistImage: require('@/assets/images/black-man.png') },
  { id: '3', name: 'If the world was ending ft T-Pain', artist: 'Justin Timberlake', price: 2.0, image: require('@/assets/images/products/product4.jpg'), artistImage: require('@/assets/images/prof.jpg') },
];

const featuredArtists = [
  { id: '1', name: 'Chris Brown', image: require('@/assets/images/prof.jpg') },
  { id: '2', name: 'Chris Brown', image: require('@/assets/images/profile.jpg') },
  { id: '3', name: 'Chris Brown', image: require('@/assets/images/black-man.png') },
  { id: '4', name: 'Chris Brown', image: require('@/assets/images/prof.jpg') },
];

const renderArtist = ({ item }: { item: typeof featuredArtists[0] }) => (
  <TouchableOpacity style={styles.artistAvatarContainer}>
    <Image source={item.image} style={styles.artistAvatar} />
    <Text style={styles.artistNameText}>{item.name}</Text>
  </TouchableOpacity>
);

const MusicScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [realReleases, setRealReleases] = useState<MusicReleaseItem[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMusicData();
    });
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

  const filteredReleases = searchQuery.trim()
    ? realReleases.filter(
        item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.artist?.username || item.artist?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : realReleases;

  const renderUpcoming = ({ item }: { item: MusicReleaseItem }) => {
    const coverUri = item.coverArtUrl ? resolveImageUrl(item.coverArtUrl) : null;
    const artistName = item.artist?.username || item.artist?.fullName || 'Artist';

    return (
      <TouchableOpacity
        style={styles.upcomingCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MusicDetail', { id: item.id })}
      >
        <ImageBackground
          source={coverUri ? { uri: coverUri } : require('@/assets/images/drop1.jpg')}
          style={styles.upcomingBg}
          imageStyle={styles.upcomingImageStyle}
        >
          <View style={styles.upcomingPriceBadge}>
            <Text style={styles.upcomingPriceText}>${item.albumPrice?.toFixed(2) || '9.99'}</Text>
          </View>
          <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, zIndex: 10 }}>
            <Text style={{ color: '#FF6B00', fontSize: 10, fontFamily: 'Poppins-Bold' }}>
              {item.availabilityStatus === 'EXCLUSIVE' ? '💎 EXCLUSIVE' : item.availabilityStatus === 'PRE_RELEASE' ? '⏳ PRE-RELEASE' : item.availabilityStatus === 'PUBLICLY_RELEASED' ? '🌐 PUBLIC' : '🔥 UNRELEASED'}
            </Text>
          </View>
          <View style={styles.upcomingGradient}>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingTitle} numberOfLines={2}>{item.title}</Text>
              <View style={styles.upcomingArtistRow}>
                <Text style={styles.upcomingArtist}>{artistName}</Text>
                <Svg width="12" height="12" viewBox="0 0 24 24" fill="#7126D0" style={{marginLeft: 4}}>
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
              <View style={styles.upcomingFooter}>
                <Text style={styles.upcomingDropType}>{item.releaseType || 'Single'}</Text>
                <Text style={styles.upcomingAccesses}>{item.defaultPlayLimit || 10} Plays</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderSong = ({ item }: { item: MusicReleaseItem }) => {
    const coverUri = item.coverArtUrl ? resolveImageUrl(item.coverArtUrl) : null;
    const artistName = item.artist?.username || item.artist?.fullName || 'Artist';

    return (
      <TouchableOpacity
        style={styles.songRow}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('MusicDetail', { id: item.id })}
      >
        <Image
          source={coverUri ? { uri: coverUri } : require('@/assets/images/products/product1.jpg')}
          style={styles.songImage}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={2}>{item.title}</Text>
          <View style={styles.songArtistRow}>
            <Text style={styles.songArtist}>{artistName}</Text>
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="#7126D0" style={{marginLeft: 4}}>
              <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </Svg>
          </View>
        </View>
        <Text style={styles.songPrice}>${item.albumPrice?.toFixed(2) || '1.99'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Unreleased Music</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.libraryHeaderBtn} onPress={() => navigation.navigate('UploadMusic')}>
            <Ionicons name="cloud-upload" size={22} color="#7126D0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.libraryHeaderBtn} onPress={() => navigation.navigate('MyMusic')}>
            <Ionicons name="library" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={styles.searchIcon}>
              <Circle cx="11" cy="11" r="8" />
              <Path d="m21 21-4.3-4.3" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for merch, artist..."
              placeholderTextColor="#666"
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

        {/* Featured Banner */}
        {(() => {
          const featured = filteredReleases.length > 0 ? filteredReleases[0] : null;
          const bannerImg = featured && featured.coverArtUrl ? resolveImageUrl(featured.coverArtUrl) : null;
          const bannerArtistName = featured?.artist?.username || featured?.artist?.fullName || 'Featured Artist';
          const bannerReleaseTitle = featured?.title || 'EXCLUSIVE UNRELEASED DROPS';

          return (
            <TouchableOpacity
              style={styles.bannerContainer}
              activeOpacity={0.9}
              onPress={() => featured && navigation.navigate('MusicDetail' as any, { id: featured.id })}
            >
              <ImageBackground
                source={bannerImg ? { uri: bannerImg } : require('@/assets/images/drop1.jpg')}
                style={styles.bannerBg}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={styles.bannerOverlay}>
                  <View style={styles.bannerArtistRow}>
                    <Text style={styles.bannerArtist}>{bannerArtistName}</Text>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="#7126D0" style={{ marginLeft: 4 }}>
                      <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </Svg>
                  </View>
                  <Text style={styles.bannerTitle}>{bannerReleaseTitle}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })()}

        {/* Upcoming Release */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Unreleased Exclusive Drops</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllReleases' as any)}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filteredReleases}
          keyExtractor={item => String(item.id)}
          renderItem={renderUpcoming}
          contentContainerStyle={styles.upcomingList}
        />

        {/* Songs List */}
        <View style={styles.songsList}>
          {filteredReleases.length > 0 ? (
            filteredReleases.map((item) => <React.Fragment key={item.id}>{renderSong({ item })}</React.Fragment>)
          ) : (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>
                {loading ? 'Loading releases...' : `No unreleased drops found ${searchQuery ? `for "${searchQuery}"` : ''}`}
              </Text>
            </View>
          )}
        </View>

        {/* Featured Artists */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Artists</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featuredArtists}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderArtist}
          contentContainerStyle={styles.artistsList}
        />
      </ScrollView>

      {/* Floating TabBar at the bottom */}
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
  headerIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: -2,
    backgroundColor: '#7126D0',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  scrollContent: {
    paddingBottom: 120, // space for tab bar
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
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
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  bannerBg: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    lineHeight: 24,
  },
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
    color: '#7126D0',
  },
  upcomingList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  upcomingCard: {
    width: width * 0.65,
    height: 200,
    marginRight: 16,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  upcomingPriceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  upcomingPriceText: {
    color: '#111',
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
    marginBottom: 6,
  },
  upcomingArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    color: '#7126D0',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  upcomingAccesses: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  songsList: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 14,
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
  songArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songArtist: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  songPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
  },
  artistsList: {
    paddingHorizontal: 20,
  },
  artistAvatarContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  artistAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  artistNameText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#111',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  emptySearch: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptySearchText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#999',
    textAlign: 'center',
  },
});
