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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

const { width, height } = Dimensions.get("window");
const PURPLE = "#7126D0";
const LIGHT_BG = "#F5F8FA";

const SecurityScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
      if (type === "success") {
        navigation.goBack();
      }
    }, 2000);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    showToast("Password updated successfully!", "success");
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
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <TextInput
              style={styles.textInput}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.textInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.textInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword}>
          <Text style={styles.saveBtnText}>Update Password</Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#374151",
    marginBottom: 6,
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
  saveBtn: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: "#FFF",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
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

export default SecurityScreen;
