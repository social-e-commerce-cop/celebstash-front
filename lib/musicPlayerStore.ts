import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Song } from './libraryStore';
import { musicService } from './musicService';

/**
 * Single app-wide audio player (expo-audio on native, HTMLAudioElement on web).
 *
 * The 5-second limit for unpurchased tracks is enforced by the backend, which only ever sends the
 * preview window for them. The timer here just stops playback cleanly at the limit and reports
 * "preview ended" so the UI can offer the purchase.
 */
let currentSong: Song | null = null;
let isPlaying = false;
let isLoading = false;
let previewEnded = false;
let playerError: string | null = null;
let currentTime = 0; // in seconds
let durationSeconds = 0; // total seconds of current song
let timerId: any = null;
let loadStartedAt = 0;

// Native player instance (expo-audio)
let expoPlayer: any = null;
let expoSource: string | null = null;

// Web player instance (HTML5 Audio)
let webAudio: any = null;

const LOAD_TIMEOUT_MS = 20000;

const playerListeners = new Set<() => void>();
const previewEndedListeners = new Set<(song: Song) => void>();

const notify = () => playerListeners.forEach(l => l());
const notifyPreviewEnded = (song: Song) => previewEndedListeners.forEach(l => {
  try { l(song); } catch (e) {}
});

export const onPreviewEnded = (listener: (song: Song) => void) => {
  previewEndedListeners.add(listener);
  return () => { previewEndedListeners.delete(listener); };
};

