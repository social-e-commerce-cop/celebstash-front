import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Clipboard from 'expo-clipboard';
import { getTransactionById, TransactionType } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const TYPE_LABELS: Record<TransactionType, string> = {
  top_up: 'Wallet Top Up',
  purchase: 'Purchase Payment',
  refund: 'Refund',
  promo: 'Promotional Credit',
};

const TYPE_ICONS: Record<TransactionType, any> = {
  top_up: 'arrow-down-circle',
  purchase: 'cart',
  refund: 'refresh-circle',
  promo: 'gift',
};

const TYPE_COLORS: Record<TransactionType, string> = {
  top_up: '#16A34A',
  purchase: '#DC2626',
  refund: '#2563EB',
  promo: '#D97706',
};

const TransactionDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const transactionId = route.params?.transactionId;

  const [copied, setCopied] = useState(false);

  const txn = getTransactionById(transactionId);

  const copyId = async () => {
    if (!txn) return;
    await Clipboard.setStringAsync(txn.id);
    setCopied(true);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Transaction ID copied!', ToastAndroid.SHORT);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  if (!txn) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={56} color="#D1D5DB" />
        <Text style={styles.notFoundTitle}>Transaction not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCredit = txn.type !== 'purchase';
  const iconColor = TYPE_COLORS[txn.type];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={styles.iconButton} />
      </View>

      {/* Amount hero */}
      <View style={styles.amountHero}>
        <View style={[styles.heroIcon, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={TYPE_ICONS[txn.type]} size={36} color={iconColor} />
        </View>
        <Text style={styles.heroType}>{TYPE_LABELS[txn.type]}</Text>
        <Text style={[styles.heroAmount, { color: isCredit ? '#16A34A' : '#DC2626' }]}>
          {isCredit ? '+' : '-'}${txn.amount.toFixed(2)}
        </Text>
        <Text style={styles.heroDate}>{txn.date} at {txn.time}</Text>

        {/* Status badge */}
        <View style={[
          styles.statusBadge,
          {
            backgroundColor:
              txn.status === 'completed' ? '#D1FAE5'
              : txn.status === 'pending' ? '#FEF3C7'
              : '#FEE2E2',
          },
        ]}>
          <Ionicons
            name={
              txn.status === 'completed' ? 'checkmark-circle'
              : txn.status === 'pending' ? 'time'
              : 'close-circle'
            }
            size={14}
            color={
              txn.status === 'completed' ? '#065F46'
              : txn.status === 'pending' ? '#92400E'
              : '#991B1B'
            }
          />
          <Text style={[
            styles.statusText,
            {
              color:
                txn.status === 'completed' ? '#065F46'
                : txn.status === 'pending' ? '#92400E'
                : '#991B1B',
            },
          ]}>
            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Detail card */}
      <View style={styles.detailCard}>
        {/* Transaction ID */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID</Text>
          <TouchableOpacity style={styles.idRow} onPress={copyId} activeOpacity={0.7}>
            <Text style={styles.detailValue} numberOfLines={1}>{txn.id}</Text>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? '#16A34A' : PURPLE}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
        {copied && <Text style={styles.copiedHint}>Copied!</Text>}

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{TYPE_LABELS[txn.type]}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={[styles.detailValue, { color: isCredit ? '#16A34A' : '#DC2626' }]}>
            {isCredit ? '+' : '-'}${txn.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{txn.date}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{txn.time}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={styles.detailValue}>{txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}</Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Description</Text>
          <Text style={[styles.detailValue, { maxWidth: '60%', textAlign: 'right' }]} numberOfLines={3}>
            {txn.description}
          </Text>
        </View>

        {txn.orderId && (
          <>
            <View style={styles.separator} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>{txn.orderId}</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: height * 0.05,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconButton: { width: width * 0.06 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },

  // â”€â”€ Amount hero â”€â”€
  amountHero: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroType: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 40,
    fontFamily: 'Poppins-Bold',
    marginBottom: 6,
  },
  heroDate: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },

  // â”€â”€ Detail card â”€â”€
  detailCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
  },
  copiedHint: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#16A34A',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 4,
  },

  // â”€â”€ Not found â”€â”€
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F5F8FA',
  },
  notFoundTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
  },
  backBtn: {
    backgroundColor: PURPLE,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backBtnText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
});

export default TransactionDetails;