import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { musicService, MusicReleaseItem } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

const FILTERS = ['All', 'Single', 'EP', 'Album'];

export default function AllReleasesScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [releases, setReleases] = useState<MusicReleaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReleases();
  }, []);

  const loadReleases = async () => {
    try {
      setLoading(true);
      const data = await musicService.getReleases();
      setReleases(data);
    } catch (err) {
      console.warn('Failed to load releases:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReleases();
  };

  const filteredReleases = releases.filter((r) => {
    if (selectedFilter === 'All') return true;
    const type = r.releaseType?.toUpperCase();
    return type === selectedFilter.toUpperCase();
  });

  const featuredRelease = releases.length > 0 ? releases[0] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Music Releases</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {FILTERS.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>{filter}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Loading releases...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />}
        >
          {/* Featured Hero Banner */}
          {featuredRelease && selectedFilter === 'All' && (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.featuredCard}
              onPress={() => navigation.navigate('MusicDetail', { id: featuredRelease.id })}
            >
              <ImageBackground
                source={
                  featuredRelease.coverArtUrl
                    ? { uri: resolveImageUrl(featuredRelease.coverArtUrl) }
                    : require('@/assets/images/drop1.jpg')
                }
                style={styles.featuredBg}
                imageStyle={styles.featuredImageStyle}
              >
                <View style={styles.featuredOverlay}>
                  <View style={styles.featuredBadgeRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{featuredRelease.releaseType || 'RELEASE'}</Text>
                    </View>
                    <View style={styles.exclusiveBadge}>
                      <Ionicons name="sparkles" size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.exclusiveBadgeText}>DIRECT TO FAN</Text>
                    </View>
                  </View>

                  <View style={styles.featuredBottom}>
                    <Text style={styles.featuredTitle} numberOfLines={2}>
                      {featuredRelease.title}
                    </Text>
                    <View style={styles.featuredArtistRow}>
                      <Text style={styles.featuredArtistText}>
                        {featuredRelease.artist?.artistName ||
                          featuredRelease.artist?.fullName ||
                          featuredRelease.artist?.username ||
                          'Artist'}
                        {featuredRelease.releaseDate
                          ? ` • ${new Date(featuredRelease.releaseDate).getFullYear()}`
                          : (featuredRelease.createdAt ? ` • ${new Date(featuredRelease.createdAt).getFullYear()}` : '')}
                      </Text>
                      <Ionicons name="checkmark-circle" size={16} color="#A78BFA" style={{ marginLeft: 4 }} />
                    </View>

                    <View style={styles.featuredCtaRow}>
                      <Text style={styles.featuredPriceText}>
                        ${featuredRelease.albumPrice?.toFixed(2) || '9.99'}
                      </Text>
                      <View style={styles.featuredPlayBtn}>
                        <Ionicons name="play" size={16} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.featuredPlayBtnText}>GET ACCESS</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}

          {/* Releases Grid / List */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === 'All' ? 'Latest Releases' : `${selectedFilter} Releases`} ({filteredReleases.length})
            </Text>
          </View>

          {filteredReleases.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Releases Found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedFilter === 'All'
                  ? 'No music releases have been uploaded yet.'
                  : `No ${selectedFilter.toLowerCase()} releases found.`}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredReleases.map((item) => {
                const coverUri = item.coverArtUrl ? resolveImageUrl(item.coverArtUrl) : null;
                const artistName =
                  item.artist?.artistName ||
                  item.artist?.fullName ||
                  item.artist?.username ||
                  'Artist';
                const releaseYear = item.releaseDate
                  ? new Date(item.releaseDate).getFullYear()
                  : (item.createdAt ? new Date(item.createdAt).getFullYear() : null);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    activeOpacity={0.88}
                    onPress={() => navigation.navigate('MusicDetail', { id: item.id })}
                  >
                    <View style={styles.cardImageWrapper}>
                      <Image
                        source={coverUri ? { uri: coverUri } : require('@/assets/images/drop1.jpg')}
                        style={styles.cardImage}
                      />
                      <View style={styles.cardTypeTag}>
                        <Text style={styles.cardTypeTagText}>{item.releaseType || 'SINGLE'}</Text>
                      </View>
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.cardArtistRow}>
                        <Text style={styles.cardArtist} numberOfLines={1}>
                          {artistName}{releaseYear ? ` • ${releaseYear}` : ''}
                        </Text>
                        <Ionicons name="checkmark-circle" size={13} color={PURPLE} style={{ marginLeft: 3 }} />
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={styles.cardPrice}>
                          ${item.albumPrice?.toFixed(2) || '9.99'}
                        </Text>
                        <View style={styles.cardAccessPill}>
                          <Text style={styles.cardAccessPillText}>
                            {item.tracks?.length || 1} {item.tracks?.length === 1 ? 'Track' : 'Tracks'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: PURPLE,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  featuredCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#111827',
  },
  featuredBg: {
    flex: 1,
  },
  featuredImageStyle: {
    borderRadius: 20,
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  exclusiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exclusiveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  featuredBottom: {
    gap: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  featuredArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredArtistText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#E5E7EB',
  },
  featuredCtaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  featuredPriceText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  featuredPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  featuredPlayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardTypeTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardTypeTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  cardInfo: {
    padding: 10,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  cardArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardArtist: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    flexShrink: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  cardAccessPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardAccessPillText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
