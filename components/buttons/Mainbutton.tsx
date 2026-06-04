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
  total = '',
  label = 'Checkout',
  arrow = '',
  onPress = () => {},
  buttonStyle,
  totalStyle,
  labelStyle,
  arrowStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {!!total && (
        <Text style={[styles.total, totalStyle]}>{total}</Text>
      )}
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      {!!arrow && (
        <Text style={[styles.arrow, arrowStyle]}>{arrow}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  total: {
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginRight: 15,
  },
  label: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  arrow: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default MainButton;