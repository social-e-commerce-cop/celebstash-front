import { useState, useEffect } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  image: any;
  genre?: string;
  duration?: string; // e.g. "3:20"
  expiresAt?: number; // timestamp in milliseconds when it expires
  type?: 'single' | 'album'; // content type
  albumTitle?: string;        // parent album name (for albums)
  trackCount?: number;        // total tracks (for albums)
}

// Seed initial songs matching the user's details and screens
let purchasedSongs: Song[] = [
  { id: '1', title: 'What does it mean to live', artist: 'Kenny K Shot', image: require('@/assets/images/products/product1.jpg'), genre: 'Pop', duration: '3:45', type: 'single', expiresAt: Date.now() + 2 * 24 * 3600 * 1000 },
  { id: '2', title: 'Corazol ft T-Pain, Usher', artist: 'The Weeknd', image: require('@/assets/images/products/product3.jpg'), genre: 'Afrobeats', duration: '4:12', type: 'album', albumTitle: 'After Hours', trackCount: 14, expiresAt: Date.now() + 3 * 24 * 3600 * 1000 },
  { id: '3', title: 'If the world was ending', artist: 'Justin Timberlake', image: require('@/assets/images/products/product2.jpg'), genre: 'Upbeat', duration: '3:28', type: 'single' },
  { id: '4', title: 'Lost In Translation Live', artist: 'Drake', image: require('@/assets/images/products/product4.jpg'), genre: 'Chill', duration: '2:56', type: 'album', albumTitle: 'Certified Lover Boy', trackCount: 21, expiresAt: Date.now() + 3 * 60 * 60 * 1000 },
  { id: '5', title: 'Heart on my sleeve', artist: 'Drake & The Weeknd', image: require('@/assets/images/products/product5.jpg'), genre: 'Pop', duration: '3:02', type: 'single', expiresAt: Date.now() - 12 * 60 * 60 * 1000 },
];

const listeners = new Set<() => void>();

export const getLibrarySongs = () => purchasedSongs;

export const addSongToLibrary = (song: { title: string; artist: string; image: any; genre?: string; duration?: string; expiresAt?: number }) => {
  // Avoid duplicates
  const exists = purchasedSongs.some(
    s => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase()
  );
  if (exists) return;

  const newSong: Song = {
    id: String(Date.now()),
    title: song.title,
    artist: song.artist,
    image: song.image,
    genre: song.genre || 'All',
    duration: song.duration || '3:15',
    expiresAt: song.expiresAt || (Date.now() + 3 * 24 * 3600 * 1000), // Default to 3 days limit
  };

  purchasedSongs = [...purchasedSongs, newSong];
  listeners.forEach(l => l());
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
