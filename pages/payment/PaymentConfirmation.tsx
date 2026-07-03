import React, { useState } from "react";
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, ActivityIndicator,
  Modal, Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import TransactionReceiptModal from "./TransactionReceiptModal";
import { addSongToLibrary } from "@/lib/libraryStore";

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
  const route = useRoute<any>();
  const [pin, setPin] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const params = route.params ?? {};
  const isMusic = (params.isMusic ?? false) || !!params.musicItem;
  const musicItem = params.musicItem ?? null;

  const transactionData = {
    transactionId: "KU" + Math.floor(100000 + Math.random() * 900000),
    amount: params.total ? String(params.total) : "789.00",
    paymentMethod: params.paymentMethod || "My Wallet",
    date: "June 30, 2026",
    time: "12:15 PM",
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
    setTimeout(() => {
      setLoading(false);
      if (isMusic && musicItem) {
        addSongToLibrary(musicItem);
      }
      setModalVisible(true);
    }, 900);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setPin([]);
    navigation.navigate("Home");
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

      {/* Music purchase success modal — only rendered for music */}
      {isMusic && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.musicModalContainer}>
              {/* Close Button top-right */}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("Library");
                }}
              >
                <Ionicons name="close" size={24} color="#7C7C7C" />
              </TouchableOpacity>

              <View style={styles.modalSuccessIcon}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
              </View>
              <Text style={styles.musicModalTitle}>Song Purchased!</Text>
              <Text style={styles.musicModalSub}>
                This song has been successfully added to your library.
              </Text>

              {musicItem && (
                <View style={styles.musicItemBox}>
                  <Image source={musicItem.image} style={styles.musicItemImage} />
                  <View style={styles.musicItemInfo}>
                    <Text style={styles.musicItemTitle} numberOfLines={1}>
                      {musicItem.title}
                    </Text>
                    <Text style={styles.musicItemArtist}>By {musicItem.artist}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.goToLibraryBtn}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate("Library");
                }}
              >
                <Text style={styles.goToLibraryText}>Go to My Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Regular receipt modal — only rendered for non-music purchases */}
      {!isMusic && (
        <TransactionReceiptModal
          visible={modalVisible}
          onClose={handleModalClose}
          {...transactionData}
        />
      )}
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

  // Music success modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  musicModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 24,
    width: width * 0.85,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  modalSuccessIcon: {
    marginBottom: 16,
    marginTop: 10,
  },
  musicModalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  musicModalSub: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  musicItemBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6FF",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EAE2FF",
  },
  musicItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  musicItemInfo: {
    flex: 1,
  },
  musicItemTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  musicItemArtist: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#7C7C7C",
    marginTop: 2,
  },
  goToLibraryBtn: {
    backgroundColor: PURPLE,
    paddingVertical: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  goToLibraryText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },
});

export default PinEntry;