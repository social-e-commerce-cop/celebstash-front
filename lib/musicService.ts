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
  isBonusTrack?: boolean;
  previewDurationSeconds?: number;
  allowDownload?: boolean;
  lyrics?: string;
  trackStory?: string;
}

export interface ReleaseBenefitItem {
  id?: number;
  benefitType: 'EARLY_ACCESS' | 'FULL_LISTENING' | 'EXCLUSIVE_CONTENT' | 'DOWNLOAD_ACCESS' | 'COMMUNITY_ACCESS' | 'MERCH_ACCESS' | 'EVENT_ACCESS' | 'BONUS_TRACKS' | 'CUSTOM';
  enabled: boolean;
  customName?: string;
  customDescription?: string;
  configData?: string;
}

export interface MusicExclusiveContentItem {
  id: number;
  title: string;
  description?: string;
  contentType: 'VIDEO' | 'PHOTO' | 'BTS' | 'INTERVIEW' | 'LYRICS' | 'DOCUMENT' | 'AUDIO';
  mediaUrl: string;
  thumbnailUrl?: string;
  sortOrder?: number;
  createdAt?: string;
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
    profilePicture?: string;
  };
  featuredArtists?: string;
  genre?: string;
  subgenre?: string;
  description?: string;
  releaseStory?: string;
  releaseDate?: string;
  publicReleaseDate?: string;
  earlyAccessDate?: string;
  language?: string;
  countryOfOrigin?: string;
  isExplicit?: boolean;
  downloadAllowed?: boolean;
  connectedEventId?: number;
  connectedProductIds?: string;
  communityConversationId?: number;
  copyrightInfo?: string;
  credits?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  availabilityStatus?: string;
  albumPrice: number;
  defaultAccessPackageType?: 'LIMITED_PLAYS' | 'PERMANENT_STREAMING';
  defaultPlayLimit?: number;
  tracks: MusicTrackItem[];
  benefits?: ReleaseBenefitItem[];
  exclusiveContents?: MusicExclusiveContentItem[];
  createdAt: string;
}

export interface ReleaseDetailResponse {
  release: MusicReleaseItem;
  benefits: ReleaseBenefitItem[];
  hasAccess: boolean;
  isArtistOwner: boolean;
  canStreamFull: boolean;
  canDownload: boolean;
  hasCommunity: boolean;
  hasExclusiveContent: boolean;
  isWaitlisted: boolean;
  waitlistCount: number;
  connectedProducts: any[];
  connectedEvent: any;
  communityConversationId?: number;
  exclusiveContents?: MusicExclusiveContentItem[];
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

export interface PurchaseAccessPayload {
  releaseId: number;
  pin?: string;
  isGift?: boolean;
  giftRecipientId?: number;
  giftRecipientUsername?: string;
  giftMessage?: string;
  price?: number;
}

export interface ArtistStudioStats {
  totalReleases: number;
  draftReleases: number;
  publishedReleases: number;
  totalOrders: number;
  totalRevenue: number;
  artistPayouts: number;
  totalFans: number;
  recentSales: {
    accessId: number;
    releaseTitle: string;
    buyerUsername: string;
    grantedAt: string;
    price: number;
    isGift: boolean;
  }[];
}

export const musicService = {
  // Get all discoverable published releases
  async getReleases(): Promise<MusicReleaseItem[]> {
    return apiClient.get<MusicReleaseItem[]>('/api/music/releases');
  },

  // Get full release detail with dynamic benefits & user authorization status
  async getReleaseDetail(id: number): Promise<ReleaseDetailResponse> {
    return apiClient.get<ReleaseDetailResponse>(`/api/music/releases/${id}`);
  },

  // Legacy get single release (returns release object from detail)
  async getReleaseById(id: number): Promise<MusicReleaseItem> {
    const detail = await apiClient.get<ReleaseDetailResponse>(`/api/music/releases/${id}`);
    return detail.release || (detail as any);
  },

  // Get user's purchased music library (real releases with active Access)
  async getMyMusic(): Promise<MusicReleaseItem[]> {
    return apiClient.get<MusicReleaseItem[]>('/api/music/my-music');
  },

  // Purchase Access via wallet or give as gift
  async purchaseReleaseAccess(releaseId: number, payload: PurchaseAccessPayload): Promise<any> {
    return apiClient.post(`/api/music/releases/${releaseId}/access`, payload);
  },

  // Join upcoming release waitlist
  async joinWaitlist(releaseId: number): Promise<any> {
    return apiClient.post(`/api/music/releases/${releaseId}/waitlist`);
  },

  // Publish a release directly to fans
  async publishRelease(releaseId: number): Promise<MusicReleaseItem> {
    return apiClient.post<MusicReleaseItem>(`/api/music/releases/${releaseId}/publish`);
  },

  // Get protected exclusive content
  async getExclusiveContent(releaseId: number): Promise<MusicExclusiveContentItem[]> {
    return apiClient.get<MusicExclusiveContentItem[]>(`/api/music/releases/${releaseId}/exclusive-content`);
  },

  // Verify playback access for a track
  async verifyAccess(trackId: number): Promise<AccessStatusResponse> {
    return apiClient.get<AccessStatusResponse>(`/api/music/tracks/${trackId}/access`);
  },

  // Record play consumption
  async consumePlay(trackId: number): Promise<AccessStatusResponse> {
    return apiClient.post<AccessStatusResponse>(`/api/music/tracks/${trackId}/consume-play`);
  },

  // Artist studio statistics
  async getArtistStudioStats(): Promise<ArtistStudioStats> {
    return apiClient.get<ArtistStudioStats>('/api/music/artist/studio');
  },

  // Artist releases (filtered by DRAFT or PUBLISHED)
  async getArtistReleases(status?: string, artistId?: number): Promise<MusicReleaseItem[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (artistId) params.append('artistId', String(artistId));
    const qs = params.toString();
    return apiClient.get<MusicReleaseItem[]>(`/api/music/artist/releases${qs ? `?${qs}` : ''}`);
  },

  // Stream URL
  getStreamUrl(trackId: number): string {
    return `${API_BASE_URL}/api/music/tracks/${trackId}/stream`;
  },

  // Download URL
  getDownloadUrl(trackId: number): string {
    return `${API_BASE_URL}/api/music/tracks/${trackId}/download`;
  },
};
