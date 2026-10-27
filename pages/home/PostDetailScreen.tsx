import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PostCard from '@/components/home/PostCard';
import { BackendPost, fetchPostById } from '@/lib/postService';
import { ApiError } from '@/lib/apiClient';

const PURPLE = '#7126D0';

/**
 * A single post, opened from a notification (like, comment, repost, new post). With
 * `openComments` the comments sheet opens straight away, as when tapping a comment notification.
 */
export default function PostDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const postId = Number(route.params?.postId);
  const openComments = Boolean(route.params?.openComments);

  const [post, setPost] = useState<BackendPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!postId) {
      setError('This post could not be found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setPost(await fetchPostById(postId));
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? 'This post is no longer available.'
          : 'Could not load this post. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Post</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : error || !post ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color="#D1D5DB" />
          <Text style={styles.errorText}>{error ?? 'This post could not be found.'}</Text>
          {!(error ?? '').includes('no longer') && (
            <TouchableOpacity style={styles.retryBtn} onPress={load}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PostCard
            post={post}
            initialCommentsOpen={openComments}
            onPostUpdated={(_, patch) => setPost((p) => (p ? { ...p, ...patch } : p))}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 8,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#111' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  errorText: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#6B7280', textAlign: 'center' },
  retryBtn: { backgroundColor: PURPLE, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 14 },
});
