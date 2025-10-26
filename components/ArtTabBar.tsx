import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
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
  ArtHome: undefined;
  CartScreen: undefined;
  Ewallet: undefined;
 ArtProfile: undefined;
};

type TabBarNavigationProp = StackNavigationProp<RootStackParamList>;
type TabBarRouteProp = RouteProp<RootStackParamList, keyof RootStackParamList>;

export default function ArtTabBar() {
  const navigation = useNavigation<TabBarNavigationProp>();
  const route = useRoute<TabBarRouteProp>();
  const activeTab = route.name as keyof RootStackParamList;

  const handlePress = (tab: keyof RootStackParamList) => {
    if (tab !== activeTab) {
      navigation.navigate(tab);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handlePress("ArtHome")}>
        <View style={[styles.tab, activeTab === "ArtHome" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "ArtHome" ? <ActiveHome /> : <HomeIcon size={25} />}
          </View>
          {activeTab === "ArtHome" && <Text style={styles.tabText}>Home</Text>}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePress("CartScreen")}>
        <View style={[styles.tab, activeTab === "CartScreen" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "CartScreen" ? <ActiveCart /> : <CartIcon size={25} />}
          </View>
          {activeTab === "CartScreen" && <Text style={styles.tabText}>Cart</Text>}
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

      <TouchableOpacity onPress={() => handlePress("ArtProfile")}>
        <View style={[styles.tab, activeTab === "ArtProfile" && styles.activeTab]}>
          <View style={styles.iconContainer}>
            {activeTab === "ArtProfile" ? <ActiveProfile /> : <ProfileIcon size={25} />}
          </View>
          {activeTab === "ArtProfile" && <Text style={styles.tabText}>Profile</Text>}
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
    paddingHorizontal: 10,
    paddingVertical: 20,
backgroundColor: '#fff', 
    borderRadius: 50,

  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: "#FF6600",
  },
  iconContainer: {
    marginRight: 6,
  },
  tabText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
