import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

// Function to scale sizes based on screen width
const scale = (size: number) => (width / 375) * size; // 375 is base width for scaling

interface PaymentMethodCardProps {
  name: string;
  icon?: React.ReactNode; // Custom icon (SVG or Image)
  selected?: boolean;
  onPress?: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  name,
  icon,
  selected = false,
  onPress,
}) => {
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
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: selected ? "#f7edfeff" : "#fff",
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: selected ? "#7126D0" : "transparent",
        },
      ]}
    >
      <View style={styles.iconWrapper}>{icon || defaultIcon}</View>
      <Text style={styles.title}>{name}</Text>

      {/* Radio indicator only when selected */}
      {selected && (
        <View style={styles.radioWrapper}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="#7126D0" />
            <Circle cx="12" cy="12" r="7.5" fill="#7126D0" />
          </Svg>
        </View>
      )}
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
    flex: 1,
    fontSize: scale(15),
    fontWeight: "600",
  },
  radioWrapper: {
    marginLeft: scale(10),
  },
});

export default PaymentMethodCard;
