/**
 * SharedMediaScreen.tsx
 * Everything shared inside one conversation, by kind. Each tab is its own paginated backend
 * query rather than a filter over a locally held list, so opening "Docs" does not require
 * having first downloaded every photo in the thread.
 *
 * Fetching is also deliberately separate from the message list: browsing the gallery must not
 * mark the conversation as read.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SharedMediaItem, ProductCardData } from '@/types/chatTypes';
import ProductCard from '@/components/messages/ProductCard';
import { chatService, MessageDto } from '@/lib/chatService';
import { toSharedMediaItem, toLocalMessage } from '@/lib/chatMappers';
import { getSessionUser } from '@/lib/session';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';
const PAGE_SIZE = 40;

type MediaTab = 'Photos' | 'Videos' | 'Docs' | 'Links' | 'Products';
const TABS: MediaTab[] = ['Photos', 'Videos', 'Docs', 'Links', 'Products'];

/** Photos and videos share one backend query; the tab picks which of the two to show. */
const KIND_FOR_TAB: Record<MediaTab, 'media' | 'documents' | 'links' | 'products'> = {
  Photos: 'media',
  Videos: 'media',
  Docs: 'documents',
  Links: 'links',
  Products: 'products',
};

export default function SharedMediaScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId;
  const numericConvId = conversationId == null || isNaN(Number(conversationId))
    ? null
    : Number(conversationId);
  const myId = getSessionUser()?.id ?? 0;

  const [activeTab, setActiveTab] = useState<MediaTab>(route.params?.initialTab ?? 'Photos');
  const [items, setItems] = useState<SharedMediaItem[]>([]);
  const [products, setProducts] = useState<{ id: string; product: ProductCardData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProducts = activeTab === 'Products';

  const load = useCallback(async (pageNum: number) => {
    if (!numericConvId) {
      setError('No conversation was selected.');
      setLoading(false);
      return;
    }
    try {
      pageNum === 0 ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const paged = await chatService.getSharedMedia(
        numericConvId, KIND_FOR_TAB[activeTab], pageNum, PAGE_SIZE,
      );

      if (isProducts) {
        const mapped = paged.content
          .map((d: MessageDto) => {
            const local = toLocalMessage(d, myId);
            return local.product ? { id: local.id, product: local.product } : null;
          })
          .filter(Boolean) as { id: string; product: ProductCardData }[];
        setProducts(prev => (pageNum === 0 ? mapped : [...prev, ...mapped]));
      } else {
        const wanted = activeTab === 'Videos' ? 'video' : activeTab === 'Photos' ? 'photo' : null;
        const mapped = paged.content
          .map((d: MessageDto) => toSharedMediaItem(d, myId))
          .filter(Boolean)
          .filter(m => !wanted || (m as SharedMediaItem).type === wanted) as SharedMediaItem[];
        setItems(prev => (pageNum === 0 ? mapped : [...prev, ...mapped]));
      }

      setHasMore(!paged.last);
      setPage(pageNum);
    } catch (e: any) {
      setError(e?.message ?? 'Could not load shared items.');
      if (pageNum === 0) { setItems([]); setProducts([]); }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [numericConvId, activeTab, isProducts, myId]);

  // Switching tab is a fresh query, not a re-filter of what is already held. load(0) sets
  // `loading` first and replaces both lists when it resolves, so no separate reset is needed —
  // the spinner covers the gap and stale rows are never shown.
  useEffect(() => {
    const id = setTimeout(() => load(0), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, numericConvId]);

  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) load(page + 1);
  };

  const isGrid = activeTab === 'Photos' || activeTab === 'Videos';

  const renderPhotoVideo = ({ item }: { item: SharedMediaItem }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={item.uri} style={styles.gridImage} />
      {item.type === 'video' && (
        <View style={styles.videoIcon}>
          <Ionicons name="play-circle" size={24} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderDoc = ({ item }: { item: SharedMediaItem }) => (
    <TouchableOpacity style={styles.docRow}>
      <View style={styles.docIconWrap}>
        <Ionicons name="document-text" size={24} color={PURPLE} />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.docMeta}>
          {[item.size, new Date(item.timestamp).toLocaleDateString()].filter(Boolean).join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderLink = ({ item }: { item: SharedMediaItem }) => (
    <View style={styles.linkRow}>
      <Ionicons name="link-outline" size={20} color={PURPLE} />
      <View style={{ flex: 1 }}>
        <Text style={styles.docName} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.docMeta}>{new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  const emptyState = (
    <View style={styles.emptyState}>
      {error ? (
        <>
          <Ionicons name="alert-circle-outline" size={44} color="#D1D5DB" />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => load(0)}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No {activeTab.toLowerCase()} shared yet</Text>
        </>
      )}
    </View>
  );

  const footer = loadingMore
    ? <ActivityIndicator style={{ marginVertical: 20 }} color={PURPLE} />
    : null;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shared Media</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsWrap}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.emptyState}><ActivityIndicator size="large" color={PURPLE} /></View>
      ) : isProducts ? (
        <FlatList
          key="products"
          data={products}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <View style={styles.productRow}>
              <ProductCard product={item.product} />
            </View>
          )}
          ListEmptyComponent={emptyState}
          ListFooterComponent={footer}
        />
      ) : (
        <FlatList
          key={isGrid ? 'grid' : 'list'}
          data={items}
          keyExtractor={item => item.id}
          numColumns={isGrid ? 3 : 1}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          renderItem={(props) => {
            if (isGrid) return renderPhotoVideo(props);
            if (activeTab === 'Docs') return renderDoc(props);
            return renderLink(props);
          }}
          ListEmptyComponent={emptyState}
          ListFooterComponent={footer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff',
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },

  // Tabs
  tabsWrap: {
    flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 8,
  },
  tabBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F3F4F6' },
  tabBtnActive: { backgroundColor: PURPLE },
  tabText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  // List
  listContent: { padding: 2, flexGrow: 1 },

  // Grid (Photos/Videos)
  gridItem: { width: width / 3 - 4, aspectRatio: 1, margin: 2 },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoIcon: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },

  // List items
  docRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  docIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8F5FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#111', marginBottom: 2 },
  docMeta: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },

  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  productRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', alignItems: 'center' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: PURPLE },
  retryText: { color: '#fff', fontFamily: 'Poppins-Medium', fontSize: 14 },
});
