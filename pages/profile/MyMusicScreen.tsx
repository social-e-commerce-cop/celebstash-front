import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { musicService, MusicEntitlementItem } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';

const PURPLE = '#7126D0';

export default function MyMusicScreen() {
  const navigation = useNavigation<any>();
  const [entitlements, setEntitlements] = useState<MusicEntitlementItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyMusic();
  }, []);

  const loadMyMusic = async () => {
    setLoading(true);
    try {
      const data = await musicService.getMyMusic();
      setEntitlements(data);
    } catch (err: any) {
      console.warn('Failed to load My Music library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = async (item: MusicEntitlementItem) => {
    const trackId = item.track?.id || (item.release.tracks && item.release.tracks[0]?.id);
    if (!trackId) {
      Alert.alert('Unavailable', 'No playable track found in this release');
      return;
    }

    try {
      // Consume play count on server side
      const updatedAccess = await musicService.consumePlay(trackId);
      Alert.alert(
        'Streaming Unlocked Track',
        `Online stream started. ${updatedAccess.isPermanent ? 'Permanent Unlimited Access' : `Remaining Plays: ${updatedAccess.remainingPlays}`}`
      );
      loadMyMusic();
    } catch (err: any) {
      Alert.alert('Playback Error', err.message || 'Unable to stream audio');
    }
  };

  const renderItem = ({ item }: { item: MusicEntitlementItem }) => {
    const coverUrl = item.release?.coverArtUrl ? resolveImageUrl(item.release.coverArtUrl) : null;
    const title = item.track ? item.track.title : item.release?.title;
    const artistName = item.release?.artist?.username || item.release?.artist?.fullName || 'Artist';

    return (
      <View style={styles.card}>
        <Image
          source={coverUrl ? { uri: coverUrl } : require('@/assets/images/drop1.jpg')}
          style={styles.coverImg}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.artistText}>{artistName} • {item.release?.releaseType || 'RELEASE'}</Text>
          
          <View style={styles.accessBadge}>
            <Ionicons name="checkmark-circle" size={14} color={PURPLE} style={{ marginRight: 4 }} />
            <Text style={styles.accessBadgeText}>
              {item.isPermanent ? 'Permanent Stream' : `${item.playsRemaining} / ${item.playsGranted} Plays Left`}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.playBtn} onPress={() => handlePlayTrack(item)}>
          <Ionicons name="play" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Music Library</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadMyMusic}>
          <Ionicons name="refresh" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Streaming Only Notice */}
      <View style={styles.noticeBanner}>
        <Ionicons name="wifi-outline" size={16} color={PURPLE} style={{ marginRight: 6 }} />
        <Text style={styles.noticeText}>Online Streaming Only • No Downloads</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : entitlements.length > 0 ? (
        <FlatList
          data={entitlements}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="musical-notes-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Your Music Library is Empty</Text>
          <Text style={styles.emptySub}>Unlocked unreleased tracks and albums will appear here.</Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('MusicScreen')}
          >
            <Text style={styles.exploreBtnText}>Explore Unreleased Music</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0FD',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  noticeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginBottom: 12,
  },
  coverImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  artistText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginTop: 2,
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accessBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  exploreBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  exploreBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
