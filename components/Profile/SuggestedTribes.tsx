import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

interface SuggestedTribe {
  id: string;
  name: string;
  mates: string;
  img?: any; // optional image
}

const suggestions: SuggestedTribe[] = [
  { id: "1", name: "Emelyne", mates: "2.4M Mates", img: require("../../assets/images/feed6.jpg") },
  { id: "2", name: "Emelyne", mates: "15 Mates" }, // will use default image
];

const defaultImg = require("../../assets/images/profile.jpg");

export default function SuggestedTribes() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find Tribes to join</Text>
      {suggestions.map((tribe) => (
        <View key={tribe.id} style={styles.row}>
          <View style={styles.profileInfo}>
            <Image source={tribe.img || defaultImg} style={styles.image} />
            <View>
              <Text style={styles.name}>{tribe.name}</Text>
              <Text style={styles.mates}>{tribe.mates}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mateBtn}>
            <Text style={styles.mateText}>Mate</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, marginBottom: 120 },
  title: { fontWeight: "bold", marginBottom: 12, fontSize: 16, color: '#8F959E' },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  profileInfo: { flexDirection: "row", alignItems: "center" },
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 12,
  },
  name: { fontWeight: "bold", fontSize: 16 },
  mates: { color: "#303030B2", fontSize: 14, fontWeight: '500' },
  mateBtn: {
    width: 80,
    height: 35,
    backgroundColor: "rgba(255, 101, 14, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  mateText: { color: "#FF650E", fontWeight: "bold" },
});
