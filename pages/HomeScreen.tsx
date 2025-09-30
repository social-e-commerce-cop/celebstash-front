import LatestDrops from '@/components/home/LatestDrops';
import Post from '@/components/home/Post';
import ProfileSection from '@/components/home/ProfileSection';
import React from 'react';
import { ScrollView, StyleSheet, Dimensions, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native"; 
import type { StackNavigationProp } from "@react-navigation/stack";
import TabBar from '@/components/Tabbar';
import { MessageIcon, NotificationIcon } from '@/assets/icons/Payment';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>(); 

  const handleChatPress = () => {
    navigation.navigate('CreatePost')
    console.log('Navigating to chat');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications')
    console.log('Navigating to notifications');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={handleChatPress}>
        <MessageIcon />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
         <NotificationIcon />
        </TouchableOpacity>
      </View>
    </View>
        <ProfileSection />
        <LatestDrops />
        <Post />
      </ScrollView>

      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </View>
  )
}

export default HomeScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04,
    paddingBottom: height * 0.12, // Extra space for TabBar
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.015,
    backgroundColor: 'transparent', // Transparent or semi-transparent
    marginHorizontal: 10,
    borderRadius: 50
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   paddingVertical: 15,
    backgroundColor: 'white',
  },
  title: {
   fontSize: width * 0.07,
    fontWeight: 'bold',
    color: 'black',
  },
  iconContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 45,
    height: 45,
    borderRadius: 20, // Half of width/height for circular shape
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f4f2f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
});
