import { useState, useEffect } from 'react';
import { Song } from './libraryStore';
import { createAudioPlayer } from 'expo-audio';

let currentSong: Song | null = null;
let isPlaying: boolean = false;
let currentTime: number = 0; // in seconds
let durationSeconds: number = 0; // total seconds of current song
let timerId: any = null;
let expoPlayer: any = null;

const playerListeners = new Set<() => void>();

const notify = () => playerListeners.forEach(l => l());

const parseDuration = (dur?: string): number => {
  if (!dur) return 180; // 3 mins default
  const parts = dur.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 180;
};

// Initialize or get the single audio player instance
const getExpoPlayer = (sourceUrl: string) => {
  if (!expoPlayer) {
    try {
      expoPlayer = createAudioPlayer(sourceUrl);
      expoPlayer.loop = false;
    } catch (err) {
      console.log("Error creating expoPlayer:", err);
    }
  } else {
    try {
      expoPlayer.replace(sourceUrl);
    } catch (err) {
      console.log("Error replacing expoPlayer source:", err);
    }
  }
  return expoPlayer;
};

export const getPlayerState = () => ({
  currentSong,
  isPlaying,
  currentTime,
  durationSeconds,
});

export const playSong = (song: Song) => {
  if (currentSong?.id !== song.id) {
    currentSong = song;
    currentTime = 0;

    // Use a fast, reliable public test MP3 stream URL
    const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    const playerInstance = getExpoPlayer(audioUrl);
    if (playerInstance) {
      try {
        playerInstance.play();
      } catch (err) {
        console.log("Error playing expoPlayer:", err);
      }
    }
    durationSeconds = parseDuration(song.duration);
  } else {
    if (expoPlayer) {
      try {
        expoPlayer.play();
      } catch (err) {
        console.log("Error playing expoPlayer:", err);
      }
    }
  }
  isPlaying = true;
  startTimer();
  notify();
};

export const pauseSong = () => {
  isPlaying = false;
  if (expoPlayer) {
    try {
      expoPlayer.pause();
    } catch (err) {
      console.log("Error pausing expoPlayer:", err);
    }
  }
  stopTimer();
  notify();
};

export const resetPlayer = () => {
  currentSong = null;
  isPlaying = false;
  currentTime = 0;
  durationSeconds = 0;
  if (expoPlayer) {
    try {
      expoPlayer.pause();
    } catch (err) {
      console.log("Error pausing expoPlayer during reset:", err);
    }
  }
  stopTimer();
  notify();
};

export const togglePlay = () => {
  if (!currentSong) return;
  if (isPlaying) {
    pauseSong();
  } else {
    isPlaying = true;
    if (expoPlayer) {
      try {
        expoPlayer.play();
      } catch (err) {
        console.log("Error playing expoPlayer:", err);
      }
    }
    startTimer();
    notify();
  }
};

export const seekTo = (seconds: number) => {
  currentTime = Math.max(0, Math.min(seconds, durationSeconds));
  if (expoPlayer) {
    try {
      expoPlayer.seekTo(seconds);
    } catch (err) {
      console.log("Error seeking expoPlayer:", err);
    }
  }
  notify();
};

const startTimer = () => {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (expoPlayer) {
      try {
        // Sync with actual player state
        currentTime = Math.floor(expoPlayer.currentTime || 0);
        if (expoPlayer.duration && expoPlayer.duration > 0) {
          durationSeconds = Math.round(expoPlayer.duration);
        }
        if (currentTime >= durationSeconds && durationSeconds > 0) {
          currentTime = 0;
          expoPlayer.seekTo(0);
        }
      } catch (err) {
        console.log("Error ticking expoPlayer:", err);
      }
    } else {
      currentTime += 1;
      if (currentTime >= durationSeconds) {
        currentTime = 0;
      }
    }
    notify();
  }, 500); // Ticks twice a second for high responsiveness
};

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};

export const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
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
