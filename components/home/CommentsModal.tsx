import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, Image,
  FlatList, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Dimensions, ScrollView, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchPostComments, addPostComment, BackendComment,
  likeCommentApi, unlikeCommentApi, editCommentApi,
  deleteCommentApi, fetchCommentReplies,
} from '@/lib/postService';
import { getSessionUser } from '@/lib/session';
import { resolveImageUrl, apiClient } from '@/lib/apiClient';

const { height } = Dimensions.get('window');
const PURPLE = '#7126D0';
const TAG_SEARCH_DEBOUNCE_MS = 250;
const CHAR_WARN_THRESHOLD = 900;
const DEFAULT_AVATAR = require('@/assets/images/black-man.png');

// ── tiny helpers ────────────────────────────────────────────────────────────
const HeartIcon = ({ filled, size = 16 }: { filled: boolean; size?: number }) => (
  <Ionicons name={filled ? 'heart' : 'heart-outline'} size={size} color={filled ? '#ED4956' : '#888'} />
);

function formatRealTimeAgo(dateStr?: string, currentNow: number = Date.now()): string {
  if (!dateStr) return '';
  try {
    let str = String(dateStr).trim();
    if (!str) return '';

    let time: number;
    const hasExplicitTz = str.endsWith('Z') || /[+-]\d{2}(:\d{2})?$/.test(str);
    if (hasExplicitTz) {
      time = new Date(str).getTime();
    } else {
      // Backend sent datetime without explicit timezone offset.
      // Check both UTC interpretation and local device interpretation, picking the closest to currentNow.
      const normalizedStr = str.replace(' ', 'T');
      const utcTime = new Date(normalizedStr.endsWith('Z') ? normalizedStr : `${normalizedStr}Z`).getTime();
      const localTime = new Date(normalizedStr).getTime();

      const absUtc = Math.abs(currentNow - utcTime);
      const absLocal = Math.abs(currentNow - localTime);

      time = absUtc < absLocal ? utcTime : localTime;
    }

    if (isNaN(time)) return '';

    const diffSec = Math.floor((currentNow - time) / 1000);
    // If posted within the last 60 seconds (or slight device/server clock difference), display 'now'
    if (diffSec < 60) return 'now';

    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return mins === 1 ? '1min' : `${mins}mins`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    const weeks = Math.floor(days / 7);
    if (weeks < 52) return `${weeks}w`;

    const years = Math.floor(days / 365);
    return `${years}y`;
  } catch {
    return '';
  }
}

function normalizeComment(c: any): BackendComment {
  if (!c) return c;
  const isLiked = Boolean(c.isLiked !== undefined ? c.isLiked : c.liked);
  const isReply = Boolean(c.isReply !== undefined ? c.isReply : c.reply);
  const isSelfReply = Boolean(c.isSelfReply !== undefined ? c.isSelfReply : c.selfReply);
  const replies = Array.isArray(c.replies) ? c.replies.map(normalizeComment) : [];
  return {
    ...c,
    isLiked,
    isReply,
    isSelfReply,
    replies,
  };
}

function HighlightMatch({ text, query, style, highlightStyle }: { text: string; query: string; style: any; highlightStyle: any }) {
  if (!query || !text) return <Text style={style}>{text}</Text>;
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
  parentAuthorId?: number;
  parentAuthorName?: string;
  nowTick?: number;
}

