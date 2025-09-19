// components/TopupSucessModal.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface TopupSucessModalProps {
  visible: boolean;
  onClose: () => void;
  transactionId: string;
  amount: string;
  paymentMethod: string;
  status?: string;
  currency?: string;
}

const TopupSucessModal: React.FC<TopupSucessModalProps> = ({
  visible,
  onClose,
  amount,
  paymentMethod,
  currency = "$",
}) => {

  const navigation = useNavigation<any>();

  // Current date and time
  const date = "September 18, 2025";
  const time = "10:36 PM";

  const handleGetReceipt = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1 style="color: #FF650E;">Top Up Receipt</h1>
            <p><strong>Amount:</strong> ${currency}${amount}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Date:</strong> ${date} | ${time}</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      await Sharing.shareAsync(uri);
      onClose();
      navigation.navigate("Ewallet");
    } catch (error) {
      console.log("Error generating PDF:", error);
    }
  };

  const handleCancel = () => {
    onClose();
    navigation.navigate("Ewallet");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Success Icon */}
            <View style={styles.header}>
              <View style={styles.successIconContainer}>
                <Svg width={80} height={81} viewBox="0 0 80 81" fill="none">
                  <Rect y={0.5} width={80} height={80} rx={40} fill="#1AB900" fillOpacity={0.2} />
                  <Rect x={8} y={8.5} width={64} height={64} rx={32} fill="#4CAF50" />
                  <Path d="M28 40.96L36 48.8L52 32" stroke="white" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>

            {/* Success Messages */}
            <Text style={styles.successText}>Top-up successfully</Text>
            <Text style={styles.subText}>You have successfully topped up</Text>

            {/* Buttons in Column */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.getReceiptButton} onPress={handleGetReceipt}>
                <Text style={styles.getReceiptButtonText}>Get E-receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { 
    backgroundColor: "#fff", 
    borderRadius: width * 0.04, 
    margin: width * 0.02, 
    width: width * 0.93, 
    padding: width * 0.05,
    paddingVertical: height * 0.05,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 5,
  },
  scrollContent: { alignItems: "center", paddingBottom: height * 0.03 },
  header: { alignItems: "center", paddingVertical: height * 0.02 },
  successIconContainer: { marginBottom: height * 0.02 },
  successText: { 
    fontSize: width * 0.045, 
    fontWeight: "bold", 
    color: "#1D1E20", 
    textAlign: "center", 
    marginBottom: height * 0.01 
  },
  subText: { 
    fontSize: width * 0.04, 
    color: "#303030", 
    textAlign: "center", 
    marginBottom: height * 0.03 
  },
  buttonContainer: { 
    flexDirection: "column", 
    width: "100%", 
    alignItems: "center" 
  },
  getReceiptButton: { 
    backgroundColor: "#FF650E", 
    paddingVertical: height * 0.02, 
    borderRadius: width * 0.02, 
    width: "100%", 
    marginBottom: height * 0.015, 
    alignItems: "center" 
  },
  getReceiptButtonText: { color: "#fff", fontSize: width * 0.04, fontWeight: "600" },
  cancelButton: { 
    backgroundColor: "#8F959E57", 
    paddingVertical: height * 0.02, 
    borderRadius: width * 0.02, 
    width: "100%", 
    alignItems: "center" 
  },
  cancelButtonText: { color: "#000", fontSize: width * 0.04, fontWeight: "bold" },
});

export default TopupSucessModal;