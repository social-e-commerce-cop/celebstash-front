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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostData, ShoppableItem } from '@/lib/postsData';

const PURPLE = '#7126D0';

interface AddPostModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPost: (newPost: PostData) => void;
  artistName: string;
}

export const AddPostModal: React.FC<AddPostModalProps> = ({
  visible,
  onClose,
  onAddPost,
  artistName,
}) => {
  const [postText, setPostText] = useState('');
  const [selectedType, setSelectedType] = useState<'product' | 'song' | 'concert' | 'none'>('none');
  const [attachedTitle, setAttachedTitle] = useState('');
  const [attachedSubtitle, setAttachedSubtitle] = useState('');
  const [attachedPrice, setAttachedPrice] = useState('');

  const handlePublish = () => {
    if (!postText.trim()) {
      Alert.alert('Empty Post', 'Please write a caption for your post.');
      return;
    }

    let attachedItem: ShoppableItem | undefined = undefined;

    if (selectedType !== 'none' && attachedTitle.trim()) {
      attachedItem = {
        type: selectedType,
        title: attachedTitle.trim(),
        subtitle: attachedSubtitle.trim() || (selectedType === 'product' ? 'Exclusive Drop' : selectedType === 'song' ? 'Official Track' : 'Live Show Ticket'),
        price: attachedPrice.trim() ? (attachedPrice.startsWith('$') ? attachedPrice : `$${attachedPrice}`) : '$50',
        image: require('../../assets/images/feed6.jpg'),
      };
    }

    const newPost: PostData = {
      id: Date.now(),
      userName: artistName || 'Kenny K Shot',
      userImage: require('../../assets/images/black-man.png'),
      timeAgo: 'Just now',
      verified: true,
      postText: postText.trim(),
      mainImage: require('../../assets/images/feed6.jpg'),
      price: attachedItem?.price || '$250',
      likes: 0,
      likedByMe: false,
      comments: 0,
      shares: 0,
      trending: 'NEW',
      attachedItem,
    };

    onAddPost(newPost);
    setPostText('');
    setSelectedType('none');
    setAttachedTitle('');
    setAttachedSubtitle('');
    setAttachedPrice('');
    onClose();
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
            <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} activeOpacity={0.8}>
              <Text style={styles.publishBtnText}>Post</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Artist Info */}
            <View style={styles.artistRow}>
              <Image source={require('../../assets/images/black-man.png')} style={styles.avatar} />
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.artistNameText}>{artistName || 'Kenny K Shot'}</Text>
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

            {/* Image Preview Box */}
            <View style={styles.imagePreviewBox}>
              <Image source={require('../../assets/images/feed6.jpg')} style={styles.previewImage} />
              <View style={styles.imageBadge}>
                <Ionicons name="image-outline" size={14} color="#FFF" />
                <Text style={styles.imageBadgeText}>Photo Attached</Text>
              </View>
            </View>

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
                      : 'Concert Title (e.g. Kigali Live Tour)'
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
    borderBottomColor: '#EEE',
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
  },
  publishBtnText: {
    color: '#FFF',
    fontSize: 13,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  artistNameText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  shoppableTag: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
  captionInput: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  imagePreviewBox: {
    position: 'relative',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  imageBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 4,
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
    gap: 8,
    marginBottom: 20,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111',
  },
});
