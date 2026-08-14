import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const PURPLE = '#7126D0';

export interface FollowUser {
  id: string;
  name: string;
  username: string;
  avatar: any;
  isFollowing: boolean;
  isVerified?: boolean;
}

const MOCK_FOLLOWERS: FollowUser[] = [
  { id: '1', name: 'Joel Kay', username: 'joel_k', avatar: require('../../assets/images/feed6.jpg'), isFollowing: true, isVerified: true },
  { id: '2', name: 'Emelyne Rose', username: 'emelyne', avatar: require('../../assets/images/profile.jpg'), isFollowing: false },
  { id: '3', name: 'Chris Evans', username: 'chrisevans', avatar: require('../../assets/images/drop1.jpg'), isFollowing: true },
  { id: '4', name: 'Bien Aime', username: 'bienaime', avatar: require('../../assets/images/product3.jpg'), isFollowing: false, isVerified: true },
  { id: '5', name: 'Jesus Martinez', username: 'jesus_mtz', avatar: require('../../assets/images/product4.jpg'), isFollowing: true },
  { id: '6', name: 'Sarah Connor', username: 'sarah_c', avatar: require('../../assets/images/feed7.png'), isFollowing: false },
  { id: '7', name: 'Marcus Vance', username: 'marcus_v', avatar: require('../../assets/images/product5.jpg'), isFollowing: true },
];

const MOCK_FOLLOWING: FollowUser[] = [
  { id: '101', name: 'Kenny K Shot', username: 'artist_kenny', avatar: require('../../assets/images/black-man.png'), isFollowing: true, isVerified: true },
  { id: '102', name: 'Vortex Official', username: 'vortextour', avatar: require('../../assets/images/drop1.jpg'), isFollowing: true, isVerified: true },
  { id: '103', name: 'Anelia Soundscapes', username: 'anelia_ambient', avatar: require('../../assets/images/product1.jpg'), isFollowing: true },
  { id: '104', name: 'Streetwear Central', username: 'streetwear_co', avatar: require('../../assets/images/product3.jpg'), isFollowing: true },
  { id: '105', name: 'Vinyl Collectors Club', username: 'vinyl_club', avatar: require('../../assets/images/product4.jpg'), isFollowing: true },
];

interface FollowListModalProps {
  visible: boolean;
  initialTab?: 'Followers' | 'Following';
  onClose: () => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  visible,
  initialTab = 'Followers',
  onClose,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'Followers' | 'Following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState<FollowUser[]>(MOCK_FOLLOWERS);
  const [following, setFollowing] = useState<FollowUser[]>(MOCK_FOLLOWING);

  // Synchronize initialTab whenever modal opens
  React.useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [visible, initialTab]);

  const toggleFollow = (id: string, isFollowersTab: boolean) => {
    if (isFollowersTab) {
      setFollowers((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isFollowing: !item.isFollowing } : item))
      );
    } else {
      setFollowing((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isFollowing: !item.isFollowing } : item))
      );
    }
  };

  const currentList = activeTab === 'Followers' ? followers : following;
  const filteredList = currentList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

        {/* Modal Top Header */}
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{activeTab}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Sub-Tabs: Followers | Following */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'Followers' && styles.activeTabItem]}
              onPress={() => setActiveTab('Followers')}
            >
              <Text style={[styles.tabText, activeTab === 'Followers' && styles.activeTabText]}>
                {followers.length} Followers
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'Following' && styles.activeTabItem]}
              onPress={() => setActiveTab('Following')}
            >
              <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>
                {following.length} Following
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                activeOpacity={0.7}
                onPress={() => {
                  onClose();
                  navigation.navigate('MyProfile', {
                    isOtherUser: true,
                    username: item.username,
                    name: item.name,
                    avatar: item.avatar,
                    role: item.isVerified ? 'artist' : 'user',
                  });
                }}
              >
                <Image source={item.avatar} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.isVerified && (
                      <Ionicons name="checkmark-circle" size={14} color={PURPLE} style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={styles.userHandle}>@{item.username}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.followBtn,
                  item.isFollowing ? styles.followingBtn : styles.notFollowingBtn,
                ]}
                onPress={() => toggleFollow(item.id, activeTab === 'Followers')}
                activeOpacity={0.8}
              >
                <Text
                  style={item.isFollowing ? styles.followingBtnText : styles.notFollowingBtnText}
                >
                  {item.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          }
        />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: PURPLE,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  userHandle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    marginTop: 1,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 95,
  },
  notFollowingBtn: {
    backgroundColor: PURPLE,
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
  },
  notFollowingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  followingBtnText: {
    color: '#111827',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
    marginTop: 12,
  },
});
