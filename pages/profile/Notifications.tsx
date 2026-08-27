import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { height } = Dimensions.get('window');
const PURPLE = '#7126D0';

type RadioChoice = 'off' | 'following' | 'everyone';

interface SubSettingConfig {
  key: string;
  title: string;
  subtitle?: string;
  type: 'radio' | 'toggle';
  value: RadioChoice | boolean;
}

interface CategoryConfig {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  description?: string;
  settings: SubSettingConfig[];
}

const INITIAL_SETTINGS: Record<string, CategoryConfig> = {
  quiet_mode: {
    key: 'quiet_mode',
    title: 'Quiet mode',
    icon: 'moon-outline',
    description: 'Automatically mute notifications at night or whenever you need to focus.',
    settings: [
      { key: 'enable_quiet', title: 'Enable Quiet Mode', type: 'toggle', value: true },
      { key: 'quiet_weekends', title: 'Include Weekends', type: 'toggle', value: true },
      { key: 'mute_calls', title: 'Silence incoming calls during Quiet Mode', type: 'toggle', value: false },
    ],
  },
  posts: {
    key: 'posts',
    title: 'Posts, stories and comments',
    icon: 'images-outline',
    description: 'Manage push notifications for likes, story reactions, and comments.',
    settings: [
      { key: 'likes', title: 'Likes on your posts', type: 'radio', value: 'everyone' },
      { key: 'story_likes', title: 'Likes & reactions on stories', type: 'radio', value: 'following' },
      { key: 'comments', title: 'Comments on your items', type: 'radio', value: 'everyone' },
      { key: 'comment_likes', title: 'Comment likes & pins', type: 'toggle', value: true },
    ],
  },
  following: {
    key: 'following',
    title: 'Following and followers',
    icon: 'person-outline',
    description: 'Control alerts when users follow you or interact with your profile.',
    settings: [
      { key: 'new_followers', title: 'New Followers', type: 'toggle', value: true },
      { key: 'accepted_requests', title: 'Accepted Follow Requests', type: 'toggle', value: true },
      { key: 'account_suggestions', title: 'Account Suggestions', type: 'toggle', value: true },
    ],
  },
  messages: {
    key: 'messages',
    title: 'Messages',
    icon: 'chatbubble-outline',
    description: 'Choose who can trigger push notifications for chat messages.',
    settings: [
      { key: 'direct_messages', title: 'Direct Messages', type: 'radio', value: 'everyone' },
      { key: 'message_requests', title: 'Message Requests', type: 'toggle', value: true },
      { key: 'group_invites', title: 'Group Chat Invites', type: 'toggle', value: true },
    ],
  },
  calls: {
    key: 'calls',
    title: 'Calls',
    icon: 'call-outline',
    description: 'Configure incoming audio and video call notification rules.',
    settings: [
      { key: 'voice_calls', title: 'Voice Calls', type: 'radio', value: 'everyone' },
      { key: 'video_calls', title: 'Video Calls', type: 'radio', value: 'following' },
    ],
  },
  live: {
    key: 'live',
    title: 'Live and Auctions',
    icon: 'videocam-outline',
    description: 'Control notifications for live auctions, streams, and creator reels.',
    settings: [
      { key: 'live_auctions', title: 'Live Stash Auctions & Streams', type: 'toggle', value: true },
      { key: 'trending_drops', title: 'Trending Product Drops', type: 'toggle', value: true },
      { key: 'repost_mentions', title: 'Story Reposts & Mentions', type: 'toggle', value: true },
    ],
  },
  email: {
    key: 'email',
    title: 'Email notifications',
    icon: 'mail-outline',
    description: 'Choose which email updates you would like to receive in your inbox.',
    settings: [
      { key: 'order_emails', title: 'Order Confirmation & Shipping Updates', type: 'toggle', value: true },
      { key: 'promo_emails', title: 'Promotional Offers & Discount Codes', type: 'toggle', value: false },
      { key: 'newsletter', title: 'CelebStash Weekly Stash Digest', type: 'toggle', value: true },
    ],
  },
  shopping: {
    key: 'shopping',
    title: 'Shopping',
    icon: 'cart-outline',
    description: 'Real-time alerts for orders, price drops, and auction bids.',
    settings: [
      { key: 'order_status', title: 'Order Delivery & Tracking', type: 'toggle', value: true },
      { key: 'price_drops', title: 'Price Drops on Wishlist Items', type: 'toggle', value: true },
      { key: 'auction_outbids', title: 'Auction Outbid Alerts', type: 'toggle', value: true },
      { key: 'restock_alerts', title: 'Exclusive Restock Alerts', type: 'toggle', value: false },
    ],
  },
};

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Main Pause All state
  const [pauseAll, setPauseAll] = useState(false);
  const [pauseDurationModal, setPauseDurationModal] = useState(false);

  // Active Category Modal State
  const [categories, setCategories] = useState<Record<string, CategoryConfig>>(INITIAL_SETTINGS);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleTogglePauseAll = (val: boolean) => {
    setPauseAll(val);
    if (val) {
      setPauseDurationModal(true);
    } else {
      showToast('Notifications resumed.');
    }
  };

  const selectPauseDuration = (durationLabel: string) => {
    setPauseDurationModal(false);
    showToast(`Notifications paused for ${durationLabel}.`);
  };

  const updateSubSettingValue = (catKey: string, settingKey: string, newValue: any) => {
    setCategories(prev => ({
      ...prev,
      [catKey]: {
        ...prev[catKey],
        settings: prev[catKey].settings.map(s =>
          s.key === settingKey ? { ...s, value: newValue } : s
        ),
      },
    }));
    showToast('Setting updated.');
  };

  const activeCategory = selectedCategoryKey ? categories[selectedCategoryKey] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F4F6" />

      {/* Floating Toast */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircleBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Push notifications */}
        <Text style={styles.sectionTitle}>Push notifications</Text>
        <View style={styles.card}>
          {/* Pause all */}
          <TouchableOpacity style={styles.rowContainer} activeOpacity={0.7} disabled>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-off-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Pause all</Text>
              <Text style={styles.rowSubtitle}>Temporarily pause notifications</Text>
            </View>
            <Switch
              value={pauseAll}
              onValueChange={handleTogglePauseAll}
              trackColor={{ true: PURPLE, false: '#E5E7EB' }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Quiet mode */}
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('quiet_mode')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="moon-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Quiet mode</Text>
              <Text style={styles.rowSubtitle}>Automatically mute notifications at night or whenever you need to focus.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Posts, stories and comments */}
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('posts')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="images-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Posts, stories and comments</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Following and followers */}
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('following')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Following and followers</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Messages */}
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('messages')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubble-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Messages</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Calls */}
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('calls')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Calls</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Live and reels */}
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('live')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="videocam-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Live and reels</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Section 2: Other notification types */}
        <Text style={styles.sectionTitle}>Other notification types</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('email')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Email notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => setSelectedCategoryKey('shopping')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="cart-outline" size={20} color="#111" />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Shopping</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Sub-Setting Category Modal ── */}
      <Modal
        visible={!!activeCategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedCategoryKey(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setSelectedCategoryKey(null)}
          />
          <View style={styles.modalSheet}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeCategory?.title}</Text>
              <TouchableOpacity
                onPress={() => setSelectedCategoryKey(null)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            {activeCategory?.description && (
              <Text style={styles.modalDesc}>{activeCategory.description}</Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {activeCategory?.settings.map(setting => (
                <View key={setting.key} style={styles.settingBlock}>
                  <Text style={styles.settingLabel}>{setting.title}</Text>

                  {setting.type === 'toggle' ? (
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleText}>
                        {setting.value ? 'Enabled' : 'Disabled'}
                      </Text>
                      <Switch
                        value={setting.value as boolean}
                        onValueChange={val =>
                          updateSubSettingValue(activeCategory.key, setting.key, val)
                        }
                        trackColor={{ true: PURPLE, false: '#E5E7EB' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  ) : (
                    <View style={styles.radioGroup}>
                      {[
                        { label: 'Off', val: 'off' },
                        { label: 'From People I Follow', val: 'following' },
                        { label: 'From Everyone', val: 'everyone' },
                      ].map(radio => {
                        const isSelected = setting.value === radio.val;
                        return (
                          <TouchableOpacity
                            key={radio.val}
                            style={styles.radioRow}
                            onPress={() =>
                              updateSubSettingValue(activeCategory.key, setting.key, radio.val)
                            }
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.radioLabel, isSelected && styles.radioLabelSelected]}>
                              {radio.label}
                            </Text>
                            <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                              {isSelected && <View style={styles.radioInner} />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Pause Duration Picker Modal ── */}
      <Modal
        visible={pauseDurationModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPauseDurationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setPauseDurationModal(false)}
          />
          <View style={styles.durationCard}>
            <Text style={styles.durationTitle}>Pause all notifications</Text>
            <Text style={styles.durationSubtitle}>
              You won't receive push notifications, but you can check them inside the app.
            </Text>

            {[
              '15 minutes',
              '1 hour',
              '2 hours',
              '4 hours',
              '8 hours',
              'Until I turn it back on',
            ].map(dur => (
              <TouchableOpacity
                key={dur}
                style={styles.durationRow}
                onPress={() => selectPauseDuration(dur)}
                activeOpacity={0.7}
              >
                <Text style={styles.durationText}>{dur}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F6',
  },
  toastContainer: {
    position: 'absolute',
    top: height * 0.06,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#111',
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
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginTop: 16,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111',
  },
  rowSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },

  // ── Modal Styles ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalScroll: {
    maxHeight: height * 0.55,
  },
  settingBlock: {
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 14,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
  },
  radioGroup: {
    gap: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  radioLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
  },
  radioLabelSelected: {
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: PURPLE,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PURPLE,
  },

  // ── Pause Duration Card ──
  durationCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: height * 0.1,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  durationTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 4,
  },
  durationSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  durationRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
});

export default NotificationScreen;
