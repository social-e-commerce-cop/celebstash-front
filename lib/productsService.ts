import { apiClient } from './apiClient';

export interface ProductItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  sizeStock?: Record<string, number>;
  availableColors?: string[];
  initialBidPrice?: number;
  currentBidPrice?: number;
  stockQuantity: number;
  imageUrls?: string[];
  imageUrl?: string;
  videoUrl?: string;
  productType: 'REGULAR' | 'BIDDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  sellerId: number;
  sellerName?: string;
  createdAt?: string;
  approvedAt?: string;
  adminNotes?: string;
  bidStartTime?: string;
  bidEndTime?: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  category: string;
  stockQuantity: number;
  imageUrls: string[];
  videoUrl?: string;
  sizeStock?: Record<string, number>;
  availableColors?: string[];
  productType?: 'REGULAR' | 'BIDDING';
}

export const productsService = {
  getAllProducts: async () => {
    return apiClient.get<ProductItem[]>('/api/products');
  },

  getNewDrops: async () => {
    return apiClient.get<ProductItem[]>('/api/products/new-drops');
  },

  getPendingProducts: async () => {
    return apiClient.get<ProductItem[]>('/api/products/pending');
  },

  getProductById: async (id: number) => {
    return apiClient.get<ProductItem>(`/api/products/${id}`);
  },

  getMyProducts: async () => {
    return apiClient.get<ProductItem[]>('/api/products/my-products');
  },

  createProduct: async (payload: CreateProductPayload) => {
    return apiClient.post<ProductItem>('/api/products', payload);
  },

  updateProduct: async (id: number, payload: Partial<CreateProductPayload>) => {
    return apiClient.put<ProductItem>(`/api/products/${id}`, payload);
  },

  updateProductStatus: async (id: number, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) => {
    return apiClient.patch<ProductItem>(`/api/products/${id}/status`, {
      status,
      rejectionReason,
    });
  },
};
