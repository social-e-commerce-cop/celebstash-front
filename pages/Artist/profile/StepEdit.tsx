import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ScrollView, Dimensions,
} from 'react-native';
import { SelectedMedia, PURPLE } from './CreatePostTypes';

const { width: W } = Dimensions.get('window');

const FILTERS: { name: 'none' | 'warm' | 'cool' | 'bw'; label: string; tint?: string }[] = [
  { name: 'none', label: 'Original' },
  { name: 'warm', label: 'Warm', tint: 'rgba(255,160,0,0.18)' },
  { name: 'cool', label: 'Cool', tint: 'rgba(0,120,255,0.18)' },
  { name: 'bw', label: 'B&W', tint: 'rgba(0,0,0,0.35)' },
];

interface Props {
  media: SelectedMedia[];
  activeIndex: number;
  filterName: 'none' | 'warm' | 'cool' | 'bw';
  onFilterChange: (f: 'none' | 'warm' | 'cool' | 'bw') => void;
  onSkip: () => void;
  onNext: () => void;
}

export default function StepEdit({ media, activeIndex, filterName, onFilterChange, onSkip, onNext }: Props) {
  const item = media[activeIndex] ?? media[0];
  const activeFilter = FILTERS.find(f => f.name === filterName) ?? FILTERS[0];

  return (
    <View style={{ flex: 1 }}>
      {/* Image Preview with Filter Overlay */}
      <View style={s.previewBox}>
        {item && <Image source={{ uri: item.uri }} style={s.img} resizeMode="cover" />}
        {activeFilter.tint && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: activeFilter.tint }]} />
        )}
        {filterName === 'bw' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0)', opacity: 0 }]} />
        )}
      </View>

      {/* Filter Strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterStrip} contentContainerStyle={{ padding: 12, gap: 16 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.name} style={s.filterItem} onPress={() => onFilterChange(f.name)}>
            {item && (
              <View style={[s.filterThumb, filterName === f.name && s.filterThumbActive]}>
                <Image source={{ uri: item.uri }} style={s.filterThumbImg} resizeMode="cover" />
                {f.tint && <View style={[StyleSheet.absoluteFill, { backgroundColor: f.tint, borderRadius: 8 }]} />}
              </View>
            )}
            <Text style={[s.filterLabel, filterName === f.name && s.filterLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.hint}>
        <Text style={s.hintTxt}>Tap a filter to preview. Long-press the image to reset.</Text>
      </View>

      {/* Action Row */}
      <View style={s.row}>
        <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
          <Text style={s.skipTxt}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nextBtn} onPress={onNext}>
          <Text style={s.nextTxt}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  previewBox: { width: '100%', height: W * 0.85, backgroundColor: '#111', position: 'relative' },
  img: { width: '100%', height: '100%' },
  filterStrip: { borderBottomWidth: 1, borderColor: '#f0f0f0', maxHeight: 110 },
  filterItem: { alignItems: 'center', gap: 6 },
  filterThumb: { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  filterThumbActive: { borderColor: PURPLE },
  filterThumbImg: { width: '100%', height: '100%' },
  filterLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#555' },
  filterLabelActive: { color: PURPLE, fontFamily: 'Poppins-Bold' },
  hint: { paddingHorizontal: 16, paddingVertical: 8 },
  hintTxt: { fontSize: 12, color: '#aaa', fontFamily: 'Poppins-Regular' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderColor: '#f0f0f0' },
  skipBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  skipTxt: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#555' },
  nextBtn: { backgroundColor: PURPLE, paddingVertical: 10, paddingHorizontal: 28, borderRadius: 8 },
  nextTxt: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 14 },
});
