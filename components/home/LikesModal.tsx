import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { apiClient, resolveImageUrl } from '@/lib/apiClient';
import { followService } from '@/lib/followService';
import { getSessionUser } from '@/lib/session';

const PURPLE = '#7126D0';

interface LikeUser {
  id: number;
  fullName: string;
  username: string;
  profilePicture?: string;
  accountVerified?: boolean;
  isFollowing?: boolean;
}

interface LikesModalProps {
  visible: boolean;
  postId?: number;
  onClose: () => void;
}

export const LikesModal: React.FC<LikesModalProps> = ({
  visible,
  postId,
  onClose,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const sessionUser = getSessionUser();

  const [users, setUsers] = useState<LikeUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !postId) return;
    setSearchQuery('');
    setError(null);
    setLoading(true);

    apiClient
      .get<LikeUser[]>(`/api/posts/${postId}/likes`)
      .then((data) => {
        setUsers(data || []);
      })
      .catch(() => setError('Could not load likers list.'))
      .finally(() => setLoading(false));
  }, [visible, postId]);

  const toggleFollow = async (targetUser: LikeUser) => {
    const update = (list: LikeUser[]) =>
      list.map((u) =>
        u.id === targetUser.id ? { ...u, isFollowing: !u.isFollowing } : u
      );

    setUsers(update);

    try {
      if (targetUser.isFollowing) {
        await followService.unfollowUser(targetUser.id);
      } else {
        await followService.followUser(targetUser.id);
      }
    } catch {
      setUsers(update);
    }
  };

  const filteredList = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />

          {/* Modal Top Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Likes</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
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

          {/* Loading / Error / List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={PURPLE} />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#E63636" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredList}
              keyExtractor={(item) => String(item.id)}
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
                        isOtherUser: item.id !== sessionUser?.id,
                        userId: item.id,
                        username: item.username,
                        name: item.fullName,
                        role: item.accountVerified ? 'artist' : 'user',
                      });
                    }}
                  >
                    <Image
                      source={item.profilePicture ? { uri: resolveImageUrl(item.profilePicture) } : require('../../assets/images/black-man.png')}
                      style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>{item.fullName}</Text>
                        {item.accountVerified && (
                          <Ionicons name="checkmark-circle" size={14} color={PURPLE} style={{ marginLeft: 4 }} />
                        )}
                      </View>
                      <Text style={styles.userHandle}>@{item.username || item.fullName.toLowerCase().replace(/\s+/g, '_')}</Text>
                    </View>
                  </TouchableOpacity>

                  {!(
                    sessionUser &&
                    (item.id === sessionUser.id ||
                     String(item.id) === String(sessionUser.id) ||
                     (sessionUser.username &&
                      item.username &&
                      item.username.toLowerCase() === sessionUser.username.toLowerCase()))
                  ) && (
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        item.isFollowing ? styles.followingBtn : styles.notFollowingBtn,
                      ]}
                      onPress={() => toggleFollow(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={item.isFollowing ? styles.followingBtnText : styles.notFollowingBtnText}>
                        {item.isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'No users match your search' : 'No likes on this post yet'}
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default LikesModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dragHandle: { width: 36, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111827' },
  closeBtn: { padding: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 2 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular', color: '#111' },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#111827' },
  userHandle: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 1 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 95 },
  notFollowingBtn: { backgroundColor: PURPLE },
  followingBtn: { backgroundColor: '#F3F4F6' },
  notFollowingBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins-Bold' },
  followingBtnText: { color: '#111827', fontSize: 12, fontFamily: 'Poppins-Bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#9CA3AF', marginTop: 12, textAlign: 'center' },
  errorText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#E63636', marginTop: 12, textAlign: 'center' },
});
