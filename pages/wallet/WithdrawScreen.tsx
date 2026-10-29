import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useWallet, withdrawWallet } from '@/lib/walletStore';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

type PayoutMethod = 'MTN' | 'Airtel' | 'Bank';

const WithdrawScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { balance, hasPinSet } = useWallet();

  const [method, setMethod] = useState<PayoutMethod>('MTN');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [bankName, setBankName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [20, 50, 100, 250];

  const handleSelectQuick = (val: number) => {
    setAmount(val.toString());
  };

  const handleSelectAll = () => {
    setAmount(balance.toFixed(2));
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to withdraw.');
      return;
    }
    if (num > balance) {
      Alert.alert('Insufficient Balance', `You only have $${balance.toFixed(2)} available.`);
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Required Info', method === 'Bank' ? 'Please enter your bank account number.' : 'Please enter your Mobile Money phone number.');
      return;
    }
    if (hasPinSet && (!pin || pin.length < 4)) {
      Alert.alert('PIN Required', 'Please enter your 4-digit wallet security PIN.');
      return;
    }

    try {
      setLoading(true);
      const targetDestination = method === 'Bank' ? `${bankName ? bankName + ' - ' : ''}${destination}` : destination;
      await withdrawWallet(num, targetDestination, method, pin || undefined);
      setLoading(false);
      Alert.alert(
        'Withdrawal Initiated',
        `$${num.toFixed(2)} is being transferred to ${method} (${targetDestination}). Funds will arrive shortly.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Withdrawal Failed', err.message || 'Unable to process withdrawal.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cash Out / Withdraw</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceVal}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceSub}>Zero payout fees for Rwandan Mobile Money</Text>
        </View>

        {/* Method Selector */}
        <Text style={styles.sectionLabel}>Select Payout Method</Text>
        <View style={styles.methodRow}>
          {(['MTN', 'Airtel', 'Bank'] as PayoutMethod[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.methodBtn, method === m && styles.methodBtnActive]}
              onPress={() => setMethod(m)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={m === 'Bank' ? 'business' : 'phone-portrait'}
                size={20}
                color={method === m ? '#fff' : '#4B5563'}
              />
              <Text style={[styles.methodText, method === m && styles.methodTextActive]}>
                {m === 'MTN' ? 'MTN MoMo' : m === 'Airtel' ? 'Airtel Money' : 'Bank Wire'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionLabel}>Withdraw Amount (USD)</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.dollarSign}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Quick Amount Chips */}
        <View style={styles.quickRow}>
          {quickAmounts.map((val) => (
            <TouchableOpacity
              key={val}
              style={styles.quickChip}
              onPress={() => handleSelectQuick(val)}
            >
              <Text style={styles.quickText}>${val}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.quickChipAll} onPress={handleSelectAll}>
            <Text style={styles.quickTextAll}>Max</Text>
          </TouchableOpacity>
        </View>

        {/* Destination Details */}
        <Text style={styles.sectionLabel}>
          {method === 'Bank' ? 'Bank Account Number' : `${method} Phone Number`}
        </Text>
        {method === 'Bank' && (
          <TextInput
            style={[styles.textInput, { marginBottom: 10 }]}
            placeholder="Bank Name (e.g. Bank of Kigali, Equity)"
            placeholderTextColor="#9CA3AF"
            value={bankName}
            onChangeText={setBankName}
          />
        )}
        <TextInput
          style={styles.textInput}
          placeholder={method === 'Bank' ? 'IBAN or Account Number' : '+250 7XX XXX XXX'}
          placeholderTextColor="#9CA3AF"
          keyboardType={method === 'Bank' ? 'default' : 'phone-pad'}
          value={destination}
          onChangeText={setDestination}
        />

        {/* PIN Entry if required */}
        {hasPinSet && (
          <>
            <Text style={styles.sectionLabel}>Wallet Security PIN</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
            />
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Confirm Withdrawal</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WithdrawScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  balanceCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  balanceVal: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  balanceSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    marginTop: 14,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  methodBtnActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  methodTextActive: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
  },
  dollarSign: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  quickChipAll: {
    flex: 1,
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickTextAll: {
    fontSize: 13,
    fontWeight: '700',
    color: PURPLE,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 32,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
