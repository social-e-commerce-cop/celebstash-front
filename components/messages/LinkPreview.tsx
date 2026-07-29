import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinkPreviewData } from '@/types/chatTypes';

const { width } = Dimensions.get('window');

interface LinkPreviewProps {
  data: LinkPreviewData;
  isOutgoing?: boolean;
  onPress?: () => void;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ data, isOutgoing = false, onPress }) => (
  <TouchableOpacity style={[styles.card, isOutgoing && styles.cardOut]} onPress={onPress} activeOpacity={0.85}>
    {data.image && (
      <Image source={data.image} style={styles.image} />
    )}
    <View style={styles.info}>
      <Text style={[styles.domain, isOutgoing && styles.domainOut]}>{data.domain}</Text>
      <Text style={[styles.title, isOutgoing && styles.textLight]} numberOfLines={2}>{data.title}</Text>
      {data.description && (
        <Text style={[styles.desc, isOutgoing && styles.descOut]} numberOfLines={2}>{data.description}</Text>
      )}
    </View>
    <View style={[styles.urlRow, isOutgoing && styles.urlRowOut]}>
      <Ionicons name="link-outline" size={12} color={isOutgoing ? 'rgba(255,255,255,0.6)' : '#9CA3AF'} />
      <Text style={[styles.urlText, isOutgoing && styles.urlTextOut]} numberOfLines={1}>{data.url}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: width * 0.62,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardOut: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  info: {
    padding: 10,
  },
  domain: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  domainOut: { color: 'rgba(255,255,255,0.5)' },
  title: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    lineHeight: 18,
  },
  textLight: { color: '#fff' },
  desc: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
  },
  descOut: { color: 'rgba(255,255,255,0.7)' },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
  },
  urlRowOut: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  urlText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    flex: 1,
  },
  urlTextOut: { color: 'rgba(255,255,255,0.5)' },
});

export default LinkPreview;
