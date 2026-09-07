import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Dimensions, FlatList, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { SelectedMedia, PURPLE } from './CreatePostTypes';

const { width: W } = Dimensions.get('window');
const TILE = (W - 4) / 3;

interface Props {
  selected: SelectedMedia[];
  activeIndex: number;
  onToggle: (asset: { id: string; uri: string; type: 'image' | 'video' }) => void;
  onActiveChange: (i: number) => void;
  isMulti: boolean;
  onMultiToggle: () => void;
}

export default function StepMedia({ selected, activeIndex, onToggle, onActiveChange, isMulti, onMultiToggle }: Props) {
  const [assets, setAssets] = useState<{ id: string; uri: string; type: 'image' | 'video' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    setPermissionDenied(false);
    try {
      let perm = await ImagePicker.requestMediaLibraryPermissionsAsync().catch(() => null);

      if (!perm?.granted) {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const opts: MediaLibrary.AssetsOptions = {
        first: 100,
        mediaType: ['photo', 'video'],
        sortBy: [MediaLibrary.SortBy.creationTime],
      };

      const media = await MediaLibrary.getAssetsAsync(opts).catch(() => null);
      if (media && media.assets) {
        const mapped = media.assets.map(a => ({
          id: a.id,
          uri: a.uri,
          type: (a.mediaType === 'video' ? 'video' : 'image') as 'image' | 'video',
        }));
        setAssets(mapped);

        // Auto-select the first asset into the top preview when nothing is selected yet
        if (mapped.length > 0 && selected.length === 0) {
          onToggle(mapped[0]);
        }
      } else {
        setAssets([]);
      }
    } catch {
      setAssets([]);
    }
    setLoading(false);
  };

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      onToggle({ id: `cam_${Date.now()}`, uri: a.uri, type: a.type === 'video' ? 'video' : 'image' });
    }
  };

  const handleSystemGalleryPicker = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.85,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        res.assets.forEach(a => {
          onToggle({
            id: `pick_${Date.now()}_${Math.random()}`,
            uri: a.uri,
            type: a.type === 'video' ? 'video' : 'image',
          });
        });
      }
    } catch (err) {
      console.log('System image picker error:', err);
    }
  };

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current && selected.length > 0 && activeIndex < selected.length) {
      scrollRef.current.scrollTo({ x: activeIndex * W, animated: true });
    }
  }, [activeIndex, selected.length]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF' }}>
      {/* Large Preview Slide Carousel - White Background */}
      <View style={s.preview}>
        {selected.length > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / W);
              if (idx >= 0 && idx < selected.length) {
                onActiveChange(idx);
              }
            }}
          >
            {selected.map((item, idx) => (
              <Image
                key={item.id || idx}
                source={{ uri: item.uri }}
                style={{ width: W, height: W * 0.85 }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        ) : (
          <View style={s.previewEmpty}>
            <Ionicons name="images-outline" size={44} color={PURPLE} />
            <Text style={s.previewEmptyTxt}>No photo selected</Text>
          </View>
        )}
        {selected.length > 1 && (
          <>
            <View style={s.countBadge}>
              <Text style={s.countTxt}>{activeIndex + 1}/{selected.length}</Text>
            </View>
            <View style={s.dots}>
              {selected.map((_, i) => (
                <View key={i} style={[s.dot, i === activeIndex ? s.dotActive : s.dotInactive]} />
              ))}
            </View>
          </>
        )}
      </View>

      {/* Clean Bar */}
      <View style={s.bar}>
        <Text style={s.albumTxt}>Gallery</Text>

        <TouchableOpacity
          style={[s.multiBtn, isMulti && s.multiBtnOn]}
          onPress={onMultiToggle}
        >
          <Ionicons name="layers-outline" size={14} color={isMulti ? '#fff' : '#374151'} />
          <Text style={[s.multiTxt, isMulti && { color: '#fff' }]}>Select Multiple</Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      {loading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color={PURPLE} size="large" />
          <Text style={s.loadingTxt}>Loading photos…</Text>
        </View>
      ) : permissionDenied ? (
        <View style={s.loadingBox}>
          <Ionicons name="lock-closed-outline" size={40} color="#ccc" />
          <Text style={[s.loadingTxt, { textAlign: 'center', paddingHorizontal: 24 }]}>
            Gallery access was denied.{`\n`}Please enable it in your device Settings or use My Gallery picker.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <TouchableOpacity style={s.retryBtn} onPress={() => loadGallery()}>
              <Text style={s.retryTxt}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.retryBtn, { backgroundColor: '#F3F4F6' }]} onPress={handleSystemGalleryPicker}>
              <Text style={[s.retryTxt, { color: '#374151' }]}>My Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          <View style={s.grid}>
            {/* Camera Tile */}
            <TouchableOpacity style={[s.tile, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]} onPress={handleCamera}>
              <Ionicons name="camera" size={32} color={PURPLE} />
              <Text style={{ fontSize: 10, fontFamily: 'Poppins-Medium', color: PURPLE, marginTop: 2 }}>Camera</Text>
            </TouchableOpacity>

            {/* System File Picker Tile */}
            <TouchableOpacity style={[s.tile, { backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' }]} onPress={handleSystemGalleryPicker}>
              <Ionicons name="images-outline" size={30} color="#4B5563" />
              <Text style={{ fontSize: 10, fontFamily: 'Poppins-Medium', color: '#4B5563', marginTop: 2 }}>My Gallery</Text>
            </TouchableOpacity>

            {assets.map(asset => {
              const idx = selected.findIndex(m => m.id === asset.id);
              const isSel = idx >= 0;
              return (
                <TouchableOpacity
                  key={asset.id}
                  style={[s.tile, isSel && s.tileSelected]}
                  onPress={() => {
                    if (isSel) {
                      onActiveChange(idx);
                    } else {
                      onToggle(asset);
                    }
                  }}
                  onLongPress={() => { if (isSel) onToggle(asset); }}
                >
                  <Image source={{ uri: asset.uri }} style={s.tileImg} />
                  {isSel && (
                    <View style={s.badge}>
                      <Text style={s.badgeTxt}>{idx + 1}</Text>
                    </View>
                  )}
                  {asset.type === 'video' && (
                    <View style={s.vidBadge}>
                      <Ionicons name="videocam" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  preview: { width: '100%', height: W * 0.85, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F3F4F6' },
  previewImg: { width: '100%', height: '100%' },
  previewEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewEmptyTxt: { color: '#374151', marginTop: 6, fontSize: 13, fontFamily: 'Poppins-Medium' },
  emptyActionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  emptyActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: PURPLE, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18,
  },
  emptyActionTxt: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Bold' },
  countBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  countTxt: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-Bold' },
  dots: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { backgroundColor: PURPLE },
  dotInactive: { backgroundColor: 'rgba(0,0,0,0.2)' },
  bar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  albumBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  albumTxt: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111' },
  cameraBarBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  multiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  multiBtnOn: { backgroundColor: PURPLE },
  multiTxt: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#374151' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8, paddingTop: 40 },
  loadingTxt: { color: '#888', fontFamily: 'Poppins-Regular', fontSize: 13 },
  retryBtn: {
    marginTop: 8, backgroundColor: PURPLE,
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 16,
  },
  retryTxt: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 2 },
  tile: { width: TILE, height: TILE, overflow: 'hidden', position: 'relative' },
  tileSelected: { opacity: 0.8 },
  tileImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: {
    position: 'absolute', top: 5, right: 5,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontFamily: 'Poppins-Bold' },
  vidBadge: {
    position: 'absolute', bottom: 5, right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: 3,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingBottom: 30, paddingTop: 12,
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111', textAlign: 'center', marginBottom: 12 },
  albumRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  albumRowTxt: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Medium', color: '#111' },
  albumCount: { fontSize: 12, color: '#888', fontFamily: 'Poppins-Regular' },
});
