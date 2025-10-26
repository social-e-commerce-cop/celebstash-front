import { Continue } from "@/assets/icons/Settings";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  isHighlighted?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  isHighlighted = false,
}) => {
  const isLogout = title.toLowerCase() === "logout";
  const isLanguage = title.toLowerCase().includes("language");

  // If it's language, we assume something like "Language (EN)"
  const renderLanguageTitle = () => {
    const match = title.match(/(.*)\((.*)\)/);
    if (match) {
      const [, base, lang] = match;
      return (
        <Text style={styles.title}>
          {base.trim()} (
          <Text style={styles.highlighted}>{lang.trim()}</Text>)
        </Text>
      );
    }
    return <Text style={styles.title}>{title}</Text>;
  };

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.iconContainer}>{icon}</View>

      {isLogout ? (
        <Text style={[styles.title, styles.logout]}>{title}</Text>
      ) : isLanguage ? (
        renderLanguageTitle()
      ) : (
        <Text style={[styles.title, isHighlighted && styles.highlighted]}>
          {title}
        </Text>
      )}

      {!isLogout && <Continue />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    color: "#1D1E20",
    fontWeight: "bold",
  },
  highlighted: {
    color: "#FF650E",
    fontWeight: "500",
  },
  logout: {
    color: "red",
    fontWeight: "500",
  },
});

export default MenuItem;
