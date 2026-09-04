import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import NotificationItem, { NotificationType, FollowMode } from '@/components/messages/NotificationItem';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { notificationService, NotificationResponse } from '@/lib/notificationService';

const { height, width } = Dimensions.get('window');

interface UINotification {
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
  relatedEntityId?: number;
  originalType: string;
}

type TabType = 'All' | 'Social' | 'Purchases' | 'Activity';
const TABS: TabType[] = ['All', 'Social', 'Purchases', 'Activity'];

const Notifications: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('All');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setNotifications(data.map(mapBackendToUI));
    } catch (error) {
      console.log('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const mapBackendToUI = (n: NotificationResponse): UINotification => {
    // Map the 26 backend types to the generic UI types
    let type: NotificationType = 'mention';
    let action = n.content;
    let actionButtonLabel = undefined;
    const t = n.type;

    if (['NEW_FOLLOWER'].includes(t)) type = 'follow';
    else if (['LIKE'].includes(t)) type = 'like';
    else if (['COMMENT'].includes(t)) type = 'comment';
    else if (['SHARE', 'REPOST'].includes(t)) type = 'share';
    else if (['PRODUCT_DROP', 'PURCHASE_SUCCESSFUL', 'ORDER_PROCESSING', 'DELIVERED'].includes(t)) type = 'purchase';
    else if (['AUCTION_STARTED', 'BID_SUCCESSFUL', 'OUTBID', 'AUCTION_WON'].includes(t)) type = 'auction';
    
    // Time formatter
    const diff = Date.now() - new Date(n.createdAt).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const time = hours < 24 ? (hours === 0 ? 'Just now' : `${hours}h`) : `${Math.floor(hours / 24)}d`;

    return {
      id: String(n.id),
      time,
      user: n.title,
      action: action,
      type,
      date: n.createdAt,
      isRead: n.read,
      relatedEntityId: n.relatedEntityId,
      originalType: t,
      avatar: require('../../assets/images/profile.jpg'), // Default until backend sends avatar
    };
  };

  const markRead = async (id: string, relatedEntityId?: number, originalType?: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await notificationService.markAsRead(Number(id));
    } catch (e) {
      console.log(e);
    }

    // Navigation Mapping
    if (originalType === 'NEW_FOLLOWER' && relatedEntityId) {
      navigation.push('MyProfile', { userId: relatedEntityId });
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Social') {
      return notifications.filter(n => ['NEW_FOLLOWER', 'LIKE', 'COMMENT', 'REPOST', 'SHARE', 'STORY_INTERACTION'].includes(n.originalType));
    }
    if (activeTab === 'Purchases') {
      return notifications.filter(n => ['PRODUCT_DROP', 'RESERVATION_SUCCESSFUL', 'PURCHASE_SUCCESSFUL', 'ORDER_PROCESSING', 'DELIVERED'].includes(n.originalType));
    }
    return notifications; // Activity (default)
  };

  const groupNotifications = (list: UINotification[]) => {
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;

    const groups: Record<string, UINotification[]> = {
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
      ) : (
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
                  onPress={() => markRead(item.id, item.relatedEntityId, item.originalType)}
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
});

export default Notifications;
