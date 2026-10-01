/**
 * MessageScreen.tsx — Conversations list.
 * Fetches real conversations from the API. No fixture fallback — a failure surfaces as an
 * error with retry rather than sample data that looks real.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SearchBar from '@/components/messages/SearchBar';
import FilterTabBar from '@/components/messages/TabBar';
import ConversationItem from '@/components/messages/Conversations';
import { ChatFilterTab, Conversation } from '@/types/chatTypes';
import { getConversationName, toLocalConversation } from '@/lib/chatMappers';
import { chatService, ConversationDto } from '@/lib/chatService';
import { getSessionToken, getSessionUser } from '@/lib/session';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';
const FILTER_TABS: ChatFilterTab[] = ['All', 'Unread', 'Favorites', 'Groups', 'Archived'];

const MessagesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  // Starts empty, never seeded with fixtures: showing sample conversations to a real user makes
  // a backend failure look like working software.
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ChatFilterTab>('All');
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; conv: Conversation | null }>({ visible: false, conv: null });
  const [showSearch, setShowSearch] = useState(false);

  // Fetch conversations from API
  const fetchConversations = useCallback(async (isRefresh = false) => {
    const token = getSessionToken();
    if (!token) {
      setLoading(false);
      setLoadError('Sign in to see your messages.');
      return;
    }

    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setLoadError(null);
      const dtos = await chatService.getConversations();
      // The real signed-in id: with a placeholder the "other participant" in a DM resolves to
      // the wrong person, so the row shows your own name and avatar.
      const myId = getSessionUser()?.id ?? 0;
      // Assigned unconditionally — an empty result means "no conversations yet", which the
      // empty state should say, not something to paper over with the previous list.
      setConversations(dtos.map(d => toLocalConversation(d, myId)));
    } catch (e: any) {
      console.warn('[MessagesScreen] Failed to load conversations:', e);
      setLoadError(e?.message || 'Could not load conversations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // fetchConversations flips the loading flag straight away, so it is scheduled rather than
  // called in the effect body — a state update during an effect breaks React's purity rules
  // (react-hooks/set-state-in-effect). `loading` already starts true, so nothing flickers.
  useEffect(() => {
    const id = setTimeout(fetchConversations, 0);
    return () => clearTimeout(id);
  }, [fetchConversations]);

  // ── Badge counts ──
  const badgeCounts = useMemo(() => ({
    Unread: conversations.filter(c => c.unreadCount > 0 && !c.isArchived).length,
    Groups: conversations.filter(c => c.type === 'group' && !c.isArchived).length,
    Favorites: conversations.filter(c => c.isFavorite && !c.isArchived).length,
    Archived: conversations.filter(c => c.isArchived).length,
  }), [conversations]);

  // ── Filtering ──
  const filtered = useMemo(() => {
    let list = conversations;
    switch (activeTab) {
      case 'Unread': list = list.filter(c => c.unreadCount > 0 && !c.isArchived); break;
      case 'Favorites': list = list.filter(c => c.isFavorite && !c.isArchived); break;
      case 'Groups': list = list.filter(c => c.type === 'group' && !c.isArchived); break;
      case 'Archived': list = list.filter(c => c.isArchived); break;
      default: list = list.filter(c => !c.isArchived);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        getConversationName(c).toLowerCase().includes(q) ||
        (c.lastMessage?.text ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, activeTab, searchQuery]);

  const displayList = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [filtered]);

  // ── Context menu actions (optimistic, then sync to API) ──
  const callApi = useCallback((fn: () => Promise<void>) => {
    fn().catch(e => console.warn('[Chat] API error:', e));
  }, []);

  const togglePin = useCallback((convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isPinned: !c.isPinned } : c));
    callApi(() => chatService.togglePin(Number(convId)));
    setContextMenu({ visible: false, conv: null });
  }, [callApi]);

  const toggleMute = useCallback((convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isMuted: !c.isMuted } : c));
    callApi(() => chatService.toggleMute(Number(convId)));
    setContextMenu({ visible: false, conv: null });
  }, [callApi]);

  const toggleFavorite = useCallback((convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isFavorite: !c.isFavorite } : c));
    callApi(() => chatService.toggleFavorite(Number(convId)));
    setContextMenu({ visible: false, conv: null });
  }, [callApi]);

  const archiveConversation = useCallback((convId: string) => {
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, isArchived: !c.isArchived } : c));
    callApi(() => chatService.toggleArchive(Number(convId)));
    setContextMenu({ visible: false, conv: null });
  }, [callApi]);

  const deleteConversation = useCallback((convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    setContextMenu({ visible: false, conv: null });
  }, []);

  const markReadUnread = useCallback((convId: string) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      return { ...c, unreadCount: c.unreadCount > 0 ? 0 : 1 };
    }));
    setContextMenu({ visible: false, conv: null });
  }, []);

  const openChat = (conv: Conversation) => {
    // Pass the conversation the list already loaded so the chat header renders immediately
    // instead of waiting on a second fetch (or falling back to placeholder details).
    navigation.navigate('ChatScreen', { conversationId: conv.id, conversation: conv });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => openChat(item)}
      onLongPress={() => setContextMenu({ visible: true, conv: item })}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Fixed Header ── */}
      <View style={styles.fixedTop}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchQuery('');
            }}>
              <Ionicons name="search" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CreateGroupScreen')}>
              <Ionicons name="create" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <SearchBar
            onSearch={setSearchQuery}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search conversations…"
          />
        )}

        <View style={styles.tabsWrap}>
          <FilterTabBar
            tabs={FILTER_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            badgeCounts={badgeCounts}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={item => item.id}
          renderItem={renderConversation}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchConversations(true)}
              colors={[PURPLE]}
              tintColor={PURPLE}
            />
          }
          ListEmptyComponent={
            loadError ? (
              // An error must read as an error. Previously a failed load fell back to fixture
              // conversations, so the screen looked healthy while nothing was actually loading.
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="cloud-offline-outline" size={52} color={PURPLE} />
                </View>
                <Text style={styles.emptyTitle}>Couldn&apos;t load messages</Text>
                <Text style={styles.emptySubtitle}>{loadError}</Text>
                <TouchableOpacity
                  onPress={() => fetchConversations()}
                  style={styles.retryBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="chatbubbles-outline" size={52} color={PURPLE} />
                </View>
                <Text style={styles.emptyTitle}>
                  {activeTab === 'Archived' ? 'No archived chats' : 'No conversations yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'Archived'
                    ? 'Archived conversations will appear here'
                    : 'Tap the pencil icon to start a new conversation'}
                </Text>
              </View>
            )
          }
        />
      )}

      {/* ── FAB — New Chat ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGroupScreen')}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity>

      {/* ── Context Menu Modal ── */}
      <Modal visible={contextMenu.visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setContextMenu({ visible: false, conv: null })}
        >
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />
            <Text style={styles.menuTitle} numberOfLines={1}>
              {contextMenu.conv ? getConversationName(contextMenu.conv) : ''}
            </Text>

            {contextMenu.conv && (
              <>
                <MenuItem icon={contextMenu.conv.isPinned ? 'pin-outline' : 'pin'} label={contextMenu.conv.isPinned ? 'Unpin' : 'Pin'} onPress={() => togglePin(contextMenu.conv!.id)} />
                <MenuItem icon={contextMenu.conv.isFavorite ? 'star' : 'star-outline'} label={contextMenu.conv.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} onPress={() => toggleFavorite(contextMenu.conv!.id)} iconColor={contextMenu.conv.isFavorite ? '#F59E0B' : undefined} />
                <MenuItem icon={contextMenu.conv.isMuted ? 'volume-high-outline' : 'volume-mute-outline'} label={contextMenu.conv.isMuted ? 'Unmute' : 'Mute'} onPress={() => toggleMute(contextMenu.conv!.id)} />
                <MenuItem icon="archive-outline" label={contextMenu.conv.isArchived ? 'Unarchive' : 'Archive'} onPress={() => archiveConversation(contextMenu.conv!.id)} />
                <MenuItem icon={contextMenu.conv.unreadCount > 0 ? 'checkmark-done-outline' : 'mail-unread-outline'} label={contextMenu.conv.unreadCount > 0 ? 'Mark as Read' : 'Mark as Unread'} onPress={() => markReadUnread(contextMenu.conv!.id)} />
                <View style={styles.menuDivider} />
                <MenuItem icon="trash-outline" label="Delete Chat" onPress={() => deleteConversation(contextMenu.conv!.id)} danger />
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const MenuItem: React.FC<{ icon: any; label: string; onPress: () => void; danger?: boolean; iconColor?: string }> = ({ icon, label, onPress, danger, iconColor }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={20} color={danger ? '#EF4444' : iconColor ?? '#374151'} />
    <Text style={[styles.menuItemText, danger && { color: '#EF4444' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  fixedTop: { paddingTop: height * 0.05, paddingHorizontal: width * 0.05, paddingBottom: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },
  headerActions: { flexDirection: 'row' },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  tabsWrap: { marginTop: 10 },
  listContent: { paddingHorizontal: width * 0.05, paddingBottom: height * 0.12 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8F5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#374151' },
  emptySubtitle: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  retryBtn: { marginTop: 16, backgroundColor: PURPLE, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins-Bold' },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12, paddingHorizontal: 20 },
  menuHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  menuTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111', marginBottom: 16, textAlign: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  menuItemText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#374151' },
  menuDivider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});

export default MessagesScreen;
