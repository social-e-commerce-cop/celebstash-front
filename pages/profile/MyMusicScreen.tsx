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
import { musicService, MusicReleaseItem } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';
import { playSong } from '@/lib/musicPlayerStore';
import { getSessionToken } from '@/lib/session';

const PURPLE = '#7126D0';

export default function MyMusicScreen() {
  const navigation = useNavigation<any>();
  const [releases, setReleases] = useState<MusicReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyMusic();
  }, []);

  const loadMyMusic = async () => {
    setLoading(true);
    try {
      const data = await musicService.getMyMusic();
      setReleases(data || []);
    } catch (err: any) {
      console.warn('Failed to load My Music library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayRelease = (rel: MusicReleaseItem) => {
    const track = rel.tracks && rel.tracks.length > 0 ? rel.tracks[0] : null;
    const token = getSessionToken();
    const coverUri = rel.coverArtUrl ? resolveImageUrl(rel.coverArtUrl) : null;
    const artistName = rel.artist?.artistName || rel.artist?.fullName || rel.artist?.username || 'Artist';

    if (track) {
      const streamUrl = `${musicService.getStreamUrl(track.id)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      playSong({
        id: String(track.id),
        title: track.title,
        artist: artistName,
        image: coverUri ? { uri: coverUri } : require('@/assets/images/drop1.jpg'),
        genre: rel.genre || 'Music',
        duration: `${Math.floor((track.durationSeconds || 180) / 60)}:${String((track.durationSeconds || 180) % 60).padStart(2, '0')}`,
        durationSeconds: track.durationSeconds || 180,
        audioUrl: streamUrl,
        isPermanent: true,
      });
      navigation.navigate('Library');
    } else {
      navigation.navigate('MusicDetail', { id: rel.id });
    }
  };

  const renderItem = ({ item }: { item: MusicReleaseItem }) => {
    const coverUrl = item.coverArtUrl ? resolveImageUrl(item.coverArtUrl) : null;
    const artistName = item.artist?.artistName || item.artist?.fullName || item.artist?.username || 'Artist';
    const trackCount = item.tracks?.length || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('MusicDetail', { id: item.id })}
      >
        <Image
          source={coverUrl ? { uri: coverUrl } : require('@/assets/images/drop1.jpg')}
          style={styles.coverImg}
        />
        <View style={styles.cardInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.artistText}>{artistName} • {item.releaseType || 'RELEASE'}</Text>

          <View style={styles.accessBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={[styles.accessBadgeText, { color: '#059669' }]}>
              Access Unlocked • {trackCount} {trackCount === 1 ? 'Track' : 'Tracks'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => handlePlayRelease(item)}
        >
          <Ionicons name="play" size={20} color="#FFF" />
        </TouchableOpacity>
      </TouchableOpacity>
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

      {/* Access Badge Notice */}
      <View style={styles.noticeBanner}>
        <Ionicons name="sparkles" size={16} color={PURPLE} style={{ marginRight: 6 }} />
        <Text style={styles.noticeText}>Direct-to-Fan Unlocked Music • Full Access</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : releases.length > 0 ? (
        <FlatList
          data={releases}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="musical-notes-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Your Music Library is Empty</Text>
          <Text style={styles.emptySub}>Releases you have unlocked directly from artists will appear here.</Text>
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
