import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from './PostCard';
import { PostData } from '@/lib/postsData';
import { BackendPost } from '@/lib/postService';

interface PostProps {
  posts?: (BackendPost | PostData | any)[];
  onAddPostPress?: () => void;
  isArtist?: boolean;
  emptyMessage?: string;
}

const Post: React.FC<PostProps> = ({
  posts = [],
  onAddPostPress,
  isArtist = false,
  emptyMessage = 'Follow creators & artists to see their latest drops and posts here!',
}) => {
  if (!posts || posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        {isArtist && onAddPostPress && (
          <TouchableOpacity style={styles.addPostBtn} onPress={onAddPostPress} activeOpacity={0.85}>
            <Text style={styles.addPostBtnText}>Create Post</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {posts.map((post, index) => (
        <PostCard key={post.id ? `post_${post.id}` : `post_idx_${index}`} post={post} />
      ))}
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#888', textAlign: 'center', marginBottom: 16 },
  artistAddPostFooter: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  addPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7126D0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addPostBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
