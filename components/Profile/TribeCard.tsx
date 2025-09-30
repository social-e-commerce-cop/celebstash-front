import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export interface Tribe {
  id: string;
  name: string;
  img: any;
  lastMessage: string;
  messageCount: number;
}

export default function TribeCard({ tribe }: { tribe: Tribe }) {
  return (
    <View style={styles.card}>
      <Image source={tribe.img} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{tribe.name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {tribe.lastMessage}
        </Text>
      </View>
      {tribe.messageCount > 0 && (
        <View style={styles.messageBadge}>
          <Text style={styles.messageCount}>{tribe.messageCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginVertical: 0,
  },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  info: { flex: 1 },
  name: { fontWeight: "bold", fontSize: 16 },
  message: { color: "#303030B2", fontSize: 14, marginTop: 4, fontWeight: '500' },
  messageBadge: {
    backgroundColor: "#FF650E",
    borderRadius: 50,
    minWidth: 30,
    minHeight: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  messageCount: { color: "#fff", fontWeight: "bold" },
});
