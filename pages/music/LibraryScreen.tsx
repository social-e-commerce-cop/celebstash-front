import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Polygon, Rect } from 'react-native-svg';
import { useLibrary, Song } from '@/lib/libraryStore';
import { useMusicPlayer, playSong, pauseSong, resetPlayer, togglePlay, formatTime } from '@/lib/musicPlayerStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

// ─── Animated Equalizer Component ("Earcbeats / Waveform") ────────────────────
const Equalizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const bar1 = useRef(new Animated.Value(4)).current;
  const bar2 = useRef(new Animated.Value(12)).current;
  const bar3 = useRef(new Animated.Value(6)).current;
  const bar4 = useRef(new Animated.Value(9)).current;

  useEffect(() => {
    let anim: any;
    if (isPlaying) {
      const createLoop = (val: Animated.Value, min: number, max: number, duration: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(val, { toValue: max, duration, useNativeDriver: false }),
            Animated.timing(val, { toValue: min, duration, useNativeDriver: false }),
          ])
        );
      };

      anim = Animated.parallel([
        createLoop(bar1, 4, 18, 400),
        createLoop(bar2, 5, 20, 500),
        createLoop(bar3, 3, 16, 350),
        createLoop(bar4, 4, 17, 450),
      ]);
      anim.start();
    } else {
      Animated.parallel([
        Animated.timing(bar1, { toValue: 4, duration: 250, useNativeDriver: false }),
        Animated.timing(bar2, { toValue: 4, duration: 250, useNativeDriver: false }),
        Animated.timing(bar3, { toValue: 4, duration: 250, useNativeDriver: false }),
        Animated.timing(bar4, { toValue: 4, duration: 250, useNativeDriver: false }),
      ]).start();
    }

    return () => {
      if (anim) anim.stop();
    };
  }, [isPlaying]);

  return (
    <View style={styles.eqContainer}>
      <Animated.View style={[styles.eqBar, { height: bar1 }]} />
      <Animated.View style={[styles.eqBar, { height: bar2 }]} />
      <Animated.View style={[styles.eqBar, { height: bar3 }]} />
      <Animated.View style={[styles.eqBar, { height: bar4 }]} />
    </View>
  );
};

