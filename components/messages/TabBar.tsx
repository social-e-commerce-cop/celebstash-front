import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

interface TabProps {
  label: string;
  badge?: string | number;
  isActive?: boolean;
  onPress?: () => void;
}

const Tab: React.FC<TabProps> = ({ label, badge, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tab, isActive && styles.activeTab]}>
    <Text style={[styles.tabText, isActive && styles.activeText]}>{label}</Text>
    {badge ? (
      <View style={[styles.badge, isActive && styles.activeBadge]}>
        <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>{badge}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

const TabBar: React.FC = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    <Tab label="All" isActive />
    <Tab label="Unreads" badge="23" />
    <Tab label="Groups" badge="2" />
    <Tab label="Favorites" />
     <Tab label="+" />
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 18, 
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 2, // minimal padding
    backgroundColor: "#E9EAEC",
    borderRadius: 25,
    height: 33, // fixed small height
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#ff6600",
  },
  tabText: {
    color: "#30303080",
    fontSize: 16,
    fontWeight: "bold",
  },
  activeText: {
    color: "#fff",
  },
  badge: {
    marginLeft: 5,
    minWidth: 16,
  },
  activeBadge: {
    backgroundColor: "#fff",
  },
  badgeText: {
    color: "#30303080",
    fontWeight: "bold",
    fontSize: 16,
  },
  activeBadgeText: {
    color: "#ff6600",
  },
});

export default TabBar;
