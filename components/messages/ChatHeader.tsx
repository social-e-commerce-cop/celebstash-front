import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Conversation } from '@/types/chatTypes';
import { getConversationName, getConversationAvatar, getOtherUser } from '@/data/mockChatData';

const PURPLE = '#7126D0';

interface ChatHeaderProps {
  scrollY: Animated.Value;
  conversation: Conversation;
  onSearchToggle: (isSearching: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClearChat?: () => void;
  onExportChat?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  scrollY, 
  conversation, 
  onSearchToggle,
  searchQuery,
  onSearchQueryChange,
  onClearChat,
  onExportChat
}) => {
  const navigation = useNavigation<any>();
  const [isSearching, setIsSearching] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const name = getConversationName(conversation);
  const avatar = getConversationAvatar(conversation);
  const isGroup = conversation.type === 'group';
  const otherUser = !isGroup ? getOtherUser(conversation) : null;
  const isOnline = otherUser?.isOnline ?? false;

  const getStatusText = () => {
    if (isGroup) return `${conversation.participants.length} members, ${conversation.participants.filter(p => p.isOnline).length} online`;
    if (isOnline) return 'Online';
    if (otherUser?.lastSeen) {
      const ls = new Date(otherUser.lastSeen);
      const now = new Date();
      if (now.getTime() - ls.getTime() < 24 * 60 * 60 * 1000) {
        return `last seen at ${ls.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `last seen ${ls.toLocaleDateString()}`;
    }
    return 'Offline';
  };

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [220, 70],
    extrapolate: 'clamp',
  });
  const largeOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const compactOpacity = scrollY.interpolate({
    inputRange: [60, 140],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleSearchToggle = () => {
    const newState = !isSearching;
    setIsSearching(newState);
    onSearchToggle(newState);
    if (!newState) onSearchQueryChange('');
  };

  const openInfo = () => {
    navigation.navigate('ChatInfoScreen', { conversationId: conversation.id });
  };

  // ── Search Mode Header ──
  if (isSearching) {
    return (
      <View style={[styles.container, styles.searchContainer]}>
        <TouchableOpacity onPress={handleSearchToggle} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.searchInputWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search in conversation..."
            value={searchQuery}
            onChangeText={onSearchQueryChange}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchQueryChange('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.searchNavBtns}>
          <TouchableOpacity style={{ padding: 4 }}><Ionicons name="chevron-up" size={20} color="#9CA3AF" /></TouchableOpacity>
          <TouchableOpacity style={{ padding: 4 }}><Ionicons name="chevron-down" size={20} color="#9CA3AF" /></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Large / Expanded Header ── */}
      <Animated.View style={[styles.largeHeader, { height: headerHeight, opacity: largeOpacity }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <View style={styles.callBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSearchToggle}>
              <Ionicons name="search" size={22} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('VideoCallScreen', { name, avatar, conversationId: conversation.id })}>
              <Ionicons name="videocam" size={24} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('VoiceCallScreen', { name, avatar, conversationId: conversation.id })}>
              <Ionicons name="call" size={22} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-vertical" size={22} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.profileBlock} onPress={openInfo} activeOpacity={0.8}>
          <View style={styles.avatarWrap}>
            <Image source={avatar} style={styles.largeAvatar} />
            {isOnline && !isGroup && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.largeName}>{name}</Text>
          <Text style={styles.statusLine}>{getStatusText()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Compact / Collapsed Header ── */}
      <Animated.View style={[styles.compactHeader, { opacity: compactOpacity }]}>
        <View style={styles.compactLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.compactAvatarInfo} onPress={openInfo} activeOpacity={0.8}>
            <View style={styles.compactAvatarWrap}>
              <Image source={avatar} style={styles.compactAvatar} />
              {isOnline && !isGroup && <View style={styles.compactOnlineDot} />}
            </View>
            <View style={styles.compactInfo}>
              <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
              <Text style={styles.compactStatus} numberOfLines={1}>{getStatusText()}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.callBtns}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('VideoCallScreen', { name, avatar, conversationId: conversation.id })}>
            <Ionicons name="videocam" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('VoiceCallScreen', { name, avatar, conversationId: conversation.id })}>
            <Ionicons name="call" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="#111" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Dropdown Menu ── */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <MenuItem icon="search-outline" label="Search" onPress={() => { setMenuVisible(false); handleSearchToggle(); }} />
            <MenuItem icon="volume-mute-outline" label="Mute Notifications" onPress={() => setMenuVisible(false)} />
            <MenuItem icon="color-palette-outline" label="Chat Wallpaper" onPress={() => setMenuVisible(false)} />
            <MenuItem icon="information-circle-outline" label="Chat Info" onPress={() => { setMenuVisible(false); openInfo(); }} />
            <View style={styles.menuDiv} />
            <MenuItem icon="trash-outline" label="Clear Chat" onPress={() => { setMenuVisible(false); onClearChat?.(); }} danger />
            <MenuItem icon="download-outline" label="Export Chat" onPress={() => { setMenuVisible(false); onExportChat?.(); }} />
            <MenuItem icon="ban-outline" label="Block User" onPress={() => setMenuVisible(false)} danger />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const MenuItem = ({ icon, label, onPress, danger }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#374151'} />
    <Text style={[styles.menuItemText, danger && { color: '#EF4444' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0, right: 0, top: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 32,
  },

  // ── Search Mode ──
  searchContainer: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    marginHorizontal: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#111', padding: 0 },
  searchNavBtns: { flexDirection: 'row' },

  // ── Large ──
  largeHeader: { backgroundColor: '#fff', overflow: 'hidden', paddingTop: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12 },
  callBtns: { flexDirection: 'row', gap: 0 },
  iconBtn: { padding: 8, borderRadius: 20 },
  profileBlock: { alignItems: 'center', paddingTop: 12 },
  avatarWrap: { position: 'relative' },
  largeAvatar: { width: 68, height: 68, borderRadius: 34 },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2, width: 14, height: 14,
    borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  largeName: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#111', marginTop: 8 },
  statusLine: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 2 },

  // ── Compact ──
  compactHeader: {
    position: 'absolute', left: 0, right: 0, top: 0, height: 60,
    paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#fff', zIndex: 20, marginTop: 32,
  },
  compactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  compactAvatarInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  compactAvatarWrap: { position: 'relative', marginLeft: 4 },
  compactAvatar: { width: 38, height: 38, borderRadius: 19 },
  compactOnlineDot: {
    position: 'absolute', bottom: 0, right: 0, width: 11, height: 11,
    borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  compactInfo: { marginLeft: 10, flex: 1, marginRight: 10 },
  compactName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111' },
  compactStatus: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' },

  // ── Menu ──
  menuOverlay: { flex: 1, backgroundColor: 'transparent' },
  menuBox: {
    position: 'absolute', top: 80, right: 12,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8,
    width: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  menuItemText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#374151' },
  menuDiv: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});