// ─── Main Library Screen ───────────────────────────────────────────────────────
const LibraryScreen = () => {
  const navigation = useNavigation<any>();
  const songs = useLibrary();
  const player = useMusicPlayer();

  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Pop', 'Afrobeats', 'Upbeat', 'Chill'];

  const [now, setNow] = useState(Date.now());

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter out songs that have expired for active gameplay auto-play
  const activeSongs = songs.filter(song => !song.expiresAt || song.expiresAt > now);

  const filteredSongs = activeFilter === 'All'
    ? songs
    : songs.filter(song => song.genre === activeFilter);

  // Auto-play first active song on mount if no song is loaded
  useEffect(() => {
    if (!player.currentSong && activeSongs.length > 0) {
      // Load first song but keep it paused initially
      playSong(activeSongs[0]);
      pauseSong();
    }
  }, [songs]);

  // Handle current song expiration
  useEffect(() => {
    if (player.currentSong && player.currentSong.expiresAt && player.currentSong.expiresAt <= now) {
      resetPlayer();
    }
  }, [now, player.currentSong]);

  const formatRemainingTime = (expiresAt: number) => {
    const diff = expiresAt - now;
    if (diff <= 0) return 'Expired';
    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs % 60}s`;
    }
    return `${secs}s`;
  };

  const handleSongPress = (song: Song) => {
    if (player.currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song);
    }
  };

  const handleShufflePlay = () => {
    if (filteredSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSongs.length);
      playSong(filteredSongs[randomIndex]);
    }
  };

  const progressPercent = player.durationSeconds > 0 
    ? (player.currentTime / player.durationSeconds) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Library</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Horizontal Filter Pills */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filters.map(filter => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Subheader: Song Count & Shuffle */}
      <View style={styles.subHeader}>
        <Text style={styles.songCount}>{filteredSongs.length} Songs</Text>
        <TouchableOpacity onPress={handleShufflePlay} style={styles.shuffleBtn}>
          <Ionicons name="shuffle" size={24} color={PURPLE} />
        </TouchableOpacity>
      </View>

      {/* Songs Scroll List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.songsListContent}
      >
        {filteredSongs.map((song) => {
          const isExpired = song.expiresAt ? song.expiresAt <= now : false;
          const isCurrent = player.currentSong?.id === song.id;
          const isThisPlaying = isCurrent && player.isPlaying;

          return (
            <TouchableOpacity
              key={song.id}
              style={[
                styles.songRow,
                isCurrent && styles.songRowActive,
                isExpired && styles.songRowExpired
              ]}
              activeOpacity={isExpired ? 1 : 0.7}
              onPress={() => {
                if (isExpired) {
                  Alert.alert(
                    "Access Expired",
                    `Your 3-day access period for "${song.title}" has ended. Please visit the store to repurchase!`,
                    [{ text: "OK" }]
                  );
                } else {
                  handleSongPress(song);
                }
              }}
            >
              {/* Cover Art */}
              <Image source={song.image} style={styles.songImage} />

              {/* Info Column */}
              <View style={styles.songInfo}>
                <View style={styles.titleContainer}>
                  <Text 
                    style={[
                      styles.songName,
                      isCurrent && styles.songNameActive,
                      isExpired && styles.songNameExpiredText
                    ]} 
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                  {isThisPlaying && <Equalizer isPlaying={true} />}
                </View>
                <View style={styles.artistRow}>
                  <Text style={styles.songArtist}>By {song.artist}</Text>
                  {song.expiresAt && (
                    <View style={[styles.expiryBadge, isExpired && styles.expiryBadgeExpired]}>
                      <Ionicons 
                        name={isExpired ? "lock-closed-outline" : "time-outline"} 
                        size={12} 
                        color={isExpired ? "#DC2626" : "#D97706"} 
                      />
                      <Text style={[styles.expiryText, isExpired && styles.expiryTextExpired]}>
                        {isExpired ? "Access Ended" : `${formatRemainingTime(song.expiresAt)} left`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Play / Pause / Lock Button */}
              <TouchableOpacity
                style={[styles.playButtonCircle, isExpired && styles.lockButtonCircle]}
                onPress={() => {
                  if (isExpired) {
                    Alert.alert(
                      "Access Expired",
                      `Your 3-day access period for "${song.title}" has ended. Please visit the store to repurchase!`,
                      [{ text: "OK" }]
                    );
                  } else {
                    handleSongPress(song);
                  }
                }}
              >
                <Ionicons
                  name={isExpired ? "lock-closed" : (isThisPlaying ? "pause" : "play")}
                  size={16}
                  color="#fff"
                  style={(!isThisPlaying && !isExpired) && { marginLeft: 2 }} // center play triangle slightly
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Floating Premium Player */}
      {player.currentSong && (
        <View style={styles.playerContainer}>
          {/* ── Row 1: album art + info + play/pause ── */}
          <View style={styles.playerInner}>
            <View style={styles.playerLeft}>
              <Image source={player.currentSong.image} style={styles.playerImage} />
              <View style={styles.playerInfo}>
                <Text style={styles.playerSongTitle} numberOfLines={1}>
                  {player.currentSong.title}
                </Text>
                <Text style={styles.playerArtistName} numberOfLines={1}>
                  {player.currentSong.artist}
                </Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.playerControls}>
              <TouchableOpacity onPress={togglePlay} style={styles.playerPlayBtn}>
                <Ionicons
                  name={player.isPlaying ? 'pause' : 'play'}
                  size={18}
                  color="#fff"
                  style={!player.isPlaying && { marginLeft: 2 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Row 2: Scrubber + timestamps ── */}
          <View style={styles.scrubberSection}>
            {/* Track bar */}
            <View style={styles.scrubberTrack}>
              {/* Filled portion */}
              <View
                style={[
                  styles.scrubberFill,
                  { width: `${progressPercent}%` },
                ]}
              />
              {/* Thumb dot that moves with the fill */}
              <View
                style={[
                  styles.scrubberThumb,
                  { left: `${progressPercent}%` },
                ]}
              />
            </View>

            {/* Time labels */}
            <View style={styles.scrubberTimes}>
              <Text style={styles.timeElapsed}>{formatTime(player.currentTime)}</Text>
              <Text style={styles.timeRemaining}>
                -{formatTime(Math.max(0, player.durationSeconds - player.currentTime))}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: height * 0.05,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#F3F4F6', // Muted container color but darker/bold text, matching mockup pill design
  },
  filterChipText: {
    color: '#7C7C7C',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  filterChipTextActive: {
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  songCount: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#303030',
  },
  shuffleBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Leave space for mini-player
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  songRowActive: {
    backgroundColor: '#F9F6FF',
    borderRadius: 10,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 8, // Smooth rounded corners
    marginRight: 14,
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  songName: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    maxWidth: width * 0.5,
  },
  songNameActive: {
    color: PURPLE,
  },
  songArtist: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#7C7C7C',
  },
  playButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Equalizer styling
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    gap: 2,
  },
  eqBar: {
    width: 2.5,
    backgroundColor: PURPLE,
    borderRadius: 1,
  },
  // Floating bottom mini-player
  playerContainer: {
    position: 'absolute',
    bottom: 40,
    left: 14,
    right: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(113, 38, 208, 0.12)',
    overflow: 'hidden',
    paddingTop: 12,
    paddingBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 65 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: { elevation: 10 },
    }),
  },
  playerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  playerImage: {
    width: 42,
    height: 42,
    borderRadius: 10,
    marginRight: 10,
  },
  playerInfo: {
    flex: 1,
  },
  playerSongTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    lineHeight: 18,
  },
  playerArtistName: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#7C7C7C',
    marginTop: 1,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ── Scrubber ──
  scrubberSection: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  scrubberTrack: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 6,
  },
  scrubberFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PURPLE,
    // centre the dot on the fill boundary
    marginLeft: -6,
    top: -4,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
  },
  scrubberTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeElapsed: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
  },
  timeRemaining: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#ABABAB',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  expiryText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#D97706',
  },
  songRowExpired: {
    opacity: 0.55,
  },
  songNameExpiredText: {
    color: '#7C7C7C',
    textDecorationLine: 'line-through',
  },
  expiryBadgeExpired: {
    backgroundColor: '#FEE2E2',
  },
  expiryTextExpired: {
    color: '#DC2626',
  },
  lockButtonCircle: {
    backgroundColor: '#EF4444',
  },
});
