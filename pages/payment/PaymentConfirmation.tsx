import React, { useState } from "react";
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import TransactionReceiptModal from "./TransactionReceiptModal";

const { width, height } = Dimensions.get("window");
const PURPLE = "#7126D0";

const KEYS = [
  ["1","2","3"],
  ["4","5","6"],
  ["7","8","9"],
  ["del","0","ok"],
];

const PinEntry: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [pin, setPin] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const transactionData = {
    transactionId: "KU465453",
    amount: "789.00",
    paymentMethod: "My E-wallet",
    date: "May 23, 2024",
    time: "09:30 AM",
    status: "Paid",
    currency: "$",
  };

  const handleKey = (key: string) => {
    if (key === "del") {
      setPin(p => p.slice(0, -1));
    } else if (key === "ok") {
      if (pin.length === 4) submit();
    } else {
      if (pin.length < 4) {
        const next = [...pin, key];
        setPin(next);
        if (next.length === 4) setTimeout(submit, 180);
      }
    }
  };

  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setModalVisible(true); }, 900);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setPin([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter PIN</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={28} color={PURPLE} />
        </View>
        <Text style={styles.title}>Confirm payment</Text>
        <Text style={styles.label}>Enter your 4-digit PIN to{"\n"}confirm the payment</Text>

        {/* PIN dots */}
        <View style={styles.pinRow}>
          {[0,1,2,3].map(i => (
            <View key={i} style={[styles.dot, i < pin.length ? styles.dotFilled : styles.dotEmpty]} />
          ))}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map(key => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.key,
                    key === "ok" && styles.keyOk,
                    key === "del" && styles.keyDel,
                  ]}
                  onPress={() => handleKey(key)}
                  activeOpacity={0.7}
                >
                  {key === "del" ? (
                    <Ionicons name="backspace-outline" size={22} color="#555" />
                  ) : key === "ok" ? (
                    <Ionicons name="checkmark" size={22} color="#fff" />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Processing…</Text>
        </View>
      )}

      <TransactionReceiptModal
        visible={modalVisible}
        onClose={handleModalClose}
        {...transactionData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingTop: height * 0.05, paddingBottom: 14,
  },
  backBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Poppins-Bold", color: "#111" },

  content: {
    flex: 1, alignItems: "center",
    paddingTop: height * 0.05, paddingHorizontal: 24,
  },

  iconCircle: {
    width: 60, height: 60, borderRadius: 34,
    backgroundColor: "#F5EEFF",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  title: { fontSize: 20, fontFamily: "Poppins-Bold", color: "#111", marginBottom: 6 },
  label: {
    fontSize: 16, fontFamily: "Poppins-Regular", color: "#888",
    textAlign: "center", lineHeight: 22, marginBottom: 32,
  },

  pinRow: { flexDirection: "row", gap: 20, marginBottom: 36 },
  dot: { width: 20, height: 20, borderRadius: 12 },
  dotEmpty: { borderWidth: 2, borderColor: "#CCC", backgroundColor: "transparent" },
  dotFilled: { backgroundColor: PURPLE },

  keypad: { width: "100%", maxWidth: 250, gap: 10 },
  keyRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  key: {
    flex: 1, height: 50, borderRadius: 5,
    backgroundColor: "#F4F4F6",
    alignItems: "center", justifyContent: "center",
  },
  keyOk: { backgroundColor: PURPLE },
  keyDel: { backgroundColor: "#F4F4F6" },
  keyText: { fontSize: 22, fontFamily: "Poppins-Medium", color: "#111" },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  loadingText: { fontSize: 15, fontFamily: "Poppins-Medium", color: "#555" },
});

export default PinEntry;