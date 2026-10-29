import { apiClient } from './apiClient';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productDescription?: string;
  productPrice: number;
  productImageUrl?: string;
  quantity: number;
  subtotal: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  /** Units still free to reserve; the line's own quantity is already held. */
  stockAvailable?: number;
  /** False once the product was withdrawn from sale; such a line cannot be checked out. */
  available?: boolean;
}

/** Shape returned by every /api/cart endpoint (CartResponse on the backend). */
export interface CartResponseData {
  id: number;
  userId: number;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface AddToCartOptions {
  quantity?: number;
  size?: string | null;
  color?: string | null;
}

export const cartService = {
  getCart: async () => {
    return apiClient.get<CartResponseData>('/api/cart');
  },

  addToCart: async (productId: number, { quantity = 1, size, color }: AddToCartOptions = {}) => {
    const params = new URLSearchParams({ productId: String(productId), quantity: String(quantity) });
    if (size) params.append('size', size);
    if (color) params.append('color', color);
    return apiClient.post<CartResponseData>(`/api/cart/items?${params.toString()}`);
  },

  updateQuantity: async (productId: number, quantity: number) => {
    return apiClient.put<CartResponseData>(`/api/cart/items/${productId}?quantity=${quantity}`);
  },

  removeFromCart: async (productId: number) => {
    return apiClient.delete<CartResponseData>(`/api/cart/items/${productId}`);
  },

  /** Empties the cart and releases its stock reservations and escrow holds. */
  clearCart: async () => {
    return apiClient.delete('/api/cart');
  },
};
