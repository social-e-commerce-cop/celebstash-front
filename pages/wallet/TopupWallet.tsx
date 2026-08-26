import CardSelector from '@/components/ewallet/CardSelector';
import { SavedCard, getDefaultCard, useCards } from '@/lib/cardStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 10000;
const SUGGESTIONS = [10, 20, 50, 100, 200, 500];

type PaymentType = 'card' | 'momo';
type MoMoProvider = 'MTN' | 'Airtel';

const TopUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const cards = useCards();
  const [amount, setAmount] = useState('');
  const defaultCard = getDefaultCard();
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(defaultCard ?? null);
  const [paymentType, setPaymentType] = useState<PaymentType>('card');
  const [momoProvider, setMomoProvider] = useState<MoMoProvider>('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+250');
  const [amountError, setAmountError] = useState('');

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    setAmount(numericValue);
    setAmountError('');
  };

  const handleSelectSuggestion = (val: number) => {
    setAmount(val.toString());
    setAmountError('');
  };

  const validate = (): boolean => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num)) {
      setAmountError('Please enter a valid amount.');
      return false;
    }
    if (num < MIN_AMOUNT) {
      setAmountError(`Minimum top-up amount is $${MIN_AMOUNT}.`);
      return false;
    }
    if (num > MAX_AMOUNT) {
      setAmountError(`Maximum top-up amount is $${MAX_AMOUNT.toLocaleString()}.`);
      return false;
    }
    if (paymentType === 'card' && !selectedCard) {
      Alert.alert('No Card Selected', 'Please select or add a payment card.');
      return false;
    }
    if (paymentType === 'momo' && (!phoneNumber || phoneNumber.length < 7)) {
      Alert.alert('Invalid Number', 'Please enter a valid Mobile Money phone number.');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validate()) return;

    if (paymentType === 'card') {
      navigation.navigate('TopupConfirmation', {
        amount: parseFloat(amount).toFixed(2),
        paymentMethodType: 'card',
        cardId: selectedCard!.id,
        cardLast4: selectedCard!.last4,
        cardBrand: selectedCard!.brand,
        cardHolder: selectedCard!.holderName,
        maskedNumber: selectedCard!.maskedNumber,
      });
    } else {
      navigation.navigate('TopupConfirmation', {
        amount: parseFloat(amount).toFixed(2),
        paymentMethodType: 'momo',
        momoProvider,
        phoneNumber: `${countryCode} ${phoneNumber}`,
      });
    }
  };

  const isFormValid =
    !!amount &&
    parseFloat(amount) >= MIN_AMOUNT &&
    (paymentType === 'card' ? !!selectedCard : phoneNumber.length >= 7);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Up Wallet</Text>
          <View style={{ width: width * 0.06 }} />
        </View>

        {/* Amount section */}
        <Text style={styles.sectionLabel}>Enter Top Up Amount</Text>

        {/* Premium Amount Card */}
        <View style={[styles.amountContainer, amountError ? styles.amountContainerError : {}]}>
          <View style={styles.amountInner}>
            <Text style={styles.currencyPrefix}>USD</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#C9D0DA"
                returnKeyType="done"
              />
            </View>
            {!!amount && (
              <Text style={styles.amountSubtext}>≈ {parseFloat(amount || '0').toLocaleString('en-US', { style: 'currency', currency: 'USD' })} will be credited</Text>
            )}
          </View>
        </View>

        {!!amountError && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={14} color="#DC2626" />
            <Text style={styles.errorText}>{amountError}</Text>
          </View>
        )}

        {/* Suggestion chips */}
        <View style={styles.suggestionsWrapper}>
          {SUGGESTIONS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.suggestionChip,
                amount === val.toString() && styles.suggestionChipActive,
              ]}
              onPress={() => handleSelectSuggestion(val)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionChipCurrency}>
                {amount === val.toString() ? '$' : '$'}
              </Text>
              <Text
                style={[
                  styles.suggestionAmount,
                  amount === val.toString() && styles.suggestionAmountActive,
                ]}
              >
                {val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Min/max info */}
        <Text style={styles.limitHint}>Min $1 · Max $10,000</Text>

        {/* Payment Method Tabs */}
        <Text style={styles.sectionLabel}>Select Payment Type</Text>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, paymentType === 'card' && styles.tabButtonActive]}
            onPress={() => setPaymentType('card')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="card"
              size={18}
              color={paymentType === 'card' ? '#fff' : '#6B7280'}
            />
            <Text style={[styles.tabButtonText, paymentType === 'card' && styles.tabButtonTextActive]}>
              Bank Card
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, paymentType === 'momo' && styles.tabButtonActive]}
            onPress={() => setPaymentType('momo')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={paymentType === 'momo' ? '#fff' : '#6B7280'}
            />
            <Text style={[styles.tabButtonText, paymentType === 'momo' && styles.tabButtonTextActive]}>
              Mobile Money
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Payment Method Forms */}
        {paymentType === 'card' ? (
          <View style={styles.methodContainer}>
            <Text style={styles.subLabel}>Choose Saved Card</Text>
            <CardSelector
              selectedCardId={selectedCard?.id ?? null}
              onSelectCard={setSelectedCard}
              onAddNew={() => navigation.navigate('AddCard', { returnTo: 'TopupWallet' })}
            />
          </View>
        ) : (
          <View style={styles.methodContainer}>
            <Text style={styles.subLabel}>Select Mobile Money Provider</Text>
            <View style={styles.providersRow}>
              <TouchableOpacity
                style={[
                  styles.providerCard,
                  momoProvider === 'MTN' && styles.providerCardActiveMTN,
                ]}
                onPress={() => setMomoProvider('MTN')}
                activeOpacity={0.8}
              >
                <Text style={styles.providerLabel}>MTN MoMo</Text>
                {momoProvider === 'MTN' && (
                  <View style={[styles.checkBadge, { backgroundColor: '#FFCC00' }]}>
                    <Ionicons name="checkmark" size={10} color="#000" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.providerCard,
                  momoProvider === 'Airtel' && styles.providerCardActiveAirtel,
                ]}
                onPress={() => setMomoProvider('Airtel')}
                activeOpacity={0.8}
              >
                <Text style={styles.providerLabel}>Airtel Money</Text>
                {momoProvider === 'Airtel' && (
                  <View style={[styles.checkBadge, { backgroundColor: '#E11900' }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.subLabel}>Mobile Number</Text>
            <View style={styles.phoneInputContainer}>
              <TouchableOpacity style={styles.countryCodeSelector} activeOpacity={0.7}>
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <Ionicons name="chevron-down" size={10} color="#666" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="788 000 000"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={12}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
              />
            </View>
          </View>
        )}

        {/* Summary Info */}
        {isFormValid && (
          <View style={styles.summaryBox}>
            <Ionicons name="information-circle-outline" size={18} color={PURPLE} style={{ marginRight: 8 }} />
            <Text style={styles.summaryText}>
              {paymentType === 'card' ? (
                <>
                  <Text style={{ fontWeight: 'bold' }}>${parseFloat(amount).toFixed(2)}</Text> will be added to your wallet from{' '}
                  <Text style={{ fontWeight: 'bold' }}>{selectedCard!.maskedNumber}</Text>.
                </>
              ) : (
                <>
                  Authorize transfer of <Text style={{ fontWeight: 'bold' }}>${parseFloat(amount).toFixed(2)}</Text> from your{' '}
                  <Text style={{ fontWeight: 'bold' }}>{momoProvider} Money</Text> account ({countryCode} {phoneNumber}) to wallet balance.
                </>
              )}
            </Text>
          </View>
        )}

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!isFormValid}
          activeOpacity={0.85}
        >
          <Text style={[styles.submitButtonText, isFormValid && { color: '#fff' }]}>
            Continue to Confirm
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.06,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1A1A1A',
    marginTop: 20,
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#4B5563',
    marginTop: 14,
    marginBottom: 8,
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAECF0',
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: '#7126D0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 4,
  },
  amountContainerError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  amountInner: {
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  currencyPrefix: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  currencySymbol: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
    marginTop: 8,
    marginRight: 2,
  },
  amountInput: {
    fontSize: 56,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    minWidth: 80,
    padding: 0,
    lineHeight: 68,
  },
  amountSubtext: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginTop: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
  },
  suggestionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    gap: 1,
  },
  suggestionChipActive: {
    backgroundColor: '#1D1E20',
    borderColor: '#1D1E20',
  },
  suggestionChipCurrency: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  suggestionAmount: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  suggestionAmountActive: {
    color: '#fff',
  },
  limitHint: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },

  // ── Tabs Row ──
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: PURPLE,
  },
  tabButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  methodContainer: {
    marginTop: 6,
    marginBottom: 14,
  },

  // ── MoMo Providers Row ──
  providersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  providerCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#F2F4F7',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  providerCardActiveMTN: {
    borderColor: '#FFCC00',
    backgroundColor: '#FFFDEB',
  },
  providerCardActiveAirtel: {
    borderColor: '#E11900',
    backgroundColor: '#FFF5F5',
  },
  providerLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Phone Input ──
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 48,
    overflow: 'hidden',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1.5,
    borderRightColor: '#E5E7EB',
    height: '100%',
  },
  countryCodeText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  phoneTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },

  summaryBox: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    lineHeight: 18,
  },
  submitButton: {
    height: 45,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
  },
});

export default TopUpScreen;
