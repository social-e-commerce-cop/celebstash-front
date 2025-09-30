import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';


const { width: screenWidth } = Dimensions.get('window');

// Helper function for scaling font sizes based on screen width (moderate scaling for consistency)
const scaleFont = (size: number): number => {
  const standardWidth = 375; // Reference iPhone 12/13 width
  return size * (screenWidth / standardWidth);
};

type CheckoutButtonProps = {
  total?: string; 
  label?: string;
  arrow?: string; 
  onPress?: () => void; 
  buttonStyle?: ViewStyle; 
  totalStyle?: TextStyle; 
  labelStyle?: TextStyle;
  arrowStyle?: TextStyle; 
};

const MainButton: React.FC<CheckoutButtonProps> = ({
  total = '$650.00',
  label = 'Checkout',
  arrow = '→',
  onPress = () => {},
  buttonStyle,
  totalStyle,
  labelStyle,
  arrowStyle,
}) => {
  const buttonHeight = Math.min(screenWidth * 0.06, 50); 
  const fontSize = scaleFont(18); 

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { height: buttonHeight },
        buttonStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.total,
          { fontSize },
          totalStyle,
        ]}
      >
        {total}
      </Text>
      <Text
        style={[
          styles.label,
          { fontSize: scaleFont(16) },
          labelStyle,
        ]}
      >
        {label}
        
      </Text>
      <Text
        style={[
          styles.arrow,
          { fontSize },
          arrowStyle,
        ]}
      >
        {arrow}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF9500', // Orange background
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 0,
    marginVertical: 12,
    minHeight: 50, // Fallback for smaller screens
  },
  total: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 15,
  },
  label: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 15,
  },
  arrow: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default MainButton;