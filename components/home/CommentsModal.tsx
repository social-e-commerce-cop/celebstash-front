import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, Image,
  FlatList, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchPostComments, addPostComment, BackendComment,
  likeCommentApi, unlikeCommentApi, editCommentApi,
  deleteCommentApi, fetchCommentReplies,
} from '@/lib/postService';
import { getSessionUser } from '@/lib/session';
import { resolveImageUrl, apiClient } from '@/lib/apiClient';
import { profileService } from '@/lib/profileService';

const { height } = Dimensions.get('window');
const PURPLE = '#7126D0';
const TAG_SEARCH_DEBOUNCE_MS = 250;
const CHAR_WARN_THRESHOLD = 900; // show counter once within 100 chars of the 1000 limit

// ── tiny helpers ────────────────────────────────────────────────────────────
const HeartIcon = ({ filled, size = 16 }: { filled: boolean; size?: number }) => (
  <Ionicons name={filled ? 'heart' : 'heart-outline'} size={size} color={filled ? PURPLE : '#888'} />
);

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return `${Math.floor(diff / 604800)}w`;
  } catch { return ''; }
}

const DEFAULT_AVATAR = require('@/assets/images/prof.jpg');

// Renders name/handle text with the matched @-mention query bolded/colored,
// so it's clear at a glance why a suggestion matched.
function HighlightMatch({ text, query, style, highlightStyle }: { text: string; query: string; style: any; highlightStyle: any }) {
  if (!query) return <Text style={style}>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={highlightStyle}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

// Placeholder rows shown while the initial comment page is loading, so the
// sheet doesn't visually jump once real content arrives.
function CommentSkeletonRow({ indent = false }: { indent?: boolean }) {
  return (
    <View style={[s.skeletonRow, indent && s.replyIndent]}>
      <View style={s.skeletonAvatar} />
      <View style={{ flex: 1 }}>
        <View style={[s.skeletonBar, { width: '35%', marginBottom: 6 }]} />
        <View style={[s.skeletonBar, { width: '80%', marginBottom: 4 }]} />
        <View style={[s.skeletonBar, { width: '55%' }]} />
      </View>
    </View>
  );
}

// ── props ────────────────────────────────────────────────────────────────────
interface Props {
  visible: boolean;
  onClose: () => void;
  currentUserImage?: any;
  postId?: number;
  postSnippet?: {
    text?: string;
    imageUrl?: string;
    userAvatar?: any;
    userName?: string;
    userUsername?: string;
  };
  postOwner?: {
    id?: number;
    username?: string;
    fullName?: string;
    profilePicture?: string;
  };
  onNavigateToProfile?: (userId?: number, username?: string) => void;
  onCommentAdded?: () => void;
  onCommentDeleted?: () => void;
}

// ── comment item ─────────────────────────────────────────────────────────────
interface CommentItemProps {
  comment: BackendComment;
  postId: number;
  sessionUserId?: number;
  sessionAvatar: any;
  onLike: (id: number, liked: boolean) => void;
  onReply: (id: number, name: string, userId?: number) => void;
  onEdit: (comment: BackendComment) => void;
  onDelete: (id: number) => void;
  onNavigateToProfile?: (userId?: number, username?: string) => void;
  depth?: number;
}

const CommentItem = React.memo(({
  comment, postId, sessionUserId, sessionAvatar,
  onLike, onReply, onEdit, onDelete, onNavigateToProfile, depth = 0
}: CommentItemProps) => {
  const [showMore, setShowMore] = useState(false);
  const isMe = sessionUserId && comment.userId && Number(comment.userId) === Number(sessionUserId);

  const avatarSrc = comment.userImageUrl
    ? { uri: resolveImageUrl(comment.userImageUrl) }
    : isMe ? sessionAvatar : DEFAULT_AVATAR;

  const displayHandle = comment.userUsername ? `@${comment.userUsername}` : `@${comment.userName}`;
  const textFull = comment.content || '';
  const textShort = textFull.length > 200 ? textFull.slice(0, 200) + '…' : textFull;

  const renderContent = (textStr: string) => {
    const parts = textStr.split(/(@\w+)/g);
    return (
      <Text style={s.commentText}>
        {parts.map((p, i) => {
          if (p.startsWith('@')) {
            const handle = p.slice(1);
            return (
              <Text
                key={i}
                style={s.mention}
                onPress={() => onNavigateToProfile?.(undefined, handle)}
              >
                {p}
              </Text>
            );
          }
          return <Text key={i}>{p}</Text>;
        })}
      </Text>
    );
  };

  const handleProfilePress = () => {
    onNavigateToProfile?.(comment.userId, comment.userUsername || comment.userName);
  };

  return (
    <View style={[s.commentRow, depth > 0 && s.replyIndent]}>
      <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
        <Image source={avatarSrc} style={depth > 0 ? s.replyAvatar : s.avatar} />
      </TouchableOpacity>
      <View style={s.commentBody}>
        <View style={s.nameRow}>
          <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
            <Text style={s.commentUser}>{displayHandle}</Text>
          </TouchableOpacity>
          <Text style={s.timestamp}>• {timeAgo(comment.createdAt)}</Text>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <Text style={s.edited}>(edited)</Text>
          )}
        </View>

        {renderContent(showMore ? textFull : textShort)}

        {textFull.length > 200 && (
          <TouchableOpacity onPress={() => setShowMore(!showMore)}>
            <Text style={s.seeMore}>{showMore ? 'Show less' : 'Read more'}</Text>
          </TouchableOpacity>
        )}

        <View style={s.actions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => onLike(comment.id, comment.isLiked)}
            accessibilityLabel={comment.isLiked ? 'Unlike comment' : 'Like comment'}
          >
            <HeartIcon filled={comment.isLiked} size={14} />
            {comment.likesCount > 0 && <Text style={[s.actionTxt, comment.isLiked && { color: PURPLE }]}>{comment.likesCount}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={() => onReply(comment.id, comment.userUsername || comment.userName, comment.userId)}>
            <Text style={s.actionTxt}>Reply</Text>
          </TouchableOpacity>

          {isMe && (
            <>
              <TouchableOpacity style={s.actionBtn} onPress={() => onEdit(comment)}>
                <Text style={s.actionTxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.actionBtn} onPress={() => onDelete(comment.id)}>
                <Text style={[s.actionTxt, { color: '#e53935' }]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
});

// ── main modal ───────────────────────────────────────────────────────────────
export const CommentsModal: React.FC<Props> = ({
  visible, onClose, currentUserImage, postId, postSnippet, postOwner,
  onNavigateToProfile, onCommentAdded, onCommentDeleted
}) => {
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(false);

  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState<BackendComment | null>(null);
  // topLevelId is the root comment this reply thread hangs off of (for client-side
  // tree injection); id is the actual parent being replied to (sent to the API).
  const [replyTo, setReplyTo] = useState<{ id: number; name: string; userId?: number; topLevelId: number } | null>(null);

  const [composerFocused, setComposerFocused] = useState(false);
  const [tagUsers, setTagUsers] = useState<Array<{ id?: number; username: string; fullName: string; profilePicture?: string }>>([]);
  const [showTag, setShowTag] = useState(false);

  const submitGuard = useRef(false);
  const pageRef = useRef(0);
  const totalPagesRef = useRef(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // tracks how many reply-pages we've already loaded per top-level comment,
  // so "View more replies" pages forward instead of refetching page 0 forever.
  const repliesPageRef = useRef<Record<number, number>>({});

  const listRef = useRef<FlatList<BackendComment>>(null);
  const inputRef = useRef<TextInput>(null);
  const tagSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTagQuery = useRef('');

  // lightweight inline toast for non-blocking error/status messages, so
  // failures don't interrupt with a modal-on-modal Alert
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
  }, []);

  const sessionUser = getSessionUser();
  const sessionAvatar = currentUserImage
    ? (typeof currentUserImage === 'string' ? { uri: resolveImageUrl(currentUserImage) } : currentUserImage)
    : (sessionUser?.profilePicture ? { uri: resolveImageUrl(sessionUser.profilePicture) } : DEFAULT_AVATAR);

  // ── fetch comments ───────────────────────────────────────────────────────
  const loadPage = useCallback(async (p: number, reset = false) => {
    if (!postId) return;
    if (reset) { setLoading(true); setLoadErr(false); }
    else setLoadingMore(true);

    try {
      const res = await fetchPostComments(postId, p, 20);
      const list = res.content || [];

      if (reset) {
        setComments(list);
      } else {
        setComments(prev => {
          const ids = new Set(prev.map(c => c.id));
          return [...prev, ...list.filter(c => !ids.has(c.id))];
        });
      }

      pageRef.current = p;
      totalPagesRef.current = Math.ceil((res.totalElements || 0) / 20);
    } catch {
      if (reset) setLoadErr(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible && postId) {
      pageRef.current = 0;
      repliesPageRef.current = {};
      loadPage(0, true);
    } else {
      setComments([]);
      setText('');
      setEditTarget(null);
      setReplyTo(null);
      setShowTag(false);
    }
  }, [visible, postId, loadPage]);

  const handleEndReached = () => {
    if (!loading && !loadingMore && pageRef.current + 1 < totalPagesRef.current) {
      loadPage(pageRef.current + 1);
    }
  };

  // ── tag detection ────────────────────────────────────────────────────────
  const runTagSearch = useCallback(async (query: string) => {
    try {
      const res = await apiClient.get<any>(`/api/v1/users/search?query=${encodeURIComponent(query)}`).catch(async () => {
        return await apiClient.get<any>(`/api/v1/users`).catch(() => []);
      });
      // stale response guard: a slower earlier request could resolve after a
      // newer keystroke already changed the query
      if (activeTagQuery.current !== query) return;

      const rawUsers = Array.isArray(res) ? res : (res?.content || []);
      let list: Array<{ id?: number; username: string; fullName: string; profilePicture?: string }> = rawUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName || u.name || u.username,
        profilePicture: u.profilePicture || u.avatar,
      }));

      // Always ensure post owner is included at the top
      if (postOwner && postOwner.username) {
        const exists = list.some(u => u.username?.toLowerCase() === postOwner.username?.toLowerCase());
        if (!exists) {
          list = [
            {
              id: postOwner.id,
              username: postOwner.username,
              fullName: postOwner.fullName || postOwner.username,
              profilePicture: postOwner.profilePicture,
            },
            ...list,
          ];
        }
      }

      setTagUsers(list);
      setShowTag(list.length > 0);
    } catch {
      setShowTag(false);
    }
  }, [postOwner]);

  const handleTextChange = (val: string) => {
    setText(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt >= val.length - 15) {
      const query = val.slice(lastAt + 1).toLowerCase();
      if (!query.includes(' ')) {
        activeTagQuery.current = query;
        if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
        tagSearchTimer.current = setTimeout(() => runTagSearch(query), TAG_SEARCH_DEBOUNCE_MS);
        return;
      }
    }
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    activeTagQuery.current = '';
    setShowTag(false);
  };

  const pickTag = (username: string) => {
    const lastAt = text.lastIndexOf('@');
    if (lastAt !== -1) {
      setText(text.slice(0, lastAt) + `@${username} `);
    }
    setShowTag(false);
  };

  // ── submit (new comment OR edit) ─────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || !postId || submitGuard.current) return;
    submitGuard.current = true;
    setSubmitting(true); setShowTag(false);

    try {
      if (editTarget) {
        const updated = await editCommentApi(postId, editTarget.id, trimmed);
        const updateTree = (list: BackendComment[]): BackendComment[] =>
          list.map(c => {
            if (c.id === updated.id) {
              return { ...c, content: updated.content, updatedAt: updated.updatedAt };
            }
            if (c.replies) {
              return { ...c, replies: updateTree(c.replies) };
            }
            return c;
          });
        setComments(updateTree);
        setEditTarget(null);
      } else {
        const created = await addPostComment(postId, trimmed, replyTo?.id);
        const sUser = getSessionUser();
        const enriched: BackendComment = {
          ...created,
          userId: created.userId || sUser?.id || 0,
          userName: created.userName || sUser?.fullName || 'You',
          userUsername: created.userUsername || sUser?.username,
          userImageUrl: created.userImageUrl || sUser?.profilePicture,
        };
        if (replyTo) {
          // Always attach into the ROOT comment's reply list (topLevelId), even
          // when replying to a nested reply — replyTo.id is the actual parent
          // sent to the API, but the tree we render is only one level deep.
          setComments(prev => prev.map(c =>
            c.id === replyTo.topLevelId
              ? { ...c, replies: [...(c.replies || []), enriched], repliesCount: (c.repliesCount || 0) + 1 }
              : c
          ));
        } else {
          setComments(prev => [enriched, ...prev]);
          // new top-level comments are prepended — scroll up so the person
          // actually sees the thing they just posted land
          requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
        }
        onCommentAdded?.();
        setReplyTo(null);
      }
      setText('');
    } catch (err: any) {
      showToast(err?.message || 'Could not send. Please try again.');
    } finally {
      setSubmitting(false);
      submitGuard.current = false;
    }
  };

  // ── like/unlike ──────────────────────────────────────────────────────────
  const handleLike = async (commentId: number, isLiked: boolean) => {
    if (!postId) return;
    const patch = (list: BackendComment[]): BackendComment[] =>
      list.map(c => {
        if (c.id === commentId) {
          return { ...c, isLiked: !isLiked, likesCount: isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1 };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: patch(c.replies) };
        }
        return c;
      });
    setComments(patch);
    try {
      const updated = isLiked
        ? await unlikeCommentApi(postId, commentId)
        : await likeCommentApi(postId, commentId);

      const syncServer = (list: BackendComment[]): BackendComment[] =>
        list.map(c => {
          if (c.id === updated.id) {
            return { ...c, isLiked: updated.isLiked, likesCount: updated.likesCount };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: syncServer(c.replies) };
          }
          return c;
        });
      setComments(syncServer);
    } catch {
      setComments(prev => {
        const revert = (list: BackendComment[]): BackendComment[] =>
          list.map(c => {
            if (c.id === commentId) {
              return { ...c, isLiked, likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1) };
            }
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: revert(c.replies) };
            }
            return c;
          });
        return revert(prev);
      });
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = (commentId: number) => {
    if (!postId) return;
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setComments(prev => {
            const removeTree = (list: BackendComment[]): BackendComment[] =>
              list
                .filter(c => Number(c.id) !== Number(commentId))
                .map(c => ({
                  ...c,
                  replies: c.replies ? removeTree(c.replies) : c.replies,
                  repliesCount: c.replies?.some(r => Number(r.id) === Number(commentId))
                    ? Math.max(0, (c.repliesCount || 1) - 1)
                    : c.repliesCount,
                }));
            return removeTree(prev);
          });

          onCommentDeleted?.();

          try {
            await deleteCommentApi(postId, commentId);
          } catch {
            showToast('Could not delete comment.');
            loadPage(0, true);
          }
        }
      }
    ]);
  };

  // ── edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (comment: BackendComment) => {
    setEditTarget(comment); setReplyTo(null); setText(comment.content);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelEdit = () => { setEditTarget(null); setText(''); };
  const cancelReply = () => { setReplyTo(null); if (!editTarget) setText(''); };

  const isReplyingToSelf = replyTo && (
    (replyTo.userId && sessionUser?.id && Number(replyTo.userId) === Number(sessionUser.id)) ||
    (sessionUser?.username && replyTo.name?.toLowerCase() === sessionUser.username.toLowerCase()) ||
    (sessionUser?.fullName && replyTo.name?.toLowerCase() === sessionUser.fullName.toLowerCase())
  );

  const placeholder = editTarget
    ? 'Edit your comment…'
    : replyTo
    ? isReplyingToSelf ? 'Replying to yourself…' : `Reply to @${replyTo.name}…`
    : 'Add a comment…';

  // ── load more replies (paginated, not stuck on page 0) ──────────────────
  const handleLoadMoreReplies = async (item: BackendComment) => {
    if (!postId) return;
    try {
      const nextPage = repliesPageRef.current[item.id] ?? 0;
      const res = await fetchCommentReplies(postId, item.id, nextPage, 20);
      if (res.content && res.content.length > 0) {
        repliesPageRef.current[item.id] = nextPage + 1;
        setComments(prev => prev.map(c => {
          if (c.id !== item.id) return c;
          const existingIds = new Set((c.replies || []).map(r => r.id));
          const merged = [...(c.replies || []), ...res.content.filter((r: BackendComment) => !existingIds.has(r.id))];
          return { ...c, replies: merged };
        }));
      }
    } catch (err) {
      console.warn('Failed to load replies:', err);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={s.modalContainer} pointerEvents="box-none">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.sheet}
        >

        {/* Header */}
        <View style={s.handle} />
        <View style={s.header}>
          <Text style={s.title}>Comments</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close comments">
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Post Context Snippet */}
        {postSnippet && (
          <View style={s.postSnippetBar}>
            <Image
              source={
                typeof postSnippet.userAvatar === 'string'
                  ? { uri: resolveImageUrl(postSnippet.userAvatar) }
                  : (postSnippet.userAvatar || DEFAULT_AVATAR)
              }
              style={s.snippetAvatar}
            />
            <View style={s.snippetInfo}>
              <Text style={s.snippetUser} numberOfLines={1}>
                @{postSnippet.userUsername || postSnippet.userName}
              </Text>
              {postSnippet.text ? (
                <Text style={s.snippetText} numberOfLines={2}>
                  {postSnippet.text}
                </Text>
              ) : null}
            </View>
            {postSnippet.imageUrl ? (
              <Image
                source={{ uri: resolveImageUrl(postSnippet.imageUrl) }}
                style={s.snippetThumb}
              />
            ) : null}
          </View>
        )}

        {/* Body */}
        {loading ? (
          <View style={[s.list, { paddingTop: 12 }]}>
            <CommentSkeletonRow />
            <CommentSkeletonRow />
            <CommentSkeletonRow indent />
            <CommentSkeletonRow />
          </View>
        ) : loadErr ? (
          <View style={s.center}>
            <Ionicons name="alert-circle-outline" size={40} color="#ccc" />
            <Text style={s.hint}>Couldn't load comments.</Text>
            <TouchableOpacity style={s.retryBtn} onPress={() => loadPage(0, true)}>
              <Text style={s.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={comments}
            keyExtractor={item => item.id.toString()}
            style={s.list}
            showsVerticalScrollIndicator={false}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={s.center}>
                <Ionicons name="chatbubble-outline" size={44} color="#ddd" />
                <Text style={s.emptyTitle}>No comments yet.</Text>
                <Text style={s.hint}>Be the first to comment.</Text>
              </View>
            }
            ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={PURPLE} style={{ marginVertical: 12 }} /> : null}
            renderItem={({ item }) => (
              <View>
                <CommentItem
                  comment={item}
                  postId={postId!}
                  sessionUserId={sessionUser?.id}
                  sessionAvatar={sessionAvatar}
                  onLike={handleLike}
                  onReply={(id, name, uId) => {
                    setReplyTo({ id, name, userId: uId, topLevelId: item.id });
                    setEditTarget(null);
                    setText('');
                    requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onNavigateToProfile={onNavigateToProfile}
                />
                {/* Inline replies */}
                {(item.replies || []).map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    postId={postId!}
                    sessionUserId={sessionUser?.id}
                    sessionAvatar={sessionAvatar}
                    onLike={handleLike}
                    onReply={(id, name, uId) => {
                      // id/name/uId describe the reply being replied to (sent to
                      // the API as the parent); topLevelId keeps it attached to
                      // this root comment's thread in the UI.
                      setReplyTo({ id, name, userId: uId, topLevelId: item.id });
                      setEditTarget(null);
                      setText('');
                      requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onNavigateToProfile={onNavigateToProfile}
                    depth={1}
                  />
                ))}

                {/* View More Replies button */}
                {item.repliesCount > (item.replies?.length || 0) && (
                  <TouchableOpacity
                    style={s.viewMoreReplies}
                    onPress={() => handleLoadMoreReplies(item)}
                  >
                    <Text style={s.viewMoreTxt}>
                      View {item.repliesCount - (item.replies?.length || 0)} more {item.repliesCount - (item.replies?.length || 0) === 1 ? 'reply' : 'replies'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}

        {/* Tag suggestions */}
        {showTag && tagUsers.length > 0 && (
          <View style={s.tagBox}>
            {tagUsers.slice(0, 5).map((u, index) => (
              <TouchableOpacity key={u.id || index} style={s.tagItem} onPress={() => pickTag(u.username || 'user')}>
                <Image source={u.profilePicture ? { uri: resolveImageUrl(u.profilePicture) } : DEFAULT_AVATAR} style={s.tagAvatar} />
                <View style={{ flex: 1 }}>
                  <HighlightMatch text={u.fullName} query={activeTagQuery.current} style={s.tagName} highlightStyle={s.tagMatch} />
                  <Text style={s.tagHandle}>
                    @<HighlightMatch text={u.username} query={activeTagQuery.current} style={s.tagHandle} highlightStyle={[s.tagMatch, { color: PURPLE }]} />
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Reply / Edit banner */}
        {(replyTo || editTarget) && (
          <View style={s.contextBanner}>
            <Text style={s.contextTxt}>
              {editTarget
                ? 'Editing comment'
                : isReplyingToSelf
                ? 'Replying to yourself'
                : `Replying to @${replyTo?.name}`}
            </Text>
            <TouchableOpacity onPress={editTarget ? cancelEdit : cancelReply} accessibilityLabel="Cancel">
              <Ionicons name="close-circle" size={18} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        {/* Composer — Expanding Multiline Prompt Box */}
        <View style={s.composer}>
          <Image source={sessionAvatar} style={s.composerAvatar} />
          <View style={[s.inputWrap, composerFocused && s.inputWrapFocused]}>
            <TextInput
              ref={inputRef}
              style={s.input}
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={text}
              onChangeText={handleTextChange}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              maxLength={1000}
              multiline={true}
              blurOnSubmit={false}
              accessibilityLabel="Comment input"
            />
            {text.length >= CHAR_WARN_THRESHOLD && (
              <Text style={[s.charCount, text.length >= 1000 && { color: '#e53935' }]}>
                {1000 - text.length}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || !text.trim()}
              style={[s.sendBtn, (!text.trim() || submitting) && { opacity: 0.35 }]}
              accessibilityLabel="Send comment"
            >
              {submitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="send" size={15} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline toast for non-blocking errors (like/delete failures, etc.) */}
        {toast && (
          <View style={s.toast} pointerEvents="none">
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
};

export default CommentsModal;

// ── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.78,
    maxHeight: height * 0.82,
    paddingBottom: Platform.OS === 'ios' ? 10 : 4,
    overflow: 'hidden',
  },
  handle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' },

  // post snippet bar
  postSnippetBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 10,
  },
  snippetAvatar: { width: 32, height: 32, borderRadius: 16 },
  snippetInfo: { flex: 1 },
  snippetUser: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#111' },
  snippetText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#666', marginTop: 1 },
  snippetThumb: { width: 36, height: 36, borderRadius: 6 },

  list: { paddingHorizontal: 16, paddingTop: 8, flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#555', marginTop: 8 },
  hint: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#999' },
  retryBtn: { marginTop: 8, backgroundColor: PURPLE, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  retryTxt: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 13 },

  // comment
  commentRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  replyIndent: { marginLeft: 48, marginBottom: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  replyAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  commentBody: { flex: 1, flexShrink: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 2 },
  commentUser: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#111' },
  timestamp: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#aaa' },
  edited: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#bbb' },
  commentText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#333', lineHeight: 20, flexWrap: 'wrap' },
  mention: { color: PURPLE, fontFamily: 'Poppins-Bold' },
  seeMore: { fontSize: 12, color: PURPLE, fontFamily: 'Poppins-Bold', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 14, marginTop: 6, alignItems: 'center' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionTxt: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#888' },

  viewMoreReplies: { marginLeft: 48, marginBottom: 10 },
  viewMoreTxt: { fontSize: 12, color: PURPLE, fontFamily: 'Poppins-Bold' },

  // tag
  tagBox: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', maxHeight: 160 },
  tagItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  tagAvatar: { width: 32, height: 32, borderRadius: 16 },
  tagName: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#111' },
  tagHandle: { fontSize: 11, fontFamily: 'Poppins-Regular', color: PURPLE },
  tagMatch: { fontFamily: 'Poppins-Bold' },

  // skeleton loading rows
  skeletonRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  skeletonAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10, backgroundColor: '#EEE' },
  skeletonBar: { height: 10, borderRadius: 5, backgroundColor: '#EEE' },

  // char counter
  charCount: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#aaa', marginRight: 2 },

  // toast
  toast: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toastTxt: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Medium' },

  // context banner
  contextBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#f9f5ff', borderTopWidth: 1, borderTopColor: '#ede5ff' },
  contextTxt: { fontSize: 12, fontFamily: 'Poppins-Medium', color: PURPLE },

  // quick emoji bar
  quickEmojiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  quickEmojiBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quickEmojiTxt: {
    fontSize: 20,
  },

  // composer
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
    backgroundColor: '#fff',
  },
  composerAvatar: { width: 32, height: 32, borderRadius: 16 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 3,
    minHeight: 38,
    maxHeight: 96,
    gap: 6,
  },
  inputWrapFocused: { borderColor: PURPLE, backgroundColor: '#fff' },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    maxHeight: 88,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});