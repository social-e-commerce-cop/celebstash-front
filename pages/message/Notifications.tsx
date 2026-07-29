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
import NotificationItem, { NotificationType, FollowMode } from '@/components/messages/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { height } = Dimensions.get('window');

interface Notification {
  id: string;
  time: string;
  user: string;
  action: string;
  type?: NotificationType;
  followMode?: FollowMode;
  avatar?: any;
  thumbnail?: any;
  comment?: string;
  actionButtonLabel?: string;
  isRead?: boolean;
  isFollowing?: boolean;
  date: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  // ── New ──
  {
    id: '1',
    time: '5m',
    user: 'theweeknd',
    action: 'is host of a Live Stash Auction: "After Hours Signed Vinyl".',
    type: 'live',
    avatar: require('../../assets/images/black-man.png'),
    actionButtonLabel: 'Join Live',
    isRead: false,
    date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    time: '22m',
    user: 'leviileon',
    action: 'started following you.',
    type: 'follow',
    followMode: 'follow_back',
    avatar: require('../../assets/images/smiling-black.png'),
    isFollowing: false,
    isRead: false,
    date: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    time: '45m',
    user: 'ange_nadette',
    action: 'outbid you ($340) on "Vintage Leather Bomber".',
    type: 'auction',
    avatar: require('../../assets/images/prof.jpg'),
    thumbnail: require('../../assets/images/product1.jpg'),
    actionButtonLabel: 'Bid $360',
    isRead: false,
    date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    time: '2h',
    user: 'mbestra',
    action: 'commented on your product drop:',
    type: 'comment',
    comment: 'Need this jacket in size L! Is it still available? 🔥',
    avatar: require('../../assets/images/profile.jpg'),
    thumbnail: require('../../assets/images/product3.jpg'),
    isRead: false,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },

  // ── Yesterday ──
  {
    id: '5',
    time: '12h',
    user: 'king_kivumbi',
    action: 'shared your item "Custom Oversized Tee" to their story.',
    type: 'share',
    avatar: require('../../assets/images/story3.png'),
    thumbnail: require('../../assets/images/feed7.png'),
    isRead: true,
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    time: '14h',
    user: 'halukman',
    action: 'suggested for you based on items you bought.',
    type: 'follow',
    followMode: 'follow',
    avatar: require('../../assets/images/professional-black.png'),
    isFollowing: false,
    isRead: true,
    date: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    time: '18h',
    user: 'verna.dare',
    action: 'liked your story drop.',
    type: 'like',
    avatar: require('../../assets/images/ast.png'),
    thumbnail: require('../../assets/images/drop1.jpg'),
    isRead: true,
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    time: '22h',
    user: 'fateme_ahmadi',
    action: 'started following you.',
    type: 'follow',
    followMode: 'follow_back',
    avatar: require('../../assets/images/story1.png'),
    isFollowing: true,
    isRead: true,
    date: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },

  // ── Last 7 days ──
  {
    id: '9',
    time: '2d',
    user: 'zahrakan',
    action: 'liked your collection drop.',
    type: 'like',
    avatar: require('../../assets/images/story2.png'),
    thumbnail: require('../../assets/images/product5.jpg'),
    isRead: true,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    time: '4d',
    user: 'drake_official',
    action: 'suggested for you from your favorite artists.',
    type: 'follow',
    followMode: 'follow',
    avatar: require('../../assets/images/feed6.jpg'),
    isFollowing: false,
    isRead: true,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const Notifications: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const groupNotifications = (list: Notification[]) => {
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;

    const groups: Record<string, Notification[]> = {
      New: [],
      Yesterday: [],
      'Last 7 days': [],
      Earlier: [],
    };

    list.forEach(n => {
      const age = now - new Date(n.date).getTime();
      if (age <= 12 * HOUR) {
        groups['New'].push(n);
      } else if (age <= 36 * HOUR) {
        groups['Yesterday'].push(n);
      } else if (age <= 7 * DAY) {
        groups['Last 7 days'].push(n);
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
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F6" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')} style={styles.backBtn}>
          <Ionicons name="settings-outline" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          return (
            <View
              style={[
                styles.itemCard,
                isFirst && styles.itemCardFirst,
                isLast && styles.itemCardLast,
                !isLast && styles.itemBorderBottom,
              ]}
            >
              <NotificationItem
                {...item}
                onPress={() => markRead(item.id)}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={52} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySubtitle}>When someone interacts with your products, auctions, or profile, it will show up here.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.055,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F4F4F6',
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 4,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  itemCardFirst: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 6,
  },
  itemCardLast: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingBottom: 6,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
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
