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
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PURPLE = '#7126D0';

const scaleFont = (size: number) => {
  const standardWidth = 375;
  return size * (screenWidth / standardWidth);
};

type OrderCardProps = {
  imageSource?: ImageSourcePropType;
  title?: string;
  subtitle?: string;
  status?: string;
  price?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  cardStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  statusPillStyle?: ViewStyle;
  statusTextStyle?: TextStyle;
  priceStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
};

const TruckIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
    <Path d="M1 3h15v13H1z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="18.5" r="1.5" />
    <Circle cx="18.5" cy="18.5" r="1.5" />
  </Svg>
);

const OrderCard: React.FC<OrderCardProps> = ({
  imageSource,
  title = "Kendric's Jacket on Tour",
  subtitle = 'Kendric Lamar',
  status = 'In delivery',
  price = '$150.00',
  buttonText = 'Track order',
  onButtonPress = () => {},
  cardStyle,
  imageStyle,
  titleStyle,
  subtitleStyle,
  statusPillStyle,
  statusTextStyle,
  priceStyle,
  buttonStyle,
  buttonTextStyle,
}) => {
  const padding = Math.min(screenWidth * 0.04, 16);
  const imageWidth = Math.min(screenWidth * 0.25, 110);

  const isTrackButton = buttonText?.toLowerCase().includes('track');
  const isReviewButton = buttonText?.toLowerCase().includes('review');

  return (
    <View style={[styles.card, { padding }, cardStyle]}>
      {/* Image */}
      <Image
        source={imageSource}
        style={[styles.image, { width: imageWidth, height: screenHeight * 0.13 }, imageStyle]}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Status pill top right */}
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

        {/* Footer: price + button */}
        <View style={styles.footer}>
          <Text style={[styles.price, { fontSize: scaleFont(17) }, priceStyle]}>{price}</Text>

          <TouchableOpacity
            style={[
              styles.button,
              isReviewButton && styles.reviewButton,
              buttonStyle,
            ]}
            onPress={onButtonPress}
            activeOpacity={0.8}
          >
            {isTrackButton && (
              <View style={styles.truckIconWrap}>
                <TruckIcon />
              </View>
            )}
            <Text style={[styles.buttonText, { fontSize: scaleFont(13) }, buttonTextStyle]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    alignItems: 'flex-start',
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginHorizontal: 2,
    marginTop: 5
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
    marginBottom: 10,
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
    backgroundColor: '#F0E8FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#D4B8F7',
    alignSelf: 'flex-start',
  },
  statusText: {
    color: PURPLE,
    fontFamily: 'Poppins-Medium',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#111',
    lineHeight: 24,
    fontFamily: 'Poppins-Bold',
  },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  reviewButton: {
    backgroundColor: '#32A06E',
  },
  truckIconWrap: {
    marginRight: 2,
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});

export default OrderCard;

