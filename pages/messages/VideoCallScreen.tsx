import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { getConversationAvatar } from '@/data/mockChatData';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, avatar } = route.params;

  const [callState, setCallState] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCameraReversed, setIsCameraReversed] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    // Simulate connection
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

  // Auto-hide controls after 5 seconds in connected state
  useEffect(() => {
    let t: any;
    if (callState === 'connected' && controlsVisible) {
      t = setTimeout(() => setControlsVisible(false), 5000);
    }
    return () => clearTimeout(t);
  }, [callState, controlsVisible]);

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
            systemText: `Video Call • ${formatTime(duration)}`,
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
    <View style={styles.container}>
      {/* Remote Video Placeholder (Other user) */}
      <View style={styles.remoteVideo}>
        <Image source={avatar} style={styles.videoPlaceholder} />
        {callState === 'calling' && (
          <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark">
            <View style={styles.callingOverlay}>
              <Image source={avatar} style={styles.avatarLarge} />
              <Text style={styles.nameLarge}>{name}</Text>
              <Text style={styles.statusText}>Ringing...</Text>
            </View>
          </BlurView>
        )}
      </View>

      {/* Local Video Picture-in-Picture */}
      {callState === 'connected' && !isVideoOff && (
        <View style={styles.localVideoWrap}>
          <Image source={require('../../assets/images/storyItem.jpg')} style={styles.localVideo} />
        </View>
      )}

      <TouchableOpacity 
        activeOpacity={1} 
        style={StyleSheet.absoluteFill} 
        onPress={() => callState === 'connected' && setControlsVisible(p => !p)}
      >
        {/* Top Header */}
        {controlsVisible && (
          <SafeAreaView style={styles.topControls}>
            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-down" size={28} color="#fff" />
              </TouchableOpacity>
              <View style={styles.encryption}>
                <Ionicons name="lock-closed" size={12} color="#fff" />
                <Text style={styles.encryptionText}>End-to-end encrypted</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setIsCameraReversed(!isCameraReversed)}>
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {callState === 'connected' && (
              <View style={styles.durationBadge}>
                <View style={styles.redDot} />
                <Text style={styles.durationText}>{formatTime(duration)}</Text>
              </View>
            )}
          </SafeAreaView>
        )}

        {/* Bottom Controls */}
        {controlsVisible && (
          <SafeAreaView style={styles.bottomControls}>
            <View style={styles.controlsRow}>
              <TouchableOpacity style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]} onPress={() => setIsVideoOff(!isVideoOff)}>
                <Ionicons name={isVideoOff ? "videocam-off" : "videocam"} size={26} color={isVideoOff ? '#000' : '#fff'} />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.controlBtn, isMuted && styles.controlBtnActive]} onPress={() => setIsMuted(!isMuted)}>
                <Ionicons name={isMuted ? "mic-off" : "mic"} size={26} color={isMuted ? '#000' : '#fff'} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
                <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  
  // Videos
  remoteVideo: { flex: 1, backgroundColor: '#111' },
  videoPlaceholder: { width: '100%', height: '100%', resizeMode: 'cover' },
  callingOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.1 },
  avatarLarge: { width: 140, height: 140, borderRadius: 70, marginBottom: 24, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  nameLarge: { fontSize: 24, fontFamily: 'Poppins-Bold', color: '#fff', marginBottom: 8 },
  statusText: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  
  localVideoWrap: {
    position: 'absolute', top: 120, right: 20, width: 100, height: 140,
    borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#fff',
    backgroundColor: '#333', zIndex: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  localVideo: { width: '100%', height: '100%', resizeMode: 'cover' },

  // Controls
  topControls: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.3)', paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  iconBtn: { padding: 8, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  encryption: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  encryptionText: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#fff' },
  durationBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, gap: 6, marginTop: 8 },
  redDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  durationText: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#fff' },

  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, paddingBottom: 30, paddingTop: 20, paddingHorizontal: 30, backgroundColor: 'rgba(0,0,0,0.4)' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  controlBtnActive: { backgroundColor: '#fff' },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
});
