/**
 * ChatInfoScreen.tsx
 * Contact info for a DM, group info for a group. Everything on this screen — participants,
 * admin badges, mute state, shared media — is read from the backend for the conversation that
 * was navigated to. There is no fixture fallback: if the conversation cannot be loaded the
 * screen says so, because a screen that silently shows someone else's contact card is worse
 * than one that reports an error.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions,
  Switch, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Conversation, SharedMediaItem } from '@/types/chatTypes';
import {
  toLocalConversation, toSharedMediaItem, getConversationName, getConversationAvatar,
  getOtherUser, isGroupAdmin, ME,
} from '@/lib/chatMappers';
import { chatService } from '@/lib/chatService';
import { getSessionUser } from '@/lib/session';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

export default function ChatInfoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId;
  const numericConvId = conversationId == null || isNaN(Number(conversationId))
    ? null
    : Number(conversationId);
  const myId = getSessionUser()?.id ?? 0;

  const [conv, setConv] = useState<Conversation | null>(null);
  const [media, setMedia] = useState<SharedMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!numericConvId) {
      setError('No conversation was selected.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const dto = await chatService.getConversation(numericConvId);
      setConv(toLocalConversation(dto, myId));
      // A media failure must not blank the whole screen — the gallery strip just stays empty.
      try {
        const paged = await chatService.getSharedMedia(numericConvId, 'media', 0, 8);
        setMedia(paged.content.map(m => toSharedMediaItem(m, myId)).filter(Boolean) as SharedMediaItem[]);
      } catch {
        setMedia([]);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Could not load this conversation.');
    } finally {
      setLoading(false);
    }
  }, [numericConvId, myId]);

  // Refetch on focus: coming back from group settings, membership may have changed.
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleMuteToggle = async () => {
    if (!numericConvId || !conv || busy) return;
    const next = !conv.isMuted;
    setConv({ ...conv, isMuted: next });   // optimistic
    try {
      setBusy(true);
      await chatService.toggleMute(numericConvId);
    } catch (e: any) {
      setConv({ ...conv, isMuted: !next }); // roll back — the server is the source of truth
      Alert.alert('Could not change notifications', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleLeaveGroup = () => {
    if (!numericConvId) return;
    Alert.alert('Leave Group', 'You will stop receiving messages from this group.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await chatService.leaveGroup(numericConvId);
            navigation.navigate('MessagesScreen');
          } catch (e: any) {
            Alert.alert('Could not leave', e?.message ?? 'Please try again.');
          }
        },
      },
    ]);
  };

  if (loading && !conv) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  if (error || !conv) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
        <Text style={styles.errorTitle}>{error ?? 'Conversation unavailable'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = getConversationName(conv);
  const avatar = getConversationAvatar(conv);
  const isGroup = conv.type === 'group';
  const otherUser = !isGroup ? getOtherUser(conv) : null;
  const isOnline = otherUser?.isOnline ?? false;
  const iAmAdmin = isGroupAdmin(conv, ME);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isGroup ? 'Group Info' : 'Contact Info'}</Text>
        <View style={styles.iconBtn}>
          {isGroup && iAmAdmin && (
            <TouchableOpacity onPress={() => navigation.navigate('GroupSettingsScreen', { conversationId })}>
              <Ionicons name="settings-outline" size={22} color="#111" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Profile Section ── */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrap}>
            <Image source={avatar} style={styles.largeAvatar} />
            {isOnline && !isGroup && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.nameText}>{name}</Text>
          <Text style={styles.statusText}>
            {isGroup
              ? `${conv.participants.length} member${conv.participants.length === 1 ? '' : 's'}`
              : (otherUser?.username ? '@' + otherUser.username : '')}
          </Text>
          {isGroup && !!conv.groupInfo?.description && (
            <Text style={styles.descriptionText}>{conv.groupInfo.description}</Text>
          )}

          <View style={styles.quickActions}>
            <QuickAction icon="call-outline" label="Audio" onPress={() => navigation.navigate('VoiceCallScreen', { name, avatar })} />
            <QuickAction icon="videocam-outline" label="Video" onPress={() => navigation.navigate('VideoCallScreen', { name, avatar })} />
            <QuickAction icon="images-outline" label="Media" onPress={() => navigation.navigate('SharedMediaScreen', { conversationId })} />
            <QuickAction
              icon={conv.isMuted ? 'volume-mute' : 'volume-high-outline'}
              label="Mute"
              onPress={handleMuteToggle}
              active={conv.isMuted}
            />
          </View>
        </View>
        <View style={styles.divider} />

        {/* ── Group Members ── */}
        {isGroup && (
          <>
            <SectionHeader
              title={`${conv.participants.length} Member${conv.participants.length === 1 ? '' : 's'}`}
              action={iAmAdmin ? 'Manage' : undefined}
              onAction={() => navigation.navigate('GroupSettingsScreen', { conversationId })}
            />
            {conv.participants.map(p => (
              <View key={p.id} style={styles.memberRow}>
                <Image source={p.avatar} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{p.name}</Text>
                  {!!p.username && <Text style={styles.memberStatus}>@{p.username}</Text>}
                </View>
                {isGroupAdmin(conv, p.id) && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </View>
            ))}
            <View style={styles.divider} />
          </>
        )}

        {/* ── Shared Media Preview ── */}
        <SectionHeader
          title="Media, Links, and Docs"
          action="View All"
          onAction={() => navigation.navigate('SharedMediaScreen', { conversationId })}
        />
        <View style={styles.mediaGrid}>
          {media.slice(0, 4).map(m => (
            <TouchableOpacity
              key={m.id}
              style={styles.mediaThumbWrap}
              onPress={() => navigation.navigate('SharedMediaScreen', { conversationId })}
            >
              <Image source={m.uri} style={styles.mediaThumb} />
              {m.type === 'video' && (
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
          {media.length === 0 && <Text style={styles.emptyText}>No shared media yet.</Text>}
        </View>
        <View style={styles.divider} />

        {/* ── Settings ── */}
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}><Ionicons name="notifications-outline" size={20} color="#374151" /></View>
            <Text style={styles.settingLabel}>Mute Notifications</Text>
            <Switch
              value={conv.isMuted}
              onValueChange={handleMuteToggle}
              disabled={busy}
              trackColor={{ false: '#D1D5DB', true: PURPLE }}
              thumbColor="#fff"
            />
          </View>
        </View>
        <View style={styles.divider} />

        {/* ── Danger Zone ── */}
        <View style={styles.dangerGroup}>
          {isGroup && (
            <TouchableOpacity style={styles.dangerRow} onPress={handleLeaveGroup}>
              <Ionicons name="exit-outline" size={22} color="#EF4444" />
              <Text style={styles.dangerText}>Leave Group</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const QuickAction = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={[styles.actionIconWrap, active && styles.actionIconActive]}>
      <Ionicons name={icon} size={22} color={active ? '#fff' : PURPLE} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title, action, onAction }: any) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {!!action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24, gap: 12 },
  errorTitle: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#374151', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: PURPLE },
  retryText: { color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 14 },
  backLink: { color: '#6B7280', fontFamily: 'Poppins-Regular', fontSize: 13, marginTop: 4 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },
  scrollContent: { paddingBottom: 60 },

  // Profile
  profileSection: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 20 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  largeAvatar: { width: 100, height: 100, borderRadius: 50 },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4, width: 20, height: 20,
    borderRadius: 10, backgroundColor: '#22C55E', borderWidth: 3, borderColor: '#fff',
  },
  nameText: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#111', marginBottom: 4 },
  statusText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center' },
  descriptionText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#6B7280', textAlign: 'center', marginTop: 8 },
  quickActions: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24, width: '100%' },
  actionItem: { alignItems: 'center', gap: 8 },
  actionIconWrap: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8F5FF',
    alignItems: 'center', justifyContent: 'center',
  },
  actionIconActive: { backgroundColor: PURPLE },
  actionLabel: { fontSize: 12, fontFamily: 'Poppins-Medium', color: '#374151' },
  divider: { height: 8, backgroundColor: '#F3F4F6', marginVertical: 20 },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111' },
  sectionAction: { fontSize: 13, fontFamily: 'Poppins-Medium', color: PURPLE },

  // Media Grid
  mediaGrid: { flexDirection: 'row', paddingHorizontal: 20, gap: 8 },
  mediaThumbWrap: { width: (width - 40 - 24) / 4, aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  mediaThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },

  // Group Members
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#111' },
  memberStatus: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  adminBadge: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  adminBadgeText: { fontSize: 10, fontFamily: 'Poppins-Bold', color: PURPLE },

  // Settings
  settingsGroup: { paddingHorizontal: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  settingIconWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: 'Poppins-Medium', color: '#111' },

  // Danger Zone
  dangerGroup: { paddingHorizontal: 20, paddingBottom: 20 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  dangerText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#EF4444' },
});
