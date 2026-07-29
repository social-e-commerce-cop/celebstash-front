import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getSharedMedia } from '@/data/mockChatData';
import { SharedMediaItem } from '@/types/chatTypes';
import ProductCard from '@/components/messages/ProductCard';
import LinkPreview from '@/components/messages/LinkPreview';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

type MediaTab = 'Photos' | 'Videos' | 'Docs' | 'Links' | 'Products';
const TABS: MediaTab[] = ['Photos', 'Videos', 'Docs', 'Links', 'Products'];

export default function SharedMediaScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId ?? 'c1';
  const initialTab = route.params?.initialTab ?? 'Photos';
  
  const [activeTab, setActiveTab] = useState<MediaTab>(initialTab);
  const media = getSharedMedia(conversationId);

  const filteredMedia = media.filter(m => {
    if (activeTab === 'Photos') return m.type === 'photo';
    if (activeTab === 'Videos') return m.type === 'video';
    if (activeTab === 'Docs') return m.type === 'document';
    if (activeTab === 'Links') return m.type === 'link';
    if (activeTab === 'Products') return m.type === 'product';
    return false;
  });

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
        <Text style={styles.docMeta}>{item.size} • {new Date(item.timestamp).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLink = ({ item }: { item: SharedMediaItem }) => (
    <View style={styles.linkRow}>
      <LinkPreview data={item.linkPreview!} />
    </View>
  );

  const renderProduct = ({ item }: { item: SharedMediaItem }) => (
    <View style={styles.productRow}>
      <ProductCard product={item.product!} />
    </View>
  );

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
      <FlatList
        data={filteredMedia}
        keyExtractor={item => item.id}
        numColumns={activeTab === 'Photos' || activeTab === 'Videos' ? 3 : 1}
        key={activeTab === 'Photos' || activeTab === 'Videos' ? 'grid' : 'list'}
        contentContainerStyle={styles.listContent}
        renderItem={(props) => {
          if (activeTab === 'Photos' || activeTab === 'Videos') return renderPhotoVideo(props);
          if (activeTab === 'Docs') return renderDoc(props);
          if (activeTab === 'Links') return renderLink(props);
          if (activeTab === 'Products') return renderProduct(props);
          return null;
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} shared yet</Text>
          </View>
        }
      />
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
  listContent: { padding: 2 },
  
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
  
  linkRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', alignItems: 'center' },
  productRow: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB', alignItems: 'center' },
  
  emptyState: { alignItems: 'center', paddingTop: 100, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#9CA3AF' },
});
