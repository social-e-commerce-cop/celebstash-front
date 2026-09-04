import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  TextInput,
  FlatList,
  Image,
  Animated,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { followService, FollowUser } from '@/lib/followService';
import { getSessionUser } from '@/lib/session';

const { height, width } = Dimensions.get('window');
const PURPLE = '#7126D0';

export type RelationshipStatus = 'FOLLOWING' | 'FOLLOW_BACK' | 'NONE' | 'REQUESTED';

export interface UIUser {
  id: number;
  fullName: string;
  username: string;
  avatar: any;
  verified: boolean;
  relationship: RelationshipStatus;
  mutualText?: string;
  isReal?: boolean;
}

interface FollowersFollowingModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab: 'Followers' | 'Following';
  userId?: number;
}

const FollowersFollowingModal: React.FC<FollowersFollowingModalProps> = ({
  visible,
  onClose,
  initialTab,
  userId,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<'Followers' | 'Following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [followers, setFollowers] = useState<UIUser[]>([]);
  const [following, setFollowing] = useState<UIUser[]>([]);
  const [suggestions, setSuggestions] = useState<UIUser[]>([]);
  const [localUsers, setLocalUsers] = useState<Record<number, RelationshipStatus>>({});

  const panY = React.useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      fetchNetworkData();
      Animated.timing(panY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(panY, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialTab, userId]);

  useEffect(() => {
    if (visible) {
      fetchNetworkData();
    }
  }, [activeTab]);

  const fetchNetworkData = async () => {
    const session = getSessionUser();
    const effectiveUserId = userId && userId > 0 ? userId : session?.id;
    if (!effectiveUserId) return;
    setLoading(true);
    try {
      const [followersRes, followingRes, sugRes] = await Promise.all([
        followService.getFollowers(effectiveUserId).catch(() => []),
        followService.getFollowing(effectiveUserId).catch(() => []),
        followService.getSuggestedUsers().catch(() => []),
      ]);
      setFollowers(followersRes.map(mapApiUserToUIUser));
      setFollowing(followingRes.map(mapApiUserToUIUser));
      if (sugRes.length > 0) {
        setSuggestions(sugRes.map(mapApiUserToUIUser));
      }
    } catch (e) {
      console.log('Failed to fetch network data', e);
    } finally {
      setLoading(false);
    }
  };

  const mapApiUserToUIUser = (user: FollowUser): UIUser => {
    return {
      id: user.id,
      fullName: user.fullName || user.username,
      username: user.username,
      avatar: user.profilePicture ? { uri: user.profilePicture } : require('../../assets/images/profile.jpg'),
      verified: user.accountVerified,
      relationship: (user.relationship as RelationshipStatus) || 'NONE',
      isReal: true,
    };
  };

  const handleClose = () => {
    Animated.timing(panY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > height * 0.25 || gestureState.vy > 1.5) {
          handleClose();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        }
      },
    })
  ).current;

  const handleFollowToggle = async (user: UIUser) => {
    const currentRel = localUsers[user.id] || user.relationship;
    const isCurrentlyFollowing = currentRel === 'FOLLOWING' || currentRel === 'REQUESTED';
    const newRel: RelationshipStatus = isCurrentlyFollowing ? 'NONE' : 'FOLLOWING';

    setLocalUsers((prev) => ({ ...prev, [user.id]: newRel }));

    if (user.isReal) {
      try {
        if (isCurrentlyFollowing) {
          await followService.unfollowUser(user.id);
        } else {
          await followService.followUser(user.id);
        }
        // Refresh following list
        fetchNetworkData();
      } catch (e) {
        console.log("Failed to toggle follow status", e);
        setLocalUsers((prev) => ({ ...prev, [user.id]: user.relationship }));
      }
    }
  };

  const navigateToProfile = (targetId: number, targetUsername: string) => {
    handleClose();
    setTimeout(() => {
        navigation.dispatch(
            StackActions.push('MyProfile', { userId: targetId, username: targetUsername, isOtherUser: true })
        );
    }, 300);
  };

  const renderFollowButton = (user: UIUser) => {
    const session = getSessionUser();

    // Do NOT render any follow action button for the logged-in user's own account
    if (
      session &&
      (user.id === session.id ||
       String(user.id) === String(session.id) ||
       (session.username &&
        user.username &&
        user.username.toLowerCase() === session.username.toLowerCase()))
    ) {
      return null;
    }

    const currentRel = localUsers[user.id] || user.relationship;

    let buttonText = 'Follow';
    let isFollowing = false;
    let isFollowBack = false;

    if (currentRel === 'FOLLOWING') {
      buttonText = 'Following';
      isFollowing = true;
    } else if (currentRel === 'FOLLOW_BACK') {
      buttonText = 'Follow Back';
      isFollowBack = true;
    }

    return (
      <TouchableOpacity
        style={[
          styles.actionBtn,
          isFollowing && styles.followingBtn,
          isFollowBack && styles.followBackBtn,
        ]}
        activeOpacity={0.8}
        onPress={() => handleFollowToggle(user)}
      >
        <Text
          style={[
            styles.actionBtnText,
            isFollowing && styles.followingBtnText,
            isFollowBack && styles.followBackBtnText,
          ]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUserRow = ({ item }: { item: UIUser }) => (
    <TouchableOpacity 
        style={styles.userRow} 
        activeOpacity={0.7}
        onPress={() => navigateToProfile(item.id, item.username)}
    >
      <Image source={item.avatar} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>{item.username}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={14} color={PURPLE} style={styles.verifiedIcon} />
          )}
        </View>
        <Text style={styles.userFullName} numberOfLines={1}>{item.fullName}</Text>
        {item.mutualText && (
          <Text style={styles.mutualText} numberOfLines={1}>{item.mutualText}</Text>
        )}
      </View>
      {renderFollowButton(item)}
    </TouchableOpacity>
  );

  const getFilteredData = (data: UIUser[]) => {
    if (!searchQuery) return data;
    const lowerQ = searchQuery.toLowerCase();
    return data.filter(
      (u) =>
        u.fullName.toLowerCase().includes(lowerQ) ||
        u.username.toLowerCase().includes(lowerQ)
    );
  };

  const displayData = activeTab === 'Followers' ? getFilteredData(followers) : getFilteredData(following);
  const displaySuggestions = getFilteredData(suggestions);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={handleClose} />
        
        <Animated.View style={[styles.sheetContainer, { transform: [{ translateY: panY }] }]}>
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.tabRow}>
              <TouchableOpacity onPress={() => setActiveTab('Followers')} style={[styles.tabBtn, activeTab === 'Followers' && styles.activeTabBtn]}>
                <Text style={[styles.tabText, activeTab === 'Followers' && styles.activeTabText]}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setActiveTab('Following')} style={[styles.tabBtn, activeTab === 'Following' && styles.activeTabBtn]}>
                <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab.toLowerCase()}`}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* List */}
          {loading ? (
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                 <ActivityIndicator size="small" color={PURPLE} />
             </View>
          ) : (
            <FlatList
              data={displayData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderUserRow}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found.</Text>
                </View>
              }
              ListFooterComponent={
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsHeader}>Suggested for You</Text>
                  {displaySuggestions.map((user) => (
                    <View key={user.id}>{renderUserRow({ item: user })}</View>
                  ))}
                </View>
              }
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    paddingTop: 8,
  },
  dragHandleArea: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabRow: {
    flexDirection: 'row',
    width: '100%',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: PURPLE,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
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
  verifiedIcon: {
    marginLeft: 4,
  },
  userFullName: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  mutualText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
  },
  followingBtnText: {
    color: '#111827',
  },
  followBackBtn: {
    backgroundColor: '#F5F0FD',
  },
  followBackBtnText: {
    color: PURPLE,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  suggestionsHeader: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 8,
  },
});

export default FollowersFollowingModal;
