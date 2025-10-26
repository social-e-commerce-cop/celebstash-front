import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import TribeCard, { Tribe } from "./TribeCard";

const tribes: Tribe[] = [
  {
    id: "1",
    name: "Emelyne💖",
    img: require("../../assets/images/feed6.jpg"),
    lastMessage: "Hello I saw your review on Kivumbi Post and...",
    messageCount: 5,
  },
  {
    id: "2",
    name: "Alex🎵",
    img: require("../../assets/images/feed7.png"),
    lastMessage: "Are you joining the game tonight?",
    messageCount: 12,
  },
];

export default function TribesList() {
  const handleExplorePress = () => {
    console.log("Explore pressed!");
    // You can navigate to another screen here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tribes</Text>
        <TouchableOpacity onPress={handleExplorePress}>
          <Text style={styles.explore}>Explore</Text>
        </TouchableOpacity>
      </View>
      {tribes.map((tribe) => (
        <TribeCard key={tribe.id} tribe={tribe} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  title: { fontWeight: "bold", fontSize: 16, color: '#1D1E20' },
  explore: { color: "#FF650E", fontWeight: "bold",fontSize: 14 },
});
