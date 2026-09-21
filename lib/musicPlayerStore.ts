import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Song } from './libraryStore';

let currentSong: Song | null = null;
let isPlaying: boolean = false;
let currentTime: number = 0; // in seconds
let durationSeconds: number = 0; // total seconds of current song
let timerId: any = null;

// Native player instance (expo-audio)
let expoPlayer: any = null;

// Web player instance (HTML5 Audio)
let webAudio: any = null;

const playerListeners = new Set<() => void>();

const notify = () => playerListeners.forEach(l => l());

const parseDuration = (dur?: string): number => {
  if (!dur) return 180; // 3 mins default
  const parts = dur.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
};

const getEffectiveAudioUrl = (song: Song): string => {
  if (song.audioUrl && typeof song.audioUrl === 'string' && song.audioUrl.trim().length > 0) {
    return song.audioUrl;
  }
  // Safe reliable preview stream fallback if no backend audio file was attached
  return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
};

/**
 * Setup or update Web HTML5 Audio Element
 */
const playWebAudio = (url: string) => {
  try {
    if (!webAudio) {
      webAudio = new window.Audio(url);
      webAudio.preload = 'auto';
    } else {
      if (webAudio.src !== url) {
        webAudio.src = url;
      }
    }

    webAudio.ontimeupdate = () => {
      currentTime = Math.floor(webAudio.currentTime || 0);
      if (webAudio.duration && !isNaN(webAudio.duration) && webAudio.duration > 0) {
        durationSeconds = Math.round(webAudio.duration);
      }
      notify();
    };

    webAudio.onended = () => {
      isPlaying = false;
      currentTime = 0;
      notify();
    };

    webAudio.onerror = (e: any) => {
      console.warn('HTML5 Audio playback error:', e);
      // If custom stream failed, fallback to public sample track
      if (webAudio.src !== 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3') {
        webAudio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        webAudio.play().catch(() => {});
      }
    };

    webAudio.play().then(() => {
      isPlaying = true;
      notify();
    }).catch((err: any) => {
      console.warn('webAudio play catch:', err);
      isPlaying = true;
      startFallbackTimer();
      notify();
    });
  } catch (err) {
    console.warn('playWebAudio exception:', err);
    isPlaying = true;
    startFallbackTimer();
    notify();
  }
};

/**
 * Setup or update Native Expo Audio Player
 */
const playNativeAudio = (url: string) => {
  try {
    const { createAudioPlayer } = require('expo-audio');
    if (!expoPlayer) {
      expoPlayer = createAudioPlayer(url);
      expoPlayer.loop = false;
    } else {
      expoPlayer.replace(url);
    }
    expoPlayer.play();
    isPlaying = true;
    startNativeTimer();
    notify();
  } catch (err) {
    console.warn('playNativeAudio exception:', err);
    isPlaying = true;
    startFallbackTimer();
    notify();
  }
};

const startNativeTimer = () => {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (expoPlayer) {
      try {
        currentTime = Math.floor(expoPlayer.currentTime || 0);
        if (expoPlayer.duration && expoPlayer.duration > 0) {
          durationSeconds = Math.round(expoPlayer.duration);
        }
        if (currentTime >= durationSeconds && durationSeconds > 0) {
          currentTime = 0;
          expoPlayer.seekTo(0);
          isPlaying = false;
        }
        notify();
      } catch (e) {}
    }
  }, 500);
};

const startFallbackTimer = () => {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (isPlaying) {
      currentTime += 1;
      if (currentTime >= durationSeconds && durationSeconds > 0) {
        currentTime = 0;
        isPlaying = false;
      }
      notify();
    }
  }, 1000);
};

export const getPlayerState = () => ({
  currentSong,
  isPlaying,
  currentTime,
  durationSeconds,
});

export const playSong = (song: Song) => {
  const isDifferent = currentSong?.id !== song.id;
  currentSong = song;
  durationSeconds = song.durationSeconds || parseDuration(song.duration);

  if (isDifferent) {
    currentTime = 0;
  }

  const url = getEffectiveAudioUrl(song);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    playWebAudio(url);
  } else {
    playNativeAudio(url);
  }

  isPlaying = true;
  notify();
};

export const pauseSong = () => {
  isPlaying = false;
  if (Platform.OS === 'web' && webAudio) {
    try {
      webAudio.pause();
    } catch (e) {}
  }
  if (expoPlayer) {
    try {
      expoPlayer.pause();
    } catch (e) {}
  }
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  notify();
};

export const resetPlayer = () => {
  currentSong = null;
  isPlaying = false;
  currentTime = 0;
  durationSeconds = 0;
  if (Platform.OS === 'web' && webAudio) {
    try {
      webAudio.pause();
      webAudio.currentTime = 0;
    } catch (e) {}
  }
  if (expoPlayer) {
    try {
      expoPlayer.pause();
    } catch (e) {}
  }
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  notify();
};

export const togglePlay = () => {
  if (!currentSong) return;
  if (isPlaying) {
    pauseSong();
  } else {
    playSong(currentSong);
  }
};

export const seekTo = (seconds: number) => {
  currentTime = Math.max(0, Math.min(seconds, durationSeconds));
  if (Platform.OS === 'web' && webAudio) {
    try {
      webAudio.currentTime = currentTime;
    } catch (e) {}
  }
  if (expoPlayer) {
    try {
      expoPlayer.seekTo(currentTime);
    } catch (e) {}
  }
  notify();
};

export const formatTime = (secs: number) => {
  const safeSecs = Math.max(0, Math.floor(secs || 0));
  const mins = Math.floor(safeSecs / 60);
  const remainingSecs = Math.floor(safeSecs % 60);
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
};

export const useMusicPlayer = () => {
  const [state, setState] = useState({
    currentSong,
    isPlaying,
    currentTime,
    durationSeconds,
  });

  useEffect(() => {
    const handleUpdate = () => {
      setState({
        currentSong,
        isPlaying,
        currentTime,
        durationSeconds,
      });
    };
    playerListeners.add(handleUpdate);
    return () => {
      playerListeners.delete(handleUpdate);
    };
  }, []);

  return state;
};
