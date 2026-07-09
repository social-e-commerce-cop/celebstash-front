import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useWallet, WalletTransaction, TransactionType, TransactionStatus } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TYPE_FILTERS: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Top Up', value: 'top_up' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Refund', value: 'refund' },
  { label: 'Promo', value: 'promo' },
];

const STATUS_FILTERS: { label: string; value: TransactionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

const txnConfig = (type: TransactionType) => {
  switch (type) {
    case 'top_up':
      return { icon: 'arrow-down-circle' as const, color: '#16A34A', sign: '+' };
    case 'purchase':
      return { icon: 'cart' as const, color: '#DC2626', sign: '-' };
    case 'refund':
      return { icon: 'refresh-circle' as const, color: '#2563EB', sign: '+' };
    case 'promo':
      return { icon: 'gift' as const, color: '#D97706', sign: '+' };
    default:
      return { icon: 'ellipse' as const, color: '#6B7280', sign: '' };
  }
};

const TYPE_LABELS: Record<TransactionType, string> = {
  top_up: 'Top Up',
  purchase: 'Purchase',
  refund: 'Refund',
  promo: 'Promo',
};

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
    subtitle = `${isOutgoing ? 'Sent by you' : 'Received by you'} â€¢ ${txn.date}`;
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

const TxnRow: React.FC<{ txn: WalletTransaction; onPress: () => void }> = ({ txn, onPress }) => {
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

// â”€â”€â”€ Main Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TransactionHistory: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { transactions } = useWallet();

  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      const matchType = typeFilter === 'all' || txn.type === typeFilter;
      const matchStatus = statusFilter === 'all' || txn.status === statusFilter;
      const matchSearch = !searchQuery || txn.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [transactions, typeFilter, statusFilter, searchQuery]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity onPress={() => setShowSearch((v) => !v)} style={styles.searchBtn}>
          <Ionicons name={showSearch ? 'close' : 'search'} size={22} color={PURPLE} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactionsâ€¦"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}

      {/* Type filter chips */}
      <FlatList
        horizontal
        data={TYPE_FILTERS}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterChip, typeFilter === item.value && styles.filterChipActive]}
            onPress={() => setTypeFilter(item.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, typeFilter === item.value && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Status filter chips */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              styles.filterChipSmall,
              statusFilter === item.value && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(item.value)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterChipText,
              styles.filterChipTextSmall,
              statusFilter === item.value && styles.filterChipTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </Text>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
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
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  searchBtn: { padding: 4 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    margin: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },

  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 6,
  },
  filterChipSmall: {
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  filterChipTextSmall: {
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#fff',
  },

  resultsCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  listContent: {
    padding: 12,
    paddingBottom: 40,
  },

  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
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
  txnInfo: { flex: 1, marginRight: 8 },
  txnTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1D1E20',
    marginBottom: 2,
  },
  txnSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#8A8A8A',
  },
  txnRight: { alignItems: 'flex-end', justifyContent: 'center' },
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

  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
});

export default TransactionHistory;
