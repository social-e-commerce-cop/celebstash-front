import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  Alert,
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
const RED = "#E63636";
const LIGHT_BG = "#F5F8FA";

const PrivacyScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Privacy State
  const [privateProfile, setPrivateProfile] = useState(false);
  const [messagePermission, setMessagePermission] = useState<"everyone" | "followers" | "none">("followers");
  const [followPermission, setFollowPermission] = useState<"everyone" | "approved">("everyone");
  const [blockedUsers, setBlockedUsers] = useState<string[]>(["@spammer_boy", "@annoying_troll"]);
  const [newBlockUsername, setNewBlockUsername] = useState("");

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  // Block/Unblock Actions
  const handleBlockUser = () => {
    const cleanUsername = newBlockUsername.trim();
    if (!cleanUsername) return;
    const formatted = cleanUsername.startsWith("@") ? cleanUsername : `@${cleanUsername}`;
    if (blockedUsers.includes(formatted)) {
      showToast("User is already blocked.", "error");
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBlockedUsers((prev) => [...prev, formatted]);
    setNewBlockUsername("");
    showToast(`${formatted} blocked successfully.`, "success");
  };

  const handleUnblockUser = (user: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBlockedUsers((prev) => prev.filter((u) => u !== user));
    showToast(`${user} unblocked.`, "success");
  };

  const handleTogglePrivateProfile = (val: boolean) => {
    setPrivateProfile(val);
    showToast(`Profile visibility set to ${val ? "Private" : "Public"}.`, "success");
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
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Private Profile Toggle */}
          <View style={[styles.switchRow, { borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingBottom: 16 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Private Profile</Text>
              <Text style={styles.switchSubLabel}>Only approved accounts can see your updates</Text>
            </View>
            <Switch
              value={privateProfile}
              onValueChange={handleTogglePrivateProfile}
              trackColor={{ true: PURPLE, false: "#D9D9D9" }}
              thumbColor="#FFF"
            />
          </View>

          {/* Message Permissions Choice */}
          <View style={styles.optionSection}>
            <Text style={styles.optionSectionTitle}>Who can message you</Text>
            <View style={styles.chipRow}>
              {(["everyone", "followers", "none"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chipBtn,
                    messagePermission === opt && styles.chipBtnSelected,
                  ]}
                  onPress={() => {
                    setMessagePermission(opt);
                    showToast("Messaging permission updated.", "success");
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      messagePermission === opt && styles.chipTextSelected,
                    ]}
                  >
                    {opt === "everyone"
                      ? "Everyone"
                      : opt === "followers"
                      ? "Followers"
                      : "No one"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Follow Permissions Choice */}
          <View style={styles.optionSection}>
            <Text style={styles.optionSectionTitle}>Who can follow you</Text>
            <View style={styles.chipRow}>
              {(["everyone", "approved"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.chipBtn,
                    followPermission === opt && styles.chipBtnSelected,
                  ]}
                  onPress={() => {
                    setFollowPermission(opt);
                    showToast("Following permission updated.", "success");
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      followPermission === opt && styles.chipTextSelected,
                    ]}
                  >
                    {opt === "everyone" ? "Everyone" : "Requires approval"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Blocked Users Sub-Section */}
          <Text style={styles.subSectionTitle}>Blocked Users</Text>

          {blockedUsers.length > 0 ? (
            <View style={styles.blockedList}>
              {blockedUsers.map((user) => (
                <View key={user} style={styles.blockedRow}>
                  <Text style={styles.blockedUsername}>{user}</Text>
                  <TouchableOpacity style={styles.unblockBtn} onPress={() => handleUnblockUser(user)}>
                    <Text style={styles.unblockText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No blocked users</Text>
          )}

          <View style={styles.addBlockContainer}>
            <TextInput
              style={[styles.textInput, { flex: 1, marginRight: 8, height: 42 }]}
              value={newBlockUsername}
              onChangeText={setNewBlockUsername}
              placeholder="@username"
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.blockBtn} onPress={handleBlockUser}>
              <Text style={styles.blockBtnText}>Block</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: {
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  switchLabel: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#1F2937",
  },
  switchSubLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginTop: 2,
  },
  optionSection: {
    marginTop: 18,
  },
  optionSectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    marginBottom: 8,
  },
  chipBtnSelected: {
    backgroundColor: PURPLE,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#4B5563",
  },
  chipTextSelected: {
    color: "#FFF",
    fontFamily: "Poppins-Bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },
  subSectionTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    marginBottom: 14,
  },
  blockedList: {
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  blockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  blockedUsername: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#374151",
  },
  unblockBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#FEF2F2",
  },
  unblockText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: RED,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#8A8A8A",
    fontStyle: "italic",
    marginBottom: 10,
  },
  addBlockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Poppins-Regular",
    backgroundColor: "#FAFAFA",
  },
  blockBtn: {
    height: 42,
    backgroundColor: "#1F2937",
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  blockBtnText: {
    color: "#FFF",
    fontFamily: "Poppins-Bold",
    fontSize: 13,
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

export default PrivacyScreen;
