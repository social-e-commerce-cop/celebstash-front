import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#7126D0';
const { width } = Dimensions.get('window');

interface VoiceRecorderProps {
  onSend: (duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel, isRecording }) => {
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10,
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) slideX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -100) {
          onCancel();
        }
        Animated.spring(slideX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

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
            {Array.from({ length: 20 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  { height: 4 + Math.random() * 14, opacity: 0.5 + Math.random() * 0.5 },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Send button */}
        <TouchableOpacity style={styles.sendBtn} onPress={() => onSend(duration)} activeOpacity={0.8}>
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
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default VoiceRecorder;
