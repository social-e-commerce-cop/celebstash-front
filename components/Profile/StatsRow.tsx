import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatsRow() {
  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.value}>1.53k</Text>
        <Text style={styles.label}>Mates</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.stat}>
        <Text style={styles.value}>15</Text>
        <Text style={styles.label}>Orders</Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.stat}>
        <Text style={styles.value}>1.5M</Text>
        <Text style={styles.label}>Likes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 10,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  value: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 3
  },
  label: {
    fontSize: 14,
    color: "#8F959E",
    fontWeight: '500',
  },
  separator: {
    width: 2,
    backgroundColor: "#8F959E57",
    alignSelf: "stretch", 
  },
});
