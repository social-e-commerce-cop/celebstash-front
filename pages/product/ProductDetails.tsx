import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type AppStackParamList = {
  ProductDetails: {
    name?: string;
    price?: string | number;
    image?: any;
    description?: string;
    artistName?: string;
    verified?: boolean;
  };
};

type ProductDetailsRouteProp = RouteProp<AppStackParamList, 'ProductDetails'>;

const defaultImages = [
  require('@/assets/images/products/product1.jpg'),
  require('@/assets/images/products/product2.jpg'),
  require('@/assets/images/products/product3.jpg'),
  require('@/assets/images/products/product4.jpg'),
  require('@/assets/images/products/product5.jpg'),
];

const sizes = ['S', 'M', 'L', 'XL'];

const colors = [
  { id: 'dark', value: '#333333' },
  { id: 'blue', value: '#3B82F6' },
  { id: 'green', value: '#24B273' },
  { id: 'orange', value: '#FF6600' },
];

const ProductDetails = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<ProductDetailsRouteProp>();

  // Route parameters with fallbacks matching the mockup
  const paramName = route.params?.name || 'Indorerwamo Collection';
  const paramPrice = route.params?.price !== undefined ? route.params.price : '30';
  const paramImage = route.params?.image || require('@/assets/images/products/product1.jpg');
  const paramDesc = route.params?.description || 'This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals';
  const paramArtistName = route.params?.artistName || 'Kenny K Shot';
  const paramVerified = route.params?.verified !== undefined ? route.params.verified : true;

  // Build a custom image gallery list
  const galleryImages = [paramImage, ...defaultImages.filter(img => img !== paramImage)].slice(0, 5);

  const [activeImage, setActiveImage] = useState(paramImage);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const selectedColorValue = colors.find(c => c.id === selectedColor)?.value ?? null;

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert(
        'Select options',
        'Please select a size and color before continuing.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    navigation.navigate('CheckoutScreen', {
      name: paramName,
      price: paramPrice,
      image: paramImage,
      artistName: paramArtistName,
      selectedSize,
      selectedColor,
      selectedColorValue,
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      Alert.alert(
        'Select options',
        'Please select a size and color before adding to cart.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    Alert.alert('Added to cart', `${paramName} has been added to your cart!`, [{ text: 'OK' }]);
  };

  // Clean numeric representation for the price text
  const displayPrice = typeof paramPrice === 'number' ? `$${paramPrice}` : (paramPrice.startsWith('$') ? paramPrice : `$${paramPrice}`);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Product Image Container */}
        <View style={styles.mainImageContainer}>
          <Image source={activeImage} style={styles.mainImage} />

          {/* Top Overlays */}
          <View style={styles.overlayHeader}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            <View style={styles.rightOverlayActions}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => setIsLiked(!isLiked)}
                activeOpacity={0.7}
              >
                <Svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={isLiked ? '#8A3FFC' : 'none'}
                  stroke={isLiked ? '#8A3FFC' : '#fff'}
                  strokeWidth="2.5"
                >
                  <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </Svg>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.circleButton, { marginLeft: 12 }]}
                activeOpacity={0.7}
              >
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Thumbnail Gallery Scroll */}
        <View style={styles.thumbnailSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
            {galleryImages.map((img, idx) => {
              const isActive = activeImage === img;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveImage(img)}
                  style={[styles.thumbnailWrapper, isActive && styles.thumbnailWrapperActive]}
                  activeOpacity={0.8}
                >
                  <Image source={img} style={styles.thumbnailImage} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Details Info Block */}
        <View style={styles.detailsBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{paramName}</Text>
            <Text style={styles.priceText}>{displayPrice}</Text>
          </View>

          {/* Artist subheader */}
          <View style={styles.artistRow}>
            <Text style={styles.artistLabel}>By </Text>
            <Text style={styles.artistName}>{paramArtistName}</Text>
            {paramVerified && (
              <View style={styles.verifiedBadge}>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="#8A3FFC">
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
            )}
          </View>

          {/* Product Description */}
          <Text style={styles.descriptionText}>{paramDesc}</Text>

          {/* Size Options */}
          <Text style={styles.sectionHeader}>Sizes:</Text>
          <View style={styles.sizeContainer}>
            {sizes.map(size => {
              const isSelected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeBox,
                    isSelected && styles.sizeBoxSelected,
                    !isSelected && styles.sizeBoxUnselected,
                  ]}
                  onPress={() => setSelectedSize(size)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Color Options */}
          <Text style={styles.sectionHeader}>Color:</Text>
          <View style={styles.colorContainer}>
            {colors.map(color => {
              const isSelected = selectedColor === color.id;
              const colorBg = color.value;
              return (
                <TouchableOpacity
                  key={color.id}
                  style={[styles.colorRing, isSelected && styles.colorRingSelected]}
                  onPress={() => setSelectedColor(color.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.colorCircle, { backgroundColor: colorBg }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Row */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity style={styles.buyButton} activeOpacity={0.8} onPress={handleBuyNow}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} activeOpacity={0.8} onPress={handleAddToCart}>
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
            <Circle cx="9" cy="21" r="1" />
            <Circle cx="20" cy="21" r="1" />
            <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  mainImageContainer: {
    width: width,
    height: height * 0.45,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayHeader: {
    position: 'absolute',
    top: height * 0.05,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  rightOverlayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0000004D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailSection: {
    marginTop: 12,
  },
  thumbnailList: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  thumbnailWrapper: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperActive: {
    borderColor: '#8A3FFC',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    flex: 1,
    marginRight: 10,
  },
  priceText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  artistLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  artistName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#8A3FFC',
  },
  verifiedBadge: {
    marginLeft: 4,
    justifyContent: 'center',
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 10,
  },
  sizeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  sizeBox: {
    width: 54,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sizeBoxUnselected: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  sizeBoxSelected: {
    backgroundColor: '#8A3FFC',
    borderWidth: 0,
  },
  sizeText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  sizeTextSelected: {
    color: '#fff',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorRingSelected: {
    borderColor: '#333',
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buyButton: {
    flex: 1,
    height: 54,
    backgroundColor: '#8A3FFC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cartButton: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
