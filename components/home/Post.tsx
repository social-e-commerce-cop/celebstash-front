import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PostCard from './PostCard';
import { PostData, default as postsData } from '@/lib/postsData';

interface PostProps {
  posts?: PostData[];
}

const Post: React.FC<PostProps> = ({ posts = postsData }) => {
  if (posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No posts found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: { marginBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#aaa' },
});