import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Image, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationCenter } from '@/lib/notificationCenter';
import { notificationService, NotificationResponse } from '@/lib/notificationService';
import { openNotificationTarget, hasNotificationTarget } from '@/lib/navigation';
import { resolveImageUrl } from '@/lib/apiClient';
import { getSessionUser } from '@/lib/session';

const PURPLE = '#7126D0';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  NEW_MESSAGE: 'chatbubble-ellipses',
  LIKE: 'heart',
  LIKE_COMMENT_ACTIVITY: 'heart',
  COMMENT: 'chatbubble',
  NEW_FOLLOWER: 'person-add',
  REPOST: 'repeat',
  STORY_INTERACTION: 'happy',
};

/**
 * Foreground banner for a newly pushed notification. Sits above every screen, never takes
 * focus, and only intercepts touches on the card itself, so scrolling underneath continues.
 * Tap opens the related screen; swipe up dismisses.
 */
export default function InAppNotificationBanner() {
  const { banner, dismissBanner, noteNotificationsRead } = useNotificationCenter();
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(-160));
  // Keep rendering the last banner while it animates out. Updated during render (the documented
  // "adjust state when a prop changes" pattern), so no effect has to set state.
  const [shown, setShown] = useState<NotificationResponse | null>(null);
  if (banner && banner !== shown) setShown(banner);

  useEffect(() => {
    if (banner) {
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    } else {
      Animated.timing(translateY, { toValue: -160, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setShown(null);
      });
    }
  }, [banner, translateY]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderMove: (_, g) => {
          if (g.dy < 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy < -30) dismissBanner();
          else Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [dismissBanner, translateY]
  );

  if (!shown) return null;

  const onPress = () => {
    dismissBanner();
    if (!shown.read) {
      noteNotificationsRead();
      notificationService.markAsRead(shown.id).catch(() => {});
    }
    openNotificationTarget(shown, getSessionUser()?.id);
  };

  const name = shown.actorName || shown.title;
  const avatar = shown.actorAvatar ? { uri: resolveImageUrl(shown.actorAvatar) } : null;

  return (
    <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 6 }]}>
      <Animated.View style={[styles.card, { transform: [{ translateY }] }]} {...pan.panHandlers}>
        <TouchableOpacity
          style={styles.row}
          activeOpacity={0.85}
          onPress={onPress}
          disabled={!hasNotificationTarget(shown)}
          accessibilityRole="button"
          accessibilityLabel={`${name}: ${shown.content}`}
        >
          {avatar ? (
            <Image source={avatar} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.iconAvatar]}>
              <Ionicons name={ICONS[shown.type] ?? 'notifications'} size={18} color="#FFF" />
            </View>
          )}
          <View style={styles.texts}>
            <Text style={styles.title} numberOfLines={1}>{name}</Text>
            <Text style={styles.body} numberOfLines={2}>{shown.content}</Text>
          </View>
          <TouchableOpacity onPress={dismissBanner} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 1000,
    elevation: 1000,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#F0E8FB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  iconAvatar: { backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  title: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#111' },
  body: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#4B5563' },
});
