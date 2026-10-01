/**
 * CreateGroupScreen.tsx
 * Step 1: Search real users from the API to add to DM or group
 * Step 2: Set group name (if more than 1 person selected)
 * Handles both "new DM" (1 person) and "new group" (multiple people)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Image, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MemberListItem from '@/components/messages/MemberListItem';
import { chatService, UserSearchResult } from '@/lib/chatService';
import { getSessionToken } from '@/lib/session';

const PURPLE = '#7126D0';
const { width } = Dimensions.get('window');

// Map API result to local format matching MemberListItem expectations
function toLocalUser(u: UserSearchResult) {
  return {
    id: String(u.id),
    name: u.fullName,
    avatar: u.profilePicture ? { uri: u.profilePicture } : require('../../assets/images/storyItem.jpg'),
    isOnline: false,
    bio: u.bio ?? '',
  };
}

type LocalUser = ReturnType<typeof toLocalUser>;

export default function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<LocalUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searchResults, setSearchResults] = useState<LocalUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!getSessionToken();

  // "No query" and "signed out" are facts about current state, not events, so they are derived
  // at render rather than pushed into state from an effect. That leaves the effect below doing
  // only the one thing it must: the debounced network call.
  const hasQuery = searchQuery.trim().length > 0;
  const visibleResults = isAuthenticated && hasQuery ? searchResults : [];
  const displayError = !isAuthenticated ? 'Sign in to start a conversation.' : error;

  // ── Search users from API ─────────────────────────────────────────────────
  // There is no offline user list to fall back to: showing invented people would let someone
  // "start a chat" with an account that does not exist. A failed search says so instead.
  useEffect(() => {
    if (!isAuthenticated || !hasQuery) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        setError(null);
        const results = await chatService.searchUsers(searchQuery);
        if (cancelled) return;
        setSearchResults(results.map(toLocalUser));
      } catch (e: any) {
        if (cancelled) return;
        setSearchResults([]);
        setError(e?.message ?? 'Could not search for people. Check your connection.');
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 400); // debounce

    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchQuery, isAuthenticated, hasQuery]);

  const toggleUser = (id: string, user: any) => {
    setSelectedUserIds(prev => {
      if (prev.includes(id)) {
        setSelectedUsers(su => su.filter(u => u.id !== id));
        return prev.filter(uId => uId !== id);
      } else {
        setSelectedUsers(su => [...su, user]);
        return [...prev, id];
      }
    });
  };

  const handleNext = async () => {
    if (step === 1 && selectedUserIds.length === 0) return;

    if (step === 1) {
      if (selectedUserIds.length === 1) {
        // Direct message — go straight to chat
        await createDirectMessage(selectedUserIds[0]);
        return;
      }
      // Multiple people — go to group naming step
      setStep(2);
      return;
    }

    if (step === 2 && groupName.trim()) {
      await createGroup();
    }
  };

  // A failure here must not navigate anywhere: sending the user into some other conversation
  // would look like the chat was created when it was not.
  const createDirectMessage = async (userId: string) => {
    try {
      setCreating(true);
      setError(null);
      const conv = await chatService.startDirectConversation(Number(userId));
      navigation.replace('ChatScreen', { conversationId: String(conv.id) });
    } catch (e: any) {
      setError(e?.message ?? 'Could not start this conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const createGroup = async () => {
    try {
      setCreating(true);
      setError(null);
      const conv = await chatService.createGroup(
        groupName.trim(),
        '',
        selectedUserIds.map(Number)
      );
      navigation.replace('ChatScreen', { conversationId: String(conv.id) });
    } catch (e: any) {
      setError(e?.message ?? 'Could not create the group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const canProceed = step === 1 ? selectedUserIds.length > 0 : !!groupName.trim();
  const buttonLabel = step === 1
    ? (selectedUserIds.length === 1 ? 'Message' : selectedUserIds.length > 1 ? 'Next' : 'Next')
    : 'Create';

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 1 ? 'New Message' : 'New Group'}</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleNext}
          disabled={!canProceed || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color={PURPLE} />
          ) : (
            <Text style={[styles.headerAction, canProceed && styles.headerActionActive]}>
              {buttonLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {step === 1 ? (
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searching && <ActivityIndicator size="small" color={PURPLE} />}
          </View>

          {!!displayError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#B91C1C" />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {selectedUsers.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll} contentContainerStyle={styles.selectedContent}>
              {selectedUsers.map(user => (
                <View key={user.id} style={styles.selectedAvatarWrap}>
                  <Image source={user.avatar} style={styles.selectedAvatar} />
                  <TouchableOpacity style={styles.removeSelectedBtn} onPress={() => toggleUser(user.id, user)}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.selectedName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <FlatList
            data={visibleResults}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <MemberListItem
                user={item as any}
                showSelection
                isSelected={selectedUserIds.includes(String(item.id))}
                onPress={() => toggleUser(String(item.id), { id: String(item.id), name: item.name, avatar: item.avatar, isOnline: false, bio: (item as any).bio ?? '' })}
              />
            )}
            ListEmptyComponent={
              searching ? null : (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchText}>
                    {displayError ? '' : hasQuery ? 'No users found' : 'Type to search for people'}
                  </Text>
                </View>
              )
            }
          />
        </>
      ) : (
        <View style={styles.step2Container}>
          <TouchableOpacity style={styles.groupAvatarBtn}>
            <View style={styles.groupAvatarPlaceholder}>
              <Ionicons name="camera" size={32} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Group name"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={25}
            autoFocus
          />
          <Text style={styles.charCount}>{groupName.length}/25</Text>
          <Text style={styles.memberCountLabel}>Members: {selectedUserIds.length}</Text>
          <View style={styles.memberGrid}>
            {selectedUsers.slice(0, 8).map(user => (
              <View key={user.id} style={{ alignItems: 'center', width: (width - 40) / 4, marginBottom: 12 }}>
                <Image source={user.avatar} style={{ width: 44, height: 44, borderRadius: 22, marginBottom: 4 }} />
                <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' }} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
              </View>
            ))}
            {selectedUsers.length > 8 && (
              <View style={{ alignItems: 'center', width: (width - 40) / 4, marginBottom: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#9CA3AF' }}>+{selectedUsers.length - 8}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },
  headerAction: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#9CA3AF' },
  headerActionActive: { color: PURPLE },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', margin: 16, borderRadius: 10, paddingHorizontal: 12, height: 44, gap: 8 },
  searchInput: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#111' },
  selectedScroll: { maxHeight: 90, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  selectedContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 16, alignItems: 'flex-start' },
  selectedAvatarWrap: { position: 'relative', alignItems: 'center', width: 56 },
  selectedAvatar: { width: 48, height: 48, borderRadius: 24 },
  removeSelectedBtn: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  selectedName: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#374151', marginTop: 4, textAlign: 'center' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  errorText: { flex: 1, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#B91C1C' },
  emptySearch: { alignItems: 'center', paddingTop: 40 },
  emptySearchText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  step2Container: { alignItems: 'center', paddingTop: 30, paddingHorizontal: 20 },
  groupAvatarBtn: { marginBottom: 24 },
  groupAvatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  groupNameInput: { width: '100%', borderBottomWidth: 1, borderBottomColor: PURPLE, fontSize: 16, fontFamily: 'Poppins-Medium', color: '#111', paddingVertical: 8, textAlign: 'center' },
  charCount: { alignSelf: 'flex-end', fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginTop: 4 },
  memberCountLabel: { alignSelf: 'flex-start', fontSize: 13, fontFamily: 'Poppins-Bold', color: '#374151', marginTop: 24, marginBottom: 12 },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
