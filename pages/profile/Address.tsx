import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
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

interface AddressItem {
  id: number;
  label: string;
  details: string;
  isDefault: boolean;
}

const AddressScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  // Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>([
    { id: 1, label: "Home", details: "11243 Thimson Sir, Sheldon Hawaii Street", isDefault: true },
    { id: 2, label: "Office", details: "556 Park Avenue, Manhattan New York", isDefault: false },
    { id: 3, label: "Parents", details: "89 Kampala Road, Central Uganda", isDefault: false },
  ]);

  // Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressLabel, setAddressLabel] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZip, setAddressZip] = useState("");

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleSetDefaultAddress = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, isDefault: addr.id === id }))
    );
    showToast("Default address updated successfully!", "success");
  };

  const handleDeleteAddress = (id: number) => {
    Alert.alert("Delete Address", "Are you sure you want to remove this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          const wasDefault = addresses.find((addr) => addr.id === id)?.isDefault;
          const filtered = addresses.filter((addr) => addr.id !== id);
          if (wasDefault && filtered.length > 0) {
            filtered[0].isDefault = true;
          }
          setAddresses(filtered);
          showToast("Address deleted successfully.", "success");
        },
      },
    ]);
  };

  const handleEditAddressClick = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddressLabel(addr.label);
    const parts = addr.details.split(", ");
    setAddressStreet(parts[0] || "");
    setAddressCity(parts[1] || "");
    setAddressState(parts[2] || "");
    setAddressZip(parts[3] || "");
    setShowAddressForm(true);
  };

  const handleSaveAddress = () => {
    if (!addressLabel || !addressStreet || !addressCity) {
      showToast("Please fill out description, street, and city.", "error");
      return;
    }

    const fullDetails = `${addressStreet}, ${addressCity}${addressState ? ", " + addressState : ""}${addressZip ? ", " + addressZip : ""}`;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (editingAddressId !== null) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddressId
            ? { ...addr, label: addressLabel, details: fullDetails }
            : addr
        )
      );
      showToast("Address updated successfully!", "success");
    } else {
      const newAddr: AddressItem = {
        id: Date.now(),
        label: addressLabel,
        details: fullDetails,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      showToast("New address added successfully!", "success");
    }

    // Reset Form
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressLabel("");
    setAddressStreet("");
    setAddressCity("");
    setAddressState("");
    setAddressZip("");
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
        <Text style={styles.headerTitle}>Shipping Addresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {addresses.map((item) => (
            <View key={item.id} style={styles.addressRow}>
              <View style={styles.addressInfo}>
                <View style={styles.addressTitleRow}>
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  {item.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressDetails}>{item.details}</Text>
              </View>

              <View style={styles.addressActions}>
                {!item.isDefault && (
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => handleSetDefaultAddress(item.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleEditAddressClick(item)}
                >
                  <Ionicons name="pencil-outline" size={18} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleDeleteAddress(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={RED} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add/Edit Address Form Toggle */}
          {showAddressForm ? (
            <View style={styles.addressFormContainer}>
              <Text style={styles.formTitle}>
                {editingAddressId ? "Edit Address" : "Add Shipping Address"}
              </Text>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Label (e.g. Home, Office)</Text>
                <TextInput
                  style={styles.textInput}
                  value={addressLabel}
                  onChangeText={setAddressLabel}
                  placeholder="Home / Office / Friends"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Street Address</Text>
                <TextInput
                  style={styles.textInput}
                  value={addressStreet}
                  onChangeText={setAddressStreet}
                  placeholder="123 Main St, Apt 4B"
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addressCity}
                    onChangeText={setAddressCity}
                    placeholder="City"
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 0.8, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addressState}
                    onChangeText={setAddressState}
                    placeholder="State"
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 0.8 }]}>
                  <Text style={styles.inputLabel}>Zip Code</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addressZip}
                    onChangeText={setAddressZip}
                    placeholder="Zip"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formButtonRow}>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: "#F3F4F6", marginRight: 8 }]}
                  onPress={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                  }}
                >
                  <Text style={[styles.formBtnText, { color: "#374151" }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.formBtn, { backgroundColor: PURPLE }]} onPress={handleSaveAddress}>
                  <Text style={styles.formBtnText}>Save Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addNewAddressBtn}
              onPress={() => {
                setEditingAddressId(null);
                setAddressLabel("");
                setAddressStreet("");
                setAddressCity("");
                setAddressState("");
                setAddressZip("");
                setShowAddressForm(true);
              }}
            >
              <Ionicons name="add" size={20} color="#000" />
              <Text style={styles.addNewAddressText}>Add New Shipping Address</Text>
            </TouchableOpacity>
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
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  addressInfo: {
    flex: 1,
    paddingRight: 10,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#111827",
  },
  defaultBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: "#2E7D32",
    fontSize: 11,
    fontFamily: "Poppins-Bold",
  },
  addressDetails: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#4B5563",
    lineHeight: 18,
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  addNewAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    marginTop: 18,
  },
  addNewAddressText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#374151",
    marginLeft: 6,
  },
  addressFormContainer: {
    marginTop: 18,
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  formTitle: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#374151",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: "#1F2937",
    fontFamily: "Poppins-Regular",
    backgroundColor: "#FAFAFA",
  },
  rowInputs: {
    flexDirection: "row",
  },
  formButtonRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  formBtn: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  formBtnText: {
    color: "#FFF",
    fontFamily: "Poppins-Bold",
    fontSize: 14,
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

export default AddressScreen;
