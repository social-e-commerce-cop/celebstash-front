/**
 * GroupSettingsScreen.tsx
 * Real group administration: rename, add members, promote/demote admins, remove members, leave.
 *
 * Admin-only controls are hidden from non-admins as a convenience, but that is not the guard —
 * the backend re-checks the caller's rights on every one of these calls and answers 403 when
 * they do not hold. After each change the conversation is refetched, so what is on screen is
 * what the server actually stored rather than what the UI hoped happened.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert, Modal,
  TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import MemberListItem from '@/components/messages/MemberListItem';
import { ChatUser, Conversation } from '@/types/chatTypes';
import { chatService, UserSearchResult } from '@/lib/chatService';
import { toLocalConversation, isGroupAdmin, ME } from '@/lib/chatMappers';
import { getSessionUser } from '@/lib/session';

const PURPLE = '#7126D0';
const FALLBACK_AVATAR = require('../../assets/images/storyItem.jpg');

export default function GroupSettingsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId;
  const numericConvId = conversationId == null || isNaN(Number(conversationId))
    ? null
    : Number(conversationId);
  const myId = getSessionUser()?.id ?? 0;

  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [groupName, setGroupName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  const [addVisible, setAddVisible] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [addResults, setAddResults] = useState<UserSearchResult[]>([]);
  const [addSelected, setAddSelected] = useState<number[]>([]);
  const [addSearching, setAddSearching] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // A missing id is a property of the navigation params, not something that happens, so it is
  // derived rather than written into state from the loader.
  const displayError = numericConvId == null ? 'No group was selected.' : error;

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!numericConvId) return;
    try {
      const local = toLocalConversation(await chatService.getConversation(numericConvId), myId);
      setConv(local);
      setGroupName(local.groupInfo?.name ?? '');
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load this group.');
    } finally {
      setLoading(false);
    }
  }, [numericConvId, myId]);

  useEffect(() => {
    if (numericConvId == null) return;
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load, numericConvId]);

  // ── Member search for "Add" ─────────────────────────────────────────────
  // An empty query is derived below rather than cleared from inside the effect.
  const addHasQuery = addQuery.trim().length > 0;
  const visibleAddResults = addHasQuery ? addResults : [];

  useEffect(() => {
    if (!addVisible || !addHasQuery) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setAddSearching(true);
        setAddError(null);
        const results = await chatService.searchUsers(addQuery);
        if (cancelled) return;
        // People already in the group are filtered out rather than shown as addable.
        const existing = new Set((conv?.participants ?? []).map(p => p.userId));
        setAddResults(results.filter(r => !existing.has(r.id)));
      } catch (e: any) {
        if (!cancelled) { setAddResults([]); setAddError(e?.message ?? 'Search failed.'); }
      } finally {
        if (!cancelled) setAddSearching(false);
      }
    }, 400);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [addQuery, addVisible, addHasQuery, conv]);

  // ── Mutations ───────────────────────────────────────────────────────────
  // Each one reloads from the server afterwards: a 204 is not proof the UI's idea of the group
  // is still correct.
  const run = async (fn: () => Promise<any>, failureTitle: string) => {
    if (busy) return false;
    try {
      setBusy(true);
      await fn();
      await load();
      return true;
    } catch (e: any) {
      Alert.alert(failureTitle, e?.message ?? 'Please try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveName = async () => {
    const trimmed = groupName.trim();
    if (!numericConvId || !trimmed || trimmed === conv?.groupInfo?.name) {
      setIsEditingName(false);
      return;
    }
    const ok = await run(() => chatService.updateGroup(numericConvId, trimmed), 'Could not rename group');
    if (!ok) setGroupName(conv?.groupInfo?.name ?? '');
    setIsEditingName(false);
  };

  const confirmAddMembers = async () => {
    if (!numericConvId || addSelected.length === 0) return;
    const ok = await run(() => chatService.addMembers(numericConvId, addSelected), 'Could not add members');
    if (ok) {
      setAddVisible(false);
      setAddSelected([]);
      setAddQuery('');
      setAddResults([]);
    }
  };

  const toggleAdmin = async (user: ChatUser) => {
    if (!numericConvId || user.userId == null || !conv) return;
    const makeAdmin = !isGroupAdmin(conv, user.id);
    setActionMenuVisible(false);
    await run(
      () => chatService.setMemberAdmin(numericConvId, user.userId!, makeAdmin),
      makeAdmin ? 'Could not promote member' : 'Could not dismiss admin',
    );
  };

  const removeMember = (user: ChatUser) => {
    if (!numericConvId || user.userId == null) return;
    setActionMenuVisible(false);
    Alert.alert('Remove member', `Remove ${user.name} from this group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => run(
          () => chatService.removeMember(numericConvId, user.userId!),
          'Could not remove member',
        ),
      },
    ]);
  };

  const leaveGroup = () => {
    if (!numericConvId) return;
    Alert.alert('Leave group', 'You will stop receiving messages from this group.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusy(true);
            await chatService.leaveGroup(numericConvId);
            navigation.navigate('MessagesScreen');
          } catch (e: any) {
            Alert.alert('Could not leave', e?.message ?? 'Please try again.');
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  // With no id there is nothing to wait for, so the spinner is skipped and the error below shows.
  if (loading && numericConvId != null) {
    return (
      <View style={styles.centered}><ActivityIndicator size="large" color={PURPLE} /></View>
    );
  }

  if (displayError || !conv || conv.type !== 'group' || !conv.groupInfo) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
        <Text style={styles.errorTitle}>{displayError ?? 'This conversation is not a group.'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const amIAdmin = isGroupAdmin(conv, ME);

  const handleMemberLongPress = (user: ChatUser) => {
    if (user.id === ME || !amIAdmin) return;
    setSelectedUser(user);
    setActionMenuVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.topSection}>
      <View style={styles.avatarBtn}>
        <Image source={conv.groupInfo!.avatar ?? FALLBACK_AVATAR} style={styles.groupAvatar} />
      </View>

      {isEditingName ? (
        <View style={styles.editNameRow}>
          <TextInput
            style={styles.nameInput}
            value={groupName}
            onChangeText={setGroupName}
            autoFocus
            maxLength={25}
          />
          <TouchableOpacity onPress={saveName} style={styles.saveNameBtn} disabled={busy}>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.nameRow}>
          <Text style={styles.groupName}>{conv.groupInfo!.name}</Text>
          {amIAdmin && (
            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editNameIcon}>
              <Ionicons name="pencil" size={16} color={PURPLE} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <Text style={styles.groupMeta}>
        Created by {conv.groupInfo!.createdBy === ME ? 'You' : (conv.participants.find(p => p.id === conv.groupInfo!.createdBy)?.name ?? 'a member')}
        {conv.groupInfo!.createdAt ? `, ${new Date(conv.groupInfo!.createdAt).toLocaleDateString()}` : ''}
      </Text>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{conv.participants.length} Members</Text>
        {amIAdmin && (
          <TouchableOpacity style={styles.addMemberBtn} onPress={() => setAddVisible(true)}>
            <Ionicons name="person-add" size={14} color={PURPLE} />
            <Text style={styles.addMemberText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Settings</Text>
        <View style={styles.iconBtn}>{busy && <ActivityIndicator size="small" color={PURPLE} />}</View>
      </View>

      <FlatList
        data={conv.participants}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <MemberListItem
            user={item}
            isAdmin={isGroupAdmin(conv, item.id)}
            onLongPress={() => handleMemberLongPress(item)}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.leaveRow} onPress={leaveGroup} disabled={busy}>
            <Ionicons name="exit-outline" size={22} color="#EF4444" />
            <Text style={styles.leaveText}>Leave Group</Text>
          </TouchableOpacity>
        }
      />

      {/* ── Member action sheet (admins only) ── */}
      <Modal visible={actionMenuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setActionMenuVisible(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{selectedUser?.name}</Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={async () => {
                const target = selectedUser;
                setActionMenuVisible(false);
                if (target?.userId == null) return;
                try {
                  const dm = await chatService.startDirectConversation(target.userId);
                  navigation.navigate('ChatScreen', { conversationId: String(dm.id) });
                } catch (e: any) {
                  Alert.alert('Could not open chat', e?.message ?? 'Please try again.');
                }
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Message {selectedUser?.name.split(' ')[0]}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => selectedUser && toggleAdmin(selectedUser)}
            >
              <Ionicons
                name={selectedUser && isGroupAdmin(conv, selectedUser.id) ? 'arrow-down' : 'arrow-up'}
                size={20}
                color="#374151"
              />
              <Text style={styles.actionText}>
                {selectedUser && isGroupAdmin(conv, selectedUser.id) ? 'Dismiss as Admin' : 'Make Group Admin'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => selectedUser && removeMember(selectedUser)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Remove from Group</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Add members ── */}
      <Modal visible={addVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.addSheet}>
            <View style={styles.handle} />
            <View style={styles.addHeader}>
              <TouchableOpacity onPress={() => { setAddVisible(false); setAddSelected([]); setAddQuery(''); }}>
                <Text style={styles.addCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.sheetTitle}>Add Members</Text>
              <TouchableOpacity onPress={confirmAddMembers} disabled={addSelected.length === 0 || busy}>
                <Text style={[styles.addConfirm, addSelected.length > 0 && styles.addConfirmActive]}>
                  Add{addSelected.length > 0 ? ` (${addSelected.length})` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search people..."
                value={addQuery}
                onChangeText={setAddQuery}
                autoFocus
              />
              {addSearching && <ActivityIndicator size="small" color={PURPLE} />}
            </View>

            {!!addError && <Text style={styles.addErrorText}>{addError}</Text>}

            <FlatList
              data={visibleAddResults}
              keyExtractor={u => String(u.id)}
              style={{ maxHeight: 320 }}
              renderItem={({ item }) => {
                const selected = addSelected.includes(item.id);
                return (
                  <TouchableOpacity
                    style={styles.resultRow}
                    onPress={() => setAddSelected(prev =>
                      selected ? prev.filter(id => id !== item.id) : [...prev, item.id])}
                  >
                    <Image
                      source={item.profilePicture ? { uri: item.profilePicture } : FALLBACK_AVATAR}
                      style={styles.resultAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName}>{item.fullName}</Text>
                      <Text style={styles.resultUsername}>@{item.username}</Text>
                    </View>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? PURPLE : '#D1D5DB'}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                addSearching ? null : (
                  <Text style={styles.addEmpty}>
                    {addHasQuery ? 'No matching people' : 'Type to search for people'}
                  </Text>
                )
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24, gap: 12 },
  errorTitle: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#374151', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: PURPLE },
  retryText: { color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 14 },
  backLink: { color: '#6B7280', fontFamily: 'Poppins-Regular', fontSize: 13, marginTop: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },

  topSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  avatarBtn: { position: 'relative', marginBottom: 16 },
  groupAvatar: { width: 100, height: 100, borderRadius: 50 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  groupName: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#111' },
  editNameIcon: { marginLeft: 8, padding: 4 },
  editNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 20, alignSelf: 'stretch' },
  nameInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: PURPLE, fontSize: 20, fontFamily: 'Poppins-Bold', color: '#111', paddingVertical: 4, textAlign: 'center' },
  saveNameBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  groupMeta: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginBottom: 24, textAlign: 'center', paddingHorizontal: 20 },

  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, marginBottom: 8, backgroundColor: '#F9FAFB', paddingVertical: 8 },
  sectionTitle: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#6B7280', textTransform: 'uppercase' },
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addMemberText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: PURPLE },

  leaveRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  leaveText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#EF4444' },

  // Action Menu
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12, paddingHorizontal: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111', marginBottom: 16, textAlign: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  actionText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },

  // Add members sheet
  addSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 30, paddingTop: 12, paddingHorizontal: 20, maxHeight: '80%' },
  addHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addCancel: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#6B7280', marginBottom: 16 },
  addConfirm: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#9CA3AF', marginBottom: 16 },
  addConfirmActive: { color: PURPLE },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#111' },
  addErrorText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#B91C1C', marginBottom: 8 },
  addEmpty: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF', textAlign: 'center', paddingVertical: 24 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  resultAvatar: { width: 40, height: 40, borderRadius: 20 },
  resultName: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#111' },
  resultUsername: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
});
