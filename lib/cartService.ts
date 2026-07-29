import { apiClient } from './apiClient';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  quantity: number;
  subtotal: number;
}

export interface CartResponseData {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export const cartService = {
  getCart: async () => {
    return apiClient.get<CartResponseData>('/api/cart');
  },

  addToCart: async (productId: number, quantity = 1) => {
    return apiClient.post<CartResponseData>(`/api/cart/items?productId=${productId}&quantity=${quantity}`);
  },

  updateQuantity: async (productId: number, quantity: number) => {
    return apiClient.put<CartResponseData>(`/api/cart/items/${productId}?quantity=${quantity}`);
  },

  removeFromCart: async (productId: number) => {
    return apiClient.delete<CartResponseData>(`/api/cart/items/${productId}`);
  },

  clearCart: async () => {
    return apiClient.delete('/api/cart');
  },
};
