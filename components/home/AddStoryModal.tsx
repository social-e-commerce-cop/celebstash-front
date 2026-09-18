import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storiesService } from '@/lib/storiesService';
import { uploadFileToBackend } from '@/lib/apiClient';

const PURPLE = '#7126D0';

interface AddStoryModalProps {
  visible: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  visible,
  onClose,
  onStoryCreated,
}) => {
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FOLLOWERS' | 'CLOSE_FRIENDS'>('PUBLIC');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickMedia = async (type: 'IMAGE' | 'VIDEO') => {
    setMediaType(type);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow photo gallery access to pick story media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'IMAGE' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
        videoMaxDuration: 30,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Media picking error:', err);
    }
  };

  const handlePostStory = async () => {
    setIsUploading(true);
    setUploadProgress(0.2);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 0.9) {
          clearInterval(interval);
          return 0.95;
        }
        return prev + 0.25;
      });
    }, 200);

    try {
      let finalMediaUrl: string;
      if (selectedUri) {
        const isVid = mediaType === 'VIDEO';
        finalMediaUrl = await uploadFileToBackend(
          selectedUri,
          `story_${Date.now()}.${isVid ? 'mp4' : 'jpg'}`,
          isVid ? 'video/mp4' : 'image/jpeg'
        );
      } else {
        finalMediaUrl = mediaType === 'IMAGE'
          ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'
          : 'https://assets.mixkit.co/videos/preview/mixkit-concert-crowd-raising-hands-41484-large.mp4';
      }

      await storiesService.createStory({
        mediaUrl: finalMediaUrl,
        mediaType,
        caption: caption.trim(),
        visibility,
        allowReplies: true,
        allowReactions: true,
      });

      setUploadProgress(1.0);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setCaption('');
        setSelectedUri(null);
        onStoryCreated();
        onClose();
      }, 300);
    } catch (err: any) {
      setIsUploading(false);
      Alert.alert('Upload Failed', err?.message || 'Failed to upload story. Please check connection and try again.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create 24h Story</Text>
            <TouchableOpacity
              style={[styles.postBtn, isUploading && styles.postBtnDisabled]}
              onPress={handlePostStory}
              disabled={isUploading}
              activeOpacity={0.8}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.postBtnText}>Share</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Upload Progress Bar */}
          {isUploading && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${uploadProgress * 100}%` }]} />
            </View>
          )}

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Media Type Selector */}
            <Text style={styles.sectionLabel}>Select Story Media</Text>
            <View style={styles.mediaRow}>
              <TouchableOpacity
                style={[styles.mediaTile, mediaType === 'IMAGE' && styles.mediaTileSelected]}
                onPress={() => handlePickMedia('IMAGE')}
              >
                <Ionicons name="image-outline" size={26} color={mediaType === 'IMAGE' ? PURPLE : '#666'} />
                <Text style={[styles.mediaTileText, mediaType === 'IMAGE' && styles.mediaTileTextSelected]}>
                  Photo (5s)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mediaTile, mediaType === 'VIDEO' && styles.mediaTileSelected]}
                onPress={() => handlePickMedia('VIDEO')}
              >
                <Ionicons name="videocam-outline" size={26} color={mediaType === 'VIDEO' ? PURPLE : '#666'} />
                <Text style={[styles.mediaTileText, mediaType === 'VIDEO' && styles.mediaTileTextSelected]}>
                  Video (Max 30s)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Media Preview Box */}
            <TouchableOpacity
              style={styles.previewBox}
              activeOpacity={0.8}
              onPress={() => handlePickMedia(mediaType)}
            >
              <Image
                source={
                  selectedUri
                    ? { uri: selectedUri }
                    : mediaType === 'IMAGE'
                    ? require('../../assets/images/storyItem.jpg')
                    : require('../../assets/images/feed6.jpg')
                }
                style={styles.previewMedia}
              />
              <View style={styles.changeOverlay}>
                <Ionicons name="camera-reverse" size={20} color="#FFF" />
                <Text style={styles.changeOverlayText}>Tap to choose from library</Text>
              </View>
              {mediaType === 'VIDEO' && (
                <View style={styles.playIconOverlay}>
                  <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                </View>
              )}
            </TouchableOpacity>

            {/* Caption Input */}
            <Text style={styles.sectionLabel}>Add Caption</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a text caption, sticker or tag..."
              placeholderTextColor="#999"
              multiline
              value={caption}
              onChangeText={setCaption}
            />

            {/* Story Audience / Privacy Selector */}
            <Text style={styles.sectionLabel}>Story Audience</Text>
            <View style={styles.privacyRow}>
              {(['PUBLIC', 'FOLLOWERS', 'CLOSE_FRIENDS'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.privacyPill, visibility === p && styles.privacyPillSelected]}
                  onPress={() => setVisibility(p)}
                >
                  <Ionicons
                    name={
                      p === 'PUBLIC'
                        ? 'globe-outline'
                        : p === 'FOLLOWERS'
                        ? 'people-outline'
                        : 'star-outline'
                    }
                    size={14}
                    color={visibility === p ? '#FFF' : '#444'}
                  />
                  <Text style={[styles.privacyText, visibility === p && styles.privacyTextSelected]}>
                    {p === 'PUBLIC' ? 'Public' : p === 'FOLLOWERS' ? 'Followers' : 'Close Friends'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  postBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#E5E7EB',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: PURPLE,
  },
  body: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  mediaTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  mediaTileSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F5F0FD',
  },
  mediaTileText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  mediaTileTextSelected: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },
  previewBox: {
    position: 'relative',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#000',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  captionInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 5,
  },
  privacyPillSelected: {
    backgroundColor: PURPLE,
  },
  privacyText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#444',
  },
  privacyTextSelected: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 6,
  },
  changeOverlayText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
});
