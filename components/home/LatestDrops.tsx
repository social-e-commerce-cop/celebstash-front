import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { productsService, ProductItem } from '@/lib/productsService';

const { width } = Dimensions.get('window');

const LatestDrops = () => {
  const navigation = useNavigation<any>();
  const [latestDrop, setLatestDrop] = useState<ProductItem | null>(null);

  useEffect(() => {
    productsService
      .getNewDrops()
      .then((drops) => {
        if (Array.isArray(drops) && drops.length > 0) {
          setLatestDrop(drops[0]);
        }
      })
      .catch(() => {});
  }, []);

  const bannerImg =
    latestDrop?.imageUrls && latestDrop.imageUrls.length > 0
      ? { uri: latestDrop.imageUrls[0] }
      : latestDrop?.imageUrl
      ? { uri: latestDrop.imageUrl }
      : require('../../assets/images/drop1.jpg');

  const titleText = latestDrop?.name || 'Indorerwamo\nCollection';

  const handlePress = () => {
    if (latestDrop) {
      const mainImg = latestDrop.imageUrls && latestDrop.imageUrls.length > 0 ? latestDrop.imageUrls[0] : latestDrop.imageUrl;
      navigation.navigate('ProductDetails', {
        name: latestDrop.name,
        price: latestDrop.price,
        image: mainImg ? { uri: mainImg } : require('../../assets/images/products/product1.jpg'),
        imageUrls: Array.isArray(latestDrop.imageUrls) && latestDrop.imageUrls.length > 0 ? latestDrop.imageUrls : (mainImg ? [mainImg] : []),
        description: latestDrop.description || 'Exclusive limited merchandise.',
        artistName: latestDrop.sellerName || 'Artist',
        verified: true,
        stockQuantity: latestDrop.stockQuantity,
        sizeStock: latestDrop.sizeStock,
        availableColors: latestDrop.availableColors,
      });
    } else {
      navigation.navigate('Shop');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bannerWrapper}
        onPress={handlePress}
      >
        <ImageBackground
          source={bannerImg}
          style={styles.bannerBackground}
          imageStyle={styles.imageStyle}
        >
          {/* Black gradient/tint overlay for readability */}
          <View style={styles.overlay} />

          {/* Badge: New Drop */}
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>New Drop</Text>
            </View>
          </View>

          {/* Banner Title */}
          <Text style={styles.title} numberOfLines={2}>{titleText}</Text>

          {/* Button: Shop Now */}
          <TouchableOpacity
            style={styles.btnContainer}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              handlePress();
            }}
          >
            <View style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Shop Now</Text>
            </View>
          </TouchableOpacity>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

export default LatestDrops;

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  bannerWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 5,
    overflow: 'hidden',
  },
  bannerBackground: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: 5,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Smooth subtle dark overlay
    borderRadius: 5,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  badge: {
    backgroundColor: '#7126D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    lineHeight: 28,
    zIndex: 1,
    marginTop: 8,
  },
  btnContainer: {
    alignSelf: 'flex-start',
    zIndex: 1,
    marginTop: 8,
  },
  shopButton: {
    backgroundColor: '#7126D0',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 5,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
});
