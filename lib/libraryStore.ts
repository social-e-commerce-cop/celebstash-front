import { useState, useEffect } from 'react';
import { musicService, MusicEntitlementItem } from './musicService';
import { resolveImageUrl } from './apiClient';
import { getSessionToken } from './session';

export interface Song {
  id: string;
  title: string;
  artist: string;
  image: any;
  genre?: string;
  duration?: string; // e.g. "3:20"
  durationSeconds?: number;
  audioUrl?: string; // Real streaming or media URL
  expiresAt?: number; // timestamp in milliseconds when it expires
  type?: 'single' | 'album'; // content type
  albumTitle?: string;        // parent album name (for albums)
  trackCount?: number;        // total tracks (for albums)
  isPermanent?: boolean;
  playsRemaining?: number;
  year?: string | number;
}

const STORAGE_KEY = 'cs_live_unlocked_library_v2';
const LEGACY_STORAGE_KEYS = ['cs_unlocked_library_songs'];

const isMockSong = (song: any): boolean => {
  if (!song) return true;
  const idStr = String(song.id || '');
  const titleLower = (song.title || '').toLowerCase();
  const artistLower = (song.artist || '').toLowerCase();
  if (['1', '2', '3', '4'].includes(idStr)) return true;
  if (artistLower.includes('kenny k shot') || artistLower.includes('the weeknd') || artistLower.includes('justin timberlake') || artistLower.includes('drake')) return true;
  if (titleLower.includes('lose you to love me') || titleLower.includes('blinding lights') || titleLower.includes('mirrors') || titleLower.includes('god\'s plan')) return true;
  return false;
};

const loadPersistedSongs = (): Song[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Purge old mock storage keys
      LEGACY_STORAGE_KEYS.forEach(k => {
        try { window.localStorage.removeItem(k); } catch (_) {}
      });

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => !isMockSong(s));
        }
      }
    } catch (e) {
      console.warn('Failed to read persisted library songs:', e);
    }
  }
  return [];
};

const persistSongs = (songs: Song[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    } catch (e) {
      console.warn('Failed to persist library songs:', e);
    }
  }
};

let purchasedSongs: Song[] = loadPersistedSongs();

const listeners = new Set<() => void>();

export const getLibrarySongs = () => purchasedSongs;

/**
 * Add a newly unlocked song to the local library store and persist it.
 */
export const addSongToLibrary = (song: {
  id?: string | number;
  title: string;
  artist: string;
  image: any;
  genre?: string;
  duration?: string;
  durationSeconds?: number;
  audioUrl?: string;
  expiresAt?: number;
  type?: 'single' | 'album';
  albumTitle?: string;
  trackCount?: number;
  isPermanent?: boolean;
  playsRemaining?: number;
  year?: string | number;
}) => {
  const songId = song.id ? String(song.id) : String(Date.now());
  const exists = purchasedSongs.some(
    s => s.id === songId || (s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase())
  );
  if (exists) return;

  const newSong: Song = {
    id: songId,
    title: song.title,
    artist: song.artist,
    image: song.image,
    genre: song.genre || 'Pop',
    duration: song.duration || '3:15',
    durationSeconds: song.durationSeconds,
    audioUrl: song.audioUrl,
    expiresAt: song.expiresAt,
    type: song.type || 'single',
    albumTitle: song.albumTitle,
    trackCount: song.trackCount,
    isPermanent: song.isPermanent,
    playsRemaining: song.playsRemaining,
    year: song.year,
  };

  purchasedSongs = [newSong, ...purchasedSongs];
  persistSongs(purchasedSongs);
  listeners.forEach(l => l());
};

/**
 * Sync unlocked library with real backend entitlements from /api/music/my-music
 */
export const syncUnlockedLibrary = async (): Promise<Song[]> => {
  const token = getSessionToken();
  if (!token) {
    purchasedSongs = [];
    persistSongs(purchasedSongs);
    listeners.forEach(l => l());
    return purchasedSongs;
  }

  try {
    const releases: any[] = await musicService.getMyMusic();
    if (Array.isArray(releases)) {
      const mappedSongs: Song[] = [];

      releases.forEach((rel: any) => {
        const artistName = rel.artist?.artistName || rel.artist?.fullName || rel.artist?.username || 'Artist';
        let coverImg: any = require('@/assets/images/products/product1.jpg');
        if (rel.coverArtUrl) {
          coverImg = { uri: resolveImageUrl(rel.coverArtUrl) };
        }

        const dateStr = rel.releaseDate || rel.createdAt;
        let releaseYear: string | undefined;
        if (dateStr) {
          const parsed = new Date(dateStr);
          const y = parsed.getFullYear();
          if (!isNaN(y) && y > 1900 && y < 2100) {
            releaseYear = String(y);
          } else {
            const m = String(dateStr).match(/\b(20\d\d|19\d\d)\b/);
            if (m) releaseYear = m[1];
          }
        }
        if (!releaseYear) {
          releaseYear = String(new Date().getFullYear());
        }

        if (rel.tracks && rel.tracks.length > 0) {
          rel.tracks.forEach((track: any) => {
            const trackId = track.id;
            const durSecs = track.durationSeconds || 180;
            const mins = Math.floor(durSecs / 60);
            const secs = durSecs % 60;
            const formattedDur = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            const streamUrl = `${musicService.getStreamUrl(trackId)}?token=${encodeURIComponent(token)}`;

            mappedSongs.push({
              id: String(trackId),
              title: track.title || rel.title,
              artist: artistName,
              image: coverImg,
              genre: rel.genre || 'Pop',
              duration: formattedDur,
              durationSeconds: durSecs,
              audioUrl: streamUrl,
              type: rel.releaseType === 'ALBUM' ? 'album' : 'single',
              albumTitle: rel.title,
              trackCount: rel.tracks.length,
              isPermanent: true,
              year: releaseYear,
            });
          });
        } else {
          mappedSongs.push({
            id: String(rel.id),
            title: rel.title,
            artist: artistName,
            image: coverImg,
            genre: rel.genre || 'Pop',
            duration: '3:30',
            durationSeconds: 210,
            audioUrl: undefined,
            type: rel.releaseType === 'ALBUM' ? 'album' : 'single',
            albumTitle: rel.title,
            trackCount: 1,
            isPermanent: true,
            year: releaseYear,
          });
        }
      });

      purchasedSongs = mappedSongs;
      persistSongs(purchasedSongs);
      listeners.forEach(l => l());
      return purchasedSongs;
    }
  } catch (err) {
    console.warn('syncUnlockedLibrary notice:', err);
  }

  return purchasedSongs;
};

export const useLibrary = () => {
  const [songs, setSongs] = useState<Song[]>(purchasedSongs);

  useEffect(() => {
    const handleUpdate = () => {
      setSongs(purchasedSongs);
    };
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return songs;
};
