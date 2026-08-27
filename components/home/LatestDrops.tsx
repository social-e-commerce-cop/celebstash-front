import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LatestDrops = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.bannerWrapper}
        onPress={() => navigation.navigate('Shop')}
      >
        <ImageBackground
          source={require('../../assets/images/drop1.jpg')}
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
          <Text style={styles.title}>Indorerwamo{"\n"}Collection</Text>

          {/* Button: Shop Now */}
          <TouchableOpacity
            style={styles.btnContainer}
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('Shop');
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
