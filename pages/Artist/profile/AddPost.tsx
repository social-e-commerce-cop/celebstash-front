import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, BackHandler, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import { CreatePostDraft, INITIAL_DRAFT, PostStep, SelectedMedia, PURPLE } from './CreatePostTypes';
import StepMedia from './StepMedia';
import StepEdit from './StepEdit';
import StepDetails from './StepDetails';
import StepPreview from './StepPreview';

const STEP_TITLES: Record<PostStep, string> = {
  1: 'New Post',
  2: 'Edit',
  3: 'Add Details',
  4: 'Preview',
};

export const CreatePostScreen = ({ navigation }: any) => {
  const [step, setStep] = useState<PostStep>(1);
  const [draft, setDraft] = useState<CreatePostDraft>(INITIAL_DRAFT);

  const hasDraftContent = draft.selectedMedia.length > 0 || draft.caption.length > 0;

  // Back handler — guard unsaved changes
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (step > 1) {
          setStep((s) => (s - 1) as PostStep);
          return true;
        }
        if (hasDraftContent) {
          Alert.alert(
            'Discard post?',
            'Your changes will be lost.',
            [
              { text: 'Keep Editing', style: 'cancel' },
              { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
            ]
          );
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [step, hasDraftContent, navigation])
  );

  const handleHeaderBack = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as PostStep);
      return;
    }
    if (hasDraftContent) {
      Alert.alert(
        'Discard post?',
        'Your changes will be lost.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleToggleAsset = (asset: { id: string; uri: string; type: 'image' | 'video' }) => {
    setDraft(prev => {
      const exists = prev.selectedMedia.findIndex(m => m.id === asset.id);
      if (exists >= 0) {
        if (prev.selectedMedia.length > 1) {
          const updated = prev.selectedMedia.filter(m => m.id !== asset.id);
          return { ...prev, selectedMedia: updated, activeIndex: 0 };
        }
        return prev;
      }
      const newItem: SelectedMedia = { id: asset.id, uri: asset.uri, type: asset.type };
      if (prev.isMultiSelect) {
        const updated = [...prev.selectedMedia, newItem];
        return { ...prev, selectedMedia: updated, activeIndex: updated.length - 1 };
      }
      return { ...prev, selectedMedia: [newItem], activeIndex: 0 };
    });
  };

  const canProceedStep1 = draft.selectedMedia.length > 0;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepMedia
            selected={draft.selectedMedia}
            activeIndex={draft.activeIndex}
            onToggle={handleToggleAsset}
            onActiveChange={(i) => setDraft(p => ({ ...p, activeIndex: i }))}
            isMulti={draft.isMultiSelect}
            onMultiToggle={() => setDraft(p => ({ ...p, isMultiSelect: !p.isMultiSelect }))}
          />
        );
      case 2:
        return (
          <StepEdit
            media={draft.selectedMedia}
            activeIndex={draft.activeIndex}
            filterName={draft.filterName}
            onFilterChange={(f) => setDraft(p => ({ ...p, filterName: f }))}
            onSkip={() => setStep(3)}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <StepDetails
            selectedMedia={draft.selectedMedia}
            caption={draft.caption}
            onCaptionChange={(t) => setDraft(p => ({ ...p, caption: t }))}
            taggedUsers={draft.taggedUsers}
            onTaggedUsersChange={(u) => setDraft(p => ({ ...p, taggedUsers: u }))}
            linkedProduct={draft.linkedProduct}
            onProductChange={(prod) => setDraft(p => ({ ...p, linkedProduct: prod }))}
          />
        );
      case 4:
        return (
          <StepPreview
            draft={draft}
            onBack={() => setStep(3)}
            onSuccess={() => {
              setDraft(INITIAL_DRAFT);
              navigation.goBack();
            }}
          />
        );
    }
  };

  const handleHeaderCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images', 'videos'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) {
      const a = res.assets[0];
      handleToggleAsset({
        id: `cam_${Date.now()}`,
        uri: a.uri,
        type: a.type === 'video' ? 'video' : 'image',
      });
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerLeft} onPress={handleHeaderBack}>
          {step === 1 ? (
            <Ionicons name="close" size={24} color="#111" />
          ) : (
            <Ionicons name="arrow-back" size={24} color="#111" />
          )}
        </TouchableOpacity>

        <Text style={s.headerTitle}>{STEP_TITLES[step]}</Text>

        {/* Right action */}
        {step === 1 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={s.camHeaderBtn} onPress={handleHeaderCamera}>
              <Ionicons name="camera" size={20} color={PURPLE} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.nextBtn, !canProceedStep1 && s.nextBtnDisabled]}
              onPress={() => canProceedStep1 && setStep(2)}
              disabled={!canProceedStep1}
            >
              <Text style={[s.nextBtnTxt, !canProceedStep1 && s.nextBtnTxtDisabled]}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
        {step === 2 && (
          <View style={{ width: 60 }} />
        )}
        {step === 3 && (
          <TouchableOpacity style={s.nextBtn} onPress={() => setStep(4)}>
            <Text style={s.nextBtnTxt}>Preview</Text>
          </TouchableOpacity>
        )}
        {step === 4 && <View style={{ width: 60 }} />}
      </View>

      {/* Step Indicator */}
      <View style={s.stepBar}>
        {([1, 2, 3, 4] as PostStep[]).map(n => (
          <View key={n} style={[s.stepDot, step >= n ? s.stepDotActive : s.stepDotInactive]} />
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderStep()}
      </View>
    </SafeAreaView>
  );
};

export default CreatePostScreen;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderColor: '#f0f0f0', backgroundColor: '#fff',
  },
  headerLeft: { width: 60, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' },
  camHeaderBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  nextBtn: {
    backgroundColor: PURPLE, paddingHorizontal: 18, paddingVertical: 7, borderRadius: 8,
  },
  nextBtnDisabled: { backgroundColor: '#E5E7EB' },
  nextBtnTxt: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 13 },
  nextBtnTxtDisabled: { color: '#9CA3AF' },
  stepBar: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  stepDot: { width: 28, height: 3, borderRadius: 2 },
  stepDotActive: { backgroundColor: PURPLE },
  stepDotInactive: { backgroundColor: '#E5E7EB' },
});
