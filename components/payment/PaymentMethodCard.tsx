import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

// Function to scale sizes based on screen width
const scale = (size: number) => (width / 375) * size; // 375 is base width for scaling

interface PaymentMethodCardProps {
  name: string;
  icon?: React.ReactNode; // Custom icon (SVG or Image)
  backgroundColor?: string;
  borderRadius?: number;
  textColor?: string;
  onPress?: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  name,
  icon,
  backgroundColor = "#fff",
  borderRadius = 12,
  textColor = "#000",
  onPress,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handlePress = () => {
    setIsSelected(!isSelected);
    onPress?.();
  };

  const defaultIcon = (
    <Svg width={scale(24)} height={scale(24)} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 7C6 5.34315 7.34315 4 9 4H15C16.6569 4 18 5.34315 18 7V17C18 18.6569 16.6569 20 15 20H9C7.34315 20 6 18.6569 6 17V7Z"
        stroke="#0070BA"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 10C9 8.89543 9.89543 8 11 8H13C14.1046 8 15 8.89543 15 10V12C15 13.1046 14.1046 14 13 14H11C9.89543 14 9 13.1046 9 12V10Z"
        fill="#009CDE"
      />
    </Svg>
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor,
          borderRadius,
          borderWidth: isSelected ? 1 : 0,
          borderColor: isSelected ? "#F5F5F8" : "transparent",
        },
      ]}
    >
      <View style={styles.iconWrapper}>{icon || defaultIcon}</View>
      <Text style={[styles.title, { color: textColor }]}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(20),
    paddingHorizontal: scale(16),
    marginBottom: scale(15),
  },
  iconWrapper: {
    width: scale(40),
    height: scale(40),
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(15),
  },
  title: {
    fontSize: scale(15),
    fontWeight: "600",
  },
});

export default PaymentMethodCard;
