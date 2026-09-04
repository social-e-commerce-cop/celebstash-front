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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { formatPrice } from '@/lib/currency';
import { resolveImageUrl } from '@/lib/apiClient';

const { width, height } = Dimensions.get('window');

type AppStackParamList = {
  ProductDetails: {
    id?: number;
    name?: string;
    price?: string | number;
    image?: any;
    imageUrls?: string[];
    description?: string;
    artistName?: string;
    verified?: boolean;
    category?: string;
    artistImage?: any;
    stockQuantity?: number;
    sizeStock?: Record<string, number>;
    availableColors?: string[];
    status?: string;
    adminNotes?: string;
    isSeller?: boolean;
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

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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
  const paramCategory = route.params?.category;
  const paramArtistImage = route.params?.artistImage;

  const isMusic = paramCategory === 'Music';
  const isSeller = route.params?.isSeller === true;

  // Build exact image gallery list from uploaded images
  const rawImageUrls = (route.params as any)?.imageUrls;
  const uploadedGallery = Array.isArray(rawImageUrls) && rawImageUrls.length > 0
    ? rawImageUrls.map((img: any) => {
        if (typeof img === 'string') return { uri: resolveImageUrl(img) };
        if (img && typeof img.uri === 'string') return { uri: resolveImageUrl(img.uri) };
        return img;
      })
    : null;

  const resolvedParamImage = typeof paramImage === 'string'
    ? { uri: resolveImageUrl(paramImage) }
    : (paramImage && typeof paramImage.uri === 'string' ? { uri: resolveImageUrl(paramImage.uri) } : paramImage);

  const galleryImages = uploadedGallery && uploadedGallery.length > 0
    ? uploadedGallery
    : [resolvedParamImage];

  const [activeImage, setActiveImage] = useState(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  const selectedColorValue = colors.find(c => c.id === selectedColor)?.value ?? null;

  const handleBuyNow = () => {
    if (!isMusic && (!selectedSize || !selectedColor)) {
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
      image: isMusic && paramArtistImage ? paramArtistImage : paramImage,
      artistName: paramArtistName,
      selectedSize: isMusic ? 'N/A' : selectedSize,
      selectedColor: isMusic ? 'N/A' : selectedColor,
      selectedColorValue: isMusic ? 'N/A' : selectedColorValue,
      isDigital: isMusic,
      isMusic: isMusic,
      musicItem: isMusic ? { title: paramName, artist: paramArtistName, image: paramImage } : null,
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
    Alert.alert(
      '✓ Added to Cart',
      `${paramName} has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('CartScreen') },
      ]
    );
  };

  // Clean numeric representation with dual currency (USD + FRW)
  const displayPrice = formatPrice(paramPrice);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Product Image Container */}
        <View style={styles.mainImageContainer}>
          <Image source={isMusic && paramArtistImage ? paramArtistImage : activeImage} style={styles.mainImage} />
          {paramCategory === 'Music' && paramArtistImage && (
            <View style={styles.artistImageOverlay}>
              <Image source={paramArtistImage} style={styles.artistAvatar} />
            </View>
          )}

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
                  fill={isLiked ? '#7126D0' : 'none'}
                  stroke={isLiked ? '#7126D0' : '#fff'}
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
        {!isMusic && (
          <View style={styles.thumbnailSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailList}>
              {galleryImages.map((img, idx) => {
                const isActive = (activeImage?.uri && img?.uri) ? activeImage.uri === img.uri : activeImage === img;
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
        )}

        {/* Product Details Info Block */}
        <View style={styles.detailsBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{paramName}</Text>
            <Text style={styles.priceText}>{displayPrice}</Text>
          </View>

          {/* Artist subheader */}
          <View style={styles.artistRow}>
            <Text style={styles.artistLabel}>
              By <Text style={styles.artistName}>{paramArtistName}</Text>
            </Text>
            {Boolean(paramVerified) && (
              <View style={styles.verifiedBadge}>
                <Svg width="14" height="14" viewBox="0 0 24 24" fill="#7126D0">
                  <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </Svg>
              </View>
            )}
          </View>

          {/* Product Description / Story */}
          <Text style={styles.descriptionText}>{paramDesc}</Text>

          {/* Creator Inventory & Monitoring Dashboard (ONLY VISIBLE TO PRODUCT SELLER / OWNER) */}
          {Boolean(isSeller) && (
            <View style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 14,
              padding: 16,
              marginVertical: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#7126D0', letterSpacing: 0.8 }}>
                  CREATOR LISTING DASHBOARD
                </Text>
                <View style={{
                  backgroundColor: route.params?.status === 'APPROVED' ? '#DCFCE7' : route.params?.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontFamily: 'Poppins-Bold',
                    color: route.params?.status === 'APPROVED' ? '#166534' : route.params?.status === 'REJECTED' ? '#991B1B' : '#92400E'
                  }}>
                    {route.params?.status || 'PENDING'}
                  </Text>
                </View>
              </View>

              {/* Performance Metrics Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' }}>Stock Available</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111827', marginTop: 2 }}>
                    {route.params?.stockQuantity ?? 0} items
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' }}>Items Sold</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#10B981', marginTop: 2 }}>
                    0 sold
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' }}>Item Price</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111827', marginTop: 2 }}>
                    ${paramPrice}
                  </Text>
                </View>

                <View style={{ flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#F3F4F6' }}>
                  <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' }}>Potential Value</Text>
                  <Text style={{ fontSize: 16, fontFamily: 'Poppins-Bold', color: '#7126D0', marginTop: 2 }}>
                    ${(Number(paramPrice) * (Number(route.params?.stockQuantity) || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Size & Items Available Breakdown for Artist/Seller */}
              {Boolean(route.params?.sizeStock && Object.keys(route.params.sizeStock).length > 0) && (
                <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#111827', marginBottom: 8 }}>
                    Size & Stock Breakdown:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {Object.entries(route.params?.sizeStock || {}).map(([sz, qty]) => (
                      <View
                        key={sz}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#7126D0' }}>
                          Size {sz}:
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'Poppins-Medium', color: '#374151' }}>
                          {String(qty)} items
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Status Note & Rejection Reason */}
              {route.params?.status === 'REJECTED' && (
                <View style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' }}>
                  <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#991B1B', marginBottom: 4 }}>
                    ✕ Submission Rejected
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: '#7F1D1D', lineHeight: 18 }}>
                    {route.params?.adminNotes
                      ? `Reason: "${route.params.adminNotes}"`
                      : 'Your product submission was rejected by Admin. Please update details below and resubmit.'}
                  </Text>

                  <TouchableOpacity
                    style={{
                      marginTop: 12,
                      backgroundColor: '#7126D0',
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                    activeOpacity={0.85}
                    onPress={() =>
                      navigation.navigate('CreateProduct', {
                        editProduct: {
                          id: route.params?.id,
                          name: paramName,
                          description: paramDesc,
                          price: paramPrice,
                          category: paramCategory,
                          stockQuantity: route.params?.stockQuantity,
                          sizeStock: route.params?.sizeStock,
                          availableColors: route.params?.availableColors,
                          imageUrls: route.params?.imageUrls,
                          imageUrl: paramImage?.uri || paramImage,
                        },
                      })
                    }
                  >
                    <Ionicons name="create-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#FFF' }}>
                      Edit & Resubmit Drop
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {route.params?.status === 'APPROVED' && (
                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: '#059669', lineHeight: 18, marginTop: 10 }}>
                  ✓ Live / Public: Approved by admin, visible in shop and purchasable by fans.
                </Text>
              )}

              {(route.params?.status === 'SOLD_OUT' || (route.params?.stockQuantity !== undefined && route.params.stockQuantity <= 0)) && (
                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Bold', color: '#DC2626', lineHeight: 18, marginTop: 10 }}>
                  🔥 Sold Out: Quantity/edition exhausted.
                </Text>
              )}

              {route.params?.status !== 'APPROVED' && route.params?.status !== 'REJECTED' && route.params?.status !== 'SOLD_OUT' && (
                <Text style={{ fontSize: 12, fontFamily: 'Poppins-Regular', color: '#D97706', lineHeight: 18, marginTop: 10 }}>
                  ⏳ Pending Admin Review: Submitted by artist, awaiting admin review (not visible to public users).
                </Text>
              )}
            </View>
          )}

          {/* Buyer Stock Availability Badge */}
          {Boolean(!isSeller && route.params?.stockQuantity !== undefined) && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
              backgroundColor: (route.params?.stockQuantity ?? 0) > 0 ? '#F0FDF4' : '#FEF2F2',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: (route.params?.stockQuantity ?? 0) > 0 ? '#BBF7D0' : '#FECACA',
              alignSelf: 'flex-start'
            }}>
              <Ionicons
                name={(route.params?.stockQuantity ?? 0) > 0 ? "checkmark-circle" : "alert-circle"}
                size={16}
                color={(route.params?.stockQuantity ?? 0) > 0 ? "#166534" : "#991B1B"}
                style={{ marginRight: 6 }}
              />
              <Text style={{
                fontSize: 12,
                fontFamily: 'Poppins-Bold',
                color: (route.params?.stockQuantity ?? 0) > 0 ? "#166534" : "#991B1B"
              }}>
                {(route.params?.stockQuantity ?? 0) > 0
                  ? `In Stock (${route.params?.stockQuantity} available)`
                  : 'Sold Out'}
              </Text>
            </View>
          )}

          {/* Size Options */}
          {Boolean(!isMusic) && (
            <>
              <Text style={styles.sectionHeader}>Sizes & Stock per Size:</Text>
              <View style={styles.sizeContainer}>
                {(route.params?.sizeStock && Object.keys(route.params.sizeStock).length > 0
                  ? Object.keys(route.params.sizeStock)
                  : sizes
                ).map(size => {
                  const isSelected = selectedSize === size;
                  const itemQty = route.params?.sizeStock ? route.params.sizeStock[size] : undefined;
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeBox,
                        isSelected && styles.sizeBoxSelected,
                        !isSelected && styles.sizeBoxUnselected,
                        { height: 48, minWidth: 60, paddingHorizontal: 8 }
                      ]}
                      onPress={() => setSelectedSize(size)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.sizeText, isSelected && styles.sizeTextSelected]}>
                        {size}
                      </Text>
                      {itemQty !== undefined && (
                        <Text style={{ fontSize: 10, fontFamily: 'Poppins-Medium', color: isSelected ? '#FFF' : '#6B7280' }}>
                          {itemQty} items
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color Options - ONLY COLOR SWATCHES (NO WORDS) */}
              <Text style={styles.sectionHeader}>Available Colors:</Text>
              <View style={styles.colorContainer}>
                {(Array.isArray(route.params?.availableColors) && route.params.availableColors.length > 0
                  ? route.params.availableColors
                  : ['Black', 'White', 'Purple', 'Blue']
                ).map((colStr, idx) => {
                  const rawVal = (colStr || '').trim();
                  const upper = rawVal.toUpperCase();
                  const colorHex = upper.startsWith('#')
                    ? upper
                    : upper === 'BLACK' ? '#000000'
                    : upper === 'WHITE' ? '#FFFFFF'
                    : upper === 'RED' || upper === 'CRIMSON' ? '#EF4444'
                    : upper === 'BLUE' || upper === 'NAVY' ? '#3B82F6'
                    : upper === 'GREEN' || upper === 'EMERALD' ? '#10B981'
                    : upper === 'PURPLE' || upper === 'VIOLET' ? '#7126D0'
                    : upper === 'GOLD' || upper === 'YELLOW' ? '#F59E0B'
                    : upper === 'SILVER' || upper === 'GRAY' || upper === 'GREY' ? '#9CA3AF'
                    : upper === 'PINK' ? '#EC4899'
                    : upper === 'ORANGE' ? '#FF6600'
                    : upper === 'BROWN' ? '#8B4513'
                    : '#333333';

                  const isSelected = selectedColor === colStr || (!selectedColor && idx === 0);
                  const isLightColor = colorHex === '#FFFFFF' || colorHex === '#F5F5DC' || colorHex === '#FFFF00';

                  return (
                    <TouchableOpacity
                      key={colStr + idx}
                      style={[
                        styles.colorSwatchWrapper,
                        isSelected && styles.colorSwatchSelected,
                      ]}
                      onPress={() => setSelectedColor(colStr)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.colorSwatchCircle,
                          {
                            backgroundColor: colorHex,
                            borderWidth: isLightColor ? 1 : 0,
                            borderColor: '#D1D5DB',
                          },
                        ]}
                      >
                        {isSelected && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={isLightColor ? '#000000' : '#FFFFFF'}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {isMusic && (
            <View style={styles.musicDetailsSection}>
              {!isSeller && (
                <TouchableOpacity style={styles.accessNowBigBtn} onPress={handleBuyNow}>
                  <Text style={styles.accessNowBigText}>Access Now</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.tracksTitle}>Tracks</Text>
              <View style={styles.tracksDivider} />
              
              <View style={styles.trackRow}>
                <Text style={styles.trackNumber}>1.</Text>
                <Text style={styles.trackName}>Mama</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
                  <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </Svg>
              </View>
              <View style={styles.trackRow}>
                <Text style={styles.trackNumber}>2.</Text>
                <Text style={styles.trackName}>Corazol ft T-pain, Usher</Text>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <Path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
                  <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </Svg>
              </View>

              {!isSeller && (
                <View style={styles.premiumCard}>
                  <View style={styles.premiumCardInner}>
                    <View>
                      <Text style={styles.premiumCardTitle}>Get Premium Access for 3 days</Text>
                      <Text style={styles.premiumCardPrice}>$2.56</Text>
                    </View>
                    <TouchableOpacity style={styles.premiumAccessBtn} onPress={handleBuyNow}>
                      <Text style={styles.premiumAccessBtnText}>Get Access</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.musicFeatures}>
                <View style={styles.featureRow}>
                  <Text style={styles.featureText}>3 access to the album</Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureText}>Offline mode</Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureText}>Download music to device</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions Row */}
      {isSeller ? (
        <View style={styles.bottomActionBar}>
          <TouchableOpacity
            style={[styles.buyButton, { backgroundColor: '#7126D0', width: '100%' }]}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buyButtonText}>Back to My Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        !isMusic && (
          <View style={styles.bottomActionBar}>
            <TouchableOpacity style={styles.buyButton} activeOpacity={0.8} onPress={handleBuyNow}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartButton} activeOpacity={0.8} onPress={handleAddToCart}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <Circle cx="9" cy="21" r="1" />
                <Circle cx="20" cy="21" r="1" />
                <Path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </Svg>
            </TouchableOpacity>
          </View>
        )
      )}
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
  artistImageOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  artistAvatar: {
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
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailWrapperActive: {
    borderColor: '#7126D0',
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
    color: '#7126D0',
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
    borderRadius: 5,
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
    backgroundColor: '#7126D0',
    borderWidth: 0,
  },
  sizeText: {
    fontSize: 16,
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
  colorSwatchWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#7126D0',
  },
  colorSwatchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: '#7126D0',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingVertical: 10,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  cartButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  musicDetailsSection: {
    marginTop: 10,
  },
  accessNowBigBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  accessNowBigText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  tracksTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 8,
  },
  tracksDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  trackNumber: {
    width: 24,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  trackName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#111',
  },
  premiumCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  premiumCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumCardTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#555',
    marginBottom: 4,
  },
  premiumCardPrice: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  premiumAccessBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  premiumAccessBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  musicFeatures: {
    backgroundColor: '#f1f3f5',
    padding: 16,
    borderRadius: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
});
