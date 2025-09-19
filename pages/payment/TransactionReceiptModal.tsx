import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView, Platform, ToastAndroid } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface TransactionReceiptModalProps {
  visible: boolean;
  onClose: () => void;
  transactionId: string;
  amount: string;
  paymentMethod: string;
  date: string;
  time: string;
  status?: string;
  currency?: string;
}

const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  visible,
  onClose,
  transactionId,
  amount,
  paymentMethod,
  date,
  time,
  status = "Paid",
  currency = "$",
}) => {
  const [copied, setCopied] = useState(false);
  const navigation = useNavigation<any>();

  const handleGetReceipt = async () => {
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1 style="color: #FF650E;">Transaction Receipt</h1>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Amount:</strong> ${currency}${amount}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Date:</strong> ${date} | ${time}</p>
            <p><strong>Status:</strong> ${status}</p>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });

      // Share or save the PDF
      await Sharing.shareAsync(uri);


      // Close modal and navigate to Home
      onClose();
      navigation.navigate("Home");
    } catch (error) {
      console.log("Error generating PDF:", error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const copyTransactionId = async () => {
    await Clipboard.setStringAsync(transactionId);
    setCopied(true);
    if (Platform.OS === "android") {
      ToastAndroid.show("Transaction ID copied!", ToastAndroid.SHORT);
    }
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.successIconContainer}>
                <Svg width={100} height={101} viewBox="0 0 100 101" fill="none">
                  <Rect y={0.5} width={100} height={100} rx={50} fill="#1AB900" fillOpacity={0.2} />
                  <Rect x={10} y={10.5} width={80} height={80} rx={40} fill="#4CAF50" />
                  <Path d="M35 51.2L45 61L65 40" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.totalDetailRow}>
                <Text style={styles.label}>Total</Text>
                <Text style={styles.value}>{currency}{amount}</Text>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Payment Method</Text>
                  <Text style={styles.value}>{paymentMethod}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{date} | {time}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Transaction ID</Text>
                  <View style={styles.transactionIdRow}>
                    <Text style={styles.value}>{transactionId}</Text>
                    <TouchableOpacity onPress={copyTransactionId} style={styles.copyButton}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M20.998 10C20.986 7.825 20.89 6.647 20.121 5.879C19.243 5 17.828 5 15 5H12C9.172 5 7.757 5 6.879 5.879C6 6.757 6 8.172 6 11V16C6 18.828 6 20.243 6.879 21.121C7.757 22 9.172 22 12 22H15C17.828 22 19.243 22 20.121 21.121C21 20.243 21 18.828 21 16V15" stroke="#FF650E" strokeWidth={1.5} strokeLinecap="round"/>
                        <Path d="M3 10V16C3 16.7956 3.31607 17.5587 3.87868 18.1213C4.44129 18.6839 5.20435 19 6 19M18 5C18 4.20435 17.6839 3.44129 17.1213 2.87868C16.5587 2.31607 15.7956 2 15 2H11C7.229 2 5.343 2 4.172 3.172C3.518 3.825 3.229 4.7 3.102 6" stroke="#FF650E" strokeWidth={1.5} strokeLinecap="round"/>
                      </Svg>
                    </TouchableOpacity>
                    {copied && <Text style={{ marginLeft: 5, color: "#FF650E" }}>Copied!</Text>}
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>{status}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Buttons */}
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
  modalContainer: { backgroundColor: "#f5f8faff", borderRadius: width * 0.04, margin: width * 0.02, maxHeight: height * 0.85, width: width * 0.9, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  header: { alignItems: "center", paddingVertical: height * 0.03, paddingHorizontal: width * 0.04 },
  successIconContainer: { marginBottom: height * 0 },
  detailsContainer: { padding: width * 0.04 },
  totalDetailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: height * 0.03, paddingHorizontal: width * 0.05, backgroundColor: '#fff', borderRadius: 5, marginBottom: height * 0.02 },
  details: { flexDirection: "column", backgroundColor: '#fff', borderRadius: 5, paddingVertical: height * 0.015 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: height * 0.015, paddingHorizontal: width * 0.05 },
  label: { fontSize: width * 0.04, color: "#303030", fontWeight: "500" },
  value: { fontSize: width * 0.04, color: "#000", fontWeight: "bold", textAlign: "right" },
  transactionIdRow: { flexDirection: "row", alignItems: "center" },
  copyButton: { marginLeft: width * 0.02 },
  statusContainer: { backgroundColor: "#FF650E", paddingHorizontal: width * 0.07, paddingVertical: height * 0.01, borderRadius: width * 0.009 },
  statusText: { fontSize: width * 0.04, color: "#fff", fontWeight: "600" },
  buttonContainer: { padding: width * 0.04, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  getReceiptButton: { backgroundColor: "#FF650E", paddingVertical: height * 0.02, borderRadius: width * 0.02, marginBottom: height * 0.015, alignItems: "center" },
  getReceiptButtonText: { color: "#fff", fontSize: width * 0.04, fontWeight: "600" },
  cancelButton: { backgroundColor: "#8F959E57", paddingVertical: height * 0.02, borderRadius: width * 0.02, alignItems: "center" },
  cancelButtonText: { color: "#000", fontSize: width * 0.04, fontWeight: "bold" },
});

export default TransactionReceiptModal;
