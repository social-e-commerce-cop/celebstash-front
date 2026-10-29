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
  Modal,
  TextInput,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { musicService, ArtistSongDetailsDto, ListeningActivityPoint, ArtistTrackStoryDto } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';
import { getSessionUser } from '@/lib/session';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';
const CARD_BG = '#FFFFFF';
const BORDER_COLOR = '#E5E7EB';

export default function ArtistSongDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const releaseId = Number(route.params?.id || route.params?.releaseId);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ArtistSongDetailsDto | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Timeframe selector for Listening Activity: 7 Days, 30 Days, All Time
  const [activeTimeframe, setActiveTimeframe] = useState<'7D' | '30D' | 'ALL'>('7D');

  // Archive Confirmation Modal
  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [archiving, setArchiving] = useState(false);

  // Edit Song Modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [releaseId]);

  const loadDetails = async () => {
    if (!releaseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setAccessDenied(false);

    try {
      const res = await musicService.getArtistSongDetails(releaseId);
      setData(res);
      // Initialize edit fields
      setEditTitle(res.title || '');
      setEditDescription(res.description || '');
      setEditGenre(res.genre || 'Afrobeats');
      setEditPrice(res.price !== undefined ? String(res.price) : '0');
    } catch (err: any) {
      console.warn('Artist song details error:', err);
      if (err?.status === 403 || err?.statusCode === 403 || err?.message?.toLowerCase().includes('access denied')) {
        setAccessDenied(true);
      } else {
        Alert.alert('Notice', err?.message || 'Unable to load artist song details.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDetails();
  };

  // Archive Song Action
  const handleArchiveConfirm = async () => {
    if (!releaseId) return;
    setArchiving(true);
    try {
      await musicService.archiveRelease(releaseId);
      setArchiveModalVisible(false);
      Alert.alert('Song Archived', 'This song has been archived and will no longer appear as an active/public release.');
      loadDetails();
    } catch (err: any) {
      Alert.alert('Archive Error', err?.message || 'Could not archive song.');
    } finally {
      setArchiving(false);
    }
  };

  // Unarchive Song Action
  const handleUnarchive = async () => {
    if (!releaseId) return;
    try {
      await musicService.unarchiveRelease(releaseId);
      Alert.alert('Song Published', 'This song is now publicly available again.');
      loadDetails();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not restore song.');
    }
  };

  // Save Edit Action
  const handleSaveEdit = async () => {
    if (!releaseId) return;
    if (!editTitle.trim()) {
      Alert.alert('Validation', 'Song title is required.');
      return;
    }

    setSavingEdit(true);
    try {
      const parsedPrice = parseFloat(editPrice) || 0;
      await musicService.updateRelease(releaseId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        genre: editGenre.trim(),
        albumPrice: parsedPrice,
      });

      setEditModalVisible(false);
      Alert.alert('Success', 'Song information updated successfully.');
      loadDetails();
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update song details.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Access Denied Screen
  if (accessDenied) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.accessDeniedCard}>
          <Ionicons name="lock-closed" size={48} color="#DC2626" />
          <Text style={styles.accessDeniedTitle}>Access denied</Text>
          <Text style={styles.accessDeniedSub}>
            Only the artist who owns this song can access this page.
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading Screen
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Loading song details...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.emptyText}>Song not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const coverUri = data.coverArtUrl ? resolveImageUrl(data.coverArtUrl) : null;
  const isArchived = data.status === 'ARCHIVED';
  const isDraft = data.status === 'DRAFT';

  // Compute Active Timeline Chart Data
  let activityPoints: ListeningActivityPoint[] = [];
  if (activeTimeframe === '7D') {
    activityPoints = data.activity7Days || [];
  } else if (activeTimeframe === '30D') {
    activityPoints = data.activity30Days || [];
  } else {
    activityPoints = data.activityAllTime || [];
  }

  // Check if timeline has any non-zero play data
  const totalPeriodPlays = activityPoints.reduce((sum, p) => sum + (p.count || 0), 0);
  const hasActivityData = totalPeriodPlays > 0;

  // Prepare chart dataset (limit to 6-7 labeled points for clean mobile rendering)
  let chartLabels: string[] = [];
  let chartValues: number[] = [];

  if (activityPoints.length > 0) {
    if (activeTimeframe === '30D') {
      // Sample evenly every 5 days for readable axis labels
      chartLabels = activityPoints.map((p, idx) => (idx % 5 === 0 || idx === activityPoints.length - 1 ? p.label : ''));
      chartValues = activityPoints.map((p) => Number(p.count || 0));
    } else {
      chartLabels = activityPoints.map((p) => p.label);
      chartValues = activityPoints.map((p) => Number(p.count || 0));
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navIconBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>SONG DETAILS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={PURPLE} />}
      >
        {/* ── 1. SONG HEADER ── */}
        <View style={styles.headerCard}>
          <Image
            source={coverUri ? { uri: coverUri } : require('@/assets/images/drop1.jpg')}
            style={styles.coverImage}
          />

          <View style={styles.headerInfo}>
            <Text style={styles.songTitle} numberOfLines={2}>
              {data.title}
            </Text>

            <View style={styles.artistRow}>
              <Text style={styles.artistName}>{data.artistName}</Text>
              <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={{ marginLeft: 4 }} />
            </View>

            {/* Status Badge & Metadata */}
            <View style={styles.statusMetaRow}>
              <View
                style={[
                  styles.statusBadge,
                  isArchived
                    ? styles.statusBadgeArchived
                    : isDraft
                    ? styles.statusBadgeDraft
                    : styles.statusBadgeAvailable,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    isArchived
                      ? { backgroundColor: '#D97706' }
                      : isDraft
                      ? { backgroundColor: PURPLE }
                      : { backgroundColor: '#10B981' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    isArchived
                      ? styles.statusTextArchived
                      : isDraft
                      ? styles.statusTextDraft
                      : styles.statusTextAvailable,
                  ]}
                >
                  Status: {isArchived ? 'Archived' : isDraft ? 'Draft' : 'Available'}
                </Text>
              </View>

              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaDuration}>{data.formattedDuration}</Text>

              {Boolean(data.releaseDate) && (
                <>
                  <Text style={styles.metaDivider}>•</Text>
                  <Text style={styles.metaDate}>{data.releaseDate}</Text>
                </>
              )}
            </View>

            {/* Action Buttons: View Public Page & Edit Song */}
            <View style={styles.headerActionRow}>
              <TouchableOpacity
                style={styles.viewPublicBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('MusicDetail', { id: data.id, releaseId: data.id })}
              >
                <Ionicons name="eye-outline" size={16} color={PURPLE} style={{ marginRight: 6 }} />
                <Text style={styles.viewPublicBtnText}>View Public Page</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSongBtn}
                activeOpacity={0.85}
                onPress={() => setEditModalVisible(true)}
              >
                <Ionicons name="create-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                <Text style={styles.editSongBtnText}>Edit Song</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── 2. PERFORMANCE (BASIC SONG STATISTICS) ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>PERFORMANCE</Text>

          <View style={styles.statsRow}>
            {/* Total Plays */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Plays</Text>
              <Text style={styles.statNumber}>
                {data.totalPlays.toLocaleString()}
              </Text>
              <Text style={styles.statSub}>Valid play events</Text>
            </View>

            {/* Unique Listeners */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Unique Listeners</Text>
              <Text style={styles.statNumber}>
                {data.uniqueListeners.toLocaleString()}
              </Text>
              <Text style={styles.statSub}>Distinct fans</Text>
            </View>

            {/* Replays */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Replays</Text>
              <Text style={styles.statNumber}>
                {data.replays.toLocaleString()}
              </Text>
              <Text style={styles.statSub}>Repeated streams</Text>
            </View>
          </View>
        </View>

        {/* ── 3. SIMPLE LISTENING ACTIVITY ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>LISTENING ACTIVITY</Text>

            {/* Timeframe Selectors */}
            <View style={styles.timeframePills}>
              {(['7D', '30D', 'ALL'] as const).map((t) => {
                const label = t === '7D' ? '7 Days' : t === '30D' ? '30 Days' : 'All Time';
                const isActive = activeTimeframe === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.timeframePill, isActive && styles.timeframePillActive]}
                    onPress={() => setActiveTimeframe(t)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeframeText, isActive && styles.timeframeTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.chartCard}>
            {hasActivityData && chartValues.length > 0 ? (
              <View style={{ alignItems: 'center' }}>
                <LineChart
                  data={{
                    labels: chartLabels,
                    datasets: [
                      {
                        data: chartValues,
                        color: (opacity = 1) => `rgba(113, 38, 208, ${opacity})`,
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={width - 48}
                  height={190}
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(113, 38, 208, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: PURPLE,
                      fill: '#FFFFFF',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '4',
                      stroke: '#F3F4F6',
                    },
                  }}
                  bezier
                  style={styles.chartStyle}
                />
              </View>
            ) : (
              <View style={styles.chartEmptyState}>
                <Ionicons name="bar-chart-outline" size={36} color="#9CA3AF" />
                <Text style={styles.chartEmptyTitle}>No listening activity yet</Text>
                <Text style={styles.chartEmptySub}>
                  Plays over time will be graphed here as fans stream this song.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 4. ACCESS / PURCHASES ── */}
        {data.isPaidRelease && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>ACCESS</Text>

            <View style={styles.accessGrid}>
              <View style={styles.accessCard}>
                <View style={styles.accessIconBox}>
                  <Ionicons name="key-outline" size={20} color={PURPLE} />
                </View>
                <View>
                  <Text style={styles.accessLabel}>Access Granted</Text>
                  <Text style={styles.accessValue}>{data.accessGranted.toLocaleString()}</Text>
                  <Text style={styles.accessSub}>Active fans holding access</Text>
                </View>
              </View>

              <View style={styles.accessCard}>
                <View style={[styles.accessIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="cart-outline" size={20} color="#059669" />
                </View>
                <View>
                  <Text style={styles.accessLabel}>Purchases</Text>
                  <Text style={styles.accessValue}>{data.purchases.toLocaleString()}</Text>
                  <Text style={styles.accessSub}>Direct paid transactions</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── 5. SONG INFORMATION ── */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeading}>SONG INFORMATION</Text>

          <View style={styles.infoTableCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Genre</Text>
              <Text style={styles.infoValue}>{data.genre}{data.subgenre ? ` (${data.subgenre})` : ''}</Text>
            </View>

            <View style={styles.infoRowDivider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Release Type</Text>
              <Text style={styles.infoValue}>{data.releaseType}</Text>
            </View>

            <View style={styles.infoRowDivider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Release Date</Text>
              <Text style={styles.infoValue}>{data.releaseDate || 'Not scheduled'}</Text>
            </View>

            <View style={styles.infoRowDivider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>
                {data.price && Number(data.price) > 0 ? `$${Number(data.price).toFixed(2)}` : 'Free'}
              </Text>
            </View>

            {data.releaseType !== 'SINGLE' && (
              <>
                <View style={styles.infoRowDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Number of Tracks</Text>
                  <Text style={styles.infoValue}>{data.trackCount} tracks</Text>
                </View>
              </>
            )}

            {Boolean(data.description) && (
              <>
                <View style={styles.infoRowDivider} />
                <View style={[styles.infoRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <Text style={[styles.infoLabel, { marginBottom: 6 }]}>Description</Text>
                  <Text style={styles.infoDescText}>{data.description}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── 6. STORIES ── */}
        {(Boolean(data.releaseStory) || (data.tracks && data.tracks.some(t => Boolean(t.trackStory)))) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>STORIES</Text>

            {/* Release Story */}
            {Boolean(data.releaseStory) && (
              <View style={styles.storyCard}>
                <View style={styles.storyCardHeader}>
                  <View style={styles.storyIconCircle}>
                    <Ionicons name="book-outline" size={16} color={PURPLE} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storyCardTitle}>Release Story</Text>
                    <Text style={styles.storyCardSub}>The artist's own words about this release</Text>
                  </View>
                </View>
                <Text style={styles.storyText}>{data.releaseStory}</Text>
              </View>
            )}

            {/* Track Stories */}
            {data.tracks && data.tracks.filter(t => Boolean(t.trackStory)).map((track, index) => (
              <View key={String(track.id)} style={[styles.storyCard, { marginTop: 12 }]}>
                <View style={styles.storyCardHeader}>
                  <View style={[styles.storyIconCircle, { backgroundColor: '#FFF7ED' }]}>
                    <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#EA580C' }}>
                      {String(track.trackNumber || (index + 1))}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.storyCardTitle}>{track.title}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
                      {Boolean(track.producer) && (
                        <View style={styles.storyMeta}><Text style={styles.storyMetaText}>Prod. {track.producer}</Text></View>
                      )}
                      {Boolean(track.featuredArtists) && (
                        <View style={styles.storyMeta}><Text style={styles.storyMetaText}>ft. {track.featuredArtists}</Text></View>
                      )}
                      {track.isBonusTrack && (
                        <View style={[styles.storyMeta, { backgroundColor: '#FEF3C7' }]}><Text style={[styles.storyMetaText, { color: '#92400E' }]}>Bonus</Text></View>
                      )}
                    </View>
                  </View>
                </View>
                <Text style={styles.storyText}>{track.trackStory}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── 7. DANGER ZONE (ARCHIVE SONG) ── */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeading, { color: '#DC2626' }]}>DANGER ZONE</Text>

          <View style={styles.dangerCard}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.dangerTitle}>
                {isArchived ? 'Song is Currently Archived' : 'Archive this song'}
              </Text>
              <Text style={styles.dangerDesc}>
                {isArchived
                  ? 'This song is hidden from public discovery. Historical purchases, access holders, and play statistics remain preserved.'
                  : 'Remove this song from public availability. Existing purchasers, transactions, and statistics will remain intact.'}
              </Text>
            </View>

            {isArchived ? (
              <TouchableOpacity
                style={styles.unarchiveBtn}
                onPress={handleUnarchive}
                activeOpacity={0.8}
              >
                <Text style={styles.unarchiveBtnText}>Restore</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.archiveBtn}
                onPress={() => setArchiveModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.archiveBtnText}>Archive Song</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── ARCHIVE CONFIRMATION MODAL ── */}
      <Modal
        visible={archiveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setArchiveModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.warningIconCircle}>
              <Ionicons name="alert" size={28} color="#DC2626" />
            </View>

            <Text style={styles.confirmTitle}>Archive this song?</Text>
            <Text style={styles.confirmMessage}>
              The song will no longer appear as an active/public release.
            </Text>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setArchiveModalVisible(false)}
                disabled={archiving}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmArchiveBtn}
                onPress={handleArchiveConfirm}
                disabled={archiving}
                activeOpacity={0.8}
              >
                {archiving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmArchiveText}>Archive Song</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── EDIT SONG MODAL ── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editSheet}>
            <View style={styles.editSheetHeader}>
              <Text style={styles.editSheetTitle}>Edit Song Information</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>Song Title *</Text>
              <TextInput
                style={styles.textInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Song title"
              />

              <Text style={styles.fieldLabel}>Genre</Text>
              <TextInput
                style={styles.textInput}
                value={editGenre}
                onChangeText={setEditGenre}
                placeholder="Genre (e.g. Afrobeats, R&B, Hip-Hop)"
              />

              <Text style={styles.fieldLabel}>Price ($ USD)</Text>
              <TextInput
                style={styles.textInput}
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Story or description behind this song..."
                multiline
              />
            </ScrollView>

            <View style={styles.editBtnRow}>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={savingEdit}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveEditBtn}
                onPress={handleSaveEdit}
                disabled={savingEdit}
                activeOpacity={0.85}
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveEditText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  emptyText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 48,
  },

  // Navigation Bar
  navBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginTop: Platform.OS === 'ios' ? 44 : 0,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    letterSpacing: 0.8,
  },

  // 1. Song Header
  headerCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  coverImage: {
    width: '100%',
    height: width * 0.65,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerInfo: {
    marginTop: 14,
  },
  songTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    lineHeight: 26,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  artistName: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  statusMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeAvailable: {
    backgroundColor: '#ECFDF5',
  },
  statusTextAvailable: {
    color: '#059669',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  statusBadgeArchived: {
    backgroundColor: '#FEF3C7',
  },
  statusTextArchived: {
    color: '#D97706',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  statusBadgeDraft: {
    backgroundColor: '#F3E8FF',
  },
  statusTextDraft: {
    color: PURPLE,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  statusBadgeText: {},
  metaDivider: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  metaDuration: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  metaDate: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  headerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  viewPublicBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  viewPublicBtnText: {
    color: PURPLE,
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  editSongBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editSongBtnText: {
    color: '#374151',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },

  // 2. Performance Section
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeading: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginVertical: 4,
  },
  statSub: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // 3. Listening Activity
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeframePills: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 2,
  },
  timeframePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeframePillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeframeText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  timeframeTextActive: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },
  chartCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
  chartStyle: {
    borderRadius: 12,
    paddingRight: 16,
  },
  chartEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  chartEmptyTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
    marginTop: 10,
  },
  chartEmptySub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },

  // 4. Access Grid
  accessGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  accessCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accessIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  accessValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginTop: 1,
  },
  accessSub: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },

  // 5. Song Information Table
  infoTableCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoRowDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  infoDescText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 19,
  },

  // 6. Danger Zone
  dangerCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dangerTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#991B1B',
  },
  dangerDesc: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#7F1D1D',
    marginTop: 4,
    lineHeight: 16,
  },
  archiveBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  archiveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  unarchiveBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unarchiveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  warningIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#4B5563',
  },
  confirmArchiveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmArchiveText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },

  // Edit Modal Sheet
  editSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  editSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  editSheetTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelEditBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelEditText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#4B5563',
  },
  saveEditBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
  },
  saveEditText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },

  // Access Denied Box
  accessDeniedCard: {
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#DC2626',
    marginTop: 16,
  },
  accessDeniedSub: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 18,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },

  // Stories Section
  storyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  storyCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  storyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  storyCardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  storyCardSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  storyText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  storyMeta: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  storyMetaText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
});
