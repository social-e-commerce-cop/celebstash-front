import { apiClient, API_BASE_URL } from './apiClient';

export interface MusicTrackItem {
  id: number;
  title: string;
  trackNumber: number;
  audioFileUrl: string;
  durationSeconds: number;
  price: number;
  producer?: string;
  songwriter?: string;
  featuredArtists?: string;
  isExplicit?: boolean;
  lyrics?: string;
  trackStory?: string;
}

export interface MusicReleaseItem {
  id: number;
  title: string;
  releaseType: 'SINGLE' | 'EP' | 'ALBUM';
  coverArtUrl?: string;
  artist?: {
    id: number;
    fullName?: string;
    username?: string;
    artistName?: string;
  };
  featuredArtists?: string;
  genre?: string;
  subgenre?: string;
  description?: string;
  releaseStory?: string;
  releaseDate?: string;
  publicReleaseDate?: string;
  language?: string;
  countryOfOrigin?: string;
  isExplicit?: boolean;
  copyrightInfo?: string;
  credits?: string;
  status: string;
  availabilityStatus?: string;
  albumPrice: number;
  defaultAccessPackageType: 'LIMITED_PLAYS' | 'PERMANENT_STREAMING';
  defaultPlayLimit: number;
  tracks: MusicTrackItem[];
  createdAt: string;
}

export interface MusicEntitlementItem {
  id: number;
  release: MusicReleaseItem;
  track?: MusicTrackItem;
  accessType: 'LIMITED_PLAYS' | 'PERMANENT_STREAMING';
  playsGranted: number;
  playsUsed: number;
  playsRemaining: number;
  isPermanent: boolean;
  amountPaid: number;
  purchasedAt: string;
}

export interface AccessStatusResponse {
  hasFullAccess: boolean;
  remainingPlays: number;
  isPermanent: boolean;
  maxDurationSeconds?: number;
}

export const musicService = {
  // Get all discoverable releases
  async getReleases(): Promise<MusicReleaseItem[]> {
    return apiClient.get<MusicReleaseItem[]>('/api/music/releases');
  },

  // Get single release detail
  async getReleaseById(id: number): Promise<MusicReleaseItem> {
    return apiClient.get<MusicReleaseItem>(`/api/music/releases/${id}`);
  },

  // Get user's purchased music library
  async getMyMusic(): Promise<MusicEntitlementItem[]> {
    return apiClient.get<MusicEntitlementItem[]>('/api/music/my-music');
  },

  // Verify playback access for a track
  async verifyAccess(trackId: number): Promise<AccessStatusResponse> {
    return apiClient.get<AccessStatusResponse>(`/api/music/tracks/${trackId}/access`);
  },

  // Record play consumption
  async consumePlay(trackId: number): Promise<AccessStatusResponse> {
    return apiClient.post<AccessStatusResponse>(`/api/music/tracks/${trackId}/consume-play`);
  },

  // Purchase access package
  async purchaseAccess(payload: {
    releaseId: number;
    trackId?: number;
    accessType?: 'LIMITED_PLAYS' | 'PERMANENT_STREAMING';
    playLimit?: number;
    amount?: number;
  }): Promise<MusicEntitlementItem> {
    return apiClient.post<MusicEntitlementItem>('/api/music/purchases', payload);
  },

  // Get stream URL for audio player
  getStreamUrl(trackId: number): string {
    return `${API_BASE_URL}/api/music/tracks/${trackId}/stream`;
  },
};
