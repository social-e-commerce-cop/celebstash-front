import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Image, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductItem, productsService } from '@/lib/productsService';
import { followService } from '@/lib/followService';
import { resolveImageUrl } from '@/lib/apiClient';
import { SelectedMedia, TaggedUser, PURPLE, LIGHT_PURPLE, BORDER_PURPLE } from './CreatePostTypes';
import { Dimensions } from 'react-native';

const { width: W } = Dimensions.get('window');

interface Props {
  selectedMedia?: SelectedMedia[];
  caption: string;
  onCaptionChange: (t: string) => void;
  taggedUsers: TaggedUser[];
  onTaggedUsersChange: (u: TaggedUser[]) => void;
  linkedProduct: ProductItem | null;
  onProductChange: (p: ProductItem | null) => void;
}

export default function StepDetails({
  selectedMedia = [],
  caption, onCaptionChange,
  taggedUsers, onTaggedUsersChange,
  linkedProduct, onProductChange,
}: Props) {
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const [peopleQuery, setPeopleQuery] = useState('');
  const [people, setPeople] = useState<TaggedUser[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const [productQuery, setProductQuery] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const openPeople = async () => {
    setPeopleOpen(true);
    setLoadingPeople(true);
    try {
      const res = await followService.getAllUsers();
      if (Array.isArray(res) && res.length > 0) {
        setPeople(res as any);
      } else {
        const fallback = await followService.getSuggestedUsers();
        setPeople(fallback as any);
      }
    } catch {
      try {
        const fallback = await followService.getSuggestedUsers();
        setPeople(fallback as any);
      } catch {
        setPeople([]);
      }
    } finally {
      setLoadingPeople(false);
    }
  };

  const openProducts = async () => {
    setProductOpen(true);
    setLoadingProducts(true);
    try {
      const res = await productsService.getMyProducts();
      setProducts(Array.isArray(res) ? res : []);
    } catch {
      try {
        const res2 = await productsService.getAllProducts();
        setProducts(Array.isArray(res2) ? res2 : []);
      } catch {
        setProducts([]);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const togglePerson = (u: TaggedUser) => {
    const exists = taggedUsers.find(t => t.id === u.id);
    if (exists) onTaggedUsersChange(taggedUsers.filter(t => t.id !== u.id));
    else onTaggedUsersChange([...taggedUsers, u]);
  };

  const filteredPeople = people.filter(p =>
    !peopleQuery || p.fullName?.toLowerCase().includes(peopleQuery.toLowerCase()) ||
    p.username?.toLowerCase().includes(peopleQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    !productQuery || p.name?.toLowerCase().includes(productQuery.toLowerCase())
  );

  return (
    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
      {/* Selected Media Slides Carousel Preview */}
      {selectedMedia && selectedMedia.length > 0 && (
        <View style={s.mediaPreviewContainer}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {selectedMedia.map((m, idx) => (
              <Image
                key={m.id || idx}
                source={{ uri: m.uri }}
                style={{ width: W, height: 220 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {selectedMedia.length > 1 && (
            <View style={s.mediaBadge}>
              <Text style={s.mediaBadgeTxt}>{selectedMedia.length} photos</Text>
            </View>
          )}
        </View>
      )}

      {/* Caption */}
      <View style={s.captionBox}>
        <TextInput
          style={s.captionInput}
          placeholder="Write a caption…"
          placeholderTextColor="#aaa"
          multiline
          value={caption}
          onChangeText={onCaptionChange}
          maxLength={5000}
          textAlignVertical="top"
        />
        <Text style={s.charCount}>{caption.length}/5000</Text>
      </View>

      <View style={s.divider} />

      {/* Tag People */}
      <TouchableOpacity style={s.row} onPress={openPeople}>
        <View style={s.rowIcon}>
          <Ionicons name="person-add-outline" size={20} color={PURPLE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowLabel}>Tag People</Text>
          {taggedUsers.length > 0 && (
            <Text style={s.rowSub}>{taggedUsers.map(u => u.username || u.fullName).join(', ')}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>

      {/* Add Product */}
      <TouchableOpacity style={s.row} onPress={openProducts}>
        <View style={s.rowIcon}>
          <Ionicons name="bag-handle-outline" size={20} color={PURPLE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.rowLabel}>Add Product</Text>
          {linkedProduct && (
            <Text style={s.rowSub}>{linkedProduct.name}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>

      {/* Selected product chip */}
      {linkedProduct && (
        <View style={s.productChip}>
          {linkedProduct.imageUrls?.[0] && (
            <Image source={{ uri: resolveImageUrl(linkedProduct.imageUrls[0]) }} style={s.productThumb} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.productChipName}>{linkedProduct.name}</Text>
            <Text style={s.productChipPrice}>${linkedProduct.price}</Text>
          </View>
          <TouchableOpacity onPress={() => onProductChange(null)}>
            <Ionicons name="close-circle" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      )}

      {/* People Modal */}
      <Modal visible={peopleOpen} animationType="slide" onRequestClose={() => setPeopleOpen(false)}>
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setPeopleOpen(false)}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>Tag People</Text>
            <TouchableOpacity onPress={() => setPeopleOpen(false)}>
              <Text style={s.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={s.searchBox}>
            <Ionicons name="search" size={16} color="#aaa" />
            <TextInput
              style={s.searchInput}
              placeholder="Search people…"
              placeholderTextColor="#aaa"
              value={peopleQuery}
              onChangeText={setPeopleQuery}
            />
          </View>
          {loadingPeople ? (
            <ActivityIndicator color={PURPLE} style={{ marginTop: 40 }} />
          ) : filteredPeople.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="people-outline" size={40} color="#ccc" />
              <Text style={s.emptyTxt}>No users found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredPeople}
              keyExtractor={i => String(i.id)}
              renderItem={({ item }) => {
                const tagged = taggedUsers.some(t => t.id === item.id);
                return (
                  <TouchableOpacity style={s.personRow} onPress={() => togglePerson(item as any)}>
                    {(item as any).profilePicture ? (
                      <Image source={{ uri: resolveImageUrl((item as any).profilePicture) }} style={s.personAvatar} />
                    ) : (
                      <View style={[s.personAvatar, { backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="person" size={18} color={PURPLE} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.personName}>{(item as any).fullName}</Text>
                      {(item as any).username && <Text style={s.personUser}>@{(item as any).username}</Text>}
                    </View>
                    {tagged && <Ionicons name="checkmark-circle" size={22} color={PURPLE} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>

      {/* Product Modal */}
      <Modal visible={productOpen} animationType="slide" onRequestClose={() => setProductOpen(false)}>
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setProductOpen(false)}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>Add Product</Text>
            <TouchableOpacity onPress={() => setProductOpen(false)}>
              <Text style={s.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={s.searchBox}>
            <Ionicons name="search" size={16} color="#aaa" />
            <TextInput
              style={s.searchInput}
              placeholder="Search products…"
              placeholderTextColor="#aaa"
              value={productQuery}
              onChangeText={setProductQuery}
            />
          </View>
          {loadingProducts ? (
            <ActivityIndicator color={PURPLE} style={{ marginTop: 40 }} />
          ) : filteredProducts.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="bag-outline" size={40} color="#ccc" />
              <Text style={s.emptyTxt}>No products found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              keyExtractor={i => String(i.id)}
              renderItem={({ item }) => {
                const chosen = linkedProduct?.id === item.id;
                return (
                  <TouchableOpacity style={s.productRow} onPress={() => { onProductChange(chosen ? null : item); setProductOpen(false); }}>
                    {item.imageUrls?.[0] ? (
                      <Image source={{ uri: resolveImageUrl(item.imageUrls[0]) }} style={s.productRowImg} />
                    ) : (
                      <View style={[s.productRowImg, { backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="bag-outline" size={22} color={PURPLE} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.productRowName}>{item.name}</Text>
                      <Text style={s.productRowPrice}>${item.price}</Text>
                    </View>
                    {chosen && <Ionicons name="checkmark-circle" size={22} color={PURPLE} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  mediaPreviewContainer: {
    width: '100%', height: 220, backgroundColor: '#f9f9f9', position: 'relative',
    borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  mediaBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  mediaBadgeTxt: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-Bold' },
  captionBox: { padding: 16, minHeight: 120 },
  captionInput: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#111', minHeight: 90, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#bbb', fontFamily: 'Poppins-Regular', textAlign: 'right', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 0 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderColor: '#f5f5f5',
  },
  rowIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: LIGHT_PURPLE, justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#111' },
  rowSub: { fontSize: 12, fontFamily: 'Poppins-Regular', color: PURPLE, marginTop: 1 },
  productChip: {
    flexDirection: 'row', alignItems: 'center', margin: 12,
    padding: 10, backgroundColor: LIGHT_PURPLE, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER_PURPLE,
  },
  productThumb: { width: 44, height: 44, borderRadius: 6, marginRight: 10 },
  productChipName: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#111' },
  productChipPrice: { fontSize: 12, fontFamily: 'Poppins-Medium', color: PURPLE },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' },
  modalDone: { fontSize: 14, fontFamily: 'Poppins-Bold', color: PURPLE },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: '#f5f5f5', borderRadius: 10,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#111' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTxt: { fontSize: 14, color: '#aaa', fontFamily: 'Poppins-Regular' },
  personRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#f5f5f5',
  },
  personAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  personName: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#111' },
  personUser: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#888' },
  productRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#f5f5f5',
  },
  productRowImg: { width: 52, height: 52, borderRadius: 8, marginRight: 12 },
  productRowName: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#111' },
  productRowPrice: { fontSize: 12, fontFamily: 'Poppins-Medium', color: PURPLE },
});
