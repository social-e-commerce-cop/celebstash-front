import { apiClient } from './apiClient';

export interface BidItem {
  productId: number;
  productName: string;
  productImageUrl?: string;
  sellerId: number;
  sellerName?: string;
  initialBidPrice: number;
  currentBidPrice: number;
  currentBidderId?: number;
  currentBidderName?: string;
  bidStartTime: string;
  bidEndTime: string;
  isActive: boolean;
  isHighestBidder?: boolean;
}

export const bidsService = {
  getBiddingProducts: async () => {
    return apiClient.get<BidItem[]>('/api/bids');
  },

  getBidDetails: async (productId: number) => {
    return apiClient.get<BidItem>(`/api/bids/${productId}`);
  },

  placeBid: async (productId: number, bidAmount: number) => {
    return apiClient.post<BidItem>('/api/bids', { productId, bidAmount });
  },
};
