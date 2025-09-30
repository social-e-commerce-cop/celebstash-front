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
import Svg, { Path, Circle, G, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeComposite, FeBlend } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const imageWidth = Math.min(screenWidth * 0.25, 120);
  const imageHeight = '100%';

  const renderRightActions = () => (
  <View style={[styles.deleteContainer, { height: '89%' }]}>
    <TouchableOpacity
      style={[styles.deleteButton, { height: '100%' }]}
      onPress={() => {
        Alert.alert('Confirm Delete', 'Remove this item from cart?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onRemove },
        ]);
      }}
      activeOpacity={0.7}
    >
      <Svg width={18} height={20} viewBox="0 0 18 20" fill="none">
        <Path
          d="M17 3C17.2652 3 17.5196 3.10536 17.7071 3.29289C17.8946 3.48043 18 3.73478 18 4C18 4.26522 17.8946 4.51957 17.7071 4.70711C17.5196 4.89464 17.2652 5 17 5H16L15.997 5.071L15.064 18.142C15.0281 18.6466 14.8023 19.1188 14.4321 19.4636C14.0619 19.8083 13.5749 20 13.069 20H4.93C4.42414 20 3.93707 19.8083 3.56688 19.4636C3.1967 19.1188 2.97092 18.6466 2.935 18.142L2.002 5.072L2 5H1C0.734784 5 0.48043 4.89464 0.292893 4.70711C0.105357 4.51957 0 4.26522 0 4C0 3.73478 0.105357 3.48043 0.292893 3.29289C0.48043 3.10536 0.734784 3 1 3H17ZM11 0C11.2652 0 11.5196 0.105357 11.7071 0.292893C11.8946 0.48043 12 0.734784 12 1C12 1.26522 11.8946 1.51957 11.7071 1.70711C11.5196 1.89464 11.2652 2 11 2H7C6.73478 2 6.48043 1.89464 6.29289 1.70711C6.10536 1.51957 6 1.26522 6 1C6 0.734784 6.10536 0.48043 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0H11Z"
          fill="#ED0006"
        />
      </Svg>
    </TouchableOpacity>
  </View>
);

  const CardContent = () => (
    <View style={[styles.card, { padding }, cardStyle]}>
      <Image
        source={imageSource}
        style={[styles.image, { width: imageWidth, height: imageHeight }, imageStyle]}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { fontSize: scaleFont(18) }, titleStyle]} numberOfLines={2}>
              {title}
            </Text>
            <Text style={[styles.subtitle, { fontSize: scaleFont(14) }, subtitleStyle]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
          <Svg width={28} height={29} viewBox="0 0 28 29" fill="none">
            <Defs>
              <Filter id="shadow" x={0} y={0.860107} width={28} height={28} filterUnits="userSpaceOnUse">
                <FeFlood floodOpacity={0} result="BackgroundImageFix" />
                <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <FeOffset dy={4} />
                <FeGaussianBlur stdDeviation={2} />
                <FeComposite in2="hardAlpha" operator="out" />
                <FeColorMatrix type="matrix" values="0 0 0 0 0.898039 0 0 0 0 0.898039 0 0 0 0 0.898039 0 0 0 0.25 0" />
                <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
              </Filter>
            </Defs>
            <G filter="url(#shadow)">
              <Circle cx={14} cy={10.8601} r={10} fill="#FF650E" />
              <Circle cx={14} cy={10.8601} r={9.5} stroke="#D9D9D9" />
            </G>
            <Path
              d="M17.9656 8.04006C18.0214 7.98308 18.088 7.93782 18.1616 7.90692C18.2351 7.87602 18.3141 7.86011 18.3939 7.86011C18.4737 7.86011 18.5526 7.87602 18.6262 7.90692C18.6997 7.93782 18.7664 7.98308 18.8222 8.04006C19.0562 8.27652 19.0595 8.65862 18.8304 8.89917L13.9924 14.6184C13.9375 14.6787 13.8708 14.7272 13.7965 14.7608C13.7222 14.7945 13.6418 14.8127 13.5602 14.8142C13.4787 14.8157 13.3976 14.8006 13.3221 14.7697C13.2466 14.7389 13.1782 14.693 13.121 14.6347L10.1771 11.6516C10.0636 11.5358 10 11.3801 10 11.2179C10 11.0558 10.0636 10.9001 10.1771 10.7843C10.233 10.7273 10.2996 10.6821 10.3732 10.6512C10.4467 10.6203 10.5257 10.6043 10.6055 10.6043C10.6852 10.6043 10.7642 10.6203 10.8378 10.6512C10.9113 10.6821 10.9779 10.7273 11.0338 10.7843L13.5309 13.315L17.9492 8.05806C17.9543 8.05173 17.9598 8.04572 17.9656 8.04006Z"
              fill="white"
            />
          </Svg>
        </View>
        <View style={[styles.statusPill, statusPillStyle]}>
          <Text style={[styles.statusText, { fontSize: scaleFont(12) }, statusTextStyle]}>
            {status}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, { fontSize: scaleFont(18) }, priceStyle]}>{price}</Text>
          <View style={[styles.quantityContainer, quantityContainerStyle]}>
            <TouchableOpacity
              style={[styles.quantityButton, quantityButtonStyle]}
              onPress={onQuantityDecrease}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.quantityText, { fontSize: scaleFont(16) }, quantityTextStyle]}>
              {quantity}
            </Text>
            <TouchableOpacity
              style={[styles.quantityButton, quantityButtonStyle]}
              onPress={onQuantityIncrease}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false} rightThreshold={40}>
      <CardContent />
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
    overflow: 'hidden',
    minHeight: screenHeight * 0.13,
  },
  image: {
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontWeight: '700',
    color: '#000000',
    lineHeight: 24,
    marginBottom: 2,
  },
  subtitle: {
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
  },
  statusPill: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  statusText: {
    fontWeight: '400',
    color: '#999999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontWeight: '700',
    color: '#FF9500',
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 5,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
  },
  quantityText: {
    fontWeight: '600',
    color: '#000000',
    minWidth: 20,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  deleteContainer: {
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    width: screenWidth * 0.18,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '190%',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CartCard;
