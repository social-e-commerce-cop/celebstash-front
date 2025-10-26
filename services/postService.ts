import { apiClient } from './apiClient';
import { PostResponse, PostRequest } from '../types/api';

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

class PostService {
  /**
   * Create a new post for a product
   * @param postData - Post creation data
   * @returns The created post
   */
  async createPost(postData: PostRequest): Promise<PostResponse> {
    try {
      return await apiClient.post<PostResponse>('/api/posts', postData);
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  /**
   * Get all posts with pagination
   * @param page - Page number (0-indexed)
   * @param size - Page size
   * @returns Paged post responses
   */
  async getAllPosts(page: number = 0, size: number = 10): Promise<PagedResponse<PostResponse>> {
    try {
      return await apiClient.get<PagedResponse<PostResponse>>(`/api/posts?page=${page}&size=${size}`);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }

  /**
   * Get a post by ID
   * @param id - Post ID
   * @returns The post
   */
  async getPostById(id: number): Promise<PostResponse> {
    try {
      return await apiClient.get<PostResponse>(`/api/posts/${id}`);
    } catch (error) {
      console.error(`Failed to fetch post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get posts created by the current user
   * @param page - Page number (0-indexed)
   * @param size - Page size
   * @returns Paged post responses
   */
  async getMyPosts(page: number = 0, size: number = 10): Promise<PagedResponse<PostResponse>> {
    try {
      return await apiClient.get<PagedResponse<PostResponse>>(`/api/posts/my-posts?page=${page}&size=${size}`);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      throw error;
    }
  }

  /**
   * Update a post
   * @param id - Post ID
   * @param postData - Updated post data
   * @returns The updated post
   */
  async updatePost(id: number, postData: PostRequest): Promise<PostResponse> {
    try {
      return await apiClient.put<PostResponse>(`/api/posts/${id}`, postData);
    } catch (error) {
      console.error(`Failed to update post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a post
   * @param id - Post ID
   */
  async deletePost(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/posts/${id}`);
    } catch (error) {
      console.error(`Failed to delete post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Like a post
   * @param id - Post ID
   * @returns The updated post
   */
  async likePost(id: number): Promise<PostResponse> {
    try {
      return await apiClient.post<PostResponse>(`/api/posts/${id}/like`);
    } catch (error) {
      console.error(`Failed to like post ${id}:`, error);
      throw error;
    }
  }

  /**
   * Unlike a post
   * @param id - Post ID
   * @returns The updated post
   */
  async unlikePost(id: number): Promise<PostResponse> {
    try {
      return await apiClient.delete<PostResponse>(`/api/posts/${id}/like`);
    } catch (error) {
      console.error(`Failed to unlike post ${id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const postService = new PostService();
export default postService;
