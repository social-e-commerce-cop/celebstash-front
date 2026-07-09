// components/TopupSuccessModal.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

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
  transactionId,
  amount,
  paymentMethod,
  status = 'Completed',
  currency = '$',
}) => {
  const navigation = useNavigation<any>();
  const { balance } = useWallet();

  const now = new Date();
  const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleGetReceipt = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial; padding: 30px; color: #1D1E20;">
            <h1 style="color: #7126D0; margin-bottom: 4px;">Top Up Receipt</h1>
            <p style="color: #8A8A8A; margin-top: 0;">ZIKII WALLET</p>
            <hr style="border-color: #EDE9FE; margin: 20px 0;" />
            <table style="width: 100%;">
              <tr><td><strong>Amount Added</strong></td><td style="text-align:right;">${currency}${amount}</td></tr>
              <tr><td><strong>Payment Method</strong></td><td style="text-align:right;">${paymentMethod}</td></tr>
              <tr><td><strong>Transaction ID</strong></td><td style="text-align:right;">${transactionId}</td></tr>
              <tr><td><strong>Status</strong></td><td style="text-align:right;">${status}</td></tr>
              <tr><td><strong>Date</strong></td><td style="text-align:right;">${date}</td></tr>
              <tr><td><strong>Time</strong></td><td style="text-align:right;">${time}</td></tr>
              <tr><td><strong>New Balance</strong></td><td style="text-align:right;">${currency}${balance.toFixed(2)}</td></tr>
            </table>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      await Sharing.shareAsync(uri);
      onClose();
      navigation.navigate('Ewallet');
    } catch (error) {
      console.log('Error generating PDF:', error);
    }
  };

  const handleDone = () => {
    onClose();
    navigation.navigate('Ewallet');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Success Icon */}
            <View style={styles.header}>
              <View style={styles.successIconContainer}>
                <Svg width={80} height={81} viewBox="0 0 80 81" fill="none">
                  <Rect y={0.5} width={80} height={80} rx={40} fill="#1AB900" fillOpacity={0.15} />
                  <Rect x={8} y={8.5} width={64} height={64} rx={32} fill="#4CAF50" />
                  <Path
                    d="M28 40.96L36 48.8L52 32"
                    stroke="white"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </View>

            <Text style={styles.successText}>Wallet Topped Up! 🎉</Text>
            <Text style={styles.amountText}>{currency}{amount}</Text>
            <Text style={styles.subText}>has been added to your wallet</Text>

            {/* New balance chip */}
            <View style={styles.newBalanceChip}>
              <Text style={styles.newBalanceLabel}>New Balance</Text>
              <Text style={styles.newBalanceAmount}>{currency}{balance.toFixed(2)}</Text>
            </View>

            {/* Detail rows */}
            <View style={styles.detailBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Transaction ID</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{transactionId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Paid via</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{paymentMethod}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Date & Time</Text>
                <Text style={styles.detailValue}>{date}, {time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailKey}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{status}</Text>
                </View>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.receiptButton} onPress={handleGetReceipt}>
                <Text style={styles.receiptButtonText}>Get E-Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Back to Wallet</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: width * 0.92,
    padding: width * 0.06,
    paddingVertical: height * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: height * 0.02,
  },
  header: { alignItems: 'center', paddingVertical: height * 0.02 },
  successIconContainer: { marginBottom: height * 0.02 },

  successText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1D1E20',
    textAlign: 'center',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },

  newBalanceChip: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  newBalanceLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8A8A8A',
    marginBottom: 2,
  },
  newBalanceAmount: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },

  detailBox: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailKey: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    maxWidth: '55%',
    textAlign: 'right',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#065F46',
  },

  buttonContainer: { width: '100%', gap: 10 },
  receiptButton: {
    backgroundColor: PURPLE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  receiptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  doneButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default TopupSucessModal;