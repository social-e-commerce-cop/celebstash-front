// components/ImageCarousel.tsx
import React, { useState } from "react";
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const images = [
  require("../../assets/images/product1.jpg"),
  require("../../assets/images/product2.png"),
  require("../../assets/images/product3.jpg"),
  require("../../assets/images/product4.jpg"),
  require("../../assets/images/product5.jpg"),
    require("../../assets/images/product4.jpg"),
  require("../../assets/images/product5.jpg"),
];

interface ImageCarouselProps {
  width: number;
  height: number;
  onBack?: () => void; // optional callback for back button
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ width, height, onBack }) => {
  const [selected, setSelected] = useState(0);
  const [liked, setLiked] = useState(false);

  const navigation = useNavigation();


  // Increase the height slightly so the top of the image is visible
  const imageHeight = height * 1.4;

  return (
    <View style={[styles.container, { width, height: imageHeight }]}>
      {/* Main Image */}
      <Image
        source={images[selected]}
        style={[styles.mainImage, { width, height: imageHeight }]}
      />

      {/* Top Header Overlay */}
      <View style={styles.headerOverlay}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
    <Ionicons name="arrow-back" size={24} color="#fff" />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>Product Details</Text>

  <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.iconButton}>
    <Ionicons
      name={liked ? "heart" : "heart-outline"}
      size={24}
      color={liked ? "red" : "#fff"}
    />
  </TouchableOpacity>
</View>

      {/* Bottom Thumbnails Overlay */}
      <View style={styles.thumbnailOverlay}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setSelected(index)}>
              <Image
                source={img}
                style={[
                  styles.thumbnail,
                  { borderColor: selected === index ? "#FF6A00" : "transparent" },
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={styles.wrapper}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    overflow: "hidden",
  },
  mainImage: {
    resizeMode: "cover",
  },
  headerOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconButton: {
    padding: 5,
  },
  thumbnailOverlay: {
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: "#fff",
    marginHorizontal: 24,
    borderRadius: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 5,
    borderWidth: 2,
    borderRadius: 10,
  },
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 5,
    paddingVertical: 5,
    backgroundColor: "#f5f8faff",
    height: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  }
});

export default ImageCarousel;