const parseDuration = (dur?: string): number => {
  if (!dur) return 0;
  const parts = dur.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

const previewLimit = (song: Song | null): number => {
  if (!song) return 0;
  if (song.maxPlaySeconds && song.maxPlaySeconds > 0) return song.maxPlaySeconds;
  return song.isPreview ? 5 : 0;
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

const fail = (message: string) => {
  isPlaying = false;
  isLoading = false;
  playerError = message;
  stopTimer();
  try { webAudio?.pause(); } catch (e) {}
  try { expoPlayer?.pause(); } catch (e) {}
  notify();
};

/** Ends playback; for a preview, tells listeners so the UI can show the purchase prompt. */
const finishPlayback = () => {
  const ended = currentSong;
  const wasPreview = previewLimit(ended) > 0;
  isPlaying = false;
  isLoading = false;
  stopTimer();
  try { webAudio?.pause(); } catch (e) {}
  try { expoPlayer?.pause(); } catch (e) {}
  if (wasPreview) {
    previewEnded = true;
    currentTime = previewLimit(ended);
  } else {
    currentTime = 0;
  }
  notify();
  if (wasPreview && ended) notifyPreviewEnded(ended);
};

/** Shared progress step for both platforms. */
const onProgress = (time: number, playing: boolean, mediaDuration?: number) => {
  currentTime = Math.floor(time || 0);
  const limit = previewLimit(currentSong);

  if (playing && isLoading) isLoading = false;
  if (!limit && mediaDuration && mediaDuration > 0 && isFinite(mediaDuration)) {
    durationSeconds = Math.round(mediaDuration);
  }

  if (limit > 0 && time >= limit) {
    finishPlayback();
    return;
  }
  // The media itself ended (a server preview may be a fraction shorter than the limit).
  if (!playing && !isLoading && mediaDuration && mediaDuration > 0 && time >= mediaDuration - 0.3) {
    finishPlayback();
    return;
  }
  if (isLoading && Date.now() - loadStartedAt > LOAD_TIMEOUT_MS) {
    fail('This track is taking too long to load. Check your connection and try again.');
    return;
  }
  notify();
};

const describeHttpFailure = (song: Song) =>
  previewLimit(song) > 0
    ? 'The preview for this track is not available right now.'
    : 'This track could not be played. You may not have access to it.';

/**
 * Setup or update Web HTML5 Audio Element
 */
const playWebAudio = (url: string, restart: boolean) => {
  try {
    if (!webAudio) {
      webAudio = new window.Audio();
      webAudio.preload = 'auto';
    }
    if (restart || webAudio.src !== url) {
      webAudio.src = url;
      webAudio.currentTime = 0;
    }

    webAudio.ontimeupdate = () => onProgress(webAudio.currentTime || 0, !webAudio.paused, webAudio.duration);
    webAudio.onended = () => finishPlayback();
    webAudio.onerror = () => { if (currentSong) fail(describeHttpFailure(currentSong)); };

    webAudio.play().then(() => {
      isPlaying = true;
      isLoading = false;
      notify();
    }).catch((err: any) => {
      // Autoplay policies or a failed load — never pretend the track is playing.
      if (err?.name === 'NotAllowedError') {
        isPlaying = false;
        isLoading = false;
        notify();
      } else if (currentSong) {
        fail(describeHttpFailure(currentSong));
      }
    });
  } catch (err) {
    fail('Audio playback is not supported in this browser.');
  }
};

/**
 * Setup or update Native Expo Audio Player
 */
const playNativeAudio = (url: string, restart: boolean) => {
  try {
    const { createAudioPlayer } = require('expo-audio');
    if (!expoPlayer) {
      expoPlayer = createAudioPlayer(url);
      expoPlayer.loop = false;
      expoSource = url;
    } else if (restart || expoSource !== url) {
      expoPlayer.replace(url);
      expoSource = url;
    }
    if (restart) {
      try { expoPlayer.seekTo(0); } catch (e) {}
    }
    expoPlayer.play();
    isPlaying = true;
    startNativeTimer();
    notify();
  } catch (err) {
    fail('Audio playback is not available on this device.');
  }
};

const startNativeTimer = () => {
  stopTimer();
  timerId = setInterval(() => {
    if (!expoPlayer) return;
    try {
      const loaded = expoPlayer.isLoaded !== false;
      const playing = Boolean(expoPlayer.playing);
      if (loaded && playing) isLoading = false;
      onProgress(expoPlayer.currentTime || 0, playing, loaded ? expoPlayer.duration : undefined);
    } catch (e) {}
  }, 250);
};

export const getPlayerState = () => ({
  currentSong,
  isPlaying,
  isLoading,
  previewEnded,
  playerError,
  currentTime,
  durationSeconds,
});

export const playSong = (song: Song) => {
  const isDifferent = currentSong?.id !== song.id || currentSong?.audioUrl !== song.audioUrl;
  // A finished preview restarts from the top: the server only ever sent those few seconds.
  const restart = isDifferent || previewEnded;

  if (!song.audioUrl) {
    currentSong = song;
    fail('No audio is available for this track.');
    return;
  }

  currentSong = song;
  playerError = null;
  previewEnded = false;
  const limit = previewLimit(song);
  durationSeconds = limit > 0 ? limit : (song.durationSeconds || parseDuration(song.duration));

  if (restart) {
    currentTime = 0;
    isLoading = true;
    loadStartedAt = Date.now();
  }
  if (isDifferent && song.id && !isNaN(Number(song.id))) {
    musicService.recordPlay(Number(song.id)).catch(() => {});
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    playWebAudio(song.audioUrl, restart);
  } else {
    playNativeAudio(song.audioUrl, restart);
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
  stopTimer();
  notify();
};

/** Stops playback and forgets the current track (e.g. when the player screen closes). */
export const resetPlayer = () => {
  currentSong = null;
  isPlaying = false;
  isLoading = false;
  previewEnded = false;
  playerError = null;
  currentTime = 0;
  durationSeconds = 0;
  if (Platform.OS === 'web' && webAudio) {
    try {
      webAudio.pause();
      webAudio.removeAttribute('src');
      webAudio.load();
    } catch (e) {}
  }
  if (expoPlayer) {
    try {
      expoPlayer.pause();
    } catch (e) {}
  }
  stopTimer();
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
  // A preview cannot be scrubbed past its limit (the server would not have the audio anyway).
  const limit = previewLimit(currentSong);
  const max = limit > 0 ? limit : durationSeconds;
  currentTime = Math.max(0, Math.min(seconds, max));
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
  const [state, setState] = useState(getPlayerState());

  useEffect(() => {
    const handleUpdate = () => {
      setState(getPlayerState());
    };
    playerListeners.add(handleUpdate);
    return () => {
      playerListeners.delete(handleUpdate);
    };
  }, []);

  return state;
};
