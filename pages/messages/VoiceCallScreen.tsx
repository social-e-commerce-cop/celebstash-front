import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function VoiceCallScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, avatar } = route.params;

  const [callState, setCallState] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Simulate connection after 3 seconds
    const t = setTimeout(() => setCallState('connected'), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let t: any;
    if (callState === 'connected') {
      t = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(t);
  }, [callState]);

  useEffect(() => {
    if (callState === 'calling') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [callState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      navigation.navigate({
        name: 'ChatScreen',
        params: {
          newCallMessage: {
            id: String(Date.now()),
            conversationId: route.params.conversationId ?? 'c1',
            senderId: 'me',
            type: 'system',
            systemText: `Voice Call • ${formatTime(duration)}`,
            timestamp: new Date().toISOString(),
            readStatus: 'read',
            reactions: [],
            isEdited: false,
            isDeleted: false,
            isPinned: false,
            isStarred: false,
          }
        },
        merge: true
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blur */}
      <Image source={avatar} style={[StyleSheet.absoluteFill, { opacity: 0.2 }]} blurRadius={30} />
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      {/* Top Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.encryption}>
          <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
          <Text style={styles.encryptionText}>End-to-end encrypted</Text>
        </View>
      </View>

      {/* Profile Section */}
      <View style={styles.profileArea}>
        <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
          <Image source={avatar} style={styles.avatar} />
        </Animated.View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.status}>
          {callState === 'calling' ? 'Ringing...' : callState === 'ended' ? 'Call Ended' : formatTime(duration)}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsArea}>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]} onPress={() => setIsSpeaker(!isSpeaker)}>
            <Ionicons name="volume-high" size={26} color={isSpeaker ? '#000' : '#fff'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlBtn, isMuted && styles.controlBtnActive]} onPress={() => setIsMuted(!isMuted)}>
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color={isMuted ? '#000' : '#fff'} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  backBtn: { padding: 8 },
  encryption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginRight: 44 },
  encryptionText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  
  profileArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.1 },
  avatarRing: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  name: { fontSize: 24, fontFamily: 'Poppins-Bold', color: '#fff', marginBottom: 8 },
  status: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  
  controlsArea: { paddingBottom: 60, paddingHorizontal: 30 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 40 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  controlBtnActive: { backgroundColor: '#fff' },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
});
