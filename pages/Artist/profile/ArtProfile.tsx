import Header from '@/components/artist/profile/HeaderProfile';
import Memories from '@/components/artist/profile/Memories';
import StockNavigation from '@/components/artist/profile/StockNavigation';
import UserInfo from '@/components/artist/profile/UserInfo';
import ArtTabBar from '@/components/ArtTabBar';
import MateCard from '@/components/Profile/MateSection';
import StatsRow from '@/components/Profile/StatsRow';
import TribesList from '@/components/Profile/TribesList';
import React from 'react';
import { ScrollView, StyleSheet,  StatusBar, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ArtProfile = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fff" />
      
      {/* Scrollable content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header />
        <UserInfo
          name="@Emmy Gretta"
          email="emmy@example.com"
          bio="I am a positive person. I love to travel and eat. Always available for chat"
        />
        <MateCard />
        <StatsRow />
        <TribesList />
        <Memories />
        <StockNavigation />
      </ScrollView>

    <View style={styles.tabBarContainer}>
                     <ArtTabBar />
                   </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: height * 0.1 },
  scrollContent: { flex: 1 },
  tabBarContainer: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
  paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.015,
    backgroundColor: 'transparent', // Transparent or semi-transparent
    marginHorizontal: 5,
    borderRadius: 50
  },
  tabItem: { alignItems: 'center', flex: 1 },
});

export default ArtProfile;
