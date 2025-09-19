import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

interface TransactionItemProps {
  image: any;
  title: string;
  date: string;
  time: string;
  amount: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  image,
  title,
  date,
  time,
  amount,
}) => {
  return (
    <View style={styles.container}>
      {/* Left - image */}
      <Image source={image} style={styles.image} resizeMode="cover" />

      {/* Middle - details */}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {date} | {time}
        </Text>
      </View>

      {/* Right - amount */}
      <Text style={styles.amount} numberOfLines={1}>
        {amount}
      </Text>
    </View>
  );
};

export default TransactionItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: height * 0.01,
    justifyContent: "space-between",
    width: "100%",
  },
  image: {
    width: width * 0.15, // ~12% of screen width
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: width * 0.04,
  },
  title: {
    fontSize: width * 0.04, // responsive font
    fontWeight: "600",
    color: "#1D1E20",
  },
  subtitle: {
    fontSize: width * 0.032,
    color: "#8A8A8A",
    marginTop: 3,
  },
  amount: {
    fontSize: width * 0.04,
    fontWeight: "700",
    color: "#1D1E20",
    marginLeft: width * 0.03,
  },
});
