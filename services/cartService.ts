import { apiClient } from './apiClient';
import { CartResponse } from '../types/api';

class CartService {
  // Get cart items
  async getCartItems(): Promise<CartResponse> {
    try {
      return await apiClient.get<CartResponse>('/api/cart');
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      throw error;
    }
  }

  // Add product to cart
  async addProductToCart(productId: number, quantity: number): Promise<CartResponse> {
    try {
      return await apiClient.post<CartResponse>(`/api/cart/items?productId=${productId}&quantity=${quantity}`);
    } catch (error) {
      console.error(`Failed to add product ${productId} to cart:`, error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItemQuantity(productId: number, quantity: number): Promise<CartResponse> {
    try {
      return await apiClient.put<CartResponse>(`/api/cart/items/${productId}?quantity=${quantity}`);
    } catch (error) {
      console.error(`Failed to update cart item ${productId}:`, error);
      throw error;
    }
  }

  // Remove product from cart
  async removeProductFromCart(productId: number): Promise<CartResponse> {
    try {
      return await apiClient.delete<CartResponse>(`/api/cart/items/${productId}`);
    } catch (error) {
      console.error(`Failed to remove product ${productId} from cart:`, error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/api/cart');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const cartService = new CartService();
export default cartService;
