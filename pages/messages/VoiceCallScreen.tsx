/**
 * VoiceCallScreen.tsx
 *
 * The call UI, kept ready for a real calling provider — but it does not place a call, and it
 * does not pretend to. There is no WebRTC layer, no signalling server and no calling provider
 * in this project, so the screen states that plainly instead of simulating a connection.
 *
 * It previously flipped itself to "connected" on a three-second timer, ran a fake duration
 * counter, claimed the call was end-to-end encrypted, and on exit pushed a "Voice Call • 1:07"
 * system message into the conversation that was never sent to the backend and vanished on
 * refresh. All of that is removed: a call log must come from a real call.
 *
 * To integrate a provider later, replace the placeholder state below with its session state and
 * wire the existing mute/speaker/end controls to it — the layout needs no changes.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { height } = Dimensions.get('window');

export default function VoiceCallScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { name, avatar } = route.params ?? {};

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blur */}
      {!!avatar && (
        <Image source={avatar} style={[StyleSheet.absoluteFill, { opacity: 0.2 }]} blurRadius={30} />
      )}
      <BlurView intensity={80} style={StyleSheet.absoluteFill} tint="dark" />

      {/* Top Section */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.encryption} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileArea}>
        <View style={styles.avatarRing}>
          {!!avatar && <Image source={avatar} style={styles.avatar} />}
        </View>
        <Text style={styles.name}>{name ?? 'Call'}</Text>
        <Text style={styles.status}>Voice calling isn&apos;t available yet</Text>
        <Text style={styles.subStatus}>
          This screen is ready for a calling provider. No call is placed and nothing is recorded
          in the conversation.
        </Text>
      </View>

      {/* Controls — inert until a provider is wired in, and visibly so. */}
      <View style={styles.controlsArea}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.controlBtnDisabled, isSpeaker && styles.controlBtnActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
            disabled
          >
            <Ionicons name="volume-high" size={26} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.controlBtnDisabled, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
            disabled
          >
            <Ionicons name="mic" size={26} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallBtn} onPress={() => navigation.goBack()}>
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

  profileArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.1 },
  avatarRing: { width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  avatar: { width: 140, height: 140, borderRadius: 70 },
  name: { fontSize: 24, fontFamily: 'Poppins-Bold', color: '#fff', marginBottom: 8 },
  status: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  subStatus: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },

  controlsArea: { paddingBottom: 60, paddingHorizontal: 30 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 40 },
  controlBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  controlBtnDisabled: { opacity: 0.4 },
  controlBtnActive: { backgroundColor: '#fff' },
  endCallBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
});
