import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';
import TabBar from '@/components/Tabbar';

const { width, height } = Dimensions.get('window');

type AppStackParamList = {
  Home: undefined;
  Browse: { initialQuery?: string };
};

type BrowseScreenRouteProp = RouteProp<AppStackParamList, 'Browse'>;

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: any;
}

const collectionsData: ProductItem[] = [
  { id: '1', name: 'Ink Art Tee', category: 'Clothing', price: 34, quantity: 15, image: require('@/assets/images/products/product1.jpg') },
  { id: '2', name: 'Ink Art Tee', category: 'Clothing', price: 34, quantity: 8, image: require('@/assets/images/products/product2.jpg') },
  { id: '3', name: 'Classic Cap', category: 'Accessories', price: 28, quantity: 24, image: require('@/assets/images/products/product3.jpg') },
  { id: '4', name: 'Artistic Print', category: 'Art', price: 45, quantity: 3, image: require('@/assets/images/products/product4.jpg') },
  { id: '5', name: 'Celeb Mug', category: 'Utilities', price: 19, quantity: 12, image: require('@/assets/images/products/product5.jpg') },
  { id: '6', name: 'Ink Art Tee Special', category: 'Clothing', price: 39, quantity: 6, image: require('@/assets/images/products/product6.jpg') },
  { id: '7', name: 'Stash Backpack', category: 'Accessories', price: 65, quantity: 9, image: require('@/assets/images/products/product7.jpg') },
  { id: '8', name: 'Minimal Tee', category: 'Clothing', price: 34, quantity: 18, image: require('@/assets/images/products/product1.jpg') },
];

const categories = ['All', 'Clothing', 'Accessories', 'Art', 'Utilities'];

const BrowseScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<BrowseScreenRouteProp>();

  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter items based on category and search query
  const filteredData = collectionsData.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderProductItem = ({ item }: { item: ProductItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('ProductDetails', {
          name: item.name,
          price: item.price,
          image: item.image,
          description:
            item.name.toLowerCase().includes('ink art')
              ? 'This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals'
              : undefined,
          artistName: 'Kenny K Shot',
          verified: true,
        })
      }
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${item.price}</Text>
          <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        keyExtractor={item => item.id}
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
