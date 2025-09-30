import Header from '@/components/Profile/Header';
import MateCard from '@/components/Profile/MateSection';
import MatesList from '@/components/Profile/MatesList';
import StatsRow from '@/components/Profile/StatsRow';
import SuggestedTribes from '@/components/Profile/SuggestedTribes';
import TribesList from '@/components/Profile/TribesList';
import UserInfo from '@/components/Profile/UserInfor';
import TabBar from '@/components/Tabbar';
import React from 'react';
import { ScrollView, StyleSheet,  StatusBar, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const MyProfile = () => {
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
        <MatesList />
        <TribesList />
        <SuggestedTribes />
      </ScrollView>

    <View style={styles.tabBarContainer}>
                     <TabBar />
                   </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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

export default MyProfile;
