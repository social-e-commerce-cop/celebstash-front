import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { CreatePostDraft, PURPLE, LIGHT_PURPLE, BORDER_PURPLE } from './CreatePostTypes';
import { resolveImageUrl } from '@/lib/apiClient';
import { getSessionUser } from '@/lib/session';
import { profileService } from '@/lib/profileService';
import { createArtistPost, uploadMediaFile } from '@/lib/postService';

const { width: W } = Dimensions.get('window');

const VerifiedBadge = () => (
  <Svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724Z"
      fill={PURPLE}
    />
  </Svg>
);

interface Props {
  draft: CreatePostDraft;
  onBack: () => void;
  onSuccess: () => void;
}

export default function StepPreview({ draft, onBack, onSuccess }: Props) {
  const sessionUser = getSessionUser();
  const [profilePic, setProfilePic] = useState<string | null>(
    sessionUser.profilePicture || sessionUser.avatar || null
  );
  const [fullName, setFullName] = useState<string>(sessionUser.fullName || 'You');

  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    profileService.getMyProfile().then(p => {
      if (p) {
        if (p.profilePicture) setProfilePic(p.profilePicture);
        if (p.fullName) setFullName(p.fullName);
      }
    }).catch(() => {});
  }, []);

  const handlePublish = async () => {
    if (draft.selectedMedia.length === 0) {
      Alert.alert('No Media', 'Please select at least one photo or video.');
      return;
    }
    setPublishing(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < draft.selectedMedia.length; i++) {
        const item = draft.selectedMedia[i];
        setProgress(`Uploading ${i + 1} of ${draft.selectedMedia.length}…`);
        const url = await uploadMediaFile(item.uri, item.name, item.type === 'video' ? 'video/mp4' : 'image/jpeg');
        uploadedUrls.push(url);
      }
      setProgress('Publishing post…');

      const imageUrls = uploadedUrls.filter((_, i) => draft.selectedMedia[i]?.type === 'image');
      const videoUrl = uploadedUrls.find((_, i) => draft.selectedMedia[i]?.type === 'video');

      const postData: any = {
        description: draft.caption || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        videoUrl: videoUrl || undefined,
      };

      if (draft.linkedProduct) {
        postData.productId = draft.linkedProduct.id;
        postData.attachedType = 'product';
        postData.attachedTitle = draft.linkedProduct.name;
        postData.attachedSubtitle = 'Official Merch';
        postData.attachedPrice = `$${draft.linkedProduct.price}`;
      }

      await createArtistPost(postData);
      setPublishing(false);
      Alert.alert('Posted!', 'Your post is now live and visible to your followers.', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (err: any) {
      setPublishing(false);
      setProgress('');
      Alert.alert('Failed to Publish', err?.message || 'Please check your connection and try again.', [
        { text: 'Try Again', onPress: handlePublish },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView>
        {/* Post Header */}
        <View style={s.postHeader}>
          <View style={s.avatar}>
            {profilePic ? (
              <Image source={{ uri: resolveImageUrl(profilePic) }} style={s.avatarImg} />
            ) : (
              <View style={[s.avatarImg, s.avatarFallback]}>
                <Ionicons name="person" size={20} color={PURPLE} />
              </View>
            )}
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={s.userName}>{fullName}</Text>
              <VerifiedBadge />
            </View>
            <Text style={s.userRole}>Artist</Text>
          </View>
        </View>

        {/* Caption Preview */}
        {!!draft.caption && <Text style={s.caption}>{draft.caption}</Text>}

        {/* Media Carousel */}
        {draft.selectedMedia.length > 0 && (
          <View style={s.mediaBox}>
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / W);
                setSlideIndex(idx);
              }}
            >
              {draft.selectedMedia.map((m, i) => (
                <Image key={m.id} source={{ uri: m.uri }} style={{ width: W, height: W * 0.9, resizeMode: 'cover' }} />
              ))}
            </ScrollView>
            {draft.selectedMedia.length > 1 && (
              <>
                <View style={s.slideCounter}>
                  <Text style={s.slideCounterTxt}>{slideIndex + 1}/{draft.selectedMedia.length}</Text>
                </View>
                <View style={s.dots}>
                  {draft.selectedMedia.map((_, i) => (
                    <View key={i} style={[s.dot, i === slideIndex ? s.dotActive : s.dotInactive]} />
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Tagged Users */}
        {draft.taggedUsers.length > 0 && (
          <View style={s.tagsRow}>
            {draft.taggedUsers.map(u => (
              <View key={u.id} style={s.tag}>
                <Text style={s.tagTxt}>@{u.username || u.fullName}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Product Card */}
        {draft.linkedProduct && (
          <View style={s.productCard}>
            {draft.linkedProduct.imageUrls?.[0] && (
              <Image source={{ uri: resolveImageUrl(draft.linkedProduct.imageUrls[0]) }} style={s.productImg} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.productName}>{draft.linkedProduct.name}</Text>
              <Text style={s.productPrice}>${draft.linkedProduct.price}</Text>
            </View>
            <View style={s.shopBtn}>
              <Text style={s.shopBtnTxt}>Shop</Text>
              <Ionicons name="chevron-forward" size={13} color="#fff" />
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Publishing Overlay */}
      {publishing && (
        <View style={s.publishingOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={s.publishingTxt}>{progress}</Text>
        </View>
      )}

      {/* Footer Action */}
      <View style={s.footer}>
        <TouchableOpacity style={s.backBtn} onPress={onBack} disabled={publishing}>
          <Ionicons name="arrow-back" size={20} color={PURPLE} />
          <Text style={s.backTxt}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.publishBtn, publishing && { opacity: 0.5 }]} onPress={handlePublish} disabled={publishing}>
          <Text style={s.publishTxt}>Publish Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  avatar: {},
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111' },
  userRole: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#888' },
  caption: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#111', paddingHorizontal: 14, paddingBottom: 8, lineHeight: 20 },
  mediaBox: { position: 'relative' },
  slideCounter: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  slideCounterTxt: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-Bold' },
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: PURPLE },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.6)' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingTop: 10 },
  tag: { backgroundColor: LIGHT_PURPLE, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: BORDER_PURPLE },
  tagTxt: { fontSize: 12, fontFamily: 'Poppins-Medium', color: PURPLE },
  productCard: {
    flexDirection: 'row', alignItems: 'center', margin: 14, padding: 10,
    backgroundColor: LIGHT_PURPLE, borderRadius: 10, borderWidth: 1, borderColor: BORDER_PURPLE,
  },
  productImg: { width: 48, height: 48, borderRadius: 6, marginRight: 10 },
  productName: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#111' },
  productPrice: { fontSize: 12, fontFamily: 'Poppins-Medium', color: PURPLE },
  shopBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: PURPLE,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 3,
  },
  shopBtnTxt: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-Bold' },
  publishingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  publishingTxt: { color: '#fff', fontSize: 15, fontFamily: 'Poppins-Medium' },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backTxt: { fontSize: 14, fontFamily: 'Poppins-Medium', color: PURPLE },
  publishBtn: {
    backgroundColor: PURPLE, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8,
  },
  publishTxt: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 14 },
});
