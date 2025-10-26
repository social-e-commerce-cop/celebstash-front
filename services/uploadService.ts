import { apiClient } from './apiClient';

class UploadService {
  /**
   * Upload a single product image
   */
  async uploadProductImage(uri: string, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      
      // Append file to form data
      const file: any = {
        uri,
        type: 'image/jpeg', // Default to JPEG, could be detected
        name: fileName || 'product_image.jpg',
      };
      
      formData.append('file', file);

      // Get auth token
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Upload via API
      const response = await fetch(`${apiClient['client'].defaults.baseURL}/api/files/upload/product-image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload image';
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          errorMessage = 'Authentication expired. Please login again.';
        } else {
          // Try to parse error response
          try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.imageUrl;
      
    } catch (error: any) {
      console.error('Failed to upload product image:', error);
      throw error;
    }
  }

  /**
   * Upload a single product video
   */
  async uploadProductVideo(uri: string, fileName: string): Promise<string> {
    try {
      const formData = new FormData();
      
      // Append file to form data
      const file: any = {
        uri,
        type: 'video/mp4', // Default to MP4
        name: fileName || 'product_video.mp4',
      };
      
      formData.append('file', file);

      // Get auth token
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Upload via API
      const response = await fetch(`${apiClient['client'].defaults.baseURL}/api/files/upload/product-video`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload video';
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          errorMessage = 'Authentication expired. Please login again.';
        } else {
          // Try to parse error response
          try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.videoUrl;
      
    } catch (error: any) {
      console.error('Failed to upload product video:', error);
      throw error;
    }
  }

  /**
   * Upload multiple post photos (3-5 images)
   */
  async uploadPostPhotos(uris: string[]): Promise<string[]> {
    try {
      if (uris.length < 3 || uris.length > 5) {
        throw new Error('Between 3 and 5 photos are required');
      }

      const formData = new FormData();
      
      // Append all files to form data
      uris.forEach((uri, index) => {
        const file: any = {
          uri,
          type: 'image/jpeg',
          name: `post_photo_${index + 1}.jpg`,
        };
        formData.append('files', file);
      });

      // Get auth token
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Upload via API
      const response = await fetch(`${apiClient['client'].defaults.baseURL}/api/files/upload/post-photos`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload photos';
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
          errorMessage = 'Authentication expired. Please login again.';
        } else {
          // Try to parse error response
          try {
            const error = await response.json();
            errorMessage = error.message || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.photoUrls;
      
    } catch (error: any) {
      console.error('Failed to upload post photos:', error);
      throw error;
    }
  }

  /**
   * Helper to get auth token from AsyncStorage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('access_token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;
