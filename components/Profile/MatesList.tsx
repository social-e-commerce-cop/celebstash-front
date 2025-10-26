import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";

interface Mate {
  id: string;
  name: string;
  img: any;
}

const mates: Mate[] = [
  { id: "1", name: "@Joel", img: require("../../assets/images/feed6.jpg") },
  { id: "2", name: "@Ange", img: require("../../assets/images/feed6.jpg") },
  { id: "3", name: "@Chris", img: require("../../assets/images/feed6.jpg") },
  { id: "4", name: "@Bien", img: require("../../assets/images/feed6.jpg") },
  { id: "5", name: "@Jesus", img: require("../../assets/images/feed6.jpg") },
   { id: "6", name: "@Jesus", img: require("../../assets/images/feed6.jpg") },
];

export default function MatesList() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mates</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {mates.map((mate) => (
          <View key={mate.id} style={styles.mate}>
            <Image source={mate.img} style={styles.image} />
            <Text>{mate.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontWeight: "bold", fontSize: 15 },
  name: { fontWeight: "bold", fontSize: 15 },
  seeAll: { color: "#FF650E", fontSize: 15, fontWeight: "bold" },
  mate: { alignItems: "center", marginRight: 20 },
  image: { width: 65, height: 65, borderRadius: 50, marginBottom: 4 },
});
