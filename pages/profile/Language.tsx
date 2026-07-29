import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get("window");
const PURPLE = "#7126D0";
const LIGHT_BG = "#F5F8FA";

interface SelectionItem {
  id: string;
  flag?: string;
  label: string;
}

const LANGUAGES: SelectionItem[] = [
  { id: "en-US", flag: "🇺🇸", label: "English (US)" },
  { id: "en-GB", flag: "🇬🇧", label: "English (UK)" },
  { id: "fr", flag: "🇫🇷", label: "French" },
  { id: "de", flag: "🇩🇪", label: "German" },
  { id: "it", flag: "🇮🇹", label: "Italian" },
  { id: "ko", flag: "🇰🇷", label: "Korean" },
  { id: "no", flag: "🇳🇴", label: "Norwegian" },
  { id: "es", flag: "🇪🇸", label: "Spanish" },
  { id: "lg", flag: "🇺🇬", label: "Luganda" },
  { id: "sw", flag: "🇰🇪", label: "Kiswahili" },
  { id: "rw", flag: "🇷🇼", label: "Kinyarwanda" },
];

const CURRENCIES: SelectionItem[] = [
  { id: "USD", flag: "💵", label: "USD ($) - US Dollar" },
  { id: "EUR", flag: "💶", label: "EUR (€) - Euro" },
  { id: "GBP", flag: "💷", label: "GBP (£) - British Pound" },
  { id: "UGX", flag: "🇺🇬", label: "UGX (USh) - Ugandan Shilling" },
  { id: "KES", flag: "🇰🇪", label: "KES (KSh) - Kenyan Shilling" },
  { id: "RWF", flag: "🇷🇼", label: "RWF (FRw) - Rwandan Franc" },
  { id: "KRW", flag: "🇰🇷", label: "KRW (₩) - Korean Won" },
];

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Active Tab State: 'language' | 'currency'
  const [activeTab, setActiveTab] = useState<"language" | "currency">("language");

  // Selection States
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const handleSelect = (item: SelectionItem) => {
    if (activeTab === "language") {
      setSelectedLanguage(item.id);
      showToast(`Language set to ${item.label}.`, "success");
    } else {
      setSelectedCurrency(item.id);
      showToast(`Currency set to ${item.id}.`, "success");
    }
  };

  // Get current list based on Tab
  const getActiveList = () => {
    if (activeTab === "language") return LANGUAGES;
    return CURRENCIES;
  };

  // Check if item is selected
  const isSelected = (id: string) => {
    if (activeTab === "language") return selectedLanguage === id;
    return selectedCurrency === id;
  };

  // Filter items by search query
  const filteredList = getActiveList().filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const switchTab = (tab: typeof activeTab) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Custom Toast */}
      {toast && (
        <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
          <Ionicons
            name={toast.type === "success" ? "checkmark-circle" : "alert-circle"}
            size={22}
            color={toast.type === "success" ? "#16A34A" : "#E63636"}
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language & Region</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs Control */}
      <View style={styles.tabContainer}>
        {(["language", "currency"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => switchTab(tab)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={20} color="#8A8A8A" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor="#8A8A8A"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color="#8A8A8A" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search List Results */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {filteredList.length > 0 ? (
            filteredList.map((item) => {
              const selected = isSelected(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.listItem, selected && styles.listItemSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.listItemLeft}>
                    {item.flag && <Text style={styles.flagIcon}>{item.flag}</Text>}
                    <Text style={[styles.listItemLabel, selected && styles.listItemLabelSelected]}>
                      {item.label}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    paddingTop: height * 0.04,
    paddingBottom: height * 0.015,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: "#000",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabButtonActive: {
    borderBottomColor: PURPLE,
  },
  tabButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#8A8A8A",
  },
  tabButtonTextActive: {
    color: PURPLE,
    fontFamily: "Poppins-Bold",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: width * 0.05,
    marginTop: 15,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
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
    paddingVertical: 15,
    paddingHorizontal: width * 0.05,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  listItemSelected: {
    backgroundColor: "#F9FAFB",
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  listItemLabel: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#374151",
  },
  listItemLabelSelected: {
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
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
  toast: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.05,
    right: width * 0.05,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 999,
    borderLeftWidth: 4,
  },
  toastSuccess: {
    borderLeftColor: "#16A34A",
  },
  toastError: {
    borderLeftColor: "#E63636",
  },
  toastText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#1F2937",
    flex: 1,
  },
});

export default LanguageScreen;
