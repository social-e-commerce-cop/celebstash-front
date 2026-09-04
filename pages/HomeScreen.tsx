import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Dimensions, View, Text, TextInput, TouchableOpacity, StatusBar, RefreshControl, Platform } from 'react-native';
import { useNavigation } from "@react-navigation/native"; 
import type { StackNavigationProp } from "@react-navigation/stack";
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import TabBar from '@/components/Tabbar';
import ProfileSection from '@/components/home/ProfileSection';
import LatestDrops from '@/components/home/LatestDrops';
import AuctionGrid from '@/components/home/AuctionGrid';
import Post from '@/components/home/Post';
import LiveAuctionBanner from '@/components/home/LiveAuctionBanner';
import { AddPostModal } from '@/components/home/AddPostModal';
import { getSessionUser } from '@/lib/session';
import { fetchHomeFeed, BackendPost } from '@/lib/postService';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>(); 
  const [user, setUser] = useState(getSessionUser());
  const [postsList, setPostsList] = useState<BackendPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addPostVisible, setAddPostVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadFeedPosts = useCallback(async () => {
    try {
      const res = await fetchHomeFeed(0, 20);
      if (res && res.content) {
        setPostsList(res.content);
      }
    } catch (err) {
      console.error('Error fetching home feed:', err);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeedPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setUser(getSessionUser());
      loadFeedPosts();
    });
    loadFeedPosts();
    return unsubscribe;
  }, [navigation, loadFeedPosts]);

  // Filter posts by username or caption text
  const filteredPosts = searchQuery.trim()
    ? postsList.filter(
        p =>
          (p.userName && p.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : postsList;

  const handleChatPress = () => {
    navigation.navigate('MessagesScreen');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const isArtistOrAdmin = user?.role === 'ARTIST' || user?.role === 'ADMIN';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7126D0']} />
        }
      >
        {/* Header: Logo & Purple Badged Icons */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>ZIKII</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>

          <View style={styles.iconContainer}>
            {/* Notification bell button */}
            <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress} activeOpacity={0.8}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </Svg>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>

            {/* Messaging bubble button */}
            <TouchableOpacity style={styles.iconButton} onPress={handleChatPress} activeOpacity={0.8}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar pill */}
        <View style={styles.searchBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Browse', { initialQuery: searchQuery })}
            activeOpacity={0.7}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" style={styles.searchIcon}>
              <Circle cx="11" cy="11" r="8" />
              <Path d="m21 21-4.3-4.3" />
            </Svg>
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for merch, artist, drops..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => navigation.navigate('Browse', { initialQuery: searchQuery })}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Browse', { initialQuery: searchQuery })}>
              <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#7126D0' }}>Search</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Featured Artists Horizontal list */}
        <ProfileSection />

        {/* Live Auction Banner */}
        <LiveAuctionBanner />

        {/* Quick Shop Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' }}>Shop & Drops</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Shop')}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#7126D0' }}>Shop All Products</Text>
            <Ionicons name="arrow-forward" size={14} color="#7126D0" />
          </TouchableOpacity>
        </View>

        {/* Latest Drops */}
        <LatestDrops />

        {/* AuctionGrid */}
        <AuctionGrid auctions={[]} />

        {/* Real Feed posts list */}
        <Post posts={filteredPosts} />
      </ScrollView>

      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight ? StatusBar.currentHeight + 28 : 52),
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    letterSpacing: 1,
  },
  logoDot: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#7126D0',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 42,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  floatingCreatePostBtn: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7126D0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7126D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 999,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
