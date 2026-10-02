// screens/EwalletScreen.tsx
import { MenuIcon } from '@/assets/icons/Payment';
import Header from '@/components/home/Header';
import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import BalanceCard from '@/components/ewallet/BalanceCard';
import TabBar from '@/components/Tabbar';
import { useWallet, WalletTransaction, refreshWallet } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const formatAmount = (num: number) => {
  const parts = num.toFixed(2).split('.');
  const main = parseInt(parts[0], 10).toLocaleString();
  return parts[1] === '00' ? `$${main}` : `$${main}.${parts[1]}`;
};

const getTransactionDisplay = (txn: WalletTransaction) => {
  const isOutgoing = txn.direction ? txn.direction === 'up' : txn.type === 'purchase' || txn.type === 'withdrawal' || txn.type === 'transfer_out';

  let title = txn.senderOrReceiver;
  let subtitle = txn.subtitle;

  if (!title) {
    if (txn.type === 'top_up') {
      title = 'Added money to your wallet';
    } else if (txn.type === 'purchase') {
      title = 'Purchase Payment';
    } else if (txn.type === 'refund') {
      title = 'Refund Credited';
    } else if (txn.type === 'withdrawal') {
      title = 'Cash Out / Withdrawal';
    } else if (txn.type === 'transfer_in') {
      title = 'Transfer Received';
    } else if (txn.type === 'transfer_out') {
      title = 'Transfer Sent';
    } else {
      title = txn.description;
    }
  }

  if (!subtitle) {
    subtitle = `${isOutgoing ? 'Debited' : 'Credited'} • ${txn.date}`;
  }

  return { title, subtitle, isOutgoing };
};

const txnIconConfig = (type: WalletTransaction['type']) => {
  switch (type) {
    case 'top_up':
      return { icon: 'arrow-down-circle' as const, color: '#16A34A', sign: '+' };
    case 'purchase':
      return { icon: 'cart-outline' as const, color: '#DC2626', sign: '-' };
    case 'refund':
      return { icon: 'refresh-circle' as const, color: '#2563EB', sign: '+' };
    case 'promo':
      return { icon: 'gift-outline' as const, color: '#D97706', sign: '+' };
    case 'withdrawal':
      return { icon: 'arrow-up-circle' as const, color: '#EA580C', sign: '-' };
    case 'transfer_in':
      return { icon: 'arrow-down-circle' as const, color: '#10B981', sign: '+' };
    case 'transfer_out':
      return { icon: 'arrow-up-circle' as const, color: '#8B5CF6', sign: '-' };
    default:
      return { icon: 'receipt-outline' as const, color: '#6B7280', sign: '' };
  }
};

// ─── Inline Transaction Row ────────────────────────────────────────────────────

interface TxnRowProps {
  txn: WalletTransaction;
  onPress: () => void;
}

const TxnRow: React.FC<TxnRowProps> = ({ txn, onPress }) => {
  const { title, subtitle, isOutgoing } = getTransactionDisplay(txn);
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
        <Text style={[styles.txnAmount, { color: isOutgoing ? '#DC2626' : '#16A34A' }]}>
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
  const [refreshing, setRefreshing] = useState(false);
  const recent = transactions.slice(0, 5);

  useFocusEffect(
    useCallback(() => {
      refreshWallet();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  };

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[PURPLE]} />
          }
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

              {/* 4-Item Action Bar */}
              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('TopupWallet')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#7126D0' }]}>
                    <Ionicons name="add" size={22} color="#fff" />
                  </View>
                  <Text style={styles.actionText}>Top Up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('WithdrawWallet')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#EA580C' }]}>
                    <Ionicons name="arrow-up" size={20} color="#fff" />
                  </View>
                  <Text style={styles.actionText}>Cash Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('TransferWallet')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#2563EB' }]}>
                    <Ionicons name="paper-plane" size={18} color="#fff" />
                  </View>
                  <Text style={styles.actionText}>Send</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => navigation.navigate('ManageCards')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: '#4F46E5' }]}>
                    <Ionicons name="card" size={19} color="#fff" />
                  </View>
                  <Text style={styles.actionText}>Cards</Text>
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

  // ── Quick actions grid ──
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
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
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
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
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1D1E20',
    marginBottom: 2,
  },
  txnSubtitle: {
    fontSize: 13,
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
    marginBottom: 2,
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
