import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import NotificationItem, { NotificationType } from '@/components/messages/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { notificationService, NotificationResponse } from '@/lib/notificationService';
import { useNotificationCenter } from '@/lib/notificationCenter';
import { openNotificationTarget } from '@/lib/navigation';
import { followService } from '@/lib/followService';
import { resolveImageUrl } from '@/lib/apiClient';
import { getSessionUser } from '@/lib/session';
import { formatRelativeTime, parseServerDate } from '@/lib/time';
import { parseTimestamp } from '@/lib/dateUtils';

const { height } = Dimensions.get('window');

type TabType = 'All' | 'Social' | 'Purchases' | 'Activity';
const TABS: TabType[] = ['All', 'Social', 'Purchases', 'Activity'];

const SOCIAL_TYPES = [
  'NEW_FOLLOWER', 'LIKE', 'LIKE_COMMENT_ACTIVITY', 'COMMENT', 'REPOST', 'SHARE',
  'STORY_INTERACTION', 'STORY_POST_ACTIVITY',
];
const PURCHASE_TYPES = [
  'PRODUCT_DROP', 'RESERVATION_SUCCESSFUL', 'RESERVATION_EXPIRING', 'RESERVATION_EXPIRED',
  'PURCHASE_SUCCESSFUL', 'ORDER_PROCESSING', 'ORDER_STATUS', 'OUT_FOR_DELIVERY', 'DELIVERED',
  'CART_EXPIRING_SOON', 'AUCTION_STARTED', 'BID_SUCCESSFUL', 'OUTBID', 'AUCTION_ENDING_SOON',
  'AUCTION_WON', 'AUCTION_LOST', 'AUCTION_ENDED', 'TICKET_PURCHASED', 'TICKET_QR_READY',
  'MUSIC_UNLOCKED', 'PAYMENT_SUCCESSFUL', 'PAYMENT_FAILED', 'TOP_UP_SUCCESSFUL', 'TOP_UP_FAILED',
];

const DEFAULT_AVATAR = require('../../assets/images/profile.jpg');

function uiType(t: string): NotificationType {
  if (t === 'NEW_FOLLOWER') return 'follow';
  if (t === 'LIKE' || t === 'LIKE_COMMENT_ACTIVITY' || t === 'STORY_INTERACTION') return 'like';
  if (t === 'COMMENT') return 'comment';
  if (t === 'SHARE' || t === 'REPOST') return 'share';
  if (t.startsWith('AUCTION') || t === 'BID_SUCCESSFUL' || t === 'OUTBID') return 'auction';
  if (PURCHASE_TYPES.includes(t)) return 'purchase';
  return 'mention';
}

/** "Sarah liked your post." → bold "Sarah" + "liked your post." */
function splitActor(n: NotificationResponse): { user: string; action: string } {
  const name = n.actorName?.trim();
  if (name && n.content?.startsWith(name)) {
    return { user: name, action: n.content.slice(name.length).trim() };
  }
  return { user: name || n.title, action: n.content };
}

const Notifications: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const center = useNotificationCenter();
  const { onNotification, noteNotificationsRead, refreshCounts } = center;

  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  // Re-render periodically so "Just now" ages to "2m" while the screen is open.
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setItems(await notificationService.getMyNotifications());
      setNow(new Date());
    } catch {
      setError('Could not load notifications. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load('initial'), 0);
    return () => clearTimeout(id);
  }, [load]);

  // New notifications appear at the top while the screen is open. A collapsed chat notification
  // keeps its id, so it replaces its old row instead of duplicating it.
  useEffect(() => onNotification((n) => {
    setItems((prev) => [n, ...prev.filter((x) => x.id !== n.id)]);
  }), [onNotification]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const unreadCount = items.filter((n) => !n.read).length;

  const openItem = (n: NotificationResponse) => {
    // Opening a notification marks that one as read — not the whole list.
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      noteNotificationsRead();
      notificationService.markAsRead(n.id).catch(() => refreshCounts());
    }
    openNotificationTarget(n, getSessionUser()?.id);
  };

  const markAllRead = async () => {
    const previous = items;
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    noteNotificationsRead(unreadCount);
    try {
      await notificationService.markAllAsRead();
    } catch {
      setItems(previous);
    } finally {
      refreshCounts();
    }
  };

  const filtered = useMemo(() => {
    if (activeTab === 'Social') return items.filter((n) => SOCIAL_TYPES.includes(n.type));
    if (activeTab === 'Purchases') return items.filter((n) => PURCHASE_TYPES.includes(n.type));
    if (activeTab === 'Activity') {
      return items.filter((n) => !SOCIAL_TYPES.includes(n.type) && !PURCHASE_TYPES.includes(n.type));
    }
    return items;
  }, [items, activeTab]);

  const sections = useMemo(() => {
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    const groups: Record<string, NotificationResponse[]> = {
      New: [],
      Yesterday: [],
      'Last 7 days': [],
      Earlier: [],
    };
    filtered.forEach((n) => {
      const age = now.getTime() - (parseServerDate(n.createdAt)?.getTime() ?? 0);
      if (age <= 12 * HOUR) groups.New.push(n);
      else if (age <= 36 * HOUR) groups.Yesterday.push(n);
      else if (age <= 7 * DAY) groups['Last 7 days'].push(n);
      else groups.Earlier.push(n);
    });
    return Object.entries(groups)
      .filter(([, data]) => data.length > 0)
      .map(([title, data]) => ({ title, data }));
  }, [filtered, now]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ flexDirection: 'row' }}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.backBtn} accessibilityLabel="Mark all as read">
              <Ionicons name="checkmark-done-outline" size={22} color="#7126D0" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('NotificationSettings')} style={styles.backBtn}>
            <Ionicons name="settings-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7126D0" />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline-outline" size={52} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Could not load notifications</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load('initial')}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} colors={['#7126D0']} />
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item, index, section }) => {
            const isFirst = index === 0;
            const isLast = index === section.data.length - 1;
            const { user, action } = splitActor(item);
            const followTarget = item.type === 'NEW_FOLLOWER' ? (item.relatedEntityId ?? item.actorId) : null;
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
                  id={String(item.id)}
                  user={user}
                  action={action}
                  time={formatRelativeTime(item.createdAt, now)}
                  type={uiType(item.type)}
                  isRead={item.read}
                  avatar={item.actorAvatar ? { uri: resolveImageUrl(item.actorAvatar) } : DEFAULT_AVATAR}
                  onPress={() => openItem(item)}
                  onFollowToggle={
                    followTarget
                      ? (follow) => (follow
                          ? followService.followUser(followTarget)
                          : followService.unfollowUser(followTarget))
                      : undefined
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={52} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>When someone likes, comments, follows you or sends a message, it will show up here.</Text>
            </View>
          }
        />
      )}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#7126D0',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#7126D0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
});

export default Notifications;
