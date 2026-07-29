import { apiClient } from './apiClient';

export interface ProductItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  initialBidPrice?: number;
  currentBidPrice?: number;
  stockQuantity: number;
  imageUrl?: string;
  productType: 'REGULAR' | 'BIDDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sellerId: number;
  sellerName?: string;
  bidStartTime?: string;
  bidEndTime?: string;
}

export const productsService = {
  getAllProducts: async () => {
    return apiClient.get<ProductItem[]>('/api/products');
  },

  getProductById: async (id: number) => {
    return apiClient.get<ProductItem>(`/api/products/${id}`);
  },

  getMyProducts: async () => {
    return apiClient.get<ProductItem[]>('/api/products/my-products');
  },
};