const CommentItem = React.memo(({
  comment, postId, sessionUserId, sessionAvatar,
  onLike, onReply, onEdit, onDelete, onNavigateToProfile, depth = 0,
  parentAuthorId, parentAuthorName, nowTick
}: CommentItemProps) => {
  const [showMore, setShowMore] = useState(false);
  const isMe = sessionUserId && comment.userId && Number(comment.userId) === Number(sessionUserId);

  const avatarSrc = comment.userImageUrl
    ? { uri: resolveImageUrl(comment.userImageUrl) }
    : isMe ? sessionAvatar : DEFAULT_AVATAR;

  const displayHandle = comment.userUsername || comment.userName || 'user';
  const rawText = comment.content || '';

  const isSelfReply = depth > 0 && Boolean(
    comment.isSelfReply ||
    (comment.userId && parentAuthorId && Number(comment.userId) === Number(parentAuthorId)) ||
    (comment.parentUserId && comment.userId && Number(comment.userId) === Number(comment.parentUserId)) ||
    (isMe && parentAuthorId && Number(sessionUserId) === Number(parentAuthorId))
  );
  const targetReplyName = comment.parentUserName || parentAuthorName;

  // If replying to yourself, no need to mention your username.
  // If replying to someone else, ensure @targetReplyName is prefixed.
  let displayText = rawText;
  if (depth > 0) {
    if (isSelfReply) {
      displayText = displayText.replace(/^@\S+\s*/, '');
    } else if (targetReplyName && !displayText.trim().startsWith('@')) {
      displayText = `@${targetReplyName} ${displayText}`;
    }
  }

  const textToRender = showMore ? displayText : (displayText.length > 200 ? displayText.slice(0, 200) + '…' : displayText);

  const renderFormattedText = (textStr: string) => {
    const parts = textStr.split(/(@\w+)/g);
    return parts.map((p, i) => {
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
    });
  };

  const handleProfilePress = () => {
    onNavigateToProfile?.(comment.userId, comment.userUsername || comment.userName);
  };

  return (
    <View style={[s.commentRow, depth > 0 && s.replyIndent]}>
      {/* Avatar */}
      <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8} style={s.avatarCol}>
        <Image source={avatarSrc} style={depth > 0 ? s.replyAvatar : s.avatar} />
      </TouchableOpacity>

      {/* Main Comment Text + Meta */}
      <View style={s.commentBody}>
        <Text style={s.commentText}>
          <Text style={s.commentUser} onPress={handleProfilePress}>
            {displayHandle}{' '}
          </Text>
          {renderFormattedText(textToRender)}
        </Text>

        {displayText.length > 200 && (
          <TouchableOpacity onPress={() => setShowMore(!showMore)}>
            <Text style={s.seeMore}>{showMore ? 'Show less' : 'Read more'}</Text>
          </TouchableOpacity>
        )}

        {/* Footer Meta Row: real-time  Reply  (Edit & Delete icons if me) */}
        <View style={s.metaRow}>
          <Text style={s.metaTimestamp}>{formatRealTimeAgo(comment.createdAt, nowTick)}</Text>
          <TouchableOpacity
            onPress={() => onReply(comment.id, comment.userUsername || comment.userName, comment.userId)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={s.metaReplyBtn}>Reply</Text>
          </TouchableOpacity>

          {isMe && (
            <View style={s.ownerActions}>
              <TouchableOpacity
                onPress={() => onEdit(comment)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Edit comment"
                style={s.metaIconBtn}
              >
                <Text style={s.metaReplyBtn}>Edit</Text> 
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(comment.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Delete comment"
                style={s.metaIconBtn}
              >
                <Ionicons name="trash" size={14} color="#737373" />
              </TouchableOpacity>
            </View>
          )}

          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <Text style={s.metaEdited}>(edited)</Text>
          )}
        </View>
      </View>

      {/* Right-aligned Like Heart */}
      <TouchableOpacity
        style={s.likeCol}
        onPress={() => onLike(comment.id, comment.isLiked)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        accessibilityLabel={comment.isLiked ? 'Unlike comment' : 'Like comment'}
      >
        <Ionicons
          name={comment.isLiked ? 'heart' : 'heart-outline'}
          size={16}
          color={comment.isLiked ? '#ED4956' : '#8E8E93'}
        />
        {comment.likesCount > 0 && (
          <Text style={s.likeColCount}>{comment.likesCount}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

// ── main modal ───────────────────────────────────────────────────────────────
export const CommentsModal: React.FC<Props> = ({
  visible, onClose, currentUserImage, postId, postSnippet, postOwner,
  onNavigateToProfile, onCommentAdded, onCommentDeleted
}) => {
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(false);

  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState<BackendComment | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: number; name: string; userId?: number; topLevelId: number } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

  const [composerFocused, setComposerFocused] = useState(false);
  const [tagUsers, setTagUsers] = useState<Array<{ id?: number; username: string; fullName: string; profilePicture?: string }>>([]);
  const [showTag, setShowTag] = useState(false);

  const submitGuard = useRef(false);
  const pageRef = useRef(0);
  const totalPagesRef = useRef(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const repliesPageRef = useRef<Record<number, number>>({});
  const listRef = useRef<FlatList<BackendComment>>(null);
  const inputRef = useRef<TextInput>(null);
  const tagSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTagQuery = useRef('');

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  // Track real time dynamically every 15s so relative timestamps (now, 1min, 2mins) update live
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!visible) return;
    setNowTick(Date.now());
    const ticker = setInterval(() => {
      setNowTick(Date.now());
    }, 15000);
    return () => clearInterval(ticker);
  }, [visible]);

  // Track keyboard show/hide to remove extra bottom space when keyboard is up
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
  }, []);

  // Always prioritize the currently logged-in user's profile picture for the composer avatar
  const sessionUser = getSessionUser();
  const sessionAvatarUri = sessionUser?.profilePicture || sessionUser?.avatar || (typeof currentUserImage === 'string' ? currentUserImage : null);
  const sessionAvatar = sessionAvatarUri
    ? { uri: resolveImageUrl(sessionAvatarUri) }
    : (currentUserImage && typeof currentUserImage !== 'string' ? currentUserImage : DEFAULT_AVATAR);

  // ── fetch comments ───────────────────────────────────────────────────────
  const loadPage = useCallback(async (p: number, reset = false) => {
    if (!postId) return;
    if (reset) { setLoading(true); setLoadErr(false); }
    else setLoadingMore(true);

    try {
      const res = await fetchPostComments(postId, p, 20);
      const list = (res.content || []).map(normalizeComment);

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
      setExpandedReplies({});
      loadPage(0, true);
    } else {
      setComments([]);
      setText('');
      setEditTarget(null);
      setReplyTo(null);
      setShowTag(false);
      setExpandedReplies({});
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
      if (activeTagQuery.current !== query) return;

      const rawUsers = Array.isArray(res) ? res : (res?.content || []);
      let list: Array<{ id?: number; username: string; fullName: string; profilePicture?: string }> = rawUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        fullName: u.fullName || u.name || u.username,
        profilePicture: u.profilePicture || u.avatar,
      }));

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

  const quickEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
  };

  // ── submit (new comment OR edit) ─────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitGuard.current) return;
    if (!postId) {
      showToast('Cannot post comment on this item.');
      return;
    }

    let contentToSend = trimmed;
    if (replyTo && isReplyingToSelf) {
      contentToSend = contentToSend.replace(/^@\S+\s*/, '').trim();
      if (!contentToSend) {
        showToast('Please enter a comment');
        return;
      }
    }

    submitGuard.current = true;
    setSubmitting(true);
    setShowTag(false);

    try {
      if (editTarget) {
        let updated: BackendComment;
        try {
          updated = await editCommentApi(postId, editTarget.id, contentToSend);
        } catch {
          updated = { ...editTarget, content: contentToSend, updatedAt: new Date().toISOString() };
        }
        const updateTree = (list: BackendComment[]): BackendComment[] =>
          list.map(c => {
            if (Number(c.id) === Number(updated.id)) {
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
        let enriched: BackendComment;
        try {
          const parentCommentId = replyTo ? (replyTo.topLevelId || replyTo.id) : undefined;
          const created = await addPostComment(postId, contentToSend, parentCommentId);
          enriched = {
            ...created,
            content: contentToSend,
            createdAt: created.createdAt || new Date().toISOString(),
            userId: created.userId || sessionUser?.id || 0,
            userName: created.userName || sessionUser?.fullName || 'You',
            userUsername: created.userUsername || sessionUser?.username,
            userImageUrl: created.userImageUrl || (sessionAvatarUri ? String(sessionAvatarUri) : undefined),
            parentId: created.parentId || (replyTo ? (replyTo.topLevelId || replyTo.id) : undefined),
            parentUserId: created.parentUserId || replyTo?.userId,
            parentUserName: created.parentUserName || replyTo?.name,
          };
        } catch (err: any) {
          // Fallback if backend API endpoint throws for mock post or connection error
          enriched = {
            id: Date.now(),
            postId,
            content: contentToSend,
            createdAt: new Date().toISOString(),
            userId: sessionUser?.id || 999,
            userName: sessionUser?.fullName || 'You',
            userUsername: sessionUser?.username || 'you',
            userImageUrl: sessionAvatarUri ? String(sessionAvatarUri) : undefined,
            parentId: replyTo ? (replyTo.topLevelId || replyTo.id) : undefined,
            parentUserId: replyTo?.userId,
            parentUserName: replyTo?.name,
            likesCount: 0,
            isLiked: false,
            repliesCount: 0,
            replies: [],
          };
        }

        if (replyTo) {
          setExpandedReplies(prev => ({ ...prev, [replyTo.topLevelId]: true }));
          setComments(prev => prev.map(c =>
            Number(c.id) === Number(replyTo.topLevelId)
              ? { ...c, replies: [...(c.replies || []), enriched], repliesCount: (c.repliesCount || 0) + 1 }
              : c
          ));
        } else {
          setComments(prev => [enriched, ...prev]);
          requestAnimationFrame(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }));
        }
        onCommentAdded?.();
        setReplyTo(null);
      }
      setText('');
    } catch (err: any) {
      showToast(err?.message || 'Could not send comment. Try again.');
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
        if (Number(c.id) === Number(commentId)) {
          return { ...c, isLiked: !isLiked, likesCount: isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1 };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: patch(c.replies) };
        }
        return c;
      });
    setComments(patch);
    try {
      const raw = isLiked
        ? await unlikeCommentApi(postId, commentId)
        : await likeCommentApi(postId, commentId);
      const updated = normalizeComment(raw);

      const syncServer = (list: BackendComment[]): BackendComment[] =>
        list.map(c => {
          if (Number(c.id) === Number(updated.id)) {
            const serverLiked = updated.isLiked !== undefined ? updated.isLiked : !isLiked;
            return { ...c, isLiked: serverLiked, likesCount: updated.likesCount };
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
            if (Number(c.id) === Number(commentId)) {
              return { ...c, isLiked, likesCount: isLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1) };
            }
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: revert(c.replies) };
            }
            return c;
          });
        return revert(prev);
      });
      showToast('Could not update like. Try again.');
    }
  };

  // ── reply trigger ────────────────────────────────────────────────────────
  const handleReply = (commentId: number, userName: string, userId?: number) => {
    const topLevel = comments.find(c =>
      Number(c.id) === Number(commentId) || (c.replies && c.replies.some(r => Number(r.id) === Number(commentId)))
    );
    const topLevelId = topLevel ? topLevel.id : commentId;

    const replyingToMyself = Boolean(
      (userId && sessionUser?.id && Number(userId) === Number(sessionUser.id)) ||
      (sessionUser?.username && userName?.toLowerCase() === sessionUser.username.toLowerCase()) ||
      (sessionUser?.fullName && userName?.toLowerCase() === sessionUser.fullName.toLowerCase())
    );

    setReplyTo({ id: commentId, name: userName, userId, topLevelId });
    setEditTarget(null);

    // If replying to yourself, no need to mention your username
    if (replyingToMyself) {
      if (text.trim().startsWith(`@${userName}`)) {
        setText('');
      } else if (text.trim().startsWith('@')) {
        setText('');
      }
    } else if (userName) {
      // If replying to someone else, prefill @username
      if (!text.trim() || text.trim().startsWith('@')) {
        setText(`@${userName} `);
      }
    }
    inputRef.current?.focus();
  };

  // ── edit trigger ─────────────────────────────────────────────────────────
  const handleEdit = (comment: BackendComment) => {
    setEditTarget(comment);
    setReplyTo(null);
    setText(comment.content || '');
    inputRef.current?.focus();
  };

  const cancelEdit = () => { setEditTarget(null); setText(''); };
  const cancelReply = () => {
    if (replyTo && text.trim() === `@${replyTo.name}`) {
      setText('');
    }
    setReplyTo(null);
  };

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = (commentId: number) => {
    if (!postId) return;
    Alert.alert(
      'Delete comment?',
      'Are you sure you want to remove this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const removeFromTree = (list: BackendComment[]): BackendComment[] =>
              list
                .filter(c => Number(c.id) !== Number(commentId))
                .map(c => {
                  if (c.replies && c.replies.length > 0) {
                    const newReplies = removeFromTree(c.replies);
                    const removed = c.replies.length - newReplies.length;
                    return {
                      ...c,
                      replies: newReplies,
                      repliesCount: Math.max(0, (c.repliesCount ?? c.replies.length) - removed),
                    };
                  }
                  return c;
                });

            setComments(removeFromTree);
            try {
              await deleteCommentApi(postId, commentId);
              onCommentDeleted?.();
            } catch {
              showToast('Could not delete comment.');
              if (postId) loadPage(0, true);
            }
          },
        },
      ]
    );
  };

  const handleBackdropPress = useCallback(() => {
    if (text.trim().length > 0) {
      Alert.alert(
        'Discard comment?',
        "Your comment hasn't been posted yet.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose },
        ]
      );
    } else {
      onClose();
    }
  }, [text, onClose]);

  const isReplyingToSelf = Boolean(
    replyTo && (
      (replyTo.userId && sessionUser?.id && Number(replyTo.userId) === Number(sessionUser.id)) ||
      (sessionUser?.username && replyTo.name?.toLowerCase() === sessionUser.username.toLowerCase()) ||
      (sessionUser?.fullName && replyTo.name?.toLowerCase() === sessionUser.fullName.toLowerCase())
    )
  );

  const placeholder = editTarget
    ? 'Edit your comment…'
    : replyTo
    ? (isReplyingToSelf ? 'Reply to your comment…' : `Reply to @${replyTo.name}…`)
    : 'Add a comment…';

  const handleLoadMoreReplies = async (item: BackendComment) => {
    if (!postId) return;
    try {
      const nextPage = repliesPageRef.current[item.id] ?? 0;
      const res = await fetchCommentReplies(postId, item.id, nextPage, 20);
      if (res.content && res.content.length > 0) {
        repliesPageRef.current[item.id] = nextPage + 1;
        const incomingReplies = res.content.map(normalizeComment);
        setComments(prev => prev.map(c => {
          if (Number(c.id) !== Number(item.id)) return c;
          const existingIds = new Set((c.replies || []).map(r => r.id));
          const newReplies = incomingReplies.filter((r: BackendComment) => !existingIds.has(r.id));
          const merged = [...(c.replies || []), ...newReplies];
          const totalFromApi = res.totalElements != null ? res.totalElements : merged.length;
          return {
            ...c,
            replies: merged,
            repliesCount: Math.max(merged.length, totalFromApi),
          };
        }));
      } else {
        // No more replies available on backend - clamp repliesCount to loaded replies
        setComments(prev => prev.map(c => {
          if (Number(c.id) !== Number(item.id)) return c;
          return { ...c, repliesCount: c.replies?.length || 0 };
        }));
      }
    } catch (err) {
      console.warn('Failed to load replies:', err);
    }
  };

  const totalCommentsCount = comments.reduce(
    (sum, c) => sum + 1 + (c.repliesCount || c.replies?.length || 0),
    0
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={handleBackdropPress} />
      <View style={s.modalContainer} pointerEvents="box-none">
        <KeyboardAvoidingView
          behavior="padding"
          style={s.sheet}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={s.handle} />
          <View style={s.header}>
            <Text style={s.title}>
              Comments{totalCommentsCount > 0 ? ` (${totalCommentsCount})` : ''}
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close comments">
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Post Snippet Bar */}
          {postSnippet && (postSnippet.text || postSnippet.userName) && (
            <View style={s.postSnippetBar}>
              <Image source={postSnippet.userAvatar || DEFAULT_AVATAR} style={s.snippetAvatar} />
              <View style={s.snippetInfo}>
                <Text style={s.snippetUser} numberOfLines={1}>
                  {postSnippet.userUsername || postSnippet.userName}
                </Text>
                {!!postSnippet.text && (
                  <Text style={s.snippetText} numberOfLines={1}>
                    {postSnippet.text}
                  </Text>
                )}
              </View>
              {!!postSnippet.imageUrl && (
                <Image source={{ uri: resolveImageUrl(postSnippet.imageUrl) }} style={s.snippetThumb} />
              )}
            </View>
          )}

          {/* List area */}
          {loading ? (
            <View style={s.list}>
              <CommentSkeletonRow />
              <CommentSkeletonRow indent />
              <CommentSkeletonRow />
            </View>
          ) : loadErr ? (
            <View style={s.center}>
              <Ionicons name="alert-circle-outline" size={40} color="#e53935" />
              <Text style={s.emptyTitle}>Could not load comments</Text>
              <TouchableOpacity style={s.retryBtn} onPress={() => loadPage(0, true)}>
                <Text style={s.retryTxt}>Tap to retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={comments}
              keyExtractor={item => String(item.id)}
              style={s.list}
              contentContainerStyle={comments.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : { paddingBottom: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                <View style={s.center}>
                  <Ionicons name="chatbubble-outline" size={44} color="#DDD" />
                  <Text style={s.emptyTitle}>No comments yet.</Text>
                  <Text style={s.hint}>Be the first to comment.</Text>
                </View>
              }
              ListFooterComponent={
                loadingMore ? <ActivityIndicator size="small" color={PURPLE} style={{ marginVertical: 12 }} /> : null
              }
              renderItem={({ item }) => (
                <View>
                  <CommentItem
                    comment={item}
                    postId={postId || 0}
                    sessionUserId={sessionUser?.id}
                    sessionAvatar={sessionAvatar}
                    onLike={handleLike}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onNavigateToProfile={onNavigateToProfile}
                    nowTick={nowTick}
                  />

                  {/* Render replies: maximum 3 visible initially, expandable */}
                  {(() => {
                    const isExpanded = Boolean(expandedReplies[item.id]);
                    const allReplies = item.replies || [];
                    const visibleReplies = isExpanded ? allReplies : allReplies.slice(0, 3);
                    const totalReplies = Math.max(item.repliesCount || 0, allReplies.length);
                    const unshownCount = Math.max(0, totalReplies - visibleReplies.length);

                    return (
                      <>
                        {visibleReplies.map(reply => (
                          <CommentItem
                            key={reply.id}
                            comment={reply}
                            postId={postId || 0}
                            sessionUserId={sessionUser?.id}
                            sessionAvatar={sessionAvatar}
                            onLike={handleLike}
                            onReply={(rId, rName, rUserId) => handleReply(rId, rName, rUserId)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onNavigateToProfile={onNavigateToProfile}
                            depth={1}
                            parentAuthorId={item.userId}
                            parentAuthorName={item.userUsername || item.userName}
                            nowTick={nowTick}
                          />
                        ))}

                        {/* View more replies button when there are more than 3 replies */}
                        {unshownCount > 0 && (
                          <TouchableOpacity
                            style={s.viewMoreReplies}
                            onPress={() => {
                              setExpandedReplies(prev => ({ ...prev, [item.id]: true }));
                              if (allReplies.length < totalReplies) {
                                handleLoadMoreReplies(item);
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <View style={s.viewMoreLine} />
                            <Text style={s.viewMoreTxt}>
                              View {unshownCount} more {unshownCount === 1 ? 'reply' : 'replies'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    );
                  })()}
                </View>
              )}
            />
          )}

          {/* Tag suggestions */}
          {showTag && tagUsers.length > 0 && (
            <ScrollView
              style={s.tagBox}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
            >
              {tagUsers.slice(0, 5).map((u, index) => (
                <TouchableOpacity key={u.id || index} style={s.tagItem} onPress={() => pickTag(u.username || 'user')}>
                  <Image source={u.profilePicture ? { uri: resolveImageUrl(u.profilePicture) } : DEFAULT_AVATAR} style={s.tagAvatar} />
                  <View style={{ flex: 1 }}>
                    <HighlightMatch text={u.fullName} query={activeTagQuery.current} style={s.tagName} highlightStyle={s.tagMatch} />
                    <Text style={s.tagHandle}>
                      @<HighlightMatch text={u.username} query={activeTagQuery.current} style={s.tagHandle} highlightStyle={[s.tagMatch, { color: '#111827' }]} />
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}


          {/* Reply / Edit banner */}
          {(replyTo || editTarget) && (
            <View style={s.contextBanner}>
              <Text style={s.contextTxt}>
                {editTarget
                  ? 'Editing comment'
                  : isReplyingToSelf
                  ? 'Replying to your comment'
                  : `Replying to @${replyTo?.name}`}
              </Text>
              <TouchableOpacity
                onPress={editTarget ? cancelEdit : cancelReply}
                accessibilityLabel="Cancel"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color="#737373" />
              </TouchableOpacity>
            </View>
          )}

          {/* Composer */}
          <View style={[
            s.composer,
            { paddingBottom: keyboardVisible ? 4 : (Platform.OS === 'ios' ? 8 : 6) }
          ]}>
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
                returnKeyType="default"
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

          {/* Inline Toast Overlay */}
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
    pointerEvents: 'box-none',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  handle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' },

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

  list: { paddingHorizontal: 16, paddingTop: 8, flex: 1, minHeight: 120 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#555', marginTop: 8 },
  hint: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#999' },
  retryBtn: { marginTop: 8, backgroundColor: PURPLE, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  retryTxt: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 13 },

  commentRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  replyIndent: {
    marginLeft: 46,
    marginBottom: 14,
  },
  avatarCol: {
    paddingTop: 2,
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  commentBody: {
    flex: 1,
    paddingRight: 10,
  },
  commentText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
    lineHeight: 18,
  },
  commentUser: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  mention: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  seeMore: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Poppins-Medium',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  metaTimestamp: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#8E8E93',
  },
  metaReplyBtn: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#737373',
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaIconBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaEdited: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#B0B0B0',
  },
  likeCol: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
    minWidth: 26,
  },
  likeColCount: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },

  viewMoreReplies: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 48,
    marginBottom: 12,
    marginTop: -4,
  },
  viewMoreLine: {
    width: 24,
    height: 1,
    backgroundColor: '#D1D5DB',
    marginRight: 10,
  },
  viewMoreTxt: {
    fontSize: 12,
    color: '#737373',
    fontFamily: 'Poppins-SemiBold',
  },

  tagBox: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', maxHeight: 180 },
  tagItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  tagAvatar: { width: 32, height: 32, borderRadius: 16 },
  tagName: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#111' },
  tagHandle: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#111827' },
  tagMatch: { fontFamily: 'Poppins-Bold' },

  skeletonRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  skeletonAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10, backgroundColor: '#EEE' },
  skeletonBar: { height: 10, borderRadius: 5, backgroundColor: '#EEE' },

  charCount: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#aaa', marginRight: 2 },

  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastTxt: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Medium' },

  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contextTxt: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },

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

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
    backgroundColor: '#fff',
    flexShrink: 0,
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