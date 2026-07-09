import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import NotificationItem, { NotificationType } from '@/components/messages/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

interface Notification {
  id: string;
  time: string;
  user: string;
  action: string;
  type?: NotificationType;
  comment?: string;
  photos?: (string | number)[];
  isRead?: boolean;
  date: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    time: '2m ago',
    user: 'Kenny K Shot',
    action: 'liked your photo.',
    type: 'like',
    photos: [require('../../assets/images/feed6.jpg')],
    isRead: false,
    date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    time: '18m ago',
    user: 'Ange Nadette',
    action: 'commented on your post.',
    type: 'comment',
    comment: '"This is absolutely fire 🔥 I love this one so much, keep it up!"',
    isRead: false,
    date: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    time: '1h ago',
    user: 'The Weeknd Fan Page',
    action: 'started following you.',
    type: 'follow',
    isRead: false,
    date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    time: '3h ago',
    user: 'Drake',
    action: 'mentioned you in a comment.',
    type: 'mention',
    comment: '"Check out @you for the best merch drops this season!"',
    isRead: true,
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    time: '5h ago',
    user: 'Ange Nadette',
    action: 'liked 3 of your photos.',
    type: 'like',
    photos: [
      require('../../assets/images/feed6.jpg'),
      require('../../assets/images/feed5.png'),
      require('../../assets/images/feed4.png'),
    ],
    isRead: true,
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    time: 'Yesterday',
    user: 'CelebStash',
    action: 'Your purchase of "After Hours" album was successful.',
    type: 'purchase',
    isRead: true,
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    time: 'Yesterday',
    user: 'Justin Timberlake',
    action: 'started following you.',
    type: 'follow',
    isRead: true,
    date: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    time: '3 days ago',
    user: 'Ange Nadette',
    action: 'tagged you in a post.',
    type: 'tag',
    isRead: true,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Notifications: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const groupNotifications = (list: Notification[]) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    const groups: Record<string, Notification[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Earlier: [],
    };

    list.forEach(n => {
      const age = now - new Date(n.date).getTime();
      if (age < DAY) {
        groups['Today'].push(n);
      } else if (age < 2 * DAY) {
        groups['Yesterday'].push(n);
      } else if (age < 7 * DAY) {
        groups['This Week'].push(n);
      } else {
        groups['Earlier'].push(n);
      }
    });

    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([title, data]) => ({ title, data }));
  };

  const sections = groupNotifications(notifications);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <NotificationItem
            {...item}
            onPress={() => markRead(item.id)}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionText}>{title}</Text>
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Back + Title */}
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#111" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Notifications</Text>
              <View style={styles.backBtn} />
            </View>

            {/* Unread count + Mark all read */}
            {unreadCount > 0 && (
              <View style={styles.subHeader}>
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                </View>
                <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                  <Ionicons name="checkmark-done-outline" size={16} color={PURPLE} />
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={52} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>When someone interacts with you, it will show up here.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  listContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },

  // ── Header ──
  header: {
    paddingTop: height * 0.055,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  unreadBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  markAllText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },

  // ── Section header ──
  sectionHeaderWrap: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
    paddingHorizontal: 32,
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
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Notifications;
