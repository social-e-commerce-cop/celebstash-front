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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper for scaling fonts
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

const CheckoutCard: React.FC<OrderCardProps> = ({
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
  const imageWidth = Math.min(screenWidth * 0.25, 120);

  return (
    <View style={[styles.card, { padding }, cardStyle]}>
      <Image
        source={imageSource}
        style={[
          styles.image,
          { width: imageWidth, height: '100%' }, // full card height
          imageStyle,
        ]}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text
          style={[styles.title, { fontSize: scaleFont(18) }, titleStyle]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          style={[styles.subtitle, { fontSize: scaleFont(14) }, subtitleStyle]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
        <View style={[styles.statusPill, statusPillStyle]}>
          <Text
            style={[styles.statusText, { fontSize: scaleFont(12) }, statusTextStyle]}
          >
            {status}
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.price, { fontSize: scaleFont(18) }, priceStyle]}>
            {price}
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { paddingHorizontal: scaleFont(8), paddingVertical: scaleFont(8) },
              buttonStyle,
            ]}
            onPress={onButtonPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { fontSize: scaleFont(14) }, buttonTextStyle]}>
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
    borderRadius: 16,
    alignItems: 'flex-start',
    overflow: 'hidden',
    marginBottom: 40,
    minHeight: screenHeight * 0.1, // ensures enough height for image
  },
  image: {
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
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
    marginBottom: 8,
  },
  statusPill: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    fontWeight: '400',
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontWeight: '700',
    color: '#FF650E',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF650E',
    borderRadius: 80,
    minWidth: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CheckoutCard;
