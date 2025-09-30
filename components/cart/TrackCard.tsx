import React from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,
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

const TrackCard: React.FC<OrderCardProps> = ({
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
        <View style={styles.footer}>
          <Text style={[styles.price, { fontSize: scaleFont(18) }, priceStyle]}>
            {price}
          </Text>
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
    marginBottom: 20,
    minHeight: screenHeight * 0.15, 
  },
  image: {
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
        paddingVertical: screenHeight * 0.02
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
    borderRadius: 24,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default TrackCard;
