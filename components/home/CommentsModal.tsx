import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, Image,
  FlatList, TextInput, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { fetchPostComments, addPostComment, BackendComment } from '@/lib/postService';

const { height } = Dimensions.get('window');

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserImage: any;
  postId?: number;
  onCommentAdded?: () => void;
}

const HeartIcon = ({ filled, size = 16 }: { filled: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#7126D0' : 'none'} stroke={filled ? '#7126D0' : '#aaa'} strokeWidth="2">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

export const CommentsModal: React.FC<CommentsModalProps> = ({ visible, onClose, currentUserImage, postId, onCommentAdded }) => {
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    }
  }, [visible, postId]);

  const loadComments = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await fetchPostComments(postId);
      setComments(res.content || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId || submitting) return;
    setSubmitting(true);
    try {
      const created = await addPostComment(postId, newComment.trim());
      setComments(prev => [created, ...prev]);
      setNewComment('');
      onCommentAdded?.();
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentCommentId: number) => {
    if (!replyText.trim() || !postId || submitting) return;
    setSubmitting(true);
    try {
      const reply = await addPostComment(postId, replyText.trim(), parentCommentId);
      setComments(prev =>
        prev.map(c =>
          c.id === parentCommentId
            ? {
                ...c,
                replies: [...(c.replies || []), reply],
                repliesCount: c.repliesCount + 1,
              }
            : c
        )
      );
      setReplyText('');
      setReplyingTo(null);
      onCommentAdded?.();
    } catch (err) {
      console.error('Failed to add reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatLikes = (n: number) => (n > 0 ? String(n) : '');

  const getImageSource = (img: any) => {
    if (!img) return currentUserImage || require('../../assets/images/black-man.png');
    if (typeof img === 'string') {
      return { uri: img };
    }
    return img;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Comments</Text>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#7126D0" />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontFamily: 'Poppins-Medium', color: '#999' }}>
                  No comments yet. Start the conversation!
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Image source={getImageSource(item.userImageUrl)} style={styles.avatar} />
                <View style={styles.commentBody}>
                  <Text style={styles.commentUser}>{item.userName}</Text>
                  <Text style={styles.commentText}>{item.content}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setReplyingTo(replyingTo === item.id ? null : item.id);
                      setReplyText('');
                    }}
                  >
                    <Text style={styles.replyLabel}>Reply</Text>
                  </TouchableOpacity>

                  {/* Inline reply input */}
                  {replyingTo === item.id && (
                    <View style={styles.replyInputRow}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder={`Reply to ${item.userName}...`}
                        placeholderTextColor="#999"
                        value={replyText}
                        onChangeText={setReplyText}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleAddReply(item.id)} style={styles.replySendIconBtn}>
                        <Ionicons name="send" size={18} color="#7126D0" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Nested replies */}
                  {(item.replies || []).map(reply => (
                    <View key={reply.id} style={styles.replyRow}>
                      <Image source={getImageSource(reply.userImageUrl)} style={styles.replyAvatar} />
                      <View style={styles.replyBody}>
                        <Text style={styles.commentUser}>{reply.userName}</Text>
                        <Text style={styles.commentText}>{reply.content}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          />
        )}

        {/* Add comment bar */}
        <View style={styles.addRow}>
          <Image source={getImageSource(currentUserImage)} style={styles.avatar} />
          <View style={styles.addInputContainer}>
            <TextInput
              style={styles.addInput}
              placeholder="Add comment..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              returnKeyType="send"
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendIconBtn} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#7126D0" />
              ) : (
                <Ionicons name="send" size={18} color="#7126D0" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.78,
    paddingBottom: 20,
  },
  handle: {
    width: 50, height: 4, backgroundColor: '#ccc', borderRadius: 2,
    alignSelf: 'center', marginVertical: 16,
  },
  title: {
    textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-Bold', color: '#000',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  commentRow: { flexDirection: 'row', marginBottom: 18, alignItems: 'flex-start' },
  avatar: { width: 40, height: 40, borderRadius: 18, marginRight: 10 },
  commentBody: { flex: 1 },
  commentUser: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#000' },
  commentText: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#333', lineHeight: 20, marginTop: 2 },
  replyLabel: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#8c8c8c', marginTop: 4 },
  replyInputRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
  },
  replyInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#000', padding: 0 },
  replySendIconBtn: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  replyRow: { flexDirection: 'row', marginTop: 10, paddingLeft: 8, alignItems: 'flex-start' },
  replyAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  replyBody: { flex: 1 },
  addRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  addInputContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 24,
    paddingHorizontal: 16,
  },
  addInput: {
    flex: 1, paddingVertical: 10,
    fontSize: 14, fontFamily: 'Poppins-Regular', color: '#000',
  },
  sendIconBtn: {
    marginLeft: 8, justifyContent: 'center', alignItems: 'center',
  },
});
