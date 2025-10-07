import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title?: string; // Added prop for customizable title
  onBack: () => void;
  onDone: () => void;
  doneDisabled: boolean;
}

const { width, height } = Dimensions.get("window");

const Header: React.FC<HeaderProps> = ({
  title = "Create Post", // Default title
  onBack,
  onDone,
  doneDisabled,
}) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerLeft} onPress={onBack}>
      <Ionicons name="arrow-back" size={width * 0.06} color="black" />
    </TouchableOpacity>

    <Text style={styles.headerTitle}>{title}</Text>

    <TouchableOpacity
      style={styles.headerRight}
      onPress={onDone}
      disabled={doneDisabled}
    >
      <Text
        style={[
          styles.headerRightText,
          doneDisabled && { color: "#FF650E" },
        ]}
      >
        Done
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.06,
  },
  headerLeft: {
    width: width * 0.12,
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  headerRight: {
    width: width * 0.15,
    alignItems: "flex-end",
  },
  headerRightText: {
    fontSize: width * 0.045,
    color: "#FF650E",
    fontWeight: "bold",
  },
});

export default Header;
