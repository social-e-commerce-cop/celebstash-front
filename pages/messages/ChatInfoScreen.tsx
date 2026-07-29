import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Conversation } from '@/types/chatTypes';
import { MOCK_CONVERSATIONS, getConversationName, getConversationAvatar, getOtherUser, getSharedMedia } from '@/data/mockChatData';
import ProductCard from '@/components/messages/ProductCard';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

export default function ChatInfoScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId ?? 'c1';
  const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId) ?? MOCK_CONVERSATIONS[0];
  
  const [isMuted, setIsMuted] = useState(conv.isMuted);

  const name = getConversationName(conv);
  const avatar = getConversationAvatar(conv);
  const isGroup = conv.type === 'group';
  const otherUser = !isGroup ? getOtherUser(conv) : null;
  const isOnline = otherUser?.isOnline ?? false;
  
  const sharedMedia = getSharedMedia(conversationId);
  const photosAndVideos = sharedMedia.filter(m => m.type === 'photo' || m.type === 'video').slice(0, 4);
  const products = sharedMedia.filter(m => m.type === 'product');

  const handleMuteToggle = () => setIsMuted(!isMuted);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isGroup ? 'Group Info' : 'Contact Info'}</Text>
        <View style={styles.iconBtn} />
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
            {isGroup ? `${conv.participants.length} members` : (otherUser?.bio ?? (isOnline ? 'Online' : 'Offline'))}
          </Text>

          <View style={styles.quickActions}>
            <QuickAction icon="call-outline" label="Audio" onPress={() => navigation.navigate('VoiceCallScreen', { name, avatar })} />
            <QuickAction icon="videocam-outline" label="Video" onPress={() => navigation.navigate('VideoCallScreen', { name, avatar })} />
            <QuickAction icon="search-outline" label="Search" onPress={() => { navigation.goBack(); /* trigger search from header ideally */ }} />
            <QuickAction icon={isMuted ? 'volume-mute' : 'volume-high-outline'} label="Mute" onPress={handleMuteToggle} active={isMuted} />
          </View>
        </View>
        <View style={styles.divider} />

        {/* ── Group Members ── */}
        {isGroup && (
          <>
            <SectionHeader title={`${conv.participants.length} Members`} action="Add" onAction={() => {}} />
            {conv.participants.map(p => (
              <TouchableOpacity key={p.id} style={styles.memberRow}>
                <Image source={p.avatar} style={styles.memberAvatar} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{p.id === 'me' ? 'You' : p.name}</Text>
                  <Text style={styles.memberStatus}>{p.isOnline ? 'Online' : 'Offline'}</Text>
                </View>
                {conv.groupInfo?.adminIds.includes(p.id) && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>Admin</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
            <View style={styles.divider} />
          </>
        )}

        {/* ── Shared Media Preview ── */}
        <SectionHeader title="Media, Links, and Docs" action="View All" onAction={() => navigation.navigate('SharedMediaScreen', { conversationId })} />
        <View style={styles.mediaGrid}>
          {photosAndVideos.map((m, i) => (
            <TouchableOpacity key={m.id} style={styles.mediaThumbWrap}>
              <Image source={m.uri} style={styles.mediaThumb} />
              {m.type === 'video' && (
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={24} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
          {photosAndVideos.length === 0 && (
            <Text style={styles.emptyText}>No shared media yet.</Text>
          )}
        </View>
        <View style={styles.divider} />

        {/* ── Shared Products ── */}
        {products.length > 0 && (
          <>
            <SectionHeader title="Shared Products" action="View All" onAction={() => navigation.navigate('SharedMediaScreen', { conversationId, initialTab: 'Products' })} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
              {products.map(p => (
                <View key={p.id} style={{ marginRight: 12 }}>
                  <ProductCard product={p.product!} />
                </View>
              ))}
            </ScrollView>
            <View style={styles.divider} />
          </>
        )}

        {/* ── Settings ── */}
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconWrap}><Ionicons name="notifications-outline" size={20} color="#374151" /></View>
            <Text style={styles.settingLabel}>Mute Notifications</Text>
            <Switch value={isMuted} onValueChange={setIsMuted} trackColor={{ false: '#D1D5DB', true: PURPLE }} thumbColor="#fff" />
          </View>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconWrap}><Ionicons name="musical-notes-outline" size={20} color="#374151" /></View>
            <Text style={styles.settingLabel}>Custom Sound</Text>
            <Text style={styles.settingValue}>Default</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingIconWrap}><Ionicons name="color-palette-outline" size={20} color="#374151" /></View>
            <Text style={styles.settingLabel}>Chat Theme</Text>
            <View style={styles.themeCircle} />
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        {/* ── Danger Zone ── */}
        <View style={styles.dangerGroup}>
          {isGroup ? (
            <TouchableOpacity style={styles.dangerRow} onPress={() => Alert.alert('Leave Group', 'Are you sure?')}>
              <Ionicons name="exit-outline" size={22} color="#EF4444" />
              <Text style={styles.dangerText}>Leave Group</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.dangerRow} onPress={() => Alert.alert('Block User', 'Are you sure?')}>
              <Ionicons name="ban-outline" size={22} color="#EF4444" />
              <Text style={styles.dangerText}>Block {name}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.dangerRow}>
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text style={styles.dangerText}>Clear Chat History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerRow}>
            <Ionicons name="download-outline" size={22} color="#374151" />
            <Text style={[styles.dangerText, { color: '#374151' }]}>Export Chat to PDF</Text>
          </TouchableOpacity>
          {!isGroup && (
            <TouchableOpacity style={styles.dangerRow}>
              <Ionicons name="flag-outline" size={22} color="#EF4444" />
              <Text style={styles.dangerText}>Report {name}</Text>
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
    <TouchableOpacity onPress={onAction}>
      <Text style={styles.sectionAction}>{action}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  
  // Products
  productsScroll: { paddingHorizontal: 20 },

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
  settingValue: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginRight: 8 },
  themeCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: PURPLE, marginRight: 8 },

  // Danger Zone
  dangerGroup: { paddingHorizontal: 20, paddingBottom: 20 },
  dangerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12 },
  dangerText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#EF4444' },
});
