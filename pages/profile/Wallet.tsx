// EditProfile.tsx
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import SwitchToggle from "@/components/Profile/SwitchToggle";

const { width, height } = Dimensions.get("window");

const Wallet = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [notificationStatus, setNotificationStatus] = useState(false);
  
    const handleToggle = (value: boolean) => {
      setNotificationStatus(value);
      console.log('Notification toggled to:', value);
    };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>
              Wallet
            </Text>

            <View style={styles.iconButton} />
          </View>
         <SwitchToggle
         label="Enable PIN verification"
        initialValue={notificationStatus}
        onValueChange={handleToggle}
      />
      <SwitchToggle
         label="Lock Account"
        initialValue={notificationStatus}
        onValueChange={handleToggle}
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f8faff",   
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04, 
},
  containerized: { paddingHorizontal: width * 0.06, paddingTop: height * 0.03, paddingBottom: height * 0.02 },
  scrollContent: {},
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: { color: "#000", fontWeight: "bold" },
  iconButton: {},

  
});

export default Wallet;
