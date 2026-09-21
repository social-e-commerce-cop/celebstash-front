import { fetchWithAuth, uploadFileToBackend } from './apiClient';

export interface BackendComment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userUsername?: string;
  userImageUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  parentId?: number;
  parentUserId?: number;
  parentUserName?: string;
  isReply?: boolean;
  isSelfReply?: boolean;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  replies?: BackendComment[];
}

export interface BackendPostLiker {
  id: number;
  fullName: string;
  username?: string;
  profilePicture?: string;
}

export interface BackendPost {
  id: number;
  userId: number;
  userName: string;
  userUsername?: string;
  userImageUrl?: string;
  userRole?: string;
  userVerified?: boolean;
  videoUrl?: string;
  imageUrls?: string[];
  description?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  repostsCount: number;
  savesCount?: number;
  isLiked: boolean;
  liked?: boolean;
  isShared: boolean;
  isReposted: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt?: string;
  product?: {
    id: number;
    name: string;
    description?: string;
    price: number;
    imageUrls?: string[];
    status?: string;
    productType?: string;
  };
  isSponsored?: boolean;
  sponsorName?: string;
  attachedType?: 'none' | 'product' | 'song' | 'concert';
  attachedTitle?: string;
  attachedSubtitle?: string;
  attachedPrice?: string;
  recentLikers?: BackendPostLiker[];
  isRepost?: boolean;
  reposterId?: number;
  reposterName?: string;
  reposterUsername?: string;
  repostedAt?: string;
}

export interface CreatePostRequest {
  description: string;
  imageUrls?: string[];
  videoUrl?: string;
  isSponsored?: boolean;
  sponsorName?: string;
  productId?: number;
  attachedType?: 'none' | 'product' | 'song' | 'concert';
  attachedTitle?: string;
  attachedSubtitle?: string;
  attachedPrice?: string;
}

/**
 * Fetch home feed posts (paginated)
 */
export async function fetchHomeFeed(page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0, totalPages: 0 };
  } catch (err) {
    console.warn('fetchHomeFeed failed:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Fetch user's own posts (paginated)
 */
export async function fetchMyPosts(page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/me?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0, totalPages: 0 };
  } catch (err) {
    console.warn('fetchMyPosts failed:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Fetch posts by user ID (paginated)
 */
export async function fetchUserPosts(userId: number, page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/user/${userId}?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0, totalPages: 0 };
  } catch (err) {
    console.warn('fetchUserPosts failed:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Fetch single post by ID
 */
export async function fetchPostById(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}`);
}

/**
 * Create a new post
 */
export async function createPostApi(req: CreatePostRequest): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

/**
 * Like a post
 */
export async function likePostApi(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}/like`, { method: 'POST' });
}

/**
 * Unlike a post
 */
export async function unlikePostApi(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}/like`, { method: 'DELETE' });
}

/**
 * Repost a post
 */
export async function repostPostApi(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}/repost`, { method: 'POST' });
}

/**
 * Unrepost a post
 */
export async function unrepostPostApi(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}/repost`, { method: 'DELETE' });
}

/**
 * Save a post
 */
export async function savePostApi(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}/save`, { method: 'POST' });
}

/**
 * Unsave a post
 */
export async function unsavePostApi(postId: number): Promise<BackendPost> {
  return await fetchWithAuth<BackendPost>(`/api/posts/${postId}/save`, { method: 'DELETE' });
}

/**
 * Delete a post
 */
export async function deletePostApi(postId: number): Promise<void> {
  await fetchWithAuth(`/api/posts/${postId}`, { method: 'DELETE' });
}

/**
 * Fetch comments for a post
 */
export async function fetchPostComments(postId: number, page = 0, size = 20): Promise<{ content: BackendComment[]; totalElements: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendComment[]; totalElements: number }>(
      `/api/posts/${postId}/comments?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0 };
  } catch (err) {
    console.warn('fetchPostComments failed:', err);
    return { content: [], totalElements: 0 };
  }
}

/**
 * Fetch replies for a comment
 */
export async function fetchCommentReplies(postId: number, commentId: number, page = 0, size = 10): Promise<{ content: BackendComment[]; totalElements: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendComment[]; totalElements: number }>(
      `/api/posts/${postId}/comments/${commentId}/replies?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0 };
  } catch (err) {
    console.warn('fetchCommentReplies failed:', err);
    return { content: [], totalElements: 0 };
  }
}

/**
 * Add a comment or reply to a post
 */
export async function addPostComment(postId: number, content: string, parentId?: number): Promise<BackendComment> {
  return await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ postId, content, parentId }),
  });
}

/**
 * Like a comment
 */
export async function likeCommentApi(postId: number, commentId: number): Promise<BackendComment> {
  return await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' });
}

/**
 * Unlike a comment
 */
export async function unlikeCommentApi(postId: number, commentId: number): Promise<BackendComment> {
  return await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'DELETE' });
}

/**
 * Edit a comment (owner only)
 */
export async function editCommentApi(postId: number, commentId: number, content: string): Promise<BackendComment> {
  return await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ postId, content }),
  });
}

/**
 * Delete a comment (owner only)
 */
export async function deleteCommentApi(postId: number, commentId: number): Promise<void> {
  await fetchWithAuth(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
}

/**
 * Fetch reposted posts for current user
 */
export async function fetchRepostedPosts(page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendPost[]; totalElements: number }>(
      `/api/posts/reposted?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0 };
  } catch (err) {
    console.warn('fetchRepostedPosts failed:', err);
    return { content: [], totalElements: 0 };
  }
}

/**
 * Fetch reposted posts for a specific user (public)
 */
export async function fetchUserReposts(userId: number, page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendPost[]; totalElements: number }>(
      `/api/posts/user/${userId}/reposts?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0 };
  } catch (err) {
    console.warn('fetchUserReposts failed:', err);
    return { content: [], totalElements: 0 };
  }
}

/**
 * Fetch saved posts for current user
 */
export async function fetchSavedPosts(page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number }> {
  try {
    const data = await fetchWithAuth<{ content: BackendPost[]; totalElements: number }>(
      `/api/posts/saved?page=${page}&size=${size}`
    );
    return data || { content: [], totalElements: 0 };
  } catch (err) {
    console.warn('fetchSavedPosts failed:', err);
    return { content: [], totalElements: 0 };
  }
}

export const uploadMediaFile = uploadFileToBackend;
export const createArtistPost = createPostApi;
