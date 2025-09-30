import MenuItem from "@/components/Profile/MenuItem";
import React from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Addres, Language, Logout, Notifications, Privacy, Profile, Security } from "@/assets/icons/Settings";
import { WalletIcon } from "@/assets/icons/Payment";

const { width, height } = Dimensions.get('window');

const SettingsScreen: React.FC = () => {

const navigation = useNavigation<StackNavigationProp<any>>();

  const handlePress = (item: string) => {
    navigation.navigate(item);
    // TODO: Add navigation or action logic here
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#000" />
              {/* Header */}
              <View style={styles.headerOverlay}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                  <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
                </TouchableOpacity>
        
                <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Settings</Text>
        
                <View style={styles.iconButton} />
              </View>
      <View style={styles.card}>
        <MenuItem
        icon={<Profile />}
        title="Edit Profile"
        onPress={() => handlePress("EditProfile")}
      />
      <MenuItem
        icon={<Addres />}
        title="Address"
        onPress={() => handlePress("AddressSetting")}
      />
      <MenuItem
        icon={<Notifications />}
        title="Notification"
        onPress={() => handlePress("NotificationSettings")}
      />
      <MenuItem
        icon={<WalletIcon />}
        title="My Wallet"
        onPress={() => handlePress("Wallet")}
      />
      <MenuItem
        icon={<Security />}
        title="Security"
        onPress={() => handlePress("Security")}
      />
      <MenuItem
        icon={<Language />}
        title="Language (EN)"
        onPress={() => handlePress("Language")}
        isHighlighted
      />
      <MenuItem
        icon={<Privacy />}
        title="Privacy Policy"
        onPress={() => handlePress("Privacy Policy")}
      />
      <MenuItem
        icon={<Logout />}
        title="Logout"
        onPress={() => handlePress("Logout")}
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8faff",
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
  },
  icon: {
    fontSize: 16,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    color: '#303030',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontWeight: 'bold'
  },
  iconButton: {},
card: {
  backgroundColor: '#fff',
  borderRadius: 15,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 10,
  paddingHorizontal: width * 0.06,
},

});

export default SettingsScreen;
