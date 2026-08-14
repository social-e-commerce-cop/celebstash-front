import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MenuItem from "@/components/Profile/MenuItem";
import {
  Addres,
  Language,
  Logout,
  Notifications,
  Privacy,
  Profile,
  Security,
} from "@/assets/icons/Settings";

const { width, height } = Dimensions.get("window");
const LIGHT_BG = "#F5F8FA";
const PURPLE = "#7126D0";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Legal Modal State
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalTitle, setLegalModalTitle] = useState("");
  const [legalModalText, setLegalModalText] = useState("");

  const handlePress = (item: string) => {
    navigation.navigate(item);
  };

  // Logout Flow
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          console.log("Logged out");
          navigation.reset({
            index: 0,
            routes: [{ name: "OnBoarding" }],
          });
        },
      },
    ]);
  };

  // Open Legal Modals
  const showPrivacyPolicy = () => {
    setLegalModalTitle("Privacy Policy");
    setLegalModalText(
      "Last updated: July 13, 2026\n\n" +
        "We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and share information when you use our social e-commerce platform.\n\n" +
        "1. Information We Collect\n" +
        "We collect information you provide directly, including your name, username, email address, phone number, and delivery addresses. We also track purchases and interactions within the app to personalize your feed.\n\n" +
        "2. How We Use Information\n" +
        "We use your details to fulfill orders, facilitate social interactions (follows, likes, messages), detect fraudulent activity, and notify you of important updates or promotional offers.\n\n" +
        "3. Sharing & Security\n" +
        "We do not sell your personal data. We only share delivery details with shipping carriers to deliver your products. Your data is encrypted and stored securely on our systems."
    );
    setLegalModalVisible(true);
  };

  const showTermsOfService = () => {
    setLegalModalTitle("Terms & Conditions");
    setLegalModalText(
      "Last updated: July 13, 2026\n\n" +
        "Please read these Terms and Conditions carefully before using our application.\n\n" +
        "1. Account Responsibilities\n" +
        "You are responsible for maintaining the confidentiality of your account credentials, including your password. You agree to provide accurate and up-to-date profile and address information.\n\n" +
        "Community Standards\n" +
        "Our social features are designed for positive interaction. We do not tolerate hate speech, spamming, harassment, or fake reviews. Violation of these standards may lead to immediate account suspension.\n\n" +
        "3. Purchases and Returns\n" +
        "All transactions are processed securely. Returns and refunds are subject to our merchant guidelines, which can be viewed per product details."
    );
    setLegalModalVisible(true);
  };

  // Settings Items definition
  const settingsItems = [
    { key: "edit-profile", title: "Edit Profile", icon: <Profile />, action: () => handlePress("EditProfile") },
    { key: "become-artist", title: "Claim Artist Status", icon: <Ionicons name="sparkles-outline" size={22} color={PURPLE} />, action: () => handlePress("BecomeArtist") },
    { key: "admin-artist", title: "Admin: Artist Applications", icon: <Ionicons name="shield-checkmark-outline" size={22} color={PURPLE} />, action: () => handlePress("AdminArtistApplications") },
    { key: "address", title: "Shipping Address", icon: <Addres />, action: () => handlePress("AddressSetting") },
    { key: "notifications", title: "Notifications", icon: <Notifications />, action: () => handlePress("NotificationSettings") },
    { key: "password", title: "Change Password", icon: <Security />, action: () => handlePress("Security") },
    { key: "privacy", title: "Privacy Settings", icon: <Privacy />, action: () => handlePress("Privacy") },
    { key: "language", title: "Language & Region", icon: <Language />, action: () => handlePress("Language") },
    { key: "policy", title: "Privacy Policy", icon: <Privacy />, action: showPrivacyPolicy },
    { key: "terms", title: "Terms & Conditions", icon: <Privacy />, action: showTermsOfService },
    { key: "logout", title: "Logout", icon: <Logout />, action: handleLogout },
  ];

  // Filter items based on search query
  const filteredItems = settingsItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search settings..."
          placeholderTextColor="#8A8A8A"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#8A8A8A" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItem
                key={item.key}
                icon={item.icon}
                title={item.title}
                onPress={item.action}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No settings found matching "{searchQuery}"</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Legal Text Modal Viewer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={legalModalVisible}
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{legalModalTitle}</Text>
              <TouchableOpacity onPress={() => setLegalModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>{legalModalText}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.001,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: "#000",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    marginHorizontal: width * 0.05,
    marginTop: 15,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#1F2937",
  },
  scrollContent: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  card: {},
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#8A8A8A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "75%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#374151",
    lineHeight: 22,
  },
});

export default SettingsScreen;
