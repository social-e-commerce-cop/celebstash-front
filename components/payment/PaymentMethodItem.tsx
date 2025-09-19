import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, Circle, Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface PaymentMethodItemProps {
  name: string;
  amount?: string;
  selected?: boolean; // <-- track selection from parent
  onPress?: () => void;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  name,
  amount,
  selected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Wallet Icon (SVG) */}
      <View style={styles.iconWrapper}>
        <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <Path d="M23.75 25H6.25C5.58696 25 4.95107 24.7366 4.48223 24.2678C4.01339 23.7989 3.75 23.163 3.75 22.5V11.25C3.75 10.587 4.01339 9.95107 4.48223 9.48223C4.95107 9.01339 5.58696 8.75 6.25 8.75H23.75C24.413 8.75 25.0489 9.01339 25.5178 9.48223C25.9866 9.95107 26.25 10.587 26.25 11.25V22.5C26.25 23.163 25.9866 23.7989 25.5178 24.2678C25.0489 24.7366 24.413 25 23.75 25Z" stroke="#FF650E" strokeWidth={1.5}/>
          <Path d="M20.625 17.5C20.4592 17.5 20.3003 17.4342 20.1831 17.3169C20.0658 17.1997 20 17.0408 20 16.875C20 16.7092 20.0658 16.5503 20.1831 16.4331C20.3003 16.3158 20.4592 16.25 20.625 16.25C20.7908 16.25 20.9497 16.3158 21.0669 16.4331C21.1842 16.5503 21.25 16.7092 21.25 16.875C21.25 17.0408 21.1842 17.1997 21.0669 17.3169C20.9497 17.4342 20.7908 17.5 20.625 17.5Z" fill="#FF650E" stroke="#FF650E" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}/>
          <Path d="M22.5 8.74995V7.0037C22.4999 6.62058 22.4117 6.2426 22.2423 5.89897C22.0729 5.55534 21.8268 5.25523 21.523 5.02184C21.2192 4.78844 20.8658 4.628 20.4901 4.5529C20.1144 4.4778 19.7265 4.49004 19.3562 4.5887L5.60625 8.25495C5.07382 8.39684 4.60317 8.71065 4.26749 9.14761C3.9318 9.58456 3.74988 10.1202 3.75 10.6712V11.2499" stroke="#FF650E" strokeWidth={1.5}/>
        </Svg>
      </View>

      {/* Text (Title + Amount) */}
      <View style={styles.textWrapper}>
        <View style={styles.titleAmountRow}>
          <Text style={styles.title}>{name}</Text>
          {amount && <Text style={styles.amount}>{amount}</Text>}
        </View>
      </View>

      {/* Radio Button */}
      <View style={styles.radioWrapper}>
        {selected ? (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="#FF650E" />
            <Circle cx="12" cy="12" r="7.5" fill="#FF650E" />
          </Svg>
        ) : (
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Rect x="0.5" y="0.5" width="23" height="23" rx="11.5" stroke="#8F959E" />
          </Svg>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.045,
    borderRadius: 12,
    marginBottom: 15,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  titleAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  amount: {
    fontSize: 18,
    color: "#FF650E",
  },
  radioWrapper: {
    marginLeft: 10,
  },
});

export default PaymentMethodItem;
