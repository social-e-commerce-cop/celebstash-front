import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

interface ChatHeaderProps {
  scrollY: Animated.Value;
  isOnline?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ scrollY, isOnline = true }) => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const name = route?.params?.name ?? 'Ange Nadette';

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

  return (
    <View style={styles.container}>
      {/* ── Large / Expanded Header ── */}
      <Animated.View style={[styles.largeHeader, { height: headerHeight, opacity: largeOpacity }]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <View style={styles.callBtns}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
              <Ionicons name="videocam-outline" size={24} color="#111" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
              <Ionicons name="call-outline" size={22} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar + name + status */}
        <View style={styles.profileBlock}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/images/feed6.jpg')}
              style={styles.largeAvatar}
            />
            {isOnline && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.largeName}>{name}</Text>
          <Text style={styles.statusLine}>{isOnline ? '🟢 Online' : 'last seen recently'}</Text>
        </View>
      </Animated.View>

      {/* ── Compact / Collapsed Header ── */}
      <Animated.View style={[styles.compactHeader, { opacity: compactOpacity }]}>
        <View style={styles.compactLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <View style={styles.compactAvatarWrap}>
            <Image source={require('../../assets/images/feed6.jpg')} style={styles.compactAvatar} />
            {isOnline && <View style={styles.compactOnlineDot} />}
          </View>
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{name}</Text>
            <Text style={styles.compactStatus}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <View style={styles.callBtns}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="videocam-outline" size={22} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="call-outline" size={22} color="#111" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingTop: 32,
  },

  // Large
  largeHeader: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  callBtns: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, borderRadius: 20 },
  profileBlock: { alignItems: 'center', paddingTop: 12 },
  avatarWrap: { position: 'relative' },
  largeAvatar: { width: 68, height: 68, borderRadius: 34 },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  largeName: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginTop: 8,
  },
  statusLine: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },

  // Compact
  compactHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 60,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 20,
    marginTop: 32,
  },
  compactLeft: { flexDirection: 'row', alignItems: 'center' },
  compactAvatarWrap: { position: 'relative', marginLeft: 4 },
  compactAvatar: { width: 38, height: 38, borderRadius: 19 },
  compactOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  compactInfo: { marginLeft: 10 },
  compactName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111' },
  compactStatus: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#22C55E' },
});
