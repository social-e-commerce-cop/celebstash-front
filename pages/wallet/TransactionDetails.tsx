// screens/TransactionsSearch.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Platform,
  ToastAndroid,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SearchIcon } from "@/assets/icons/Payment";
import TransactionItem from "@/components/ewallet/TransactionItem";
import PromoCodeDetail from "@/components/ewallet/ShippingCard";
import * as Clipboard from "expo-clipboard";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface TransactionReceiptModalProps {
  visible?: boolean;
  onClose?: () => void;
  transactionId?: string;
  amount?: string;
  paymentMethod?: string;
  date?: string;
  time?: string;
  status?: string;
  currency?: string;
}

const TransactionDetails: React.FC<TransactionReceiptModalProps> = ({
  visible = false,
  onClose = () => {},
  transactionId = "KU46545453",
  amount = "100.00",
  paymentMethod = "My E-wallet",
  date = "September 18, 2025",
  time = "08:55 PM",
  status = "Paid",
  currency = "$",
}) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [showSearch, setShowSearch] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyTransactionId = async () => {
    await Clipboard.setStringAsync(transactionId);
    setCopied(true);
    if (Platform.OS === "android") {
      ToastAndroid.show("Transaction ID copied!", ToastAndroid.SHORT);
    }
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>
          Transaction History
        </Text>

        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.iconButton}>
          <SearchIcon />
        </TouchableOpacity>
      </View>

     <View style={{ paddingHorizontal: width * 0.05, marginBottom: 20 }}>
       <Image source={require('@/assets/images/wallet/barcode.png')} style={{ width: width * 0.8, height: height * 0.2 }} />
     </View>

      {/* Transaction Item */}
      <TransactionItem
        image={require("@/assets/images/wallet/transaction1.jpg")}
        title="Kendric’s Jacket on Tour"
        date="May 28, 2024"
        time="08:40 AM"
        amount=""
      />

      {/* Promo Code Detail */}
      <PromoCodeDetail />

      {/* Details */}
      <View style={styles.detailsContainer}>
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
                  <Path
                    d="M20.998 10C20.986 7.825 20.89 6.647 20.121 5.879C19.243 5 17.828 5 15 5H12C9.172 5 7.757 5 6.879 5.879C6 6.757 6 8.172 6 11V16C6 18.828 6 20.243 6.879 21.121C7.757 22 9.172 22 12 22H15C17.828 22 19.243 22 20.121 21.121C21 20.243 21 18.828 21 16V15"
                    stroke="#FF650E"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                  <Path
                    d="M3 10V16C3 16.7956 3.31607 17.5587 3.87868 18.1213C4.44129 18.6839 5.20435 19 6 19M18 5C18 4.20435 17.6839 3.44129 17.1213 2.87868C16.5587 2.31607 15.7956 2 15 2H11C7.229 2 5.343 2 4.172 3.172C3.518 3.825 3.229 4.7 3.102 6"
                    stroke="#FF650E"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>
              {copied && <Text style={styles.copiedText}>Copied!</Text>}
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
    </ScrollView>
  );
};

export default TransactionDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8faff",
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.04,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {},
  detailsContainer: { paddingTop: 10,  },
  details: {
    flexDirection: "column",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: height * 0.015,
    marginBottom: height * 0.08
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
  },
  label: { fontSize: width * 0.04, color: "#303030", fontWeight: "500" },
  value: { fontSize: width * 0.04, color: "#000", fontWeight: "bold", textAlign: "right" },
  transactionIdRow: { flexDirection: "row", alignItems: "center" },
  copyButton: { marginLeft: width * 0.02 },
  copiedText: { marginLeft: 5, color: "#FF650E", fontSize: width * 0.035 },
  statusContainer: {
    backgroundColor: "#FF650E",
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.01,
    borderRadius: width * 0.009,
  },
  statusText: { fontSize: width * 0.04, color: "#fff", fontWeight: "600" },
});