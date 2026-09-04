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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createArtistPost, uploadMediaFile } from '@/lib/postService';

import { useNavigation } from '@react-navigation/native';

const PURPLE = '#7126D0';

interface AddPostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
  artistName?: string;
}

export interface SelectedMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
}

export const AddPostModal: React.FC<AddPostModalProps> = ({
  visible,
  onClose,
  onPostCreated,
  artistName,
}) => {
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    if (visible) {
      onClose();
      navigation.navigate('CreatePost');
    }
  }, [visible]);
  const [postText, setPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'product' | 'song' | 'concert' | 'none'>('none');
  const [attachedTitle, setAttachedTitle] = useState('');
  const [attachedSubtitle, setAttachedSubtitle] = useState('');
  const [attachedPrice, setAttachedPrice] = useState('');

  const [selectedMediaList, setSelectedMediaList] = useState<SelectedMedia[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePickMedia = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required to upload media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: SelectedMedia[] = result.assets.map((asset, idx) => ({
          id: `${Date.now()}_${idx}`,
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
        }));
        setSelectedMediaList((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('Media picker error:', err);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setSelectedMediaList((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePublish = async () => {
    if (!postText.trim() && selectedMediaList.length === 0) {
      Alert.alert('Empty Post', 'Please write a caption or attach media for your post.');
      return;
    }

    setLoading(true);
    try {
      const imageUrls: string[] = [];
      let videoUrl: string | undefined = undefined;

      for (let i = 0; i < selectedMediaList.length; i++) {
        const item = selectedMediaList[i];
        const isVid = item.type === 'video';
        const uploadedUrl = await uploadMediaFile(
          item.uri,
          `post_media_${Date.now()}_${i}.${isVid ? 'mp4' : 'jpg'}`,
          isVid ? 'video/mp4' : 'image/jpeg'
        );

        if (isVid) {
          if (!videoUrl) videoUrl = uploadedUrl;
        } else {
          imageUrls.push(uploadedUrl);
        }
      }

      await createArtistPost({
        description: postText.trim(),
        imageUrls,
        videoUrl,
        attachedType: selectedType !== 'none' ? selectedType : undefined,
        attachedTitle: attachedTitle.trim() || undefined,
        attachedSubtitle: attachedSubtitle.trim() || undefined,
        attachedPrice: attachedPrice.trim() ? (attachedPrice.startsWith('$') ? attachedPrice : `$${attachedPrice}`) : undefined,
      });

      Alert.alert('Success', 'Your post has been published live!');

      // Reset form
      setPostText('');
      setSelectedMediaList([]);
      setSelectedType('none');
      setAttachedTitle('');
      setAttachedSubtitle('');
      setAttachedPrice('');

      onPostCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.message || 'Failed to publish post. Please check backend connection.');
    } finally {
      setLoading(false);
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
            <Text style={styles.headerTitle}>Create Artist Post</Text>
            <TouchableOpacity
              style={[styles.publishBtn, loading && styles.publishBtnDisabled]}
              onPress={handlePublish}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.publishBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Artist Info */}
            <View style={styles.artistRow}>
              <Image source={require('../../assets/images/black-man.png')} style={styles.avatar} />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.artistNameText}>{artistName || 'Verified Artist'}</Text>
                  <Ionicons name="checkmark-circle" size={14} color={PURPLE} style={{ marginLeft: 4 }} />
                </View>
                <Text style={styles.shoppableTag}>Shoppable Creator Post</Text>
              </View>
            </View>

            {/* Post Caption */}
            <TextInput
              style={styles.captionInput}
              placeholder="What's happening? Share a drop, song preview, or live concert update..."
              placeholderTextColor="#999"
              multiline
              value={postText}
              onChangeText={setPostText}
            />

            {/* Media Selector / Preview */}
            {selectedMediaList.length > 0 ? (
              <View style={styles.mediaContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaList}>
                  {selectedMediaList.map((item) => (
                    <View key={item.id} style={styles.mediaThumbnailBox}>
                      <Image source={{ uri: item.uri }} style={styles.thumbnailImage} />
                      <TouchableOpacity
                        style={styles.removeThumbnailBtn}
                        onPress={() => handleRemoveMedia(item.id)}
                      >
                        <Ionicons name="close-circle" size={22} color="#FFF" />
                      </TouchableOpacity>
                      <View style={styles.thumbnailBadge}>
                        <Ionicons
                          name={item.type === 'video' ? 'videocam' : 'image'}
                          size={12}
                          color="#FFF"
                        />
                      </View>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addMoreTile}
                    onPress={handlePickMedia}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={28} color={PURPLE} />
                    <Text style={styles.addMoreText}>Add More</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.mediaPickerPlaceholder}
                onPress={handlePickMedia}
                activeOpacity={0.7}
              >
                <Ionicons name="camera-outline" size={28} color={PURPLE} />
                <Text style={styles.mediaPickerText}>Add Photos or Videos (Multiple allowed)</Text>
              </TouchableOpacity>
            )}

            {/* Shoppable Link Attachment Selector */}
            <Text style={styles.sectionLabel}>Attach Shoppable Item (Optional)</Text>
            <View style={styles.typeSelectorRow}>
              {(['none', 'product', 'song', 'concert'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typePill, selectedType === t && styles.typePillActive]}
                  onPress={() => setSelectedType(t)}
                >
                  <Ionicons
                    name={
                      t === 'product'
                        ? 'bag-handle-outline'
                        : t === 'song'
                        ? 'musical-notes-outline'
                        : t === 'concert'
                        ? 'ticket-outline'
                        : 'link-outline'
                    }
                    size={14}
                    color={selectedType === t ? '#FFF' : '#444'}
                  />
                  <Text style={[styles.typePillText, selectedType === t && styles.typePillTextActive]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedType !== 'none' && (
              <View style={styles.attachmentForm}>
                <TextInput
                  style={styles.formInput}
                  placeholder={
                    selectedType === 'product'
                      ? 'Product Name (e.g. Tour Hoodie)'
                      : selectedType === 'song'
                      ? 'Song/Album Title (e.g. Ethereal Echoes)'
                      : 'Concert Title (e.g. Live Concert Ticket)'
                  }
                  placeholderTextColor="#999"
                  value={attachedTitle}
                  onChangeText={setAttachedTitle}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Subtitle/Details (e.g. Heavyweight Cotton)"
                  placeholderTextColor="#999"
                  value={attachedSubtitle}
                  onChangeText={setAttachedSubtitle}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Price (e.g. $45)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={attachedPrice}
                  onChangeText={setAttachedPrice}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddPostModal;

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
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  publishBtn: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  publishBtnDisabled: {
    opacity: 0.6,
  },
  publishBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  body: {
    padding: 16,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  artistNameText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  shoppableTag: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
  captionInput: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  mediaPickerPlaceholder: {
    height: 120,
    backgroundColor: '#F7F2FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE0F8',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  mediaPickerText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
  imagePreviewBox: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  typePillActive: {
    backgroundColor: PURPLE,
  },
  typePillText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#444',
  },
  typePillTextActive: {
    color: '#FFF',
    fontFamily: 'Poppins-Bold',
  },
  attachmentForm: {
    backgroundColor: '#F7F2FC',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 24,
  },
  formInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    borderWidth: 1,
    borderColor: '#EAE0F8',
  },
  mediaContainer: {
    marginBottom: 16,
  },
  mediaList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 10,
  },
  mediaThumbnailBox: {
    width: 110,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeThumbnailBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 11,
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 6,
  },
  addMoreTile: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PURPLE,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F2FC',
    gap: 4,
  },
  addMoreText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
});
