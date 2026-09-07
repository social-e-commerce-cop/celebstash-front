import { API_BASE_URL, fetchWithAuth, uploadFileToBackend } from './apiClient';
import { getSessionToken } from './session';

export interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrls: string[];
  status?: string;
  productType?: string;
}

export interface BackendPost {
  id: number;
  userId: number;
  userName: string;
  userImageUrl?: string;
  userRole?: string;
  userVerified?: boolean;
  product?: BackendProduct;
  videoUrl?: string;
  imageUrls?: string[];
  description?: string;
  createdAt: string;
  updatedAt?: string;

  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  repostsCount: number;

  isLiked: boolean;
  isShared: boolean;
  isReposted: boolean;
  isSaved: boolean;

  isSponsored?: boolean;
  sponsorName?: string;

  attachedType?: 'product' | 'song' | 'concert' | 'none' | string;
  attachedTitle?: string;
  attachedSubtitle?: string;
  attachedPrice?: string;
}

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
  isReply: boolean;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  replies?: BackendComment[];
}

/**
 * Upload image or video file to backend storage (/api/files/upload)
 */
export async function uploadMediaFile(fileUri: string, fileName?: string, fileType?: string): Promise<string> {
  return await uploadFileToBackend(fileUri, fileName, fileType);
}

/**
 * Create a new post (Approved Artists & Admins only)
 */
export async function createArtistPost(data: {
  description?: string;
  imageUrls?: string[];
  videoUrl?: string;
  productId?: number;
  isSponsored?: boolean;
  sponsorName?: string;
  attachedType?: string;
  attachedTitle?: string;
  attachedSubtitle?: string;
  attachedPrice?: string;
}): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errMsg = `Failed to create post (HTTP ${res.status})`;
    try {
      const errorData: any = await res.json();
      if (errorData?.message) {
        errMsg = errorData.message;
      } else if (errorData?.errors && Array.isArray(errorData.errors)) {
        errMsg = errorData.errors.map((e: any) => e.defaultMessage || e.message || e).join(', ');
      } else if (errorData?.error) {
        errMsg = errorData.error;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }

  return await res.json();
}

/**
 * Fetch main home feed posts (Followed artists + Discovery fallback)
 */
