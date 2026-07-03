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

const MusicScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter songs by title or artist based on search query
  const filteredSongs = searchQuery.trim()
    ? songsData.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : songsData;

  const renderUpcoming = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.upcomingCard} activeOpacity={0.9} onPress={() => {}}>
      <ImageBackground source={item.image} style={styles.upcomingBg} imageStyle={styles.upcomingImageStyle}>
        <View style={styles.upcomingPriceBadge}>
          <Text style={styles.upcomingPriceText}>${item.price}</Text>
        </View>
        <View style={styles.upcomingGradient}>
          <View style={styles.upcomingInfo}>
            <Text style={styles.upcomingTitle} numberOfLines={3}>{item.title}</Text>
            <View style={styles.upcomingArtistRow}>
              <Text style={styles.upcomingArtist}>{item.artist}</Text>
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="#7126D0" style={{marginLeft: 4}}>
                <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </Svg>
            </View>
            <View style={styles.upcomingFooter}>
              <Text style={styles.upcomingDropType}>Single Drop</Text>
              <Text style={styles.upcomingAccesses}>{item.accesses} Accesses</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderSong = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.songRow}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDetails', {
          name: item.name,
          price: item.price,
          image: item.image,
          description: 'This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals',
          artistName: item.artist,
          verified: true,
          category: 'Music',
          artistImage: item.artistImage,
        })
      }
    >
      <Image source={item.image} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.songArtistRow}>
          <Text style={styles.songArtist}>{item.artist}</Text>
          <Svg width="12" height="12" viewBox="0 0 24 24" fill="#7126D0" style={{marginLeft: 4}}>
            <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </Svg>
        </View>
      </View>
      <Text style={styles.songPrice}>${item.price.toFixed(1)}</Text>
    </TouchableOpacity>
  );

  const renderArtist = ({ item }: { item: any }) => (
    <View style={styles.artistAvatarContainer}>
      <Image source={item.image} style={styles.artistAvatar} />
      <Text style={styles.artistNameText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Music</Text>
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.libraryHeaderBtn} onPress={() => navigation.navigate('Library')}>
            <Ionicons name="library" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
              <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </Svg>
            <View style={styles.badge}><Text style={styles.badgeText}>1</Text></View>
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
        <View style={styles.bannerContainer}>
          <ImageBackground source={require('@/assets/images/drop1.jpg')} style={styles.bannerBg} imageStyle={{borderRadius: 12}}>
            <View style={styles.bannerOverlay}>
              <View style={styles.bannerArtistRow}>
                <Text style={styles.bannerArtist}>Justin Timberlake</Text>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="#7126D0" style={{marginLeft: 4}}>
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
              <Text style={styles.bannerTitle}>IF THE WORLD WAS ENDING FT TAYE P</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Upcoming Release */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Release</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllReleases' as any)}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={upcomingReleases}
          keyExtractor={item => item.id}
          renderItem={renderUpcoming}
          contentContainerStyle={styles.upcomingList}
        />

        {/* Songs List */}
        <View style={styles.songsList}>
          {filteredSongs.length > 0 ? (
            filteredSongs.map((item) => <React.Fragment key={item.id}>{renderSong({ item })}</React.Fragment>)
          ) : (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>No songs found for "{searchQuery}"</Text>
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
