import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { musicService, MusicReleaseItem, MusicTrackItem, AccessStatusResponse } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

export default function MusicDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const releaseId = route.params?.id || route.params?.releaseId;

  const [release, setRelease] = useState<MusicReleaseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrackItem | null>(null);
  const [selectedAccessType, setSelectedAccessType] = useState<'LIMITED_PLAYS' | 'PERMANENT_STREAMING'>('LIMITED_PLAYS');
  const [selectedPlayLimit, setSelectedPlayLimit] = useState<number>(10);
  const [purchasing, setPurchasing] = useState(false);
  const [accessStatus, setAccessStatus] = useState<Record<number, AccessStatusResponse>>({});

  useEffect(() => {
    loadReleaseDetail();
  }, [releaseId]);

  const loadReleaseDetail = async () => {
    if (!releaseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await musicService.getReleaseById(Number(releaseId));
      setRelease(data);
      if (data.tracks && data.tracks.length > 0) {
        setSelectedTrack(data.tracks[0]);
        // Check playback access status for tracks
        const statusMap: Record<number, AccessStatusResponse> = {};
        for (const t of data.tracks) {
          try {
            const st = await musicService.verifyAccess(t.id);
            statusMap[t.id] = st;
          } catch (e) {}
        }
        setAccessStatus(statusMap);
      }
    } catch (error: any) {
      console.warn('Failed to load release detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (isFullAlbum: boolean) => {
    if (!release) return;
    setPurchasing(true);
    try {
      const payload = {
        releaseId: release.id,
        trackId: isFullAlbum ? undefined : selectedTrack?.id,
        accessType: selectedAccessType,
        playLimit: selectedAccessType === 'LIMITED_PLAYS' ? selectedPlayLimit : undefined,
        amount: isFullAlbum ? release.albumPrice : (selectedTrack?.price || 1.99),
      };

      await musicService.purchaseAccess(payload);
      Alert.alert('Access Granted!', 'You have successfully unlocked streaming access for this release.', [
        { text: 'OK', onPress: () => loadReleaseDetail() },
      ]);
    } catch (err: any) {
      Alert.alert('Purchase Failed', err.message || 'Unable to process purchase');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Loading Release Details...</Text>
      </View>
    );
  }

  const coverImg = release?.coverArtUrl ? resolveImageUrl(release.coverArtUrl) : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {release?.title || 'Unreleased Track'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Artwork & Main Details */}
        <View style={styles.coverWrapper}>
          <Image
            source={coverImg ? { uri: coverImg } : require('@/assets/images/drop1.jpg')}
            style={styles.coverArt}
          />
          <View style={styles.unreleasedBadge}>
            <Ionicons name="flame" size={14} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.unreleasedBadgeText}>EXCLUSIVE UNRELEASED</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.releaseTitle}>{release?.title || 'Exclusive Track'}</Text>
          <View style={styles.artistRow}>
            <Text style={styles.artistName}>{release?.artist?.username || release?.artist?.fullName || 'Artist'}</Text>
            <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.metaSub}>
            {release?.releaseType || 'SINGLE'} • {release?.genre || 'Music'} • Online Streaming Only
          </Text>
        </View>

        {/* 6.5 Unreleased / Exclusive Banner */}
        <View style={{
          backgroundColor: '#FFF7ED',
          borderWidth: 1,
          borderColor: '#FFEDD5',
          borderRadius: 12,
          padding: 14,
          marginBottom: 14,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#C2410C' }}>
              {release?.availabilityStatus === 'EXCLUSIVE' ? '💎 EXCLUSIVE' : release?.availabilityStatus === 'PRE_RELEASE' ? '⏳ PRE-RELEASE' : release?.availabilityStatus === 'PUBLICLY_RELEASED' ? '🌐 PUBLIC RELEASE' : '🔥 UNRELEASED'}
            </Text>
          </View>
          <Text style={{ fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111827' }}>
            {release?.title || 'Unreleased Track'}
          </Text>
          <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#4B5563', marginTop: 2 }}>
            {release?.artist?.username || release?.artist?.fullName || 'Artist Name'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#FED7AA' }}>
            <Ionicons name="calendar-outline" size={14} color="#C2410C" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#C2410C' }}>
              Official release: {release?.publicReleaseDate ? new Date(release.publicReleaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'October 30, 2026'}
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9A3412', marginTop: 4 }}>
            Purchasing provides early stream access before the official public release.
          </Text>
        </View>

        {/* Protection Banner (No Downloads / Online Streaming Only) */}
        <View style={styles.streamingNoticeBanner}>
          <Ionicons name="shield-checkmark" size={18} color={PURPLE} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.streamingNoticeTitle}>Protected Online Streaming</Text>
            <Text style={styles.streamingNoticeSub}>
              Unreleased audio is protected. No downloads or offline files allowed.
            </Text>
          </View>
        </View>

        {/* Story Section */}
        {Boolean(release?.releaseStory || release?.description) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>About This Release</Text>
            <Text style={styles.sectionBody}>{release?.releaseStory || release?.description}</Text>
          </View>
        )}

        {/* Credits Section */}
        {Boolean(release?.credits) && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Credits & Attribution</Text>
            <Text style={styles.creditsText}>{release?.credits}</Text>
          </View>
        )}

        {/* Tracklist */}
        <View style={styles.tracklistSection}>
          <Text style={styles.sectionTitle}>Tracklist ({release?.tracks?.length || 0})</Text>
          {release?.tracks && release.tracks.length > 0 ? (
            release.tracks.map((tr, idx) => {
              const status = accessStatus[tr.id];
              const isSelected = selectedTrack?.id === tr.id;
              const hasAccess = status?.hasFullAccess;
              const remaining = status?.remainingPlays || 0;

              return (
                <TouchableOpacity
                  key={tr.id}
                  style={[styles.trackRow, isSelected && styles.trackRowSelected]}
                  onPress={() => setSelectedTrack(tr)}
                >
                  <Text style={styles.trackNum}>{idx + 1}.</Text>
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{tr.title}</Text>
                    <Text style={styles.trackPrice}>
                      ${tr.price?.toFixed(2) || '1.99'} • {hasAccess ? (status?.isPermanent ? 'Unlimited Plays' : `${remaining} Plays Left`) : '5s Free Preview'}
                    </Text>
                  </View>

                  {hasAccess ? (
                    <View style={styles.unlockedPill}>
                      <Ionicons name="play-circle" size={20} color={PURPLE} />
                      <Text style={styles.unlockedText}>{status?.isPermanent ? 'Unlocked' : `${remaining} plays`}</Text>
                    </View>
                  ) : (
                    <View style={styles.previewPill}>
                      <Ionicons name="play-outline" size={16} color="#6B7280" />
                      <Text style={styles.previewText}>5s Preview</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyTrackText}>No tracks uploaded for this release.</Text>
          )}
        </View>

        {/* Access Package Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Access Package</Text>
          <View style={styles.packageGrid}>
            <TouchableOpacity
              style={[styles.packageCard, selectedAccessType === 'LIMITED_PLAYS' && selectedPlayLimit === 5 && styles.packageCardActive]}
              onPress={() => { setSelectedAccessType('LIMITED_PLAYS'); setSelectedPlayLimit(5); }}
            >
              <Text style={styles.packageTitle}>5 Full Plays</Text>
              <Text style={styles.packageSub}>Streaming Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.packageCard, selectedAccessType === 'LIMITED_PLAYS' && selectedPlayLimit === 10 && styles.packageCardActive]}
              onPress={() => { setSelectedAccessType('LIMITED_PLAYS'); setSelectedPlayLimit(10); }}
            >
              <Text style={styles.packageTitle}>10 Full Plays</Text>
              <Text style={styles.packageSub}>Streaming Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.packageCard, selectedAccessType === 'LIMITED_PLAYS' && selectedPlayLimit === 20 && styles.packageCardActive]}
              onPress={() => { setSelectedAccessType('LIMITED_PLAYS'); setSelectedPlayLimit(20); }}
            >
              <Text style={styles.packageTitle}>20 Full Plays</Text>
              <Text style={styles.packageSub}>Streaming Only</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.packageCard, selectedAccessType === 'PERMANENT_STREAMING' && styles.packageCardActive]}
              onPress={() => { setSelectedAccessType('PERMANENT_STREAMING'); }}
            >
              <Text style={styles.packageTitle}>Permanent Unlock</Text>
              <Text style={styles.packageSub}>Unlimited Stream</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionContainer}>
          {selectedTrack && (
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={() => handlePurchase(false)}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buyBtnText}>
                  Unlock Track ({selectedTrack.title}) • ${selectedTrack.price?.toFixed(2) || '1.99'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {release?.releaseType === 'ALBUM' && (
            <TouchableOpacity
              style={[styles.buyBtn, styles.buyAlbumBtn]}
              onPress={() => handlePurchase(true)}
              disabled={purchasing}
            >
              <Text style={styles.buyBtnText}>
                Unlock Full Album • ${release.albumPrice?.toFixed(2) || '9.99'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
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
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  coverWrapper: {
    width: '100%',
    height: width * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    position: 'relative',
  },
  coverArt: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  unreleasedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#7126D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreleasedBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  titleSection: {
    marginTop: 16,
  },
  releaseTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  artistName: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  metaSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  streamingNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(113, 38, 208, 0.2)',
  },
  streamingNoticeTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  streamingNoticeSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  sectionCard: {
    marginTop: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    lineHeight: 20,
  },
  creditsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 18,
  },
  tracklistSection: {
    marginTop: 20,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackRowSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F5F0FD',
  },
  trackNum: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    marginRight: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  trackPrice: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  unlockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unlockedText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  emptyTrackText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  packageCard: {
    width: (width - 68) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  packageCardActive: {
    borderColor: PURPLE,
    backgroundColor: '#F5F0FD',
  },
  packageTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  packageSub: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  actionContainer: {
    marginTop: 24,
    gap: 10,
  },
  buyBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyAlbumBtn: {
    backgroundColor: '#111827',
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
