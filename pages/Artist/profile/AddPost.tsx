import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StatusBar,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { createAudioPlayer } from 'expo-audio';
import { createArtistPost, uploadMediaFile } from '@/lib/postService';
import { productsService, ProductItem } from '@/lib/productsService';
import { getSessionUser } from '@/lib/session';
import { musicService } from '@/lib/musicService';
import { resolveImageUrl } from '@/lib/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PURPLE = '#7126D0';
const WHITE_BG = '#FFFFFF';

export interface SelectedMediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name?: string;
}

export interface RoyaltyFreeTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration: string;
  audioUrl: string;
}

export const CreatePostScreen = ({ navigation }: any) => {
  const sessionUser = getSessionUser();

  // Multi-step Flow State: 1 = Picker Grid, 2 = Carousel Review, 3 = Caption & Tagging
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Direct Device Assets State
  const [deviceAssets, setDeviceAssets] = useState<{ id: string; uri: string; type: 'image' | 'video' }[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  // Selected Media State
  const [mediaList, setMediaList] = useState<SelectedMediaItem[]>([]);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(true);

  // Caption State
  const [caption, setCaption] = useState('');

  // Music Attachment State
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<RoyaltyFreeTrack | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicSearchQuery, setMusicSearchQuery] = useState('');
  const audioPlayerRef = useRef<any>(null);

  // Product Attachment State
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [storeProducts, setStoreProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Uploading / Publishing State
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');

  // Automatically load device gallery photos into grid on screen mount
  useEffect(() => {
    loadDevicePhotos();
  }, []);

  const loadDevicePhotos = async () => {
    setLoadingAssets(true);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(false);
      if (permission.granted) {
        const media = await MediaLibrary.getAssetsAsync({
          first: 60,
          mediaType: ['photo', 'video'],
          sortBy: [MediaLibrary.SortBy.creationTime],
        });

        if (media && media.assets && media.assets.length > 0) {
          const mapped = media.assets.map((asset) => ({
            id: asset.id,
            uri: asset.uri,
            type: (asset.mediaType === 'video' ? 'video' : 'image') as 'image' | 'video',
          }));
          setDeviceAssets(mapped);

          // Auto-select the first photo into the top preview area
          const first = mapped[0];
          setMediaList([{ id: first.id, uri: first.uri, type: first.type }]);
          setActiveMediaIndex(0);
          setLoadingAssets(false);
          return;
        }
      }
    } catch (err) {
      console.log('MediaLibrary load note:', err);
    }

    // Fallback for Expo Go: Automatically launch device's real image picker to select actual user photos
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const items: SelectedMediaItem[] = result.assets.map((asset, idx) => ({
          id: `device_${Date.now()}_${idx}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          name: asset.fileName || `photo_${idx}`,
        }));

        setDeviceAssets(items);
        setMediaList(items);
        setActiveMediaIndex(0);
      }
    } catch (e) {
      console.log('ImagePicker launch note:', e);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
        } catch (_) {}
      }
    };
  }, []);

  // Fetch store products from backend
  useEffect(() => {
    if (productModalVisible && storeProducts.length === 0) {
      setLoadingProducts(true);
      productsService
        .getAllProducts()
        .then((items) => {
          if (Array.isArray(items)) {
            setStoreProducts(items);
          }
        })
        .catch((err) => {
          console.warn('Failed to load products for post attachment:', err);
        })
        .finally(() => setLoadingProducts(false));
    }
  }, [productModalVisible]);

  // Fetch real music releases from backend
  const [realMusicTracks, setRealMusicTracks] = useState<RoyaltyFreeTrack[]>([]);
  useEffect(() => {
    if (musicModalVisible && realMusicTracks.length === 0) {
      const user = getSessionUser();
      const currentUserId = user?.id;
      const currentUsername = (user?.username || '').toLowerCase();

      musicService
        .getReleases()
        .then((releases) => {
          if (Array.isArray(releases) && releases.length > 0) {
            const artistReleases = releases.filter((r) => {
              if (!r.artist) return false;
              if (currentUserId && r.artist.id === currentUserId) return true;
              if (currentUsername && r.artist.username && r.artist.username.toLowerCase() === currentUsername) return true;
              return false;
            });

            const mapped: RoyaltyFreeTrack[] = artistReleases.map((rel) => ({
              id: `real_release_${rel.id}`,
              title: rel.title,
              artist: rel.artist?.username || rel.artist?.fullName || 'Artist',
              coverUrl: rel.coverArtUrl ? resolveImageUrl(rel.coverArtUrl) : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
              duration: `${rel.tracks?.length || 1} tracks`,
              audioUrl: rel.tracks && rel.tracks.length > 0 ? musicService.getStreamUrl(rel.tracks[0].id) : '',
            }));
            setRealMusicTracks(mapped);
          }
        })
        .catch((err) => {
          console.warn('Failed to load backend music releases:', err);
        });
    }
  }, [musicModalVisible]);

  // Handle toggling device photo selection from grid directly
  const handleToggleAsset = (asset: { id: string; uri: string; type: 'image' | 'video' }) => {
    const existingIndex = mediaList.findIndex((m) => m.id === asset.id);

    if (existingIndex >= 0) {
      if (mediaList.length > 1) {
        setMediaList((prev) => prev.filter((m) => m.id !== asset.id));
        setActiveMediaIndex(0);
      }
    } else {
      const newItem: SelectedMediaItem = {
        id: asset.id,
        uri: asset.uri,
        type: asset.type,
      };

      if (isMultiSelect) {
        setMediaList((prev) => [...prev, newItem]);
        setActiveMediaIndex(mediaList.length);
      } else {
        setMediaList([newItem]);
        setActiveMediaIndex(0);
      }
    }
  };

  // Media capture using Live Camera
  const handleCaptureCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Camera permission is required to capture photos and videos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const captured = result.assets[0];
        const newItem: SelectedMediaItem = {
          id: `cam_${Date.now()}`,
          uri: captured.uri,
          type: captured.type === 'video' ? 'video' : 'image',
          name: captured.fileName || 'camera_capture',
        };

        setDeviceAssets((prev) => [newItem, ...prev]);
        setMediaList((prev) => {
          const updated = [...prev, newItem];
          setActiveMediaIndex(updated.length - 1);
          return updated;
        });
      }
    } catch (err) {
      console.error('Camera capture error:', err);
    }
  };

  // System image picker launcher
  const handleLaunchSystemPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: isMultiSelect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: SelectedMediaItem[] = result.assets.map((asset, idx) => ({
          id: `sys_${Date.now()}_${idx}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          name: asset.fileName || `media_${idx}`,
        }));

        setDeviceAssets((prev) => [...newItems, ...prev]);
        setMediaList((prev) => [...prev, ...newItems]);
        if (mediaList.length === 0) {
          setActiveMediaIndex(0);
        }
      }
    } catch (err) {
      console.error('System picker error:', err);
    }
  };

  // Remove single media item
  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (activeMediaIndex >= filtered.length) {
        setActiveMediaIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Toggle Audio Preview Playback
  const handleToggleMusicPreview = (track: RoyaltyFreeTrack) => {
    if (selectedMusic?.id === track.id && isPlayingMusic) {
      if (audioPlayerRef.current) {
        try {
          audioPlayerRef.current.pause();
        } catch (_) {}
      }
      setIsPlayingMusic(false);
    } else {
      setSelectedMusic(track);
      setIsPlayingMusic(true);
      try {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.replace(track.audioUrl);
          audioPlayerRef.current.play();
        } else {
          const player = createAudioPlayer(track.audioUrl);
          audioPlayerRef.current = player;
          player.play();
        }
      } catch (e) {
        console.log('Audio playback preview note:', e);
      }
    }
  };

  // Final Share / Publish Post
  const handlePublishPost = async () => {
    if (mediaList.length === 0 && !caption.trim()) {
      Alert.alert('Empty Post', 'Please select photos/videos or write a caption.');
      return;
    }

    setSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];
      let uploadedVideoUrl: string | undefined = undefined;

      for (let i = 0; i < mediaList.length; i++) {
        const item = mediaList[i];
        setUploadStatusText(`Uploading media ${i + 1} of ${mediaList.length}...`);

        if (item.uri.startsWith('http')) {
          if (item.type === 'video') {
            if (!uploadedVideoUrl) uploadedVideoUrl = item.uri;
          } else {
            uploadedImageUrls.push(item.uri);
          }
        } else {
          const isVid = item.type === 'video';
          const ext = isVid ? 'mp4' : 'jpg';
          const uploadedUrl = await uploadMediaFile(
            item.uri,
            `post_media_${Date.now()}_${i}.${ext}`,
            isVid ? 'video/mp4' : 'image/jpeg'
          );

          if (isVid) {
            if (!uploadedVideoUrl) uploadedVideoUrl = uploadedUrl;
          } else {
            uploadedImageUrls.push(uploadedUrl);
          }
        }
      }

      setUploadStatusText('Publishing post to your feed...');

      let attachedType = 'none';
      let attachedTitle: string | undefined = undefined;
      let attachedSubtitle: string | undefined = undefined;
      let attachedPrice: string | undefined = undefined;
      let productId: number | undefined = undefined;

      if (selectedProduct) {
        attachedType = 'product';
        attachedTitle = selectedProduct.name;
        attachedSubtitle = selectedProduct.description || 'Stash Creator Merch';
        attachedPrice = `$${selectedProduct.price}`;
        productId = selectedProduct.id;
      } else if (selectedMusic) {
        attachedType = 'song';
        attachedTitle = selectedMusic.title;
        attachedSubtitle = selectedMusic.artist;
        attachedPrice = 'Royalty-Free Track';
      }

      await createArtistPost({
        description: caption.trim(),
        imageUrls: uploadedImageUrls,
        videoUrl: uploadedVideoUrl,
        productId,
        attachedType,
        attachedTitle,
        attachedSubtitle,
        attachedPrice,
      });

      Alert.alert('Success', 'Your post has been published live.');
      navigation.goBack();
    } catch (err: any) {
      console.error('Failed to publish post:', err);
      Alert.alert('Error Publishing Post', err.message || 'Failed to publish post. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadStatusText('');
    }
  };

  const filteredTracks = realMusicTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(musicSearchQuery.toLowerCase())
  );

  const filteredProducts = storeProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // ── STEP 1: INSTANT AUTOMATIC MEDIA DISPLAY GRID (WHITE THEME) ──
  const renderStep1 = () => {
    const currentMedia = mediaList[activeMediaIndex] || mediaList[0];

    return (
      <View style={styles.stepContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>New post</Text>
          <TouchableOpacity
            style={[styles.nextHeaderBtn, mediaList.length === 0 && styles.nextBtnDisabled]}
            disabled={mediaList.length === 0}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextHeaderBtnText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Large Top Media Preview Box */}
        <View style={styles.topPreviewArea}>
          {currentMedia ? (
            currentMedia.type === 'video' ? (
              <View style={styles.videoPreviewBox}>
                <Ionicons name="videocam" size={48} color={PURPLE} />
                <Text style={styles.videoPreviewText}>Video Selected</Text>
              </View>
            ) : (
              <Image source={{ uri: currentMedia.uri }} style={styles.largePreviewImage} />
            )
          ) : (
            <View style={styles.emptyPreviewBox}>
              <ActivityIndicator size="small" color={PURPLE} />
            </View>
          )}

          {/* Aspect Ratio Expand Button */}
          <View style={styles.expandIconBox}>
            <Ionicons name="expand-outline" size={18} color="#FFF" />
          </View>
        </View>

        {/* Recents Bar & Select Multiple Toggle */}
        <View style={styles.recentsBar}>
          <View style={styles.recentsDropdown}>
            <Text style={styles.recentsText}>Recents</Text>
            <Ionicons name="chevron-down" size={16} color="#111827" />
          </View>

          <TouchableOpacity
            style={[styles.multiSelectBtn, isMultiSelect && styles.multiSelectBtnActive]}
            onPress={() => setIsMultiSelect(!isMultiSelect)}
          >
            <Ionicons name="layers-outline" size={15} color={isMultiSelect ? '#FFF' : '#374151'} />
            <Text style={[styles.multiSelectText, isMultiSelect && styles.multiSelectTextActive]}>
              Select Multiple
            </Text>
          </TouchableOpacity>
        </View>

        {/* Media Grid */}
        <ScrollView style={styles.gridScrollView}>
          <View style={styles.mediaGridContainer}>
            {/* Camera Icon Tile with Dark Slate Icon / Light Slate Tile */}
            <TouchableOpacity style={styles.cameraTile} onPress={handleCaptureCamera}>
              <Ionicons name="camera" size={32} color="#111827" />
            </TouchableOpacity>

            {/* Direct Device Gallery Photos Rendered Automatically */}
            {deviceAssets.map((asset) => {
              const selectedIndex = mediaList.findIndex((m) => m.id === asset.id);
              const isSelected = selectedIndex >= 0;

              return (
                <TouchableOpacity
                  key={asset.id}
                  style={[styles.gridTile, isSelected && styles.gridTileSelected]}
                  onPress={() => handleToggleAsset(asset)}
                >
                  <Image source={{ uri: asset.uri }} style={styles.gridTileImg} />
                  {isSelected && (
                    <View style={styles.gridTileIndexBadge}>
                      <Text style={styles.gridTileIndexText}>{selectedIndex + 1}</Text>
                    </View>
                  )}
                  {asset.type === 'video' && (
                    <View style={styles.videoBadge}>
                      <Ionicons name="videocam" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {loadingAssets && (
            <ActivityIndicator size="small" color={PURPLE} style={{ marginVertical: 30 }} />
          )}
        </ScrollView>
      </View>
    );
  };

  // ── STEP 2: CAROUSEL REVIEW & EDIT (WHITE THEME) ──
  const renderStep2 = () => {
    return (
      <View style={styles.stepContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Suggested Audio Pill */}
          {selectedMusic ? (
            <View style={styles.headerAudioPill}>
              <Ionicons name="musical-notes" size={14} color={PURPLE} />
              <Text style={styles.headerAudioText} numberOfLines={1}>
                {selectedMusic.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedMusic(null)}>
                <Ionicons name="close" size={14} color="#111827" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.headerAudioPill}
              onPress={() => setMusicModalVisible(true)}
            >
              <Ionicons name="musical-notes-outline" size={14} color={PURPLE} />
              <Text style={styles.headerAudioText}>Add Audio</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.nextHeaderBtn} onPress={() => setStep(3)}>
            <Text style={styles.nextHeaderBtnText}>Next</Text>
          </TouchableOpacity>
        </View>

        {/* Swipeable Carousel Preview */}
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const contentOffset = e.nativeEvent.contentOffset.x;
              const currentIndex = Math.round(contentOffset / SCREEN_WIDTH);
              if (currentIndex !== activeMediaIndex) {
                setActiveMediaIndex(currentIndex);
              }
            }}
            scrollEventThrottle={16}
          >
            {mediaList.map((item) => (
              <View key={item.id} style={styles.carouselSlide}>
                {item.type === 'video' ? (
                  <View style={styles.videoPreviewBox}>
                    <Ionicons name="videocam" size={56} color={PURPLE} />
                    <Text style={styles.videoPreviewText}>Video Content</Text>
                  </View>
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.carouselSlideImage} />
                )}
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          {mediaList.length > 1 && (
            <View style={styles.paginationDots}>
              {mediaList.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === activeMediaIndex ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom Editing Tool Bar */}
        <View style={styles.toolBarRow}>
          {[
            { id: 'audio', label: 'Audio', icon: 'musical-notes-outline', action: () => setMusicModalVisible(true) },
            { id: 'product', label: 'Product', icon: 'bag-handle-outline', action: () => setProductModalVisible(true) },
            { id: 'add', label: 'Add Media', icon: 'images-outline', action: handleLaunchSystemPicker },
            { id: 'camera', label: 'Camera', icon: 'camera-outline', action: handleCaptureCamera },
          ].map((tool) => (
            <TouchableOpacity key={tool.id} style={styles.toolItem} onPress={tool.action}>
              <View style={styles.toolIconBox}>
                <Ionicons name={tool.icon as any} size={20} color={PURPLE} />
              </View>
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Thumbnail Strip & Next Action */}
        <View style={styles.step2Footer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
            {mediaList.map((item) => (
              <View key={item.id} style={styles.step2ThumbBox}>
                <Image source={{ uri: item.uri }} style={styles.step2ThumbImg} />
                <TouchableOpacity
                  style={styles.step2ThumbRemove}
                  onPress={() => handleRemoveMedia(item.id)}
                >
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.step2AddMoreBtn} onPress={handleLaunchSystemPicker}>
              <Ionicons name="add" size={24} color={PURPLE} />
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.primaryNextBtn} onPress={() => setStep(3)}>
            <Text style={styles.primaryNextBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── STEP 3: CAPTION & PUBLISH (WHITE THEME) ──
  const renderStep3 = () => {
    return (
      <View style={styles.stepContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>New post</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.step3ScrollView} keyboardShouldPersistTaps="handled">
          {/* Top Horizontal Carousel Preview */}
          <View style={styles.step3CarouselPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {mediaList.map((item) => (
                <View key={item.id} style={styles.step3PreviewCard}>
                  <Image source={{ uri: item.uri }} style={styles.step3PreviewImage} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Caption Input */}
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.step3CaptionInput}
              placeholder="Add a caption..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={2200}
              value={caption}
              onChangeText={setCaption}
            />
          </View>

          {/* Option Tiles */}
          <View style={styles.optionsGroup}>
            {/* Audio Tile */}
            <TouchableOpacity
              style={styles.optionTile}
              onPress={() => setMusicModalVisible(true)}
            >
              <Ionicons name="musical-notes-outline" size={22} color={PURPLE} style={styles.optionIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Add audio</Text>
                {selectedMusic && (
                  <Text style={styles.optionSubText}>{selectedMusic.title} • {selectedMusic.artist}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Product Tile */}
            <TouchableOpacity
              style={styles.optionTile}
              onPress={() => setProductModalVisible(true)}
            >
              <Ionicons name="bag-handle-outline" size={22} color={PURPLE} style={styles.optionIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Link Store Product</Text>
                {selectedProduct && (
                  <Text style={styles.optionSubText}>{selectedProduct.name} • ${selectedProduct.price}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Bottom Full-Width Share Button */}
        <View style={styles.shareFooter}>
          <TouchableOpacity
            style={[styles.sharePrimaryBtn, submitting && styles.nextBtnDisabled]}
            onPress={handlePublishPost}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.sharePrimaryBtnText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={WHITE_BG} />

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* ── MUSIC SELECTION MODAL ── */}
      <Modal visible={musicModalVisible} animationType="slide" transparent onRequestClose={() => setMusicModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Choose Music</Text>
              <TouchableOpacity onPress={() => setMusicModalVisible(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBox}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search tracks or artists..."
                placeholderTextColor="#9CA3AF"
                value={musicSearchQuery}
                onChangeText={setMusicSearchQuery}
              />
            </View>

            <FlatList
              data={filteredTracks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedMusic?.id === item.id;
                const isPlaying = isSelected && isPlayingMusic;

                return (
                  <TouchableOpacity
                    style={[styles.trackRow, isSelected && styles.trackRowSelected]}
                    onPress={() => {
                      setSelectedMusic(item);
                      setMusicModalVisible(false);
                    }}
                  >
                    <Image source={{ uri: item.coverUrl }} style={styles.trackCover} />
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.trackTitle}>{item.title}</Text>
                      <Text style={styles.trackArtist}>{item.artist}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleMusicPreview(item)}
                      style={styles.playPreviewBtn}
                    >
                      <Ionicons
                        name={isPlaying ? 'pause-circle' : 'play-circle'}
                        size={28}
                        color={PURPLE}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── PRODUCT SELECTION MODAL ── */}
      <Modal visible={productModalVisible} animationType="slide" transparent onRequestClose={() => setProductModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Link Store Product</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBox}>
              <Ionicons name="search" size={16} color="#9CA3AF" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search merch or products..."
                placeholderTextColor="#9CA3AF"
                value={productSearchQuery}
                onChangeText={setProductSearchQuery}
              />
            </View>

            {loadingProducts ? (
              <ActivityIndicator size="small" color={PURPLE} style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={filteredProducts}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.productRow}
                    onPress={() => {
                      setSelectedProduct(item);
                      setProductModalVisible(false);
                    }}
                  >
                    <View style={styles.productImgBox}>
                      {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.productImg} />
                      ) : (
                        <Ionicons name="bag-handle" size={20} color={PURPLE} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productSub}>${item.price} • {item.productType}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: WHITE_BG,
  },
  stepContainer: {
    flex: 1,
    backgroundColor: WHITE_BG,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight ? StatusBar.currentHeight + 12 : 24),
    paddingBottom: 12,
    backgroundColor: WHITE_BG,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 4,
  },
  headerTitleLight: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  nextHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  nextBtnDisabled: {
    opacity: 0.4,
  },
  nextHeaderBtnText: {
    color: '#3B82F6',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  topPreviewArea: {
    width: '100%',
    height: SCREEN_WIDTH * 0.9,
    backgroundColor: '#F9FAFB',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  largePreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPreviewBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  videoPreviewText: {
    color: PURPLE,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginTop: 6,
  },
  emptyPreviewBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  expandIconBox: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE_BG,
  },
  recentsDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentsText: {
    color: '#111827',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  multiSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  multiSelectBtnActive: {
    backgroundColor: PURPLE,
  },
  multiSelectText: {
    color: '#374151',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  multiSelectTextActive: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
  },
  gridScrollView: {
    flex: 1,
  },
  mediaGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
  },
  cameraTile: {
    width: SCREEN_WIDTH / 3 - 3,
    height: SCREEN_WIDTH / 3 - 3,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1.5,
  },
  gridTile: {
    width: SCREEN_WIDTH / 3 - 3,
    height: SCREEN_WIDTH / 3 - 3,
    margin: 1.5,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  gridTileSelected: {
    borderWidth: 3,
    borderColor: PURPLE,
  },
  gridTileImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridTileIndexBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridTileIndexText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 3,
    borderRadius: 4,
  },
  headerAudioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    maxWidth: 180,
  },
  headerAudioText: {
    color: '#111827',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#F9FAFB',
  },
  carouselSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  carouselSlideImage: {
    width: SCREEN_WIDTH,
    height: '100%',
    resizeMode: 'contain',
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: PURPLE,
    width: 14,
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
  toolBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: WHITE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  toolItem: {
    alignItems: 'center',
    gap: 4,
  },
  toolIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F7F2FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolLabel: {
    color: '#374151',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  step2Footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  thumbStrip: {
    flex: 1,
    marginRight: 12,
  },
  step2ThumbBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  step2ThumbImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  step2ThumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  step2AddMoreBtn: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F7F2FC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PURPLE,
  },
  primaryNextBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  primaryNextBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  step3ScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  step3CarouselPreview: {
    marginVertical: 16,
  },
  step3PreviewCard: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  step3PreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  captionContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  step3CaptionInput: {
    color: '#111827',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsGroup: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionTitle: {
    color: '#111827',
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
  },
  optionSubText: {
    color: PURPLE,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  shareFooter: {
    padding: 16,
    backgroundColor: WHITE_BG,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sharePrimaryBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sharePrimaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: WHITE_BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  trackRowSelected: {
    backgroundColor: '#F7F2FC',
  },
  trackCover: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  trackArtist: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  playPreviewBtn: {
    padding: 4,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImgBox: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  productImg: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  productSub: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
});
