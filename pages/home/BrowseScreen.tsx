import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';
import TabBar from '@/components/Tabbar';
import { productsService, ProductItem as RealProductItem } from '@/lib/productsService';
import { resolveImageUrl } from '@/lib/apiClient';

const { width, height } = Dimensions.get('window');

type AppStackParamList = {
  Home: undefined;
  Browse: { initialQuery?: string };
};

type BrowseScreenRouteProp = RouteProp<AppStackParamList, 'Browse'>;

const fallbackCollections: RealProductItem[] = [
  { id: 101, name: 'Ink Art Tee', category: 'Clothing', price: 34, stockQuantity: 15, productType: 'REGULAR', status: 'APPROVED', sellerId: 1, sellerName: 'Anelia', imageUrl: undefined },
  { id: 102, name: 'Classic Cap', category: 'Accessories', price: 28, stockQuantity: 24, productType: 'REGULAR', status: 'APPROVED', sellerId: 2, sellerName: 'Kenny K Shot', imageUrl: undefined },
  { id: 103, name: 'Artistic Print', category: 'Art', price: 45, stockQuantity: 3, productType: 'REGULAR', status: 'APPROVED', sellerId: 1, sellerName: 'Anelia', imageUrl: undefined },
  { id: 104, name: 'Celeb Mug', category: 'Utilities', price: 19, stockQuantity: 12, productType: 'REGULAR', status: 'APPROVED', sellerId: 2, sellerName: 'Kenny K Shot', imageUrl: undefined },
];

const categories = ['All', 'Clothing', 'Accessories', 'Art', 'Utilities'];

const BrowseScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<BrowseScreenRouteProp>();

  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [activeCategory, setActiveCategory] = useState('All');
  const [realProducts, setRealProducts] = useState<RealProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsService.getAllProducts()
      .then(prods => {
        if (Array.isArray(prods) && prods.length > 0) {
          // Sort by ID descending (newest / recently added first)
          const sorted = [...prods].sort((a, b) => b.id - a.id);
          setRealProducts(sorted);
        } else {
          setRealProducts(fallbackCollections);
        }
      })
      .catch(() => {
        setRealProducts(fallbackCollections);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter items based on category and search query
  const filteredData = useMemo(() => {
    let list = realProducts;
    if (activeCategory !== 'All') {
      list = list.filter(item => (item.category || 'Clothing').toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(q) ||
        (item.sellerName && item.sellerName.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [realProducts, activeCategory, searchQuery]);

  const renderProductItem = ({ item }: { item: RealProductItem }) => {
    const rawMainImg = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : item.imageUrl;
    const mainImg = rawMainImg ? resolveImageUrl(rawMainImg) : null;
    const resolvedImageUrls = Array.isArray(item.imageUrls) && item.imageUrls.length > 0
      ? item.imageUrls.map(u => resolveImageUrl(u))
      : (mainImg ? [mainImg] : []);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('ProductDetails', {
            id: item.id,
            name: item.name,
            price: item.price,
            image: mainImg ? { uri: mainImg } : require('@/assets/images/products/product1.jpg'),
            imageUrls: resolvedImageUrls,
            description: item.description || 'Exclusive merchandise product.',
            artistName: item.sellerName || 'Kenny K Shot',
            verified: true,
            stockQuantity: item.stockQuantity,
            sizeStock: item.sizeStock,
            availableColors: item.availableColors,
            category: item.category,
            isSeller: false, // Ensure buyer view!
          })
        }
      >
        <Image
          source={mainImg ? { uri: mainImg } : require('@/assets/images/products/product1.jpg')}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${item.price}</Text>
            <Text style={styles.productQuantity}>Qty: {item.stockQuantity ?? 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Top Header Row with back arrow & title */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          {/* <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse</Text>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" style={styles.searchIcon}>
          <Circle cx="11" cy="11" r="8" />
          <Path d="m21 21-4.3-4.3" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for merch, collections..."
          placeholderTextColor="#333"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoFocus={!route.params?.initialQuery}
        />
      </View>

      {/* Categories scroll & Filter button */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isActive = activeCategory === item;
            return (
              <TouchableOpacity
                style={styles.categoryTab}
                onPress={() => setActiveCategory(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, isActive ? styles.categoryTextActive : styles.categoryTextInactive]}>
                  {item}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          }}
        />

        {/* Filter button icon on the right */}
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Grid of collections */}
      <FlatList
        data={filteredData}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderProductItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found matching "{searchQuery}"</Text>
          </View>
        }
      />

      {/* Floating TabBar at the bottom */}
      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </View>
  );
};

export default BrowseScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.05,
    paddingBottom: 10,
  },
  backButton: {
    // marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    marginHorizontal: width * 0.06,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    paddingVertical: 10,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.06,
    marginBottom: 16,
  },
  categoriesList: {
    paddingRight: 10,
  },
  categoryTab: {
    marginRight: 20,
    paddingVertical: 6,
    position: 'relative',
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  categoryTextActive: {
    color: '#000',
    fontFamily: 'Poppins-Bold',
  },
  categoryTextInactive: {
    color: '#8c8c8c',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#7126D0',
    borderRadius: 1.5,
  },
  filterButton: {
    paddingLeft: 12,
  },
  gridContent: {
    paddingHorizontal: width * 0.06,
    paddingBottom: height * 0.15, // Space for bottom floating bar
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: (width - width * 0.12 - 16) / 2,
    height: 220,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  productName: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  productPrice: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  productQuantity: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#8c8c8c',
    textAlign: 'center',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});
