import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '@/contexts/AuthContext';
import TabBar from '@/components/Tabbar';

const { width, height } = Dimensions.get('window');

type AppStackParamList = {
  Home: undefined;
  CartScreen: undefined;
  Ewallet: undefined;
  Profile: undefined;
  Signin: undefined;
  ProfileDetails: { story: { username: string; time: string; image: any } };
};

type ProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Profile'>;

const Profile: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userEmail}>{user.email || user.phoneNumber}</Text>
            <Text style={styles.userStatus}>Status: {user.status}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04,
    paddingBottom: height * 0.12,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 30,
  },
  userInfo: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: '#888',
  },
  logoutButton: {
    backgroundColor: '#FF650E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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

export default Profile;
