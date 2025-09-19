// components/SizeSelector.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  width: number;
}

const sizes = ["S", "M", "L", "XL", "XXL"];

const SizeSelector = ({ width }: Props) => {
  const [selected, setSelected] = useState("M");

  return (
    <View style={[styles.container, { paddingHorizontal: width * 0.05 }]}>
      <View style={styles.roww}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeBox,
              selected === size && styles.active,
              { minWidth: width * 0.15 },
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
  container: { marginTop: 15 },
  label: { fontWeight: "bold", marginBottom: 10 },
  roww: { flexDirection: "row", flexWrap: "wrap" },
  sizeBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  active: { backgroundColor: "#FF6A00", borderColor: "#FF6A00" },
  text: { color: "#333" },
  activeText: { color: "#fff", fontWeight: "bold" },
});

export default SizeSelector;
