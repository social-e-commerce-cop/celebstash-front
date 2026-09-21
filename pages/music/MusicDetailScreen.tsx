import React, { useState, useEffect, useRef } from 'react';
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
  Switch,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  musicService,
  MusicReleaseItem,
  MusicTrackItem,
  ReleaseDetailResponse,
  ReleaseBenefitItem,
  MusicExclusiveContentItem,
} from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';
import { useMusicPlayer, playSong, pauseSong, togglePlay } from '@/lib/musicPlayerStore';
import { addSongToLibrary, syncUnlockedLibrary } from '@/lib/libraryStore';
import { getSessionToken, getSessionUser } from '@/lib/session';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

export default function MusicDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const releaseId = Number(route.params?.id || route.params?.releaseId);

  const [detailData, setDetailData] = useState<ReleaseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TRACKS' | 'BENEFITS' | 'EXCLUSIVE'>('TRACKS');
  
  // Checkout Modal
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Waitlist
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Preview Player State
  const player = useMusicPlayer();
  const [previewTrack, setPreviewTrack] = useState<MusicTrackItem | null>(null);
  const [previewSecondsRemaining, setPreviewSecondsRemaining] = useState<number>(5);
  const previewTimerRef = useRef<any>(null);

  // Exclusive Content viewer
  const [selectedExclusiveItem, setSelectedExclusiveItem] = useState<MusicExclusiveContentItem | null>(null);

  useEffect(() => {
    loadReleaseDetail();
    return () => {
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
    };
  }, [releaseId]);

  const loadReleaseDetail = async () => {
    if (!releaseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await musicService.getReleaseDetail(releaseId);
      setDetailData(data);
    } catch (error: any) {
      console.warn('Failed to load release detail:', error);
      Alert.alert('Notice', error?.message || 'Unable to load release details.');
    } finally {
      setLoading(false);
    }
  };

  const release = detailData?.release;
  const benefits = detailData?.benefits || [];
  const enabledBenefits = benefits.filter(b => b.enabled);
  const hasAccess = detailData?.hasAccess || false;
  const canStreamFull = detailData?.canStreamFull || false;
  const canDownload = detailData?.canDownload || false;
  const hasCommunity = detailData?.hasCommunity || false;
  const hasExclusiveContent = detailData?.hasExclusiveContent || false;
  const isWaitlisted = detailData?.isWaitlisted || false;
  const waitlistCount = detailData?.waitlistCount || 0;

  // Handle Joining Waitlist
  const handleJoinWaitlist = async () => {
    if (!release) return;
    setWaitlistLoading(true);
    try {
      await musicService.joinWaitlist(release.id);
      Alert.alert('Waitlist Confirmed!', 'You have joined the waitlist for this release. You will be notified the instant access opens.');
      loadReleaseDetail();
    } catch (err: any) {
      Alert.alert('Waitlist', err?.message || 'Could not join waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  // Handle Playback: Full playback if authorized, 5s preview if not
  const handlePlayTrack = (track: MusicTrackItem) => {
    const token = getSessionToken();
    const isCurrentlyPlaying = player.currentSong?.id === String(track.id) && player.isPlaying;

    if (isCurrentlyPlaying) {
      togglePlay();
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
      return;
    }

    const coverImg = release?.coverArtUrl ? { uri: resolveImageUrl(release.coverArtUrl) } : require('@/assets/images/drop1.jpg');
    const streamUrl = `${musicService.getStreamUrl(track.id)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const releaseYear = release?.releaseDate
      ? new Date(release.releaseDate).getFullYear()
      : (release?.createdAt ? new Date(release.createdAt).getFullYear() : undefined);

    if (canStreamFull || hasAccess) {
      // Full playback without time limit
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
      playSong({
        id: String(track.id),
        title: track.title,
        artist: release?.artist?.artistName || release?.artist?.fullName || release?.artist?.username || 'Artist',
        image: coverImg,
        genre: release?.genre || 'Music',
        duration: `${Math.floor((track.durationSeconds || 180) / 60)}:${String((track.durationSeconds || 180) % 60).padStart(2, '0')}`,
        durationSeconds: track.durationSeconds || 180,
        audioUrl: streamUrl,
        isPermanent: true,
        year: releaseYear,
      });
      setPreviewTrack(null);
    } else {
      // 5-Second Preview Playback
      setPreviewTrack(track);
      setPreviewSecondsRemaining(5);

      playSong({
        id: String(track.id),
        title: `${track.title} (5s Preview)`,
        artist: release?.artist?.artistName || release?.artist?.fullName || release?.artist?.username || 'Artist',
        image: coverImg,
        genre: release?.genre || 'Music',
        duration: '0:05',
        durationSeconds: 5,
        audioUrl: streamUrl,
        isPermanent: false,
        year: releaseYear,
      });

      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
      let count = 5;
      previewTimerRef.current = setInterval(() => {
        count -= 1;
        setPreviewSecondsRemaining(Math.max(0, count));
        if (count <= 0) {
          clearInterval(previewTimerRef.current);
          pauseSong();
          Alert.alert(
            'Preview Ended',
            'You listened to the 5-second preview. Unlock full listening by getting Access.',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Get Access', onPress: () => setCheckoutVisible(true) },
            ]
          );
        }
      }, 1000);
    }
  };

  // Handle Purchasing Access
  const handleConfirmPurchase = async () => {
    if (!release) return;
    if (isGift && !giftRecipient.trim()) {
      Alert.alert('Recipient Required', 'Please enter the username of the recipient.');
      return;
    }

    setPurchasing(true);
    try {
      await musicService.purchaseReleaseAccess(release.id, {
        releaseId: release.id,
        pin: walletPin || undefined,
        isGift,
        giftRecipientUsername: isGift ? giftRecipient.trim() : undefined,
        giftMessage: isGift ? giftMessage.trim() : undefined,
        price: release.albumPrice,
      });

      setCheckoutVisible(false);
      setWalletPin('');
      setGiftRecipient('');
      setGiftMessage('');
      setIsGift(false);

      // Refresh unlocked library store
      await syncUnlockedLibrary();

      Alert.alert(
        'Access Unlocked!',
        isGift
          ? `You have gifted Access to @${giftRecipient.trim()}! A notification and access pass have been delivered.`
          : 'You now have full access to this release, including streaming, benefits, and unlocked media!',
        [{ text: 'Enjoy Music', onPress: () => loadReleaseDetail() }]
      );
    } catch (err: any) {
      Alert.alert('Purchase Error', err?.message || 'Transaction could not be completed.');
    } finally {
      setPurchasing(false);
    }
  };

  const getBenefitIcon = (type: string) => {
    switch (type) {
      case 'EARLY_ACCESS': return 'time-outline';
      case 'FULL_LISTENING': return 'headset-outline';
      case 'EXCLUSIVE_CONTENT': return 'sparkles-outline';
      case 'DOWNLOAD_ACCESS': return 'download-outline';
      case 'COMMUNITY_ACCESS': return 'chatbubbles-outline';
      case 'MERCH_ACCESS': return 'shirt-outline';
      case 'EVENT_ACCESS': return 'ticket-outline';
      case 'BONUS_TRACKS': return 'musical-notes-outline';
      default: return 'star-outline';
    }
  };

  const getBenefitLabel = (benefit: ReleaseBenefitItem) => {
    if (benefit.customName) return benefit.customName;
    switch (benefit.benefitType) {
      case 'EARLY_ACCESS': return 'Early Stream Access';
      case 'FULL_LISTENING': return 'Full Audio Streaming';
      case 'EXCLUSIVE_CONTENT': return 'Exclusive Media & BTS';
      case 'DOWNLOAD_ACCESS': return 'High-Quality Audio Downloads';
      case 'COMMUNITY_ACCESS': return 'Artist Fan Community';
      case 'MERCH_ACCESS': return 'Merch Discounts & Access';
      case 'EVENT_ACCESS': return 'Concert & Event Access';
      case 'BONUS_TRACKS': return 'Bonus Audio Tracks Included';
      default: return 'Special Fan Benefit';
    }
  };

  const getBenefitDescription = (benefit: ReleaseBenefitItem) => {
    if (benefit.customDescription) return benefit.customDescription;
    switch (benefit.benefitType) {
      case 'EARLY_ACCESS': return 'Listen to tracks before official public store release';
      case 'FULL_LISTENING': return 'Unlimited, full-length streaming for all tracks';
      case 'EXCLUSIVE_CONTENT': return 'Access behind-the-scenes videos, photos & commentary';
      case 'DOWNLOAD_ACCESS': return 'Download uncompressed audio tracks directly to device';
      case 'COMMUNITY_ACCESS': return 'Join private group chat channel with the artist';
      case 'MERCH_ACCESS': return 'Unlock access to artist merchandise and bundles';
      case 'EVENT_ACCESS': return 'Priority access and early-bird ticket booking';
      case 'BONUS_TRACKS': return 'Special unreleased bonus tracks attached to release';
      default: return 'Custom artist-curated fan benefit';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.loadingText}>Loading Release...</Text>
      </View>
    );
  }

  const coverImg = release?.coverArtUrl ? resolveImageUrl(release.coverArtUrl) : null;
  const artistName = release?.artist?.artistName || release?.artist?.fullName || release?.artist?.username || 'Artist';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {release?.title || 'Music Release'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cover Artwork & Badge */}
        <View style={styles.coverWrapper}>
          <Image
            source={coverImg ? { uri: coverImg } : require('@/assets/images/drop1.jpg')}
            style={styles.coverArt}
          />
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{release?.releaseType || 'SINGLE'}</Text>
            </View>
            {hasAccess ? (
              <View style={[styles.accessBadge, { backgroundColor: '#10B981' }]}>
                <Ionicons name="checkmark-circle" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.accessBadgeText}>ACCESS UNLOCKED</Text>
              </View>
            ) : (
              <View style={styles.accessBadge}>
                <Ionicons name="sparkles" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.accessBadgeText}>DIRECT TO FAN</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title, Artist, & Price Row */}
        <View style={styles.titleSection}>
          <Text style={styles.releaseTitle}>{release?.title || 'Untitled Release'}</Text>
          <View style={styles.artistRow}>
            <Text style={styles.artistName}>{artistName}</Text>
            <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={{ marginLeft: 4 }} />
          </View>
          <Text style={styles.metaSub}>
            {release?.genre || 'Music'} {release?.subgenre ? `• ${release.subgenre}` : ''} • {release?.tracks?.length || 0} Tracks
          </Text>

          {/* Pricing & CTA Card */}
          <View style={styles.pricingCard}>
            <View>
              <Text style={styles.priceLabel}>RELEASE ACCESS</Text>
              <Text style={styles.priceValue}>${release?.albumPrice?.toFixed(2) || '9.99'}</Text>
            </View>

            {hasAccess ? (
              <TouchableOpacity
                style={[styles.ctaButton, { backgroundColor: '#10B981' }]}
                onPress={() => {
                  if (release?.tracks && release.tracks.length > 0) {
                    handlePlayTrack(release.tracks[0]);
                  }
                }}
              >
                <Ionicons name="play" size={18} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.ctaButtonText}>PLAY FULL RELEASE</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => setCheckoutVisible(true)}
              >
                <Ionicons name="lock-open" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.ctaButtonText}>GET ACCESS</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 5-Second Preview Notice for Unauthorized Fans */}
        {!hasAccess && previewTrack && (
          <View style={styles.previewNoticeBanner}>
            <Ionicons name="headset" size={20} color={PURPLE} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewNoticeTitle}>Playing 5-Second Preview</Text>
              <Text style={styles.previewNoticeSub}>
                {previewTrack.title} • {previewSecondsRemaining}s left. Get Access to unlock full playback!
              </Text>
            </View>
          </View>
        )}

        {/* Tabs: Tracks / What You Get / Exclusive Content */}
        <View style={styles.tabNav}>
          <TouchableOpacity
            style={[styles.tabNavItem, activeTab === 'TRACKS' && styles.tabNavItemActive]}
            onPress={() => setActiveTab('TRACKS')}
          >
            <Text style={[styles.tabNavText, activeTab === 'TRACKS' && styles.tabNavTextActive]}>
              Tracks ({release?.tracks?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabNavItem, activeTab === 'BENEFITS' && styles.tabNavItemActive]}
            onPress={() => setActiveTab('BENEFITS')}
          >
            <Text style={[styles.tabNavText, activeTab === 'BENEFITS' && styles.tabNavTextActive]}>
              What You Get ({enabledBenefits.length})
            </Text>
          </TouchableOpacity>

          {hasExclusiveContent && (
            <TouchableOpacity
              style={[styles.tabNavItem, activeTab === 'EXCLUSIVE' && styles.tabNavItemActive]}
              onPress={() => setActiveTab('EXCLUSIVE')}
            >
              <Text style={[styles.tabNavText, activeTab === 'EXCLUSIVE' && styles.tabNavTextActive]}>
                Exclusive Media
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TAB 1: TRACKLIST */}
        {activeTab === 'TRACKS' && (
          <View style={styles.tabContent}>
            {release?.tracks && release.tracks.length > 0 ? (
              release.tracks.map((tr, idx) => {
                const isPlayingThis = player.currentSong?.id === String(tr.id) && player.isPlaying;

                return (
                  <View key={tr.id} style={styles.trackCard}>
                    <TouchableOpacity
                      style={styles.trackCardMain}
                      activeOpacity={0.75}
                      onPress={() => handlePlayTrack(tr)}
                    >
                      <View style={styles.trackNumberCol}>
                        {isPlayingThis ? (
                          <Ionicons name="volume-high" size={20} color={PURPLE} />
                        ) : (
                          <Text style={styles.trackNumberText}>{idx + 1}</Text>
                        )}
                      </View>

                      <View style={styles.trackDetailsCol}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.trackTitleText} numberOfLines={1}>
                            {tr.title}
                          </Text>
                          {tr.isExplicit && (
                            <View style={styles.explicitBadge}>
                              <Text style={styles.explicitBadgeText}>E</Text>
                            </View>
                          )}
                          {tr.isBonusTrack && (
                            <View style={styles.bonusBadge}>
                              <Text style={styles.bonusBadgeText}>BONUS</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.trackArtistSub}>
                          {tr.featuredArtists ? `feat. ${tr.featuredArtists}` : artistName}
                          {tr.durationSeconds ? ` • ${Math.floor(tr.durationSeconds / 60)}:${String(tr.durationSeconds % 60).padStart(2, '0')}` : ''}
                        </Text>
                      </View>

                      <View style={styles.trackActionCol}>
                        {hasAccess || canStreamFull ? (
                          <View style={styles.playIconBtn}>
                            <Ionicons name={isPlayingThis ? "pause" : "play"} size={16} color="#FFF" />
                          </View>
                        ) : (
                          <View style={styles.previewBtn}>
                            <Ionicons name={isPlayingThis ? "pause" : "play"} size={12} color={PURPLE} style={{ marginRight: 4 }} />
                            <Text style={styles.previewBtnText}>5s Preview</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Download Button if user has Access & release allows download */}
                    {canDownload && (
                      <TouchableOpacity
                        style={styles.downloadTrackBtn}
                        onPress={() => {
                          const token = getSessionToken();
                          const dlUrl = `${musicService.getDownloadUrl(tr.id)}?token=${encodeURIComponent(token || '')}`;
                          Alert.alert('Download Ready', `Download URL generated for ${tr.title}. Open in browser or device manager.`);
                        }}
                      >
                        <Ionicons name="download-outline" size={16} color={PURPLE} style={{ marginRight: 4 }} />
                        <Text style={styles.downloadTrackText}>Download High-Res</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="musical-notes-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyCardText}>No tracks uploaded for this release.</Text>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: DYNAMIC "WHAT YOU GET" CHECKLIST */}
        {activeTab === 'BENEFITS' && (
          <View style={styles.tabContent}>
            <View style={styles.benefitsHeaderCard}>
              <Text style={styles.benefitsHeaderTitle}>WHAT YOU GET WITH ACCESS</Text>
              <Text style={styles.benefitsHeaderSub}>
                This artist has tailored specific benefits exclusively for access holders of this release.
              </Text>
            </View>

            {enabledBenefits.length > 0 ? (
              enabledBenefits.map((benefit, index) => (
                <View key={benefit.id || index} style={styles.benefitCard}>
                  <View style={styles.benefitIconBox}>
                    <Ionicons name={getBenefitIcon(benefit.benefitType) as any} size={22} color={PURPLE} />
                  </View>
                  <View style={styles.benefitInfo}>
                    <Text style={styles.benefitTitle}>{getBenefitLabel(benefit)}</Text>
                    <Text style={styles.benefitDescription}>{getBenefitDescription(benefit)}</Text>
                  </View>
                  <View style={styles.benefitCheckmark}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Ionicons name="information-circle-outline" size={36} color="#9CA3AF" />
                <Text style={styles.emptyCardText}>Standard listening access included.</Text>
              </View>
            )}

            {/* Community Chat Teaser Card */}
            {hasCommunity && (
              <View style={styles.communityCard}>
                <Ionicons name="chatbubbles" size={24} color={PURPLE} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.communityTitle}>Artist Fan Community Included</Text>
                  <Text style={styles.communitySub}>
                    Access unlocks the private direct discussion channel with the artist.
                  </Text>
                </View>
                {hasAccess ? (
                  <TouchableOpacity
                    style={styles.communityJoinBtn}
                    onPress={() => navigation.navigate('ChatScreen', { conversationId: detailData?.communityConversationId })}
                  >
                    <Text style={styles.communityJoinBtnText}>Enter</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.communityLockPill}>
                    <Ionicons name="lock-closed" size={14} color="#6B7280" />
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* TAB 3: EXCLUSIVE CONTENT */}
        {activeTab === 'EXCLUSIVE' && (
          <View style={styles.tabContent}>
            {!hasAccess ? (
              <View style={styles.lockedExclusiveBox}>
                <View style={styles.lockCircle}>
                  <Ionicons name="lock-closed" size={32} color={PURPLE} />
                </View>
                <Text style={styles.lockedTitle}>Exclusive Media Locked</Text>
                <Text style={styles.lockedSub}>
                  Unlock Access to view behind-the-scenes studio sessions, private photo albums, interviews, and lyrics.
                </Text>
                <TouchableOpacity
                  style={styles.unlockExclusiveBtn}
                  onPress={() => setCheckoutVisible(true)}
                >
                  <Text style={styles.unlockExclusiveBtnText}>Get Access to Unlock</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {detailData?.exclusiveContents && detailData.exclusiveContents.length > 0 ? (
                  detailData.exclusiveContents.map((item: MusicExclusiveContentItem) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.exclusiveCard}
                      activeOpacity={0.88}
                      onPress={() => setSelectedExclusiveItem(item)}
                    >
                      <Image
                        source={item.thumbnailUrl ? { uri: resolveImageUrl(item.thumbnailUrl) } : require('@/assets/images/drop1.jpg')}
                        style={styles.exclusiveThumb}
                      />
                      <View style={styles.exclusiveCardInfo}>
                        <View style={styles.exclusiveTypeTag}>
                          <Text style={styles.exclusiveTypeTagText}>{item.contentType}</Text>
                        </View>
                        <Text style={styles.exclusiveTitleText}>{item.title}</Text>
                        {Boolean(item.description) && (
                          <Text style={styles.exclusiveDescText} numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="play-circle-outline" size={28} color={PURPLE} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyCardText}>No exclusive content uploaded yet.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Waitlist Section for Upcoming Releases */}
        {release?.availabilityStatus === 'PRE_RELEASE' && (
          <View style={styles.waitlistCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.waitlistTitle}>Upcoming Release Waitlist</Text>
              <Text style={styles.waitlistSub}>
                {waitlistCount > 0 ? `${waitlistCount} fans waiting` : 'Be first in line when release drops'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.waitlistBtn, isWaitlisted && styles.waitlistBtnDone]}
              onPress={handleJoinWaitlist}
              disabled={waitlistLoading || isWaitlisted}
            >
              {waitlistLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.waitlistBtnText}>
                  {isWaitlisted ? '✓ Joined' : 'Join Waitlist'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Story & Credits */}
        {Boolean(release?.releaseStory || release?.description) && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>About This Release</Text>
            <Text style={styles.infoCardBody}>{release?.releaseStory || release?.description}</Text>
          </View>
        )}

        {Boolean(release?.credits) && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Credits & Attribution</Text>
            <Text style={styles.infoCardBody}>{release?.credits}</Text>
          </View>
        )}
      </ScrollView>

      {/* CHECKOUT & GET ACCESS MODAL */}
      <Modal
        visible={checkoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckoutVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Get Release Access</Text>
              <TouchableOpacity onPress={() => setCheckoutVisible(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Summary */}
              <View style={styles.modalReleaseRow}>
                <Image
                  source={coverImg ? { uri: coverImg } : require('@/assets/images/drop1.jpg')}
                  style={styles.modalThumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalReleaseTitle} numberOfLines={1}>{release?.title}</Text>
                  <Text style={styles.modalArtistName}>{artistName}</Text>
                  <Text style={styles.modalPriceText}>${release?.albumPrice?.toFixed(2) || '9.99'}</Text>
                </View>
              </View>

              {/* What's Included Preview */}
              <View style={styles.modalBenefitsBox}>
                <Text style={styles.modalBenefitsTitle}>INCLUDED BENEFITS:</Text>
                {enabledBenefits.map((b, i) => (
                  <View key={i} style={styles.modalBenefitRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 6 }} />
                    <Text style={styles.modalBenefitText}>{getBenefitLabel(b)}</Text>
                  </View>
                ))}
              </View>

              {/* Gift Toggle */}
              <View style={styles.giftToggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.giftToggleLabel}>Give as a Gift</Text>
                  <Text style={styles.giftToggleSub}>Send access directly to another fan's library</Text>
                </View>
                <Switch
                  value={isGift}
                  onValueChange={setIsGift}
                  trackColor={{ false: '#D1D5DB', true: PURPLE }}
                  thumbColor="#FFF"
                />
              </View>

              {isGift && (
                <View style={styles.giftInputsBox}>
                  <Text style={styles.inputLabel}>Recipient Username *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter recipient's username"
                    value={giftRecipient}
                    onChangeText={setGiftRecipient}
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>Gift Message (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, { height: 60 }]}
                    placeholder="Add a personal note to the recipient..."
                    value={giftMessage}
                    onChangeText={setGiftMessage}
                    multiline
                  />
                </View>
              )}

              {/* Wallet PIN */}
              <Text style={styles.inputLabel}>Wallet Security PIN (Optional if not set)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="4-digit PIN"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={walletPin}
                onChangeText={setWalletPin}
              />

              {/* Pay Button */}
              <TouchableOpacity
                style={styles.confirmPayBtn}
                onPress={handleConfirmPurchase}
                disabled={purchasing}
              >
                {purchasing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmPayBtnText}>
                    {isGift ? 'Gift Access' : 'Confirm & Unlock Access'} • ${release?.albumPrice?.toFixed(2) || '9.99'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFFFFF',
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
    paddingBottom: 40,
  },
  coverWrapper: {
    width: width,
    height: width * 0.9,
    position: 'relative',
    backgroundColor: '#111',
  },
  coverArt: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  accessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  accessBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  pricingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  previewNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  previewNoticeTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  previewNoticeSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    marginTop: 2,
  },
  tabNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 14,
    paddingHorizontal: 20,
  },
  tabNavItem: {
    paddingVertical: 12,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabNavItemActive: {
    borderBottomColor: PURPLE,
  },
  tabNavText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  tabNavTextActive: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },
  tabContent: {
    padding: 20,
  },
  trackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
    padding: 12,
  },
  trackCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumberCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackNumberText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
  },
  trackDetailsCol: {
    flex: 1,
    marginLeft: 8,
  },
  trackTitleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  explicitBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  explicitBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  bonusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  bonusBadgeText: {
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
    color: '#D97706',
  },
  trackArtistSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  trackActionCol: {
    marginLeft: 8,
  },
  playIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  previewBtnText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  downloadTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  downloadTrackText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
  benefitsHeaderCard: {
    backgroundColor: '#FAF5FF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  benefitsHeaderTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    letterSpacing: 0.5,
  },
  benefitsHeaderSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    marginTop: 4,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  benefitIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitInfo: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  benefitDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  benefitCheckmark: {
    marginLeft: 8,
  },
  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginTop: 10,
  },
  communityTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  communitySub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  communityJoinBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  communityJoinBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  communityLockPill: {
    padding: 6,
  },
  lockedExclusiveBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  lockedTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  lockedSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  unlockExclusiveBtn: {
    marginTop: 16,
    backgroundColor: PURPLE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  unlockExclusiveBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  exclusiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    marginBottom: 10,
  },
  exclusiveThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  exclusiveCardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  exclusiveTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  exclusiveTypeTagText: {
    color: PURPLE,
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
  },
  exclusiveTitleText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  exclusiveDescText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  waitlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  waitlistTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#C2410C',
  },
  waitlistSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9A3412',
    marginTop: 2,
  },
  waitlistBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  waitlistBtnDone: {
    backgroundColor: '#10B981',
  },
  waitlistBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoCardTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 6,
  },
  infoCardBody: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyCardText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
    marginTop: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalReleaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  modalThumb: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  modalReleaseTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalArtistName: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  modalPriceText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    marginTop: 2,
  },
  modalBenefitsBox: {
    backgroundColor: '#FAF5FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  modalBenefitsTitle: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalBenefitText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  giftToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  giftToggleLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  giftToggleSub: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  giftInputsBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  confirmPayBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  confirmPayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
});
