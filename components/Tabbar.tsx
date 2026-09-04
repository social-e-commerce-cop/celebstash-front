import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import {
  ActiveCart,
  ActiveHome,
  ActiveProfile,
  ActiveWallet,
  CartIcon,
  HomeIcon,
  ProfileIcon,
  WalletIcon,
} from "@/assets/icons/Payment";

type RootStackParamList = {
  Home: undefined;
  Shop: undefined;
  Music: { initialQuery?: string } | undefined;
  Ewallet: undefined;
  MyProfile: undefined;
  CartScreen: undefined;
};

type TabBarNavigationProp = StackNavigationProp<RootStackParamList>;
type TabBarRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

export default function TabBar() {
  const navigation = useNavigation<TabBarNavigationProp>();
  const route = useRoute<TabBarRouteProp>();
  const activeTab = route.name as keyof RootStackParamList;

  const handlePress = (tab: keyof RootStackParamList) => {
    if (tab !== activeTab) {
      navigation.navigate(tab as any);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handlePress("Home")}>
        <View style={[styles.tab, activeTab === "Home" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "Home" ? <ActiveHome /> : <HomeIcon size={25} />}
          </View>
          {activeTab === "Home" && <Text style={styles.tabText}>Home</Text>}
        </View>
      </TouchableOpacity>

      {/* Second Tab: Shop (All Products) */}
      <TouchableOpacity onPress={() => handlePress("Shop")}>
        <View style={[styles.tab, (activeTab as string) === "Shop" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {(activeTab as string) === "Shop" ? (
              <Ionicons name="bag-handle" size={24} color="#fff" />
            ) : (
              <Ionicons name="bag-handle-outline" size={24} color="#1D1E20" />
            )}
          </View>
          {(activeTab as string) === "Shop" && <Text style={styles.tabText}>Shop</Text>}
        </View>
      </TouchableOpacity>

      {/* Third Tab: Music */}
      <TouchableOpacity onPress={() => handlePress("Music")}>
        <View style={[styles.tab, activeTab === "Music" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "Music" ? (
              <Ionicons name="musical-notes" size={25} color="#fff" />
            ) : (
              <Ionicons name="musical-notes-outline" size={25} color="#1D1E20" />
            )}
          </View>
          {activeTab === "Music" && <Text style={styles.tabText}>Music</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("Ewallet")}>
        <View style={[styles.tab, activeTab === "Ewallet" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "Ewallet" ? <ActiveWallet /> : <WalletIcon size={25} />}
          </View>
          {activeTab === "Ewallet" && <Text style={styles.tabText}>Ewallet</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("MyProfile")}>
        <View style={[styles.tab, activeTab === "MyProfile" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "MyProfile" ? <ActiveProfile /> : <ProfileIcon size={25} />}
          </View>
          {activeTab === "MyProfile" && <Text style={styles.tabText}>Profile</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: "#7126D0",
  },
  iconContainer: {
    marginRight: 6,
  },
  tabText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
});
