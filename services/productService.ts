import { apiClient } from './apiClient';
import { ProductResponse, ProductRequest } from '../types/api';

class ProductService {
  // Get all products
  async getAllProducts(): Promise<ProductResponse[]> {
    try {
      return await apiClient.get<ProductResponse[]>('/api/products');
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(id: number): Promise<ProductResponse> {
    try {
      return await apiClient.get<ProductResponse>(`/api/products/${id}`);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  }

  // Get user's products
  async getMyProducts(): Promise<ProductResponse[]> {
    try {
      return await apiClient.get<ProductResponse[]>('/api/products/my-products');
    } catch (error) {
      console.error('Failed to fetch user products:', error);
      throw error;
    }
  }

  // Create new product
  async createProduct(productData: ProductRequest): Promise<ProductResponse> {
    try {
      return await apiClient.post<ProductResponse>('/api/products', productData);
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  // Update product status (admin only)
  async updateProductStatus(id: number, status: string): Promise<ProductResponse> {
    try {
      return await apiClient.patch<ProductResponse>(`/api/products/${id}/status`, { status });
    } catch (error) {
      console.error(`Failed to update product ${id} status:`, error);
      throw error;
    }
  }

  // Move product to bidding (admin only)
  async moveProductToBidding(id: number, initialBidPrice: number): Promise<ProductResponse> {
    try {
      return await apiClient.patch<ProductResponse>(`/api/products/${id}/move-to-bidding?initialBidPrice=${initialBidPrice}`);
    } catch (error) {
      console.error(`Failed to move product ${id} to bidding:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;
