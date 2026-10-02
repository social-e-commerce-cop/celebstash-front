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
import { useWallet, transferWallet } from '@/lib/walletStore';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

const TransferScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { balance, hasPinSet } = useWallet();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [5, 10, 25, 50];

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (!recipient.trim()) {
      Alert.alert('Recipient Required', 'Please enter the @username or email of the recipient.');
      return;
    }
    if (!amount || isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }
    if (num > balance) {
      Alert.alert('Insufficient Balance', `You only have $${balance.toFixed(2)} available.`);
      return;
    }
    if (hasPinSet && (!pin || pin.length < 4)) {
      Alert.alert('PIN Required', 'Please enter your 4-digit wallet security PIN.');
      return;
    }

    try {
      setLoading(true);
      await transferWallet(num, recipient.trim(), note.trim() || undefined, pin || undefined);
      setLoading(false);
      Alert.alert(
        'Transfer Successful',
        `$${num.toFixed(2)} was successfully sent to ${recipient.trim().startsWith('@') ? recipient.trim() : '@' + recipient.trim()}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Transfer Failed', err.message || 'Unable to complete transfer.');
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
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceVal}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceSub}>Instant transfer to any CelebStash fan or artist</Text>
        </View>

        {/* Recipient Input */}
        <Text style={styles.sectionLabel}>Recipient (@Username or Email)</Text>
        <View style={styles.recipientWrapper}>
          <Ionicons name="at" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.recipientInput}
            placeholder="e.g. theartist or fan@example.com"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            value={recipient}
            onChangeText={setRecipient}
          />
        </View>

        {/* Amount Input */}
        <Text style={styles.sectionLabel}>Transfer Amount (USD)</Text>
        <View style={styles.amountWrapper}>
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
              onPress={() => setAmount(val.toString())}
            >
              <Text style={styles.quickText}>${val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note / Memo */}
        <Text style={styles.sectionLabel}>Note or Memo (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Tip for great concert / For your birthday"
          placeholderTextColor="#9CA3AF"
          value={note}
          onChangeText={setNote}
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
              <Ionicons name="paper-plane-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Send Money Now</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TransferScreen;

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
    backgroundColor: '#312E81',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    color: '#C7D2FE',
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
    color: '#A5B4FC',
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
  recipientWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
  },
  recipientInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  amountWrapper: {
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
    gap: 10,
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
