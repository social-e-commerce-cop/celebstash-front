import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface GenderSelectorProps {
  value: string;
  onChange: (gender: string) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange }) => {
  const genders = ["Male", "Female", "Other"];
  return (
    <View style={styles.row}>
      <Text style={styles.label}>Gender</Text>
      <View style={styles.options}>
        {genders.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.option, value === g && styles.optionActive]}
            onPress={() => onChange(g)}
          >
            <Text style={value === g ? styles.textActive : styles.text}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { borderBottomWidth: 1, borderColor: "#ddd", padding: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  options: { flexDirection: "row", gap: 12 },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionActive: { backgroundColor: "#FF6600", borderColor: "#FF6600" },
  text: { color: "#333" },
  textActive: { color: "white", fontWeight: "600" },
});

export default GenderSelector;
