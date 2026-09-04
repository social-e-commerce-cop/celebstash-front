import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { getSessionToken } from '@/lib/session';
import { API_BASE_URL } from '@/lib/apiClient';

const PURPLE = '#7126D0';

interface TrackItem {
  title: string;
  price: string;
  fileUri: string;
  fileName: string;
  producer: string;
  songwriter: string;
  featuredArtists: string;
  trackStory: string;
  isExplicit: boolean;
}

export default function UploadMusicScreen() {
  const navigation = useNavigation<any>();

  // Release Information
  const [releaseType, setReleaseType] = useState<'SINGLE' | 'EP' | 'ALBUM' | 'MULTIPLE_TRACKS'>('SINGLE');
  const [title, setTitle] = useState('');
  const [featuredArtists, setFeaturedArtists] = useState('');
  const [genre, setGenre] = useState('Afrobeats');
  const [subgenre, setSubgenre] = useState('');
  const [releaseStory, setReleaseStory] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState<'UNRELEASED' | 'EXCLUSIVE' | 'PRE_RELEASE' | 'PUBLICLY_RELEASED'>('UNRELEASED');
  const [publicReleaseDate, setPublicReleaseDate] = useState('October 30, 2026');
  const [copyrightInfo, setCopyrightInfo] = useState('');
  const [credits, setCredits] = useState('');

  // Access Package & Pricing
  const [albumPrice, setAlbumPrice] = useState('9.99');
  const [defaultPlayLimit, setDefaultPlayLimit] = useState(10);
  const [accessType, setAccessType] = useState<'LIMITED_PLAYS' | 'PERMANENT_STREAMING'>('LIMITED_PLAYS');

  // Cover Art
  const [coverArtUri, setCoverArtUri] = useState<string | null>(null);

  // Tracks List
  const [tracks, setTracks] = useState<TrackItem[]>([
    {
      title: '',
      price: '1.99',
      fileUri: '',
      fileName: '',
      producer: '',
      songwriter: '',
      featuredArtists: '',
      trackStory: '',
      isExplicit: false,
    },
  ]);
  const [expandedTrackIdx, setExpandedTrackIdx] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);

  const pickCoverArt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      const asset = res.assets[0];
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Cover artwork image must be smaller than 10MB.');
        return;
      }
      setCoverArtUri(asset.uri);
    }
  };

  const pickAudioFile = async (index: number) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const ext = (asset.name.split('.').pop() || '').toLowerCase();
        const validFormats = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'];
        if (!validFormats.includes(ext)) {
          Alert.alert('Unsupported Audio Format', 'Supported formats: MP3, WAV, AAC, FLAC, M4A, OGG.');
          return;
        }
        if (asset.size && asset.size > 100 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Audio file size cannot exceed 100MB.');
          return;
        }
        const newTracks = [...tracks];
        newTracks[index].fileUri = asset.uri;
        newTracks[index].fileName = asset.name;
        if (!newTracks[index].title) {
          newTracks[index].title = asset.name.replace(/\.[^/.]+$/, '');
        }
        setTracks(newTracks);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not select audio file');
    }
  };

  const addTrackRow = () => {
    const newIdx = tracks.length;
    setTracks([
      ...tracks,
      {
        title: '',
        price: '1.99',
        fileUri: '',
        fileName: '',
        producer: '',
        songwriter: '',
        featuredArtists: '',
        trackStory: '',
        isExplicit: false,
      },
    ]);
    setExpandedTrackIdx(newIdx);
  };

  const removeTrackRow = (index: number) => {
    if (tracks.length === 1) return;
    setTracks(tracks.filter((_, i) => i !== index));
    if (expandedTrackIdx === index) {
      setExpandedTrackIdx(null);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a release title');
      return;
    }
    if (!coverArtUri) {
      Alert.alert('Missing Cover Art', 'Please upload a cover art image');
      return;
    }
    const invalidTrack = tracks.find(t => !t.fileUri);
    if (invalidTrack) {
      Alert.alert('Missing Audio File', 'Please select an audio file for all tracks');
      return;
    }

    setSubmitting(true);
    try {
      const token = getSessionToken();
      const formData = new FormData();

      formData.append('title', title);
      formData.append('releaseType', releaseType);
      formData.append('featuredArtists', featuredArtists);
      formData.append('genre', genre);
      formData.append('subgenre', subgenre);
      formData.append('releaseStory', releaseStory);
      formData.append('availabilityStatus', availabilityStatus);
      formData.append('publicReleaseDate', publicReleaseDate);
      formData.append('copyrightInfo', copyrightInfo);
      formData.append('credits', credits);
      formData.append('albumPrice', albumPrice);
      formData.append('defaultPlayLimit', String(defaultPlayLimit));
      formData.append('accessType', accessType);

      // Cover art file
      const coverExt = coverArtUri.split('.').pop() || 'jpg';
      formData.append('coverArt', {
        uri: coverArtUri,
        name: `cover_${Date.now()}.${coverExt}`,
        type: `image/${coverExt === 'png' ? 'png' : 'jpeg'}`,
      } as any);

      // Tracks
      tracks.forEach((tr, i) => {
        formData.append('trackTitles', tr.title || `Track ${i + 1}`);
        formData.append('trackPrices', tr.price || '1.99');
        formData.append('trackProducers', tr.producer || '');
        formData.append('trackSongwriters', tr.songwriter || '');
        formData.append('trackFeaturedArtists', tr.featuredArtists || '');
        formData.append('trackStories', tr.trackStory || '');
        formData.append('trackExplicits', String(tr.isExplicit));

        const audioExt = tr.fileName.split('.').pop() || 'mp3';
        formData.append('trackFiles', {
          uri: tr.fileUri,
          name: tr.fileName || `track_${i + 1}.${audioExt}`,
          type: 'audio/mpeg',
        } as any);
      });

      const response = await fetch(`${API_BASE_URL}/api/music/releases/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `Upload failed (${response.status})`);
      }

      Alert.alert('Success!', 'Your unreleased music has been published directly to the marketplace.', [
        { text: 'View Profile', onPress: () => navigation.navigate('ArtProfile' as any) },
        { text: 'View Marketplace', onPress: () => navigation.navigate('MusicScreen' as any) },
      ]);
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Something went wrong while uploading music');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Music Release</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Release Type Selector */}
        <Text style={styles.fieldLabel}>Release Type *</Text>
        <View style={styles.typeSelectorRow}>
          {(['SINGLE', 'EP', 'ALBUM', 'MULTIPLE_TRACKS'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, releaseType === type && styles.typeChipActive]}
              onPress={() => setReleaseType(type)}
            >
              <Text style={[styles.typeChipText, releaseType === type && styles.typeChipTextActive]}>
                {type.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cover Artwork */}
        <Text style={styles.fieldLabel}>Cover Artwork *</Text>
        <TouchableOpacity style={styles.coverUploadBox} onPress={pickCoverArt}>
          {coverArtUri ? (
            <Image source={{ uri: coverArtUri }} style={styles.coverPreview} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="image-outline" size={36} color={PURPLE} />
              <Text style={styles.uploadPlaceholderText}>Tap to select high-res cover art (1:1 aspect ratio)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Release Information */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeading}>Release Information</Text>

        <Text style={styles.fieldLabel}>Release Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Ethereal Tide LP"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.fieldLabel}>Featured Artists</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Burna Boy, Wizkid (comma separated)"
          value={featuredArtists}
          onChangeText={setFeaturedArtists}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Genre</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Afrobeats"
              value={genre}
              onChangeText={setGenre}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Subgenre</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Afro-Pop"
              value={subgenre}
              onChangeText={setSubgenre}
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Story & Inspiration</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Share the story behind this music with your fans..."
          multiline
          numberOfLines={3}
          value={releaseStory}
          onChangeText={setReleaseStory}
        />

        {/* Availability & Unreleased Status */}
        <Text style={styles.fieldLabel}>Release Availability Status *</Text>
        <View style={styles.typeSelectorRow}>
          {[
            { id: 'UNRELEASED', label: 'UNRELEASED' },
            { id: 'EXCLUSIVE', label: 'EXCLUSIVE' },
            { id: 'PRE_RELEASE', label: 'PRE-RELEASE' },
            { id: 'PUBLICLY_RELEASED', label: 'PUBLIC' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.typeChip, availabilityStatus === item.id && styles.typeChipActive]}
              onPress={() => setAvailabilityStatus(item.id as any)}
            >
              <Text style={[styles.typeChipText, availabilityStatus === item.id && styles.typeChipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Official Public Release Date</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. October 30, 2026"
          value={publicReleaseDate}
          onChangeText={setPublicReleaseDate}
        />

        <Text style={styles.fieldLabel}>Copyright / Ownership Information</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. © 2026 CelebStash Music Group"
          value={copyrightInfo}
          onChangeText={setCopyrightInfo}
        />

        <Text style={styles.fieldLabel}>Credits & Contributors</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Executive Produced by Taye"
          value={credits}
          onChangeText={setCredits}
        />

        {/* Access Package Rules */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionHeading}>Access Package & Pricing Rules</Text>

        <Text style={styles.fieldLabel}>Default Access Package</Text>
        <View style={styles.typeSelectorRow}>
          <TouchableOpacity
            style={[styles.typeChip, accessType === 'LIMITED_PLAYS' && styles.typeChipActive]}
            onPress={() => setAccessType('LIMITED_PLAYS')}
          >
            <Text style={[styles.typeChipText, accessType === 'LIMITED_PLAYS' && styles.typeChipTextActive]}>Limited Plays</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeChip, accessType === 'PERMANENT_STREAMING' && styles.typeChipActive]}
            onPress={() => setAccessType('PERMANENT_STREAMING')}
          >
            <Text style={[styles.typeChipText, accessType === 'PERMANENT_STREAMING' && styles.typeChipTextActive]}>Permanent Stream</Text>
          </TouchableOpacity>
        </View>

        {accessType === 'LIMITED_PLAYS' && (
          <>
            <Text style={styles.fieldLabel}>Default Plays Included</Text>
            <View style={styles.typeSelectorRow}>
              {[5, 10, 20, 30].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.limitChip, defaultPlayLimit === num && styles.limitChipActive]}
                  onPress={() => setDefaultPlayLimit(num)}
                >
                  <Text style={[styles.limitChipText, defaultPlayLimit === num && styles.limitChipTextActive]}>{num} Plays</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {(releaseType === 'ALBUM' || releaseType === 'EP' || releaseType === 'MULTIPLE_TRACKS') && (
          <>
            <Text style={styles.fieldLabel}>Full Bundle Price ($)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="decimal-pad"
              value={albumPrice}
              onChangeText={setAlbumPrice}
            />
          </>
        )}

        {/* Audio Track Files */}
        <View style={styles.sectionDivider} />
        <View style={styles.trackHeaderRow}>
          <Text style={styles.sectionHeading}>Track Information ({tracks.length})</Text>
          <TouchableOpacity style={styles.addTrackBtn} onPress={addTrackRow}>
            <Ionicons name="add-circle" size={20} color={PURPLE} />
            <Text style={styles.addTrackBtnText}>Add Track</Text>
          </TouchableOpacity>
        </View>

        {tracks.map((tr, idx) => {
          const isExpanded = expandedTrackIdx === idx;

          return (
            <View key={idx} style={styles.trackCard}>
              <TouchableOpacity
                style={styles.trackCardHeader}
                onPress={() => setExpandedTrackIdx(isExpanded ? null : idx)}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.trackCardNumber}>
                    Track #{idx + 1}: {tr.title || 'Untitled Track'}
                  </Text>
                </View>
                {tracks.length > 1 && (
                  <TouchableOpacity onPress={() => removeTrackRow(idx)}>
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.audioPickerBox} onPress={() => pickAudioFile(idx)}>
                <Ionicons name="musical-notes-outline" size={20} color={PURPLE} style={{ marginRight: 8 }} />
                <Text style={styles.audioPickerText} numberOfLines={1}>
                  {tr.fileName || 'Tap to select audio file (MP3, WAV, AAC, M4A)'}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.fieldLabel}>Track Title *</Text>
                  <TextInput
                    style={styles.trackInput}
                    placeholder="Track Title"
                    value={tr.title}
                    onChangeText={(text) => {
                      const updated = [...tracks];
                      updated[idx].title = text;
                      setTracks(updated);
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.trackInput}
                    placeholder="Price ($)"
                    keyboardType="decimal-pad"
                    value={tr.price}
                    onChangeText={(text) => {
                      const updated = [...tracks];
                      updated[idx].price = text;
                      setTracks(updated);
                    }}
                  />
                </View>
              </View>

              {isExpanded && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.fieldLabel}>Producer</Text>
                  <TextInput
                    style={styles.trackInput}
                    placeholder="e.g. Metro Boomin"
                    value={tr.producer}
                    onChangeText={(text) => {
                      const updated = [...tracks];
                      updated[idx].producer = text;
                      setTracks(updated);
                    }}
                  />

                  <Text style={styles.fieldLabel}>Songwriter / Composer</Text>
                  <TextInput
                    style={styles.trackInput}
                    placeholder="e.g. Taye"
                    value={tr.songwriter}
                    onChangeText={(text) => {
                      const updated = [...tracks];
                      updated[idx].songwriter = text;
                      setTracks(updated);
                    }}
                  />

                  <Text style={styles.fieldLabel}>Track Featured Artists</Text>
                  <TextInput
                    style={styles.trackInput}
                    placeholder="e.g. Rema"
                    value={tr.featuredArtists}
                    onChangeText={(text) => {
                      const updated = [...tracks];
                      updated[idx].featuredArtists = text;
                      setTracks(updated);
                    }}
                  />

                  <Text style={styles.fieldLabel}>Track Story / Notes</Text>
                  <TextInput
                    style={[styles.trackInput, { height: 60 }]}
                    placeholder="Story behind this specific track..."
                    multiline
                    value={tr.trackStory}
                    onChangeText={(text) => {
                      const updated = [...tracks];
                      updated[idx].trackStory = text;
                      setTracks(updated);
                    }}
                  />

                  <View style={[styles.switchRow, { marginTop: 6 }]}>
                    <Text style={styles.switchLabel}>Explicit Track</Text>
                    <Switch
                      value={tr.isExplicit}
                      onValueChange={(val) => {
                        const updated = [...tracks];
                        updated[idx].isExplicit = val;
                        setTracks(updated);
                      }}
                      trackColor={{ false: '#D1D5DB', true: PURPLE }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleUpload} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Publish Release</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  typeChipActive: {
    backgroundColor: PURPLE,
  },
  typeChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  limitChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  limitChipActive: {
    backgroundColor: PURPLE,
  },
  limitChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  limitChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  coverUploadBox: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  coverPreview: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    padding: 10,
  },
  uploadPlaceholderText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  trackHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addTrackBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  trackCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  trackCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackCardNumber: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  audioPickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  audioPickerText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
    flex: 1,
  },
  trackInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111827',
    marginBottom: 6,
  },
  submitBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },
});
