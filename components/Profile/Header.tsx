import React from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // 👈 import navigation hook
import { StackNavigationProp } from "@react-navigation/stack";

const Header = () => {
      const navigation = useNavigation<StackNavigationProp<any>>(); 

    const handleSettings = () => {
    navigation.navigate('Settings')
    console.log('Navigating to settings');
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backImage.jpg")} // background image
      style={styles.header}
      imageStyle={styles.headerImage}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleSettings}>
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",
    height: 220,
  paddingTop: 48,
  },
  headerImage: {
    resizeMode: "cover",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
});

export default Header;
