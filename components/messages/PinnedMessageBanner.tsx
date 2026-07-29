import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#7126D0';

interface PinnedMessageBannerProps {
  text: string;
  senderName?: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

const PinnedMessageBanner: React.FC<PinnedMessageBannerProps> = ({ text, senderName, onPress, onDismiss }) => (
  <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.pinIconWrap}>
      <Ionicons name="pin" size={14} color={PURPLE} />
    </View>
    <View style={styles.content}>
      {senderName && <Text style={styles.sender}>{senderName}</Text>}
      <Text style={styles.text} numberOfLines={1}>{text}</Text>
    </View>
    <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
      <Ionicons name="close" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
    gap: 10,
  },
  pinIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  sender: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
  },
  closeBtn: {
    padding: 4,
  },
});

export default PinnedMessageBanner;