export async function fetchHomeFeed(page = 0, size = 10): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/feed?page=${page}&size=${size}`
    );
    if (!res.ok) {
      return await fetchDiscoveryFeed(page, size);
    }
    const data = await res.json();
    if (!data?.content || data.content.length === 0) {
      return await fetchDiscoveryFeed(page, size);
    }
    return data;
  } catch (err) {
    console.warn('fetchHomeFeed failed gracefully:', err);
    return await fetchDiscoveryFeed(page, size);
  }
}

/**
 * Fetch discovery feed posts
 */
export async function fetchDiscoveryFeed(page = 0, size = 10): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/discovery?page=${page}&size=${size}`
    );
    if (!res.ok) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    return await res.json();
  } catch (err) {
    console.warn('fetchDiscoveryFeed failed gracefully:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Fetch profile posts for a specific artist
 */
export async function fetchArtistPosts(userId: number, page = 0, size = 10): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/user/${userId}?page=${page}&size=${size}`
    );
    if (!res.ok) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    return await res.json();
  } catch (err) {
    console.warn('fetchArtistPosts failed gracefully:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Fetch current user's own posts
 */
export async function fetchMyPosts(page = 0, size = 10): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/my-posts?page=${page}&size=${size}`
    );
    if (!res.ok) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    return await res.json();
  } catch (err) {
    console.warn('fetchMyPosts failed gracefully:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Fetch current user's saved posts
 */
export async function fetchSavedPosts(page = 0, size = 10): Promise<{ content: BackendPost[]; totalElements: number; totalPages: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendPost[]; totalElements: number; totalPages: number }>(
      `/api/posts/saved?page=${page}&size=${size}`
    );
    if (!res.ok) {
      return { content: [], totalElements: 0, totalPages: 0 };
    }
    return await res.json();
  } catch (err) {
    console.warn('fetchSavedPosts failed gracefully:', err);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

/**
 * Like a post
 */
export async function likePostApi(postId: number): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>(`/api/posts/${postId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to like post');
  return await res.json();
}

/**
 * Unlike a post
 */
export async function unlikePostApi(postId: number): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>(`/api/posts/${postId}/like`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unlike post');
  return await res.json();
}

/**
 * Repost a post
 */
export async function repostPostApi(postId: number): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>(`/api/posts/${postId}/repost`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to repost post');
  return await res.json();
}

/**
 * Unrepost a post
 */
export async function unrepostPostApi(postId: number): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>(`/api/posts/${postId}/repost`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unrepost post');
  return await res.json();
}

/**
 * Save a post
 */
export async function savePostApi(postId: number): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>(`/api/posts/${postId}/save`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to save post');
  return await res.json();
}

/**
 * Unsave a post
 */
export async function unsavePostApi(postId: number): Promise<BackendPost> {
  const res = await fetchWithAuth<BackendPost>(`/api/posts/${postId}/save`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unsave post');
  return await res.json();
}

/**
 * Delete a post
 */
export async function deletePostApi(postId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/posts/${postId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete post');
}

/**
 * Fetch comments for a post
 */
export async function fetchPostComments(postId: number, page = 0, size = 20): Promise<{ content: BackendComment[]; totalElements: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendComment[]; totalElements: number }>(
      `/api/posts/${postId}/comments?page=${page}&size=${size}`
    );
    if (!res.ok) return { content: [], totalElements: 0 };
    return await res.json();
  } catch (err) {
    console.warn('fetchPostComments failed gracefully:', err);
    return { content: [], totalElements: 0 };
  }
}

/**
 * Fetch replies for a comment
 */
export async function fetchCommentReplies(postId: number, commentId: number, page = 0, size = 10): Promise<{ content: BackendComment[]; totalElements: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendComment[]; totalElements: number }>(
      `/api/posts/${postId}/comments/${commentId}/replies?page=${page}&size=${size}`
    );
    if (!res.ok) return { content: [], totalElements: 0 };
    return await res.json();
  } catch (err) {
    console.warn('fetchCommentReplies failed:', err);
    return { content: [], totalElements: 0 };
  }
}

/**
 * Add a comment or reply to a post
 */
export async function addPostComment(postId: number, content: string, parentId?: number): Promise<BackendComment> {
  const res = await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ postId, content, parentId }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return await res.json();
}

/**
 * Like a comment
 */
export async function likeCommentApi(postId: number, commentId: number): Promise<BackendComment> {
  const res = await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to like comment');
  return await res.json();
}

/**
 * Unlike a comment
 */
export async function unlikeCommentApi(postId: number, commentId: number): Promise<BackendComment> {
  const res = await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments/${commentId}/like`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to unlike comment');
  return await res.json();
}

/**
 * Edit a comment (owner only)
 */
export async function editCommentApi(postId: number, commentId: number, content: string): Promise<BackendComment> {
  const res = await fetchWithAuth<BackendComment>(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ postId, content }),
  });
  if (!res.ok) throw new Error('Failed to edit comment');
  return await res.json();
}

/**
 * Delete a comment (owner only)
 */
export async function deleteCommentApi(postId: number, commentId: number): Promise<void> {
  const res = await fetchWithAuth(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete comment');
}



/**
 * Fetch reposted posts for current user
 */
export async function fetchRepostedPosts(page = 0, size = 20): Promise<{ content: BackendPost[]; totalElements: number }> {
  try {
    const res = await fetchWithAuth<{ content: BackendPost[]; totalElements: number }>(
      `/api/posts/reposted?page=${page}&size=${size}`
    );
    if (!res.ok) {
      const feedRes = await fetchWithAuth<{ content: BackendPost[] }>(`/api/posts?page=${page}&size=${size}`);
      if (feedRes.ok) {
        const data = await feedRes.json();
        const repostedList = (data.content || []).filter((p: BackendPost) => p.isReposted);
        return { content: repostedList, totalElements: repostedList.length };
      }
      return { content: [], totalElements: 0 };
    }
    return await res.json();
  } catch (err) {
    console.warn('fetchRepostedPosts failed, using fallback:', err);
    try {
      const feedRes = await fetchWithAuth<{ content: BackendPost[] }>(`/api/posts?page=${page}&size=${size}`);
      if (feedRes.ok) {
        const data = await feedRes.json();
        const repostedList = (data.content || []).filter((p: BackendPost) => p.isReposted);
        return { content: repostedList, totalElements: repostedList.length };
      }
    } catch {}
    return { content: [], totalElements: 0 };
  }
}
