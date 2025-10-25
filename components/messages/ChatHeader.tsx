// components/ChatHeader.tsx
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { VideoCall } from "@/assets/icons/Settings";

interface ChatHeaderProps {
  scrollY: Animated.Value;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ scrollY }) => {
  const navigation = useNavigation();

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [220, 70],
    extrapolate: "clamp",
  });

  const largeOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const compactOpacity = scrollY.interpolate({
    inputRange: [60, 140],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      {/* Large Header */}
      <Animated.View
        style={[
          styles.largeHeader,
          { height: headerHeight, opacity: largeOpacity },
        ]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.callButtons}>
            <TouchableOpacity
              onPress={() => alert("Starting video call...")}
              style={styles.callIcon}
            >
              {VideoCall}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => alert("Starting audio call...")}
              style={styles.callIcon}
            >
              <Ionicons name="call" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/images/feed6.jpg")}
            style={styles.largeAvatar}
          />
          <Text style={styles.name}>Ange Nadette</Text>
        </View>
      </Animated.View>

      {/* Compact Header */}
      <Animated.View
        style={[
          styles.compactHeader,
          { opacity: compactOpacity },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* BACK BUTTON */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 6, marginRight: 6, borderRadius: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          {/* AVATAR AND NAME */}
          <Image
            source={require("../../assets/images/feed6.jpg")}
            style={styles.compactAvatar}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.compactName}>Ange Nadette</Text>
            <Text style={styles.lastSeen}>1h</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={{ marginRight: 12 }}>
            {VideoCall}
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="call" size={22} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    backgroundColor: "#fff",
    paddingTop: 32,
  },
  largeHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingBottom: 0,
    paddingTop: 24,
  },
  largeAvatar: { width: 70, height: 70, borderRadius: 50 },
  name: { marginTop: 8, fontSize: 18, fontWeight: "700" },
  compactHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 36,
  },
  compactAvatar: { width: 40, height: 40, borderRadius: 20 },
  compactName: { fontWeight: "700" },
  lastSeen: { color: "#6B7280", fontSize: 12 },
  topBar: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: { padding: 8, borderRadius: 20 },
  callButtons: { flexDirection: "row", alignItems: "center" },
  callIcon: { padding: 8, borderRadius: 20, marginLeft: 8 },
});
