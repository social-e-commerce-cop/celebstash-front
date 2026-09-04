import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ImageBackground,
  TextInput,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import TabBar from '@/components/Tabbar';
import LatestDrops from '@/components/home/LatestDrops';
import UpcomingDrops from '@/components/home/UpcomingDrops';
import { productsService, ProductItem } from '@/lib/productsService';
import { formatPrice } from '@/lib/currency';

const { width, height } = Dimensions.get('window');
const H_PAD = 20;
const GAP = 12;
const CARD_W = (width - H_PAD * 2 - GAP) / 2;

type Category = 'All' | 'Clothing' | 'Accessories' | 'Art' | 'Utilities';

const CATEGORIES: Category[] = ['All', 'Clothing', 'Accessories', 'Art', 'Utilities'];

const PurpleVerifiedBadge = () => (
  <Svg width="14" height="14" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724ZM6.50256 15.462L5.51556 13.8119L3.65481 13.419C3.50581 13.3914 3.38706 13.3115 3.29856 13.179C3.21006 13.047 3.17356 12.9065 3.18906 12.7575L3.36681 10.8405L2.10456 9.40045C1.99856 9.29195 1.94556 9.15845 1.94556 8.99995C1.94556 8.84145 1.99856 8.70795 2.10456 8.59945L3.36681 7.15945L3.18906 5.2432C3.17406 5.0937 3.21056 4.95295 3.29856 4.82095C3.38706 4.68895 3.50581 4.60895 3.65481 4.58095L5.51481 4.1887L6.50181 2.5387C6.58281 2.4047 6.69156 2.3122 6.82806 2.2612C6.96456 2.2097 7.10581 2.21645 7.25181 2.28145L9.00006 3.0202L10.7476 2.28145C10.8941 2.21645 11.0356 2.2097 11.1721 2.2612C11.3086 2.3122 11.4173 2.4047 11.4983 2.5387L12.4846 4.1887L14.3453 4.58095C14.4943 4.60895 14.6131 4.68895 14.7016 4.82095C14.7901 4.95295 14.8266 5.0937 14.8111 5.2432L14.6341 7.15945L15.8956 8.59945C16.0016 8.70795 16.0546 8.84145 16.0546 8.99995C16.0546 9.15845 16.0016 9.2922 15.8956 9.4012L14.6341 10.8405L14.8111 12.7567C14.8261 12.9062 14.7896 13.047 14.7016 13.179C14.6131 13.3115 14.4943 13.3914 14.3453 13.419L12.4853 13.8119L11.4983 15.462C11.4173 15.5954 11.3086 15.688 11.1721 15.7395C11.0356 15.791 10.8943 15.784 10.7483 15.7185L9.00006 14.9797L7.25256 15.7185C7.10606 15.7835 6.96456 15.7902 6.82806 15.7387C6.69156 15.6877 6.58281 15.5952 6.50181 15.4612"
      fill="#7126D0"
    />
  </Svg>
);

