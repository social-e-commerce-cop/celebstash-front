// components/ProductHeader.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  width: number;
}

const sizes = ["S", "M", "L", "XL", "XXL"];

const ProductHeader = ({ width }: Props) => {
  const [selected, setSelected] = useState("M");

  return (
    <View style={[styles.containerP, { paddingHorizontal: width * 0.04 }]}>
      {/* Row for Category and Rating */}
      <View style={styles.row}>
        <Text style={[styles.category, { fontSize: width * 0.035 }]}>Kendric’s Jacket</Text>
        <Text style={[styles.rating, { fontSize: width * 0.035 }]}>⭐ 5.0</Text>
      </View>

      {/* Title */}
      <Text style={[styles.title, { fontSize: width * 0.05 }]}>
        Kendric’s Jacket on Tour
      </Text>
      <Text style={{ fontSize: width * 0.04, fontWeight: "bold", marginBottom: 10 }}>
        This isn’t just a jacket — it’s a moment in music history.
      </Text>

      {/* Description */}
      <Text style={[styles.description, { fontSize: width * 0.04 }]}>
        Worn by Kendrick Lamar during the &apos;Mr. Morale Tour&apos;, this piece carries the energy of sold-out arenas, poetic verses, and raw, unfiltered emotion. From the backstage pulse to the spotlight on stage, this jacket has witnessed the power of art to move millions.
        It’s more than fashion — it&apos;s a symbol of resilience, purpose, and evolution. With every stitch, it echoes the stories told, the cities touched, and the fans who sang every word.
      </Text>

      <Text style={{ fontSize: width * 0.04, fontWeight: "bold", marginBottom: 10 }}>
        Limited availability. Authenticated. Untamed
      </Text>

      {/* Sizes row */}
      <View style={styles.sizeRow}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeBox,
              selected === size && styles.active,
              { width: (width - 2 * width * 0.06 - (sizes.length - 1) * 10) / sizes.length },
            ]}
            onPress={() => setSelected(size)}
          >
            <Text style={selected === size ? styles.activeText : styles.text}>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerP: {
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingVertical: 24,
    marginHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  category: {
    color: "#FF6A00",
    fontWeight: "bold",
  },
  title: {
    fontWeight: "bold",
    marginVertical: 5,
    marginBottom: 10,
  },
  rating: {
    fontWeight: "bold",
    color: "#444",
  },
  description: {
    color: "#8F959E",
    marginTop: 5,
    lineHeight: 20,
    marginBottom: 10,
  },
  sizeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sizeBox: {
    height: 37,
    borderWidth: 1,
    borderColor: "#272522",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 0,
  },
  active: { backgroundColor: "#272522", borderColor: "#272522" },
  text: { color: "#272522" },
  activeText: { color: "#FF650E", fontWeight: "bold" },
});

export default ProductHeader;
