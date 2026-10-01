/**
 * VideoCallScreen.tsx
 *
 * The video call UI, kept ready for a real calling provider — but it places no call and does
 * not pretend to. There is no WebRTC layer, signalling server or calling provider in this
 * project, so the screen says so instead of simulating a session.
 *
 * It previously flipped itself to "connected" on a three-second timer, ran a fake duration
 * counter with a recording dot, showed a stock photo as the "local camera" feed, claimed the
 * call was end-to-end encrypted, and on exit pushed a "Video Call • 1:07" system message into
 * the conversation that was never sent to the backend and disappeared on refresh.
 *
 * To integrate a provider later, drive the state below from its session and render its tracks
 * in the two video surfaces — the layout and controls need no changes.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, avatar } = route.params ?? {};

  return (
    <View style={styles.container}>
      {/* Remote video surface — a provider's remote track renders here. */}
      <View style={styles.remoteVideo}>
        {!!avatar && <Image source={avatar} style={styles.videoPlaceholder} />}
        <BlurView intensity={100} style={StyleSheet.absoluteFill} tint="dark">
          <View style={styles.callingOverlay}>
            {!!avatar && <Image source={avatar} style={styles.avatarLarge} />}
            <Text style={styles.nameLarge}>{name ?? 'Call'}</Text>
            <Text style={styles.statusText}>Video calling isn&apos;t available yet</Text>
            <Text style={styles.subStatus}>
              This screen is ready for a calling provider. No call is placed and nothing is
              recorded in the conversation.
            </Text>
          </View>
        </BlurView>
      </View>

      {/* Top Header */}
      <SafeAreaView style={styles.topControls}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.encryption} />
          <View style={styles.iconBtn} />
        </View>
      </SafeAreaView>

      {/* Bottom Controls — inert until a provider is wired in, and visibly so. */}
      <SafeAreaView style={styles.bottomControls}>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={[styles.controlBtn, styles.controlBtnDisabled]} disabled>
            <Ionicons name="videocam" size={26} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.controlBtn, styles.controlBtnDisabled]} disabled>
            <Ionicons name="mic" size={26} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  subStatus: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },

  // Controls
  topControls: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.3)', paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  iconBtn: { padding: 8, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  encryption: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  bottomControls: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, paddingBottom: 30, paddingTop: 20, paddingHorizontal: 30, backgroundColor: 'rgba(0,0,0,0.4)' },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  controlBtnDisabled: { opacity: 0.4 },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
});
