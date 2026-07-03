import React from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Dimensions,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PURPLE = '#7126D0';

const scaleFont = (size: number) => (size * screenWidth) / 375;

type CartCardProps = {
  imageSource?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  status?: string;
  price?: string;
  quantity?: number;
  onQuantityDecrease?: () => void;
  onQuantityIncrease?: () => void;
  onRemove?: () => void;
  cardStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  statusPillStyle?: ViewStyle;
  statusTextStyle?: TextStyle;
  priceStyle?: TextStyle;
  quantityContainerStyle?: ViewStyle;
  quantityButtonStyle?: ViewStyle;
  quantityTextStyle?: TextStyle;
};

const CartCard: React.FC<CartCardProps> = ({
  imageSource,
  title = "Kendrick's Jacket on Tour",
  subtitle = 'Kendrick Lamar',
  status = 'In Cart',
  price = '$150.00',
  quantity = 1,
  onQuantityDecrease = () => {},
  onQuantityIncrease = () => {},
  onRemove = () => {},
  cardStyle,
  imageStyle,
  titleStyle,
  subtitleStyle,
  statusPillStyle,
  statusTextStyle,
  priceStyle,
  quantityContainerStyle,
  quantityButtonStyle,
  quantityTextStyle,
}) => {
  const padding = Math.min(screenWidth * 0.04, 16);
  const imageWidth = Math.min(screenWidth * 0.25, 110);

  const renderRightActions = () => (
    <View style={styles.deleteContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert('Confirm Delete', 'Remove this item from cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onRemove },
          ]);
        }}
        activeOpacity={0.7}
      >
        <Svg width={20} height={22} viewBox="0 0 18 20" fill="none">
          <Path
            d="M17 3C17.2652 3 17.5196 3.10536 17.7071 3.29289C17.8946 3.48043 18 3.73478 18 4C18 4.26522 17.8946 4.51957 17.7071 4.70711C17.5196 4.89464 17.2652 5 17 5H16L15.997 5.071L15.064 18.142C15.0281 18.6466 14.8023 19.1188 14.4321 19.4636C14.0619 19.8083 13.5749 20 13.069 20H4.93C4.42414 20 3.93707 19.8083 3.56688 19.4636C3.1967 19.1188 2.97092 18.6466 2.935 18.142L2.002 5.072L2 5H1C0.734784 5 0.48043 4.89464 0.292893 4.70711C0.105357 4.51957 0 4.26522 0 4C0 3.73478 0.105357 3.48043 0.292893 3.29289C0.48043 3.10536 0.734784 3 1 3H17ZM11 0C11.2652 0 11.5196 0.105357 11.7071 0.292893C11.8946 0.48043 12 0.734784 12 1C12 1.26522 11.8946 1.51957 11.7071 1.70711C11.5196 1.89464 11.2652 2 11 2H7C6.73478 2 6.48043 1.89464 6.29289 1.70711C6.10536 1.51957 6 1.26522 6 1C6 0.734784 6.10536 0.48043 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0H11Z"
            fill="#ED0006"
          />
        </Svg>
        <Text style={styles.deleteLabel}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false} rightThreshold={40}>
      <View style={[styles.card, { padding }, cardStyle]}>
        <Image
          source={imageSource}
          style={[styles.image, { width: imageWidth, height: screenHeight * 0.13 }, imageStyle]}
          resizeMode="cover"
        />
        <View style={styles.content}>
          {/* Title row + In Cart badge */}
          <View style={styles.topRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.title, { fontSize: scaleFont(15) }, titleStyle]} numberOfLines={2}>
                {title}
              </Text>
              <Text style={[styles.subtitle, { fontSize: scaleFont(12) }, subtitleStyle]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
            <View style={[styles.statusPill, statusPillStyle]}>
              <Text style={[styles.statusText, { fontSize: scaleFont(11) }, statusTextStyle]}>
                {status}
              </Text>
            </View>
          </View>

          {/* Footer: price + qty */}
          <View style={styles.footer}>
            <Text style={[styles.price, { fontSize: scaleFont(17) }, priceStyle]}>{price}</Text>
            <View style={[styles.quantityContainer, quantityContainerStyle]}>
              <TouchableOpacity
                style={[styles.quantityButton, quantityButtonStyle]}
                onPress={onQuantityDecrease}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityText, { fontSize: scaleFont(15) }, quantityTextStyle]}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonPlus, quantityButtonStyle]}
                onPress={onQuantityIncrease}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={[styles.quantityButtonText, { color: '#fff' }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 14,
    alignItems: 'flex-start',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginHorizontal: 2,
  },
  image: {
    borderRadius: 5,
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    color: '#111',
    lineHeight: 21,
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    color: '#888',
    lineHeight: 18,
    fontFamily: 'Poppins-Medium',
  },
  statusPill: {
    backgroundColor: '#F0F7FF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#C7E0FF',
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#3B82F6',
    fontFamily: 'Poppins-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: PURPLE,
    lineHeight: 24,
    fontFamily: 'Poppins-Bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityButtonPlus: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#555',
    lineHeight: 22,
  },
  quantityText: {
    color: '#111',
    minWidth: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E8FF',
    width: screenWidth * 0.22,
    borderRadius: 5,
    marginBottom: 14,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    gap: 6,
  },
  deleteLabel: {
    color: '#ED0006',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
});

export default CartCard;

