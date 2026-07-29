import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCardData } from '@/types/chatTypes';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

interface ProductCardProps {
  product: ProductCardData;
  isOutgoing?: boolean;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isOutgoing = false, onPress }) => (
  <TouchableOpacity style={[styles.card, isOutgoing && styles.cardOut]} onPress={onPress} activeOpacity={0.85}>
    <Image source={product.image} style={styles.productImage} />
    <View style={styles.info}>
      <Text style={[styles.productName, isOutgoing && styles.textLight]} numberOfLines={1}>
        {product.name}
      </Text>
      {product.artistName && (
        <View style={styles.artistRow}>
          <Text style={[styles.artistName, isOutgoing && styles.textLightSub]} numberOfLines={1}>
            {product.artistName}
          </Text>
          {product.verified && (
            <Ionicons name="checkmark-circle" size={12} color={isOutgoing ? '#93C5FD' : '#3B82F6'} />
          )}
        </View>
      )}
      <Text style={[styles.price, isOutgoing && styles.textLight]}>{product.price}</Text>
      <View style={[styles.viewBtn, isOutgoing && styles.viewBtnOut]}>
        <Ionicons name="bag-outline" size={13} color={isOutgoing ? PURPLE : '#fff'} />
        <Text style={[styles.viewBtnText, isOutgoing && styles.viewBtnTextOut]}>View Product</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: width * 0.62,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardOut: {
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  info: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 2,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  artistName: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  price: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    marginBottom: 8,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 7,
  },
  viewBtnOut: {
    backgroundColor: '#fff',
  },
  viewBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  viewBtnTextOut: {
    color: PURPLE,
  },
  textLight: { color: '#fff' },
  textLightSub: { color: 'rgba(255,255,255,0.7)' },
});

export default ProductCard;
