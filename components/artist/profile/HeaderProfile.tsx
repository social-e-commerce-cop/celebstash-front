import React, { useState } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AddItem } from "@/assets/icons/Settings";
import AddItemModal from "./AddItemModal"; // import modal

const Header = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSettings = () => {
    navigation.navigate('ArtSettings');
  };

  return (
    <>
      <ImageBackground
        source={require("../../../assets/images/backImage.jpg")}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
              {AddItem}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSettings} style={styles.button}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <AddItemModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
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
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  button: {
    padding: 4,
  },
});

export default Header;
