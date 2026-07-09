import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SearchBar from '@/components/messages/SearchBar';
import ConversationItem from '@/components/messages/Conversations';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

type FilterTab = 'All' | 'Unread' | 'Groups';

const STORIES = [
  { id: 's0', name: 'Your Story', avatar: require('../../assets/images/storyItem.jpg'), isSelf: true },
  { id: 's1', name: 'Kenny', avatar: require('../../assets/images/feed6.jpg'), hasStory: true },
  { id: 's2', name: 'Ange', avatar: require('../../assets/images/feed5.png'), hasStory: true },
  { id: 's3', name: 'Drake', avatar: require('../../assets/images/feed4.png'), hasStory: true },
  { id: 's4', name: 'Weeknd', avatar: require('../../assets/images/feed3.png'), hasStory: false },
];

const ALL_CONVERSATIONS = [
  {
    id: '1',
    name: 'Kenny K Shot ðŸŽ¤',
    lastMessage: 'Did you check out the new drop?',
    unreadCount: 3,
    hasStory: true,
    isOnline: true,
    timestamp: '2m',
    isPinned: true,
    isRead: false,
    groupMembers: [{ avatar: require('../../assets/images/feed6.jpg') }],
  },
  {
    id: '2',
    name: 'Ange Nadette',
    lastMessage: 'Love your new post! ðŸ”¥',
    unreadCount: 0,
    hasStory: false,
    isOnline: true,
    timestamp: '15m',
    isPinned: false,
    isRead: true,
    groupMembers: [{ avatar: require('../../assets/images/feed6.jpg') }],
  },
  {
    id: '3',
    name: 'Fan Club ðŸŽ¶',
    lastMessage: 'New album drops Friday!',
    unreadCount: 12,
    isGroup: true,
    hasStory: false,
    isOnline: false,
    timestamp: '1h',
    isPinned: true,
    isRead: false,
    senderPrefix: 'Ange: ',
    groupMembers: [
      { avatar: require('../../assets/images/feed6.jpg') },
      { avatar: require('../../assets/images/feed5.png') },
      { avatar: require('../../assets/images/feed4.png') },
    ],
  },
  {
    id: '4',
    name: 'Drake',
    lastMessage: 'Certified ðŸ¦‰',
    unreadCount: 1,
    hasStory: true,
    isOnline: false,
    timestamp: '3h',
    isRead: false,
    groupMembers: [{ avatar: require('../../assets/images/feed4.png') }],
  },
  {
    id: '5',
    name: 'The Weeknd',
    lastMessage: 'Blinding lights ðŸŽµ',
    unreadCount: 0,
    hasStory: false,
    isOnline: false,
    timestamp: 'Mon',
    isRead: true,
    isMuted: true,
    groupMembers: [{ avatar: require('../../assets/images/feed3.png') }],
  },
  {
    id: '6',
    name: 'Merch Team',
    lastMessage: 'Shipment confirmed âœ…',
    unreadCount: 0,
    isGroup: true,
    hasStory: false,
    isOnline: false,
    timestamp: 'Sun',
    isRead: true,
    senderPrefix: 'You: ',
    groupMembers: [
      { avatar: require('../../assets/images/feed6.jpg') },
      { avatar: require('../../assets/images/feed5.png') },
    ],
  },
  {
    id: '7',
    name: 'Emelyne ðŸ’–',
    lastMessage: 'typingâ€¦',
    unreadCount: 0,
    hasStory: false,
    isOnline: true,
    timestamp: 'now',
    isRead: true,
    isTyping: true,
    groupMembers: [{ avatar: require('../../assets/images/feed6.jpg') }],
  },
];

const FILTER_TABS: FilterTab[] = ['All', 'Unread', 'Groups'];

const MessagesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered = ALL_CONVERSATIONS
    .filter(c => {
      if (activeTab === 'Unread') return c.unreadCount > 0;
      if (activeTab === 'Groups') return !!c.isGroup;
      return true;
    })
    .filter(c =>
      !searchQuery.trim() ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pinned = filtered.filter(c => c.isPinned);
  const regular = filtered.filter(c => !c.isPinned);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ChatScreen', { name: item.name, groupMembers: item.groupMembers, isGroup: item.isGroup })}
      activeOpacity={0.75}
    >
      <ConversationItem
        name={item.name}
        lastMessage={item.lastMessage}
        unreadCount={item.unreadCount}
        isGroup={item.isGroup}
        groupMembers={item.groupMembers}
        hasStory={item.hasStory}
        isOnline={item.isOnline}
        timestamp={item.timestamp}
        isPinned={item.isPinned}
        isMuted={item.isMuted}
        isTyping={item.isTyping}
        senderPrefix={item.senderPrefix}
        isRead={item.isRead}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Fixed Header */}
      <View style={styles.fixedTop}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('NewChat')}
          >
            <Ionicons name="create-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>

        <SearchBar
          onSearch={setSearchQuery}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Filter Tabs */}
        <View style={styles.tabsRow}>
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={regular}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Stories row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
              {STORIES.map(s => (
                <TouchableOpacity key={s.id} style={styles.storyItem} activeOpacity={0.8}>
                  <View style={[styles.storyRing, !s.isSelf && s.hasStory && styles.storyRingActive]}>
                    {s.isSelf ? (
                      <View style={styles.selfStoryAvatar}>
                        <Image source={s.avatar} style={styles.storyAvatar} />
                        <View style={styles.storyAddBtn}>
                          <Ionicons name="add" size={12} color="#fff" />
                        </View>
                      </View>
                    ) : (
                      <Image source={s.avatar} style={styles.storyAvatar} />
                    )}
                  </View>
                  <Text style={styles.storyName} numberOfLines={1}>{s.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Pinned conversations */}
            {pinned.length > 0 && (
              <View>
                <Text style={styles.sectionLabel}>ðŸ“Œ Pinned</Text>
                {pinned.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => navigation.navigate('ChatScreen', { name: item.name })}
                    activeOpacity={0.75}
                  >
                    <ConversationItem
                      name={item.name}
                      lastMessage={item.lastMessage}
                      unreadCount={item.unreadCount}
                      isGroup={item.isGroup}
                      groupMembers={item.groupMembers}
                      hasStory={item.hasStory}
                      isOnline={item.isOnline}
                      timestamp={item.timestamp}
                      isPinned={item.isPinned}
                      isMuted={item.isMuted}
                      isTyping={item.isTyping}
                      senderPrefix={item.senderPrefix}
                      isRead={item.isRead}
                    />
                  </TouchableOpacity>
                ))}
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>All Messages</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={52} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Start a new conversation</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  fixedTop: {
    paddingTop: height * 0.05,
    paddingHorizontal: width * 0.05,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  tabChipActive: {
    backgroundColor: PURPLE,
  },
  tabChipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  tabChipTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.1,
  },

  // Stories
  storiesRow: {
    paddingVertical: 14,
    paddingRight: 8,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 64,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyRingActive: {
    borderColor: PURPLE,
  },
  selfStoryAvatar: {
    position: 'relative',
  },
  storyAddBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  storyName: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginTop: 5,
    textAlign: 'center',
  },

  // Section labels
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#D1D5DB',
  },
});

export default MessagesScreen;