export default function ShopScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAllProducts();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.log('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'All') {
      list = list.filter((p) => (p.category || 'Clothing').toLowerCase() === activeCategory.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.sellerName && p.sellerName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [products, activeCategory, search]);

  const navigateToProduct = (product?: ProductItem) => {
    const mainImg = product?.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product?.imageUrl;
    navigation.navigate('ProductDetails', {
      name: product?.name ?? 'Indorerwamo Collection',
      price: product?.price ?? 30,
      image: mainImg ? { uri: mainImg } : require('../../assets/images/products/product1.jpg'),
      imageUrls: Array.isArray(product?.imageUrls) && product.imageUrls.length > 0 ? product.imageUrls : (mainImg ? [mainImg] : []),
      description: product?.description || 'Exclusive limited merchandise from your favorite artist.',
      artistName: product?.sellerName ?? 'Kenny K Shot',
      verified: true,
      stockQuantity: product?.stockQuantity,
      sizeStock: product?.sizeStock,
      availableColors: product?.availableColors,
      isSeller: false,
    });
  };

  const renderProduct = ({ item, index }: { item: ProductItem; index: number }) => {
    const prodImg = (item.imageUrls && item.imageUrls.length > 0)
      ? { uri: item.imageUrls[0] }
      : item.imageUrl
      ? { uri: item.imageUrl }
      : require('../../assets/images/products/product1.jpg');

    return (
      <TouchableOpacity
        style={[styles.productCard, index % 2 === 0 ? { marginRight: GAP / 2 } : { marginLeft: GAP / 2 }]}
        activeOpacity={0.85}
        onPress={() => navigateToProduct(item)}
      >
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>{formatPrice(item.price)}</Text>
        </View>
        <Image source={prodImg} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.artistRow}>
            <Text style={styles.artistName} numberOfLines={1}>{item.sellerName || 'Artist'}</Text>
            <PurpleVerifiedBadge />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // We use a ScrollView for the header/drops section and embed a FlatList-like grid manually
  // to avoid nested VirtualizedList issues.
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shop</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} style={styles.cartBtn}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <Line x1="3" y1="6" x2="21" y2="6" />
              <Path d="M16 10a4 4 0 0 1-8 0" />
            </Svg>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Search + Filter ── */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5">
              <Circle cx="11" cy="11" r="8" />
              <Path d="m21 21-4.3-4.3" />
            </Svg>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for merch, artist..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round">
              <Line x1="4" y1="6" x2="20" y2="6" />
              <Line x1="8" y1="12" x2="20" y2="12" />
              <Line x1="12" y1="18" x2="20" y2="18" />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* ── Category Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Featured Drop Hero ── */}
        {/* <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToProduct()} style={styles.heroWrapper}>
          <ImageBackground
            source={require('../../assets/images/drop1.jpg')}
            style={styles.heroBg}
            imageStyle={styles.heroImage}
          >
            <View style={styles.heroOverlay} />
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>New Drop</Text>
            </View>
            <Text style={styles.heroTitle}>Indorerwamo{"\n"}Collection</Text>
            <TouchableOpacity style={styles.shopNowBtn} activeOpacity={0.8} onPress={() => navigateToProduct()}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </ImageBackground>
        </TouchableOpacity> */}
        <LatestDrops />

        {/* ── Upcoming Drops (Disabled for now) ── */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Drops</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Drops')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>
        <UpcomingDrops /> */}
        {/* ── Product Grid (2 columns, manual render to avoid nested VirtualizedList) ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'All' ? 'All Products' : activeCategory}
            {filteredProducts.length > 0 ? `  (${filteredProducts.length})` : ''}
          </Text>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((item, index) => {
              const prodImg = (item.imageUrls && item.imageUrls.length > 0)
                ? { uri: item.imageUrls[0] }
                : item.imageUrl
                ? { uri: item.imageUrl }
                : require('../../assets/images/products/product1.jpg');

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.productCard,
                    index % 2 === 0 ? { marginRight: GAP / 2 } : { marginLeft: GAP / 2 },
                    index >= 2 && { marginTop: GAP },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => navigateToProduct(item)}
                >
                  <View style={styles.priceTag}>
                    <Text style={styles.priceTagText}>{formatPrice(item.price)}</Text>
                  </View>
                  <Image source={prodImg} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.artistRow}>
                      <Text style={styles.artistName} numberOfLines={1}>{item.sellerName || 'Artist'}</Text>
                      <PurpleVerifiedBadge />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bottom padding for TabBar */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* ── TabBar ── */}
      <View style={styles.tabBarWrapper}>
        <TabBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: H_PAD, paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingBottom: 14,
  },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#111' },
  cartBtn: { position: 'relative', padding: 4 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#7126D0', width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'Poppins-Bold' },

  // Search
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    // marginHorizontal: width * 0.06,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Poppins-Regular', color: '#333' },
  filterBtn: {
    backgroundColor: '#f5f5f5', borderRadius: 5,
    padding: 12, alignItems: 'center', justifyContent: 'center',
  },

  // Category tabs
  categoryRow: { gap: 8, paddingBottom: 16 },
  categoryBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 5, backgroundColor: '#f5f5f5',
  },
  categoryBtnActive: { backgroundColor: '#7126D0' },
  categoryText: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#555' },
  categoryTextActive: { color: '#fff' },

  // Hero
  heroWrapper: { borderRadius: 5, overflow: 'hidden', marginBottom: 20 },
  heroBg: { width: '100%', height: 160, justifyContent: 'flex-end', paddingVertical: 10 },
  heroImage: { borderRadius: 5, resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 14 },
  heroBadge: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: '#7126D0', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6,
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Bold' },
  heroTitle: { color: '#fff', fontSize: 20, fontFamily: 'Poppins-Bold', lineHeight: 26, marginBottom: 10 },
  shopNowBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#7126D0', paddingHorizontal: 20, paddingVertical: 9, borderRadius: 8,
  },
  shopNowText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Bold' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' },
  seeAllText: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#7126D0' },

  // Drop cards
  dropCard: { borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  dropCardBg: { width: '100%', minHeight: 190, paddingVertical: 16,  },
  dropCardImage: { borderRadius: 14, resizeMode: 'cover' },
  dropCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.42)', borderRadius: 14, paddingHorizontal: 16 },
  dropBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#7126D0', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, marginBottom: 8,
  },
  dropBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-Bold' },
  dropTitle: { color: '#fff', fontSize: 17, fontFamily: 'Poppins-Bold', marginBottom: 10 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  countdownUnit: { alignItems: 'center', minWidth: 36 },
  countdownNum: { color: '#fff', fontSize: 20, fontFamily: 'Poppins-Bold' },
  countdownLabel: { color: '#ddd', fontSize: 10, fontFamily: 'Poppins-Regular' },
  countdownSep: { color: '#fff', fontSize: 20, fontFamily: 'Poppins-Bold', paddingBottom: 14 },
  dropDate: { color: '#ddd', fontSize: 12, fontFamily: 'Poppins-Regular', marginBottom: 12 },
  notifyBtn: {
    alignSelf: 'stretch', backgroundColor: '#7126D0',
    paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  notifyText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Bold' },

  // Product Grid – 2 columns
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  productCard: {
    width: CARD_W,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  priceTag: {
    position: 'absolute', top: 8, left: 8, zIndex: 2,
    backgroundColor: '#fff', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  priceTagText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#111' },
  productImage: { width: '100%', height: CARD_W, resizeMode: 'cover' },
  productInfo: { paddingHorizontal: 10, paddingVertical: 8 },
  productName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111', marginBottom: 2 },
  artistRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  artistName: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#777' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, fontFamily: 'Poppins-Regular', color: '#aaa' },

  // TabBar
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});
