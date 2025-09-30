// ProductDetails.tsx
import BottomBar from "@/components/products/BottomBar";
import ImageCarousel from "@/components/products/ImageCarousel";
import ProductHeader from "@/components/products/ProductHeader";
import ReviewsSection from "@/components/products/ReviewSection";
import React from "react";
import { View, ScrollView, StyleSheet, useWindowDimensions } from "react-native";

const ProductDetails = () => {
  const { width, height } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.07 }}
      >
        <ImageCarousel width={width} height={height * 0.4} />
        <ProductHeader width={width} />
        <ReviewsSection width={width} />
        <BottomBar width={width} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8faff" },
});

export default ProductDetails;
