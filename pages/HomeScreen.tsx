import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Dimensions, View, Text, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from "@react-navigation/native"; 
import type { StackNavigationProp } from "@react-navigation/stack";
import Svg, { Circle, Path } from 'react-native-svg';

import TabBar from '@/components/Tabbar';
import ProfileSection from '@/components/home/ProfileSection';
import LatestDrops from '@/components/home/LatestDrops';
import AuctionGrid from '@/components/home/AuctionGrid';
import Post from '@/components/home/Post';
import { getSessionUser } from '@/lib/session';
import postsData from '@/lib/postsData';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>(); 
  const [user, setUser] = useState(getSessionUser());
  const [activeTab, setActiveTab] = useState('For You');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts by username or caption text
  const filteredPosts = searchQuery.trim()
    ? postsData.filter(
        p =>
          p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.postText.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : postsData;

  // Define state for active auctions. If this array is empty [], the Auction Grid hides completely!
  const [auctions, setAuctions] = useState<any[]>([
    {
      id: 1,
      image: require('../assets/images/smiling-black.png'),
      title: 'This is the jacket i wore during the opening ...',
      viewerCount: '3.4K',
      artistName: 'Kenny K Shot',
      artistAvatar: require('../assets/images/storyItem.jpg'),
      timeAgo: '1h ago',
    },
    {
      id: 2,
      image: require('../assets/images/feed7.png'),
      title: 'This is the jacket i wore during the opening ...',
      viewerCount: '3.4K',
      artistName: 'Kenny K Shot',
      artistAvatar: require('../assets/images/storyItem.jpg'),
      timeAgo: '1h ago',
    },
  ]);

  // Dynamically fetch username when the screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setUser(getSessionUser());
    });
    return unsubscribe;
  }, [navigation]);

  const handleChatPress = () => {
    navigation.navigate('MessagesScreen');
    console.log('Navigating to chat');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
    console.log('Navigating to notifications');
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header: Greeting & Purple Badged Icons */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingLight}>Good Morning</Text>
            <Text style={styles.greetingBold}>{user.fullName}</Text>
          </View>

          <View style={styles.iconContainer}>
            {/* Notification bell button with purple badge '1' */}
            <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress} activeOpacity={0.8}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </Svg>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>

            {/* Messaging bubble button with purple badge '2' */}
            <TouchableOpacity style={styles.iconButton} onPress={handleChatPress} activeOpacity={0.8}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar pill */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Browse', { initialQuery: searchQuery })}
        >
          <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" style={styles.searchIcon}>
            <Circle cx="11" cy="11" r="8" />
            <Path d="m21 21-4.3-4.3" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for merch, artist..."
            placeholderTextColor="#333"
            value={searchQuery}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

         {/* Section 5: ProfileSection (Featured Artists Horizontal list) */}
        <ProfileSection />


        {/* Custom Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => setActiveTab('For You')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'For You' ? styles.tabTextActive : styles.tabTextInactive]}>
              For You
            </Text>
            {activeTab === 'For You' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabButton} 
            onPress={() => setActiveTab('Following')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'Following' ? styles.tabTextActive : styles.tabTextInactive]}>
              Following
            </Text>
            {activeTab === 'Following' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </View>
        {/* Section 4: Latest Drops (Drop Banner) */}
        <LatestDrops />

        {/* Section 6: AuctionGrid (Side-by-side double cards) */}
        <AuctionGrid auctions={auctions} />

        {/* Section 7: Feed posts list */}
        <Post posts={filteredPosts} />
      </ScrollView>

      {/* Floating TabBar at the bottom */}
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
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.05,
    paddingBottom: height * 0.12, // Space for floating bottom TabBar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#white',
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingLight: {
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    lineHeight: 30,
  },
  greetingBold: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    lineHeight: 30,
    marginTop: -2,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  iconButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 3,
    backgroundColor: '#8A3FFC', // Vibrant Purple badge background
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3', // Muted grey backdrop
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
    marginBottom: 3
  },
  searchInput: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    padding: 0, // Remove default TextInput padding
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    paddingBottom: 2,
  },
  tabButton: {
    paddingVertical: 6,
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  tabTextActive: {
    color: '#000',
  },
  tabTextInactive: {
    color: '#8c8c8c',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#8A3FFC', // Thick purple underline indicator
    borderRadius: 2,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.015,
    backgroundColor: 'transparent',
    marginHorizontal: 10,
    borderRadius: 50,
  },
});
