import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, Image,
  FlatList, TextInput, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface Reply {
  id: number;
  userName: string;
  userImage: any;
  text: string;
  likes: number;
  likedByMe: boolean;
}

interface Comment {
  id: number;
  userName: string;
  userImage: any;
  text: string;
  likes: number;
  likedByMe: boolean;
  replies: Reply[];
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  currentUserImage: any;
  onCommentAdded?: () => void;
}

const HeartIcon = ({ filled, size = 16 }: { filled: boolean; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#7126D0' : 'none'} stroke={filled ? '#7126D0' : '#aaa'} strokeWidth="2">
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </Svg>
);

const initialComments: Comment[] = [
  {
    id: 1,
    userName: 'Ange Nadette',
    userImage: require('../../assets/images/story1.png'),
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus,',
    likes: 2,
    likedByMe: true,
    replies: [],
  },
  {
    id: 2,
    userName: 'Ange Nadette',
    userImage: require('../../assets/images/story2.png'),
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus,',
    likes: 0,
    likedByMe: false,
    replies: [],
  },
  {
    id: 3,
    userName: 'Ange Nadette',
    userImage: require('../../assets/images/story3.png'),
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus,',
    likes: 2,
    likedByMe: true,
    replies: [],
  },
  {
    id: 4,
    userName: 'Ange Nadette',
    userImage: require('../../assets/images/story4.png'),
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus,',
    likes: 2,
    likedByMe: true,
    replies: [],
  },
  {
    id: 5,
    userName: 'Ange Nadette',
    userImage: require('../../assets/images/story1.png'),
    text: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus,',
    likes: 2,
    likedByMe: true,
    replies: [],
  },
];

const CommentsModal: React.FC<CommentsModalProps> = ({ visible, onClose, currentUserImage, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleLikeComment = (commentId: number) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  const handleLikeReply = (commentId: number, replyId: number) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? {
              ...c,
              replies: c.replies.map(r =>
                r.id === replyId
                  ? { ...r, likedByMe: !r.likedByMe, likes: r.likedByMe ? r.likes - 1 : r.likes + 1 }
                  : r
              ),
            }
          : c
      )
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now(),
        userName: 'You',
        userImage: currentUserImage,
        text: newComment.trim(),
        likes: 0,
        likedByMe: false,
        replies: [],
      },
    ]);
    setNewComment('');
    onCommentAdded?.();
  };

  const handleAddReply = (commentId: number) => {
    if (!replyText.trim()) return;
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: Date.now(),
                  userName: 'You',
                  userImage: currentUserImage,
                  text: replyText.trim(),
                  likes: 0,
                  likedByMe: false,
                },
              ],
            }
          : c
      )
    );
    setReplyText('');
    setReplyingTo(null);
    onCommentAdded?.();
  };

  const formatLikes = (n: number) => (n > 0 ? String(n) : '');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Comments</Text>

        <FlatList
          data={comments}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <Image source={item.userImage} style={styles.avatar} />
              <View style={styles.commentBody}>
                <Text style={styles.commentUser}>{item.userName}</Text>
                <Text style={styles.commentText}>{item.text}</Text>
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
                      placeholderTextColor="#333"
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
                {item.replies.map(reply => (
                  <View key={reply.id} style={styles.replyRow}>
                    <Image source={reply.userImage} style={styles.replyAvatar} />
                    <View style={styles.replyBody}>
                      <Text style={styles.commentUser}>{reply.userName}</Text>
                      <Text style={styles.commentText}>{reply.text}</Text>
                    </View>
                    <TouchableOpacity style={styles.likeBtn} onPress={() => handleLikeReply(item.id, reply.id)}>
                      <HeartIcon filled={reply.likedByMe} size={14} />
                      {reply.likes > 0 && <Text style={styles.likeCount}>{reply.likes}</Text>}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Per-comment like button */}
              <TouchableOpacity style={styles.likeBtn} onPress={() => handleLikeComment(item.id)}>
                <HeartIcon filled={item.likedByMe} />
                {item.likes > 0 && <Text style={styles.likeCount}>{formatLikes(item.likes)}</Text>}
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Add comment bar */}
        <View style={styles.addRow}>
          <Image source={currentUserImage} style={styles.avatar} />
          <View style={styles.addInputContainer}>
            <TextInput
              style={styles.addInput}
              placeholder="Add comment"
              placeholderTextColor="#333"
              value={newComment}
              onChangeText={setNewComment}
              returnKeyType="send"
              onSubmitEditing={handleAddComment}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.sendIconBtn}>
              <Ionicons name="send" size={18} color="#7126D0" />
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
  commentUser: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#000' },
  commentText: { fontSize: 16, fontFamily: 'Poppins-Regular', color: '#333', lineHeight: 22, marginTop: 2 },
  replyLabel: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#8c8c8c', marginTop: 5 },
  likeBtn: { alignItems: 'center', marginLeft: 8, minWidth: 20 },
  likeCount: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#7126D0', marginTop: 2 },
  replyInputRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 8,
    backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
  },
  replyInput: { flex: 1, fontSize: 16, fontFamily: 'Poppins-Regular', color: '#000', padding: 0 },
  replySendIconBtn: { marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  sendLabel: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#7126D0', marginLeft: 8 },
  replyRow: { flexDirection: 'row', marginTop: 10, paddingLeft: 8, alignItems: 'flex-start' },
  replyAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 8 },
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
    flex: 1, paddingVertical: 12,
    fontSize: 16, fontFamily: 'Poppins-Regular', color: '#000',
  },
  sendIconBtn: {
    marginLeft: 8, justifyContent: 'center', alignItems: 'center',
  },
});
