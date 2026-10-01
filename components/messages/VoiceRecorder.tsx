/**
 * VoiceRecorder.tsx
 *
 * Records a real voice note with expo-audio and hands the resulting file to the caller.
 *
 * This used to be animation only: a timer, a pulsing dot and a waveform of random bar heights,
 * with "send" passing just a duration. No microphone was ever opened, so the VOICE message that
 * reached the backend had no audio attached and there was nothing to play back. It now asks for
 * the microphone permission, records to a file, and passes that file's uri up so it can be
 * uploaded like any other attachment.
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';

const PURPLE = '#7126D0';

interface VoiceRecorderProps {
  /** Receives the recorded file and how long it ran. A null uri means nothing was captured. */
  onSend: (uri: string | null, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
}

/** Fixed bar heights: the waveform is decorative, and random values re-rolled every render. */
const WAVE_HEIGHTS = [6, 11, 8, 15, 9, 13, 7, 16, 10, 12, 6, 14, 9, 11, 17, 8, 12, 7, 15, 10];

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel, isRecording }) => {
  const [duration, setDuration] = useState(0);
  const [busy, setBusy] = useState(false);
  // useMemo rather than useRef().current: reading a ref during render is what react-hooks/refs
  // flags, and these only need creating once per mount.
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const slideX = useMemo(() => new Animated.Value(0), []);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  // The recorder object identity is stable but its methods are not safe to call after unmount,
  // so a ref tracks whether this component is still mounted before touching it.
  const startedRef = useRef(false);

  const stopRecorder = useCallback(async () => {
    if (!startedRef.current) return null;
    startedRef.current = false;
    try {
      await recorder.stop();
      return recorder.uri ?? null;
    } catch (e) {
      console.warn('[VoiceRecorder] stop failed:', e);
      return null;
    }
  }, [recorder]);

  useEffect(() => {
    let cancelled = false;

    if (isRecording) {
      (async () => {
        const { granted } = await requestRecordingPermissionsAsync();
        if (cancelled) return;
        if (!granted) {
          Alert.alert('Microphone needed', 'Allow microphone access to record a voice message.');
          onCancel();
          return;
        }
        try {
          await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
          await recorder.prepareToRecordAsync();
          if (cancelled) return;
          recorder.record();
          startedRef.current = true;
          setDuration(0);
          timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        } catch (e) {
          console.warn('[VoiceRecorder] could not start recording:', e);
          if (!cancelled) {
            Alert.alert('Could not record', 'The microphone is unavailable right now.');
            onCancel();
          }
        }
      })();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      pulseAnim.setValue(1);
    }

    return () => {
      cancelled = true;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const handleSend = async () => {
    if (busy) return;
    setBusy(true);
    if (timerRef.current) clearInterval(timerRef.current);
    const uri = await stopRecorder();
    setBusy(false);
    onSend(uri, duration);
  };

  const handleCancel = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await stopRecorder();   // discard: the caller is not given the uri
    onCancel();
  }, [stopRecorder, onCancel]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // react-hooks/refs flags any function handed a closure that could touch a ref, because it
  // cannot tell when that closure runs. PanResponder.create only stores these callbacks and
  // invokes them on gestures, never during render, so the warning does not apply here.
  /* eslint-disable react-hooks/refs */
  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) slideX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -100) {
          handleCancel();
        }
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
    [slideX, handleCancel],
  );
  /* eslint-enable react-hooks/refs */

  if (!isRecording) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { transform: [{ translateX: slideX }] }]} {...panResponder.panHandlers}>
        {/* Cancel hint */}
        <View style={styles.cancelHint}>
          <Ionicons name="chevron-back" size={14} color="#9CA3AF" />
          <Text style={styles.cancelText}>Slide to cancel</Text>
        </View>

        {/* Recording indicator */}
        <View style={styles.recordingRow}>
          <Animated.View style={[styles.redDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>

          {/* Waveform */}
          <View style={styles.waveform}>
            {WAVE_HEIGHTS.map((h, i) => (
              <View key={i} style={[styles.waveBar, { height: h }]} />
            ))}
          </View>
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={[styles.sendBtn, busy && styles.sendBtnBusy]}
          onPress={handleSend}
          disabled={busy}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cancelHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cancelText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  recordingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  durationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
    minWidth: 38,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 20,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 2,
    backgroundColor: PURPLE,
    opacity: 0.7,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnBusy: { opacity: 0.5 },
});

export default VoiceRecorder;
