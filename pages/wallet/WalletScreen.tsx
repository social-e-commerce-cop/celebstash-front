// screens/EwalletScreen.tsx
import { MenuIcon } from '@/assets/icons/Payment';
import Header from '@/components/home/Header';
import React, { useCallback } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import BalanceCard from '@/components/ewallet/BalanceCard';
import TabBar from '@/components/Tabbar';
import { useWallet, WalletTransaction } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const formatAmount = (num: number) => {
  const parts = num.toFixed(2).split('.');
  const main = parseInt(parts[0], 10).toLocaleString();
  return parts[1] === '00' ? `$${main}` : `$${main}.${parts[1]}`;
};

const getTransactionDisplay = (txn: WalletTransaction) => {
  const isOutgoing = txn.direction ? txn.direction === 'up' : txn.type === 'purchase';
  
  let title = txn.senderOrReceiver;
  let subtitle = txn.subtitle;
  
  if (!title) {
    if (txn.type === 'top_up') {
      title = 'Added money to your wallet';
    } else if (txn.type === 'purchase') {
      title = 'Purchased';
    } else if (txn.type === 'refund') {
      title = 'Refunded';
    } else {
      title = txn.description;
    }
  }
  
  if (!subtitle) {
    subtitle = `${isOutgoing ? 'Sent by you' : 'Received by you'} • ${txn.date}`;
  }
  
  return { title, subtitle, isOutgoing };
};

const txnIconConfig = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'top_up':
      return { icon: 'wallet-outline' as const, color: '#16A34A', sign: '+' };
    case 'purchase':
      return { icon: 'cart-outline' as const, color: '#1D1E20', sign: '-' };
    case 'refund':
      return { icon: 'refresh-outline' as const, color: '#2563EB', sign: '+' };
    case 'promo':
      return { icon: 'gift-outline' as const, color: '#D97706', sign: '+' };
    default:
      return { icon: 'receipt-outline' as const, color: '#6B7280', sign: '' };
  }
};

// ─── Inline Transaction Row ────────────────────────────────────────────────────

const TxnRow: React.FC<{ txn: WalletTransaction; onPress: () => void }> = ({
  txn,
  onPress,
}) => {
  const { title, subtitle } = getTransactionDisplay(txn);
  const cfg = txnIconConfig(txn.type);

  return (
    <TouchableOpacity style={styles.txnRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.txnIcon}>
        <Ionicons name={cfg.icon} size={24} color={cfg.color} />
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.txnSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.txnRight}>
        <Text style={[styles.txnAmount, { color: txn.type === 'purchase' ? '#1D1E20' : '#16A34A' }]}>
          {cfg.sign}{formatAmount(txn.amount)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

const EwalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { transactions } = useWallet();
  const recent = transactions.slice(0, 5);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
      <View style={styles.container}>
        {/* Sticky Header — sits above the scrollable list */}
        <View style={styles.header}>
           <Header
          title="My Wallet"
          onRightPress={() => navigation.navigate('ManageCards')}
          RightIcon={<MenuIcon />}
        />
        </View>
        <FlatList
          data={recent}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>Top up your wallet to get started</Text>
            </View>
          }
          ListHeaderComponent={
            <View>
              {/* Balance card */}
              <BalanceCard />

              {/* Quick action buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('TopupWallet')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.primaryBtnText}>Top Up Wallet</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('ManageCards')}
                  activeOpacity={0.85}
                >
                  <Ionicons name="card-outline" size={20} color={PURPLE} />
                  <Text style={styles.secondaryBtnText}>Manage Cards</Text>
                </TouchableOpacity>
              </View>

              {/* Section header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {transactions.length > 5 && (
                  <TouchableOpacity onPress={() => navigation.navigate('TransactionSearch')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TxnRow
              txn={item}
              onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
            />
          )}
        />
      </View>

      <View style={styles.tabBarContainer}>
        <TabBar />
      </View>
    </>
  );
};

export default EwalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  listContent: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.12,
  },
  header: {
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.04,
  },

  // ── Quick actions ──
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PURPLE,
    borderRadius:  8,
    paddingVertical: 10,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: PURPLE,
  },
  secondaryBtnText: {
    color: PURPLE,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },

  // ── Section header ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    color: '#1D1E20',
  },
  seeAll: {
    fontSize: 14,
    color: PURPLE,
    fontFamily: 'Poppins-Medium',
  },

  // ── Transaction row ──
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  txnIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txnInfo: {
    flex: 1,
    marginRight: 8,
  },
  txnTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1D1E20',
    marginBottom: 2,
  },
  txnSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#8A8A8A',
  },
  txnRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  txnAmount: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1D1E20',
    marginBottom: 2,
  },
  txnSecondaryAmount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#8A8A8A',
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#D1D5DB',
  },

  // ── Tab bar ──
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});
