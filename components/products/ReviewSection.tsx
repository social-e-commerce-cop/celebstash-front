// components/ReviewsSection.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

interface Props {
  width: number;
  onRate?: (rating: number) => void;
}

const ReviewsSection = ({ width, onRate }: Props) => {
  const [rating, setRating] = useState(0); // current rating (0-5)

  const handlePress = (index: number) => {
    setRating(index + 1);
    onRate && onRate(index + 1);
  };

  const starSize = width * 0.04; // smaller star size

   const navigation = useNavigation<StackNavigationProp<any>>();
  
   const handleReviews = () => navigation.navigate("ProductReviews");

  return (
    <View style={[styles.container, { paddingHorizontal: width * 0.04 }]}>
      {/* Header: Reviews + View All */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { fontSize: width * 0.045 }]}>Reviews</Text>
        <TouchableOpacity onPress={handleReviews}>
          <Text style={[styles.viewAll, { fontSize: width * 0.035 }]}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Review Card + Rating Row */}
      <View style={styles.rowContainer}>
        {/* Review Card */}
        <View style={styles.reviewCard}>
          <Image
            source={require("../../assets/images/feed6.jpg")}
            style={[styles.avatar, { width: width * 0.12, height: width * 0.12 }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { fontSize: width * 0.04 }]}>
              Ronald Richards
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.comment, { fontSize: width * 0.035 }]}>
                13 Sep, 2020
              </Text>
            </View>
          </View>
        </View>

        {/* Rating + Stars */}
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingText, { fontSize: width * 0.04 }]}>
            {rating > 0 ? rating.toFixed(1) : "4.8"} 
            <Text style={{ color: '#8F959E' }}> rating</Text>
          </Text>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, index) => (
              <TouchableOpacity key={index} onPress={() => handlePress(index)}>
                {index < rating ? (
                  <Svg width={starSize} height={starSize} viewBox="0 0 10 9" fill="none">
                    <Path
                      d="M4.0123 1.17092C4.32632 0.281463 5.5842 0.281461 5.89822 1.17092L6.30542 2.3243C6.44656 2.72406 6.82443 2.99139 7.24838 2.99139H8.37769C9.36639 2.99139 9.75542 4.27311 8.93353 4.82268L8.16664 5.33547C7.78674 5.58949 7.62738 6.06873 7.77952 6.49966L8.10542 7.42278C8.4256 8.32968 7.40612 9.12156 6.60662 8.58697L5.51111 7.85445C5.17469 7.6295 4.73584 7.6295 4.39942 7.85445L3.30391 8.58697C2.50441 9.12156 1.48493 8.32968 1.8051 7.42278L2.13101 6.49966C2.28315 6.06873 2.12379 5.58949 1.74389 5.33547L0.976996 4.82268C0.155108 4.27311 0.544146 2.99139 1.53284 2.99139H2.66215C3.0861 2.99139 3.46397 2.72406 3.60511 2.3243L4.0123 1.17092Z"
                      fill="#FF981F"
                    />
                  </Svg>
                ) : (
                  <Svg width={starSize} height={starSize} viewBox="0 0 10 9" fill="none">
                    <Path
                      d="M4.05713 1.25391C4.29273 0.587137 5.23551 0.587215 5.47119 1.25391L5.87842 2.40723C6.0548 2.90683 6.52733 3.24107 7.05713 3.24121H8.18701C8.92833 3.24142 9.22027 4.20308 8.604 4.61523L7.83643 5.12793C7.36181 5.44552 7.1629 6.04448 7.35303 6.58301L7.6792 7.50586C7.91933 8.18603 7.15382 8.77985 6.5542 8.37891L5.45947 7.64648C5.03903 7.36535 4.49032 7.36547 4.06982 7.64648L2.97412 8.37891C2.3745 8.77985 1.60996 8.18603 1.8501 7.50586L2.17627 6.58301C2.36641 6.04439 2.16668 5.44547 1.69189 5.12793L0.925293 4.61523C0.308876 4.20306 0.600764 3.24121 1.34229 3.24121H2.47119C3.00113 3.24121 3.47348 2.90693 3.6499 2.40723L4.05713 1.25391Z"
                      stroke="#8F959E"
                      strokeWidth={0.5}
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Additional paragraph below */}
      <Text
        style={{
          fontSize: width * 0.04,
          fontWeight: "bold",
          marginBottom: 10,
          marginTop: 15,
          color: "#8F959E",
        }}
      >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque malesuada eget vitae amet...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 24,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontWeight: "bold" },
  viewAll: { color: "#8F959E", fontWeight: "bold" },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reviewCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 2,
    marginRight: 10,
  },
  avatar: { borderRadius: 50, marginRight: 10 },
  name: { fontWeight: "bold", marginBottom: 4 },
  comment: { color: "#555", marginLeft: 6 },
  ratingContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  ratingText: { fontWeight: "bold", color: "#444", marginBottom: 8 },
  starsRow: { flexDirection: "row", gap: 3 },
});

export default ReviewsSection;
