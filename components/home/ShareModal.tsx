import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Dimensions,
  Share,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { followService, FollowUser } from '@/lib/followService';
import { getSessionUser } from '@/lib/session';
import { resolveImageUrl } from '@/lib/apiClient';

const { height } = Dimensions.get('window');

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postText: string;
  postId?: number | string;
  onPostShared?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  postText,
  postId,
  onPostShared,
}) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  useEffect(() => {
    if (!visible) {
      setSearch('');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPeople = async () => {
      try {
        const currentUser = getSessionUser();
        let userList: FollowUser[] = [];

        if (currentUser?.id) {
          try {
            userList = await followService.getFollowing(currentUser.id);
          } catch {
            // fallback if following call fails
          }
        }

        if (!userList || userList.length === 0) {
          userList = await followService.getSuggestedUsers();
        }

        if (!userList || userList.length === 0) {
          userList = await followService.getAllUsers();
        }

        if (isMounted) {
          const currentId = currentUser?.id;
          const currentUsername = currentUser?.username?.toLowerCase();
          const filtered = (userList || []).filter(u => {
            if (currentId && u.id === currentId) return false;
            if (currentUsername && u.username?.toLowerCase() === currentUsername) return false;
            return true;
          });
          setUsers(filtered);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Failed to load real users for share panel:', err);
          setError('Unable to load users. You can still use Global Share below.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPeople();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const filteredUsers = users.filter(user => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const nameMatch = user.fullName?.toLowerCase().includes(query);
    const usernameMatch = user.username?.toLowerCase().includes(query);
    return nameMatch || usernameMatch;
  });

  const getShareUrl = () => {
    if (postId) {
      return `https://celebstash.app/posts/${postId}`;
    }
    return 'https://celebstash.app';
  };

  const handleUserSendPress = (user: FollowUser) => {
    showToast(`In-app chat coming soon! Tap 'Global Share' below to send to @${user.username || user.fullName}.`);
  };

  const handleGlobalShare = async () => {
    const shareUrl = getShareUrl();
    const message = postText ? `${postText}\n\n${shareUrl}` : shareUrl;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).share) {
        await (navigator as any).share({
          title: 'Share Post | ZIKII',
          text: postText || 'Check out this post on ZIKII',
          url: shareUrl,
        });
        onPostShared?.();
        onClose();
        return;
      }

      const result = await Share.share({
        message,
        url: shareUrl,
        title: 'Share Post | ZIKII',
      });

      if (result.action === Share.sharedAction) {
        onPostShared?.();
        onClose();
      }
    } catch (e: any) {
      if (e?.message !== 'User canceled' && e?.name !== 'AbortError') {
        console.warn('Native share failed, falling back to copy link:', e);
        handleCopyLink();
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = getShareUrl();
      await Clipboard.setStringAsync(shareUrl);
      showToast('Post link copied to clipboard!');
      onPostShared?.();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (e) {
      Alert.alert('Copy failed', 'Could not copy link to clipboard.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Share</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7} accessibilityLabel="Close share panel">
            <Ionicons name="close" size={22} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5">
            <Circle cx="11" cy="11" r="8" />
            <Path d="m21 21-4.3-4.3" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search people..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            accessibilityLabel="Search people"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Toast Notice Banner */}
        {toastMessage && (
          <View style={styles.toastBanner}>
            <Ionicons name="information-circle" size={16} color="#7126D0" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Section 1: People / Users */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>People</Text>
        </View>

        {loading ? (
          <View style={styles.statusBox}>
            <ActivityIndicator size="small" color="#7126D0" />
            <Text style={styles.statusText}>Loading people...</Text>
          </View>
        ) : error ? (
          <View style={styles.statusBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <Text style={[styles.statusText, { color: '#EF4444' }]}>{error}</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>No people found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id.toString()}
            style={styles.userList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const avatarUri = item.profilePicture ? resolveImageUrl(item.profilePicture) : null;
              const displayName = item.fullName || item.username || 'User';
              const displayTag = item.username ? `@${item.username}` : '';

              return (
                <View style={styles.userRow}>
                  <View style={styles.userInfoLeft}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitials}>
                          {displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.userTextCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.userNameText} numberOfLines={1}>
                          {displayName}
                        </Text>
                        {item.accountVerified && (
                          <Ionicons name="checkmark-circle" size={14} color="#7126D0" />
                        )}
                      </View>
                      {displayTag ? (
                        <Text style={styles.userTagText} numberOfLines={1}>
                          {displayTag}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.userSendBtn}
                    onPress={() => handleUserSendPress(item)}
                    activeOpacity={0.8}
                    accessibilityLabel={`Share to ${displayName}`}
                  >
                    <Ionicons name="paper-plane-outline" size={14} color="#7126D0" style={{ marginRight: 4 }} />
                    <Text style={styles.userSendBtnText}>Send</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section 2: Global Native Share & Utilities */}
        <View style={styles.globalShareSection}>
          <Text style={styles.sectionHeaderTitle}>Share via</Text>

          <View style={styles.globalBtnRow}>
            <TouchableOpacity
              style={styles.globalSharePrimaryBtn}
              onPress={handleGlobalShare}
              activeOpacity={0.85}
              accessibilityLabel="Open native global share"
            >
              <Ionicons name="share-social" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.globalSharePrimaryBtnText}>Global Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyLinkBtn}
              onPress={handleCopyLink}
              activeOpacity={0.8}
              accessibilityLabel="Copy post link"
            >
              <Ionicons name="link" size={18} color="#374151" style={{ marginRight: 6 }} />
              <Text style={styles.copyLinkBtnText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ShareModal;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    padding: 0,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B21A8',
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  userList: {
    maxHeight: height * 0.32,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  avatarFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7126D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  userTextCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  userTagText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  userSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  userSendBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    marginVertical: 14,
  },
  globalShareSection: {
    paddingHorizontal: 16,
  },
  globalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  globalSharePrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7126D0',
    paddingVertical: 12,
    borderRadius: 8,
  },
  globalSharePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  copyLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyLinkBtnText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
