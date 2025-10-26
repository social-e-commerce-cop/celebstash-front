import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { postService } from '@/services/postService';
import { uploadService } from '@/services/uploadService';
import { ProductResponse } from '@/types/api';
import ImagePickerRow from '@/components/artist/profile/ImagePickerRow';
import VideoPickerRow from '@/components/artist/profile/VideoPicker';
import FormRow from '@/components/artist/profile/FormRow';

interface CreatePostScreenProps {
  navigation: any;
  route: {
    params: {
      product: ProductResponse;
    };
  };
}

const CreatePostScreen = ({ navigation, route }: CreatePostScreenProps) => {
  const { product } = route.params;
  
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const validateAndSubmit = async () => {
    // Validation
    if (photos.length < 3 || photos.length > 5) {
      Alert.alert('Error', 'Please add between 3 and 5 photos');
      return;
    }

    if (videos.length === 0) {
      Alert.alert('Error', 'Please add a video');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Upload photos
      console.log('Uploading photos...');
      const photoUrls = await uploadService.uploadPostPhotos(photos);

      // Step 2: Upload video
      console.log('Uploading video...');
      const videoUrl = await uploadService.uploadProductVideo(
        videos[0],
        `post_video_${Date.now()}.mp4`
      );

      // Step 3: Create post
      console.log('Creating post...');
      const postData = {
        productId: product.id,
        videoUrl: videoUrl,
        photoUrls: photoUrls,
        description: description.trim() || undefined,
      };

      const createdPost = await postService.createPost(postData);

      setLoading(false);

      Alert.alert(
        'Success! 🎉',
        `Post created successfully!\n\nYour post is now live and visible to all users.`,
        [
          {
            text: 'View Post',
            onPress: () => navigation.navigate('PostDetail', { postId: createdPost.id }),
          },
          {
            text: 'Back to Products',
            onPress: () => navigation.navigate('MyProducts'),
          },
        ]
      );

    } catch (error: any) {
      setLoading(false);
      console.error('Failed to create post:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to create post. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={validateAndSubmit}
          disabled={loading || photos.length < 3 || videos.length === 0}
        >
          <Text
            style={[
              styles.doneButton,
              (loading || photos.length < 3 || videos.length === 0) && styles.doneButtonDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF650E" />
          <Text style={styles.loadingText}>Publishing your post...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* Product Info */}
        <View style={styles.productCard}>
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price.toLocaleString()} RWF</Text>
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedText}>✓ APPROVED</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>📸 Post Requirements</Text>
          <Text style={styles.instructionsText}>
            • Add 3-5 photos showcasing your product{'\n'}
            • Add a video (max 50MB){'\n'}
            • Write an engaging description{'\n'}
            • Your post will be visible to all users instantly
          </Text>
        </View>

        {/* Photos */}
        <Text style={styles.sectionTitle}>
          Photos ({photos.length}/5) {photos.length < 3 && '⚠️ Min 3 required'}
        </Text>
        <ImagePickerRow images={photos} onChange={setPhotos} />

        {/* Video */}
        <Text style={styles.sectionTitle}>
          Video {videos.length === 0 && '⚠️ Required'}
        </Text>
        <VideoPickerRow videos={videos} onChange={setVideos} />

        <View style={styles.separator} />

        {/* Description */}
        <FormRow
          label="Description (Optional)"
          value={description}
          onChange={setDescription}
          placeholder="Share the story behind this product, styling tips, or special features..."
          multiline
          showBottomBorder={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 28,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF650E',
  },
  doneButtonDisabled: {
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF650E',
    marginBottom: 6,
  },
  approvedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approvedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  separator: {
    height: 8,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  instructionsBox: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default CreatePostScreen;
