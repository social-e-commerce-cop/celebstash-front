import React, { useState, useRef } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from '@react-navigation/stack';
import TransactionReceiptModal from "./TransactionReceiptModal";

const { width, height } = Dimensions.get("window");

interface PinEntryProps {
  label?: string;
  circleColor?: string;
  fillColor?: string;
  circleSize?: number;
  spacing?: number;
}

const PinEntry: React.FC<PinEntryProps> = ({
  label = "Enter your Pin to confirm the payment",
  circleColor = "#D3D3D3",
  fillColor = "#FF650E",
  circleSize = width * 0.12,
  spacing = width * 0.03,
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [pin, setPin] = useState<string[]>(new Array(4).fill(""));
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const transactionData = {
    transactionId: "KU465453",
    amount: "789.00",
    paymentMethod: "My E-wallet",
    date: "May 23, 2024",
    time: "09:30 AM",
    status: "Paid",
    currency: "$",
  };

  const handlePinChange = (text: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < 3) {
      inputsRef.current[index + 1]?.focus();
    } else if (text && index === 3) {
      // Start loading and show modal after delay
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setModalVisible(true);
      }, 800); // 0.8 second delay
    }

    if (!text && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setPin(new Array(4).fill(""));
    inputsRef.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Enter Your Pin</Text>
        <View style={styles.iconButton} />
      </View>

      {/* Content Below Header */}
      <View style={styles.contentBelowHeader}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <View key={index} style={{ marginHorizontal: spacing / 2 }}>
              <TextInput
                ref={(ref: TextInput | null) => { inputsRef.current[index] = ref; }}
                style={[
                  styles.inputBox,
                  { width: circleSize, height: circleSize, borderColor: circleColor },
                ]}
                value={digit}
                onChangeText={(text) => handlePinChange(text, index)}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry
                autoFocus={index === 0}
              />
              {/* Small orange circle in center when input is filled */}
              {digit ? (
                <View
                  style={{
                    width: circleSize * 0.3,
                    height: circleSize * 0.3,
                    borderRadius: (circleSize * 0.3) / 2,
                    backgroundColor: fillColor,
                    position: "absolute",
                    top: (circleSize - circleSize * 0.3) / 2,
                    left: (circleSize - circleSize * 0.3) / 2,
                  }}
                />
              ) : null}
            </View>
          ))}
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={fillColor} />
            <Text style={{ marginTop: 10, color: "#333" }}>Processing...</Text>
          </View>
        )}
      </View>

      <TransactionReceiptModal
        visible={modalVisible}
        onClose={handleModalClose}
        transactionId={transactionData.transactionId}
        amount={transactionData.amount}
        paymentMethod={transactionData.paymentMethod}
        date={transactionData.date}
        time={transactionData.time}
        status={transactionData.status}
        currency={transactionData.currency}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04,
    backgroundColor: "#fff",
  },
  contentBelowHeader: {
    alignItems: "center",
    marginTop: height * 0.02,
  },
  label: {
    fontSize: width * 0.04,
    color: "#303030",
    marginBottom: height * 0.07,
    textAlign: "center",
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  inputBox: {
    borderRadius: 8,
    backgroundColor: "#F5F5F8",
    textAlign: "center",
    fontSize: width * 0.05,
    color: "#000",
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.07,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {},
  loadingOverlay: {
    position: "absolute",
    top: height / 2 - 40,
    left: width / 2 - 40,
    width: 80,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default PinEntry;
