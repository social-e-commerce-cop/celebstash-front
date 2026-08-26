import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import TopupSucessModal from '@/components/ewallet/TopupSucessModal';
import { topUpWallet } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const BRAND_LABELS: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  amex: 'AMEX',
  unknown: 'Card',
};

const TopupConfirmation: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();

  const amount = route.params?.amount ?? '0.00';
  const paymentMethodType = route.params?.paymentMethodType ?? 'card'; // 'card' or 'momo'

  // Card parameters
  const cardLast4 = route.params?.cardLast4 ?? '****';
  const cardBrand = route.params?.cardBrand ?? 'visa';
  const cardHolder = route.params?.cardHolder ?? '';
  const maskedNumber = route.params?.maskedNumber ?? '**** **** **** ****';

  // MoMo parameters
  const momoProvider = route.params?.momoProvider ?? 'MTN';
  const phoneNumber = route.params?.phoneNumber ?? '';

  // CVV state (for card)
  const [cvv, setCvv] = useState('');
  const [cvvError, setCvvError] = useState('');

  // PIN state (for momo)
  const [pin, setPin] = useState<string[]>(new Array(5).fill(''));
  const pinInputsRef = useRef<(TextInput | null)[]>([]);
  const [pinError, setPinError] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const isAmex = cardBrand === 'amex';
  const cvvLength = isAmex ? 4 : 3;

  const handleConfirmCard = () => {
    if (submitted) return;

    if (!cvv || cvv.length < cvvLength) {
      setCvvError(`Please enter your ${cvvLength}-digit CVV.`);
      return;
    }

    processTopUp(`Card ending in ${cardLast4}`);
  };

  const handlePinChange = (text: string, index: number) => {
    const cleanDigit = text.replace(/[^0-9]/g, '');
    const newPin = [...pin];
    newPin[index] = cleanDigit;
    setPin(newPin);
    setPinError('');

    if (cleanDigit && index < 4) {
      pinInputsRef.current[index + 1]?.focus();
    } else if (cleanDigit && index === 4) {
      // Auto submit MoMo topup when 5th digit entered
      const fullPin = newPin.join('');
      if (fullPin.length === 5) {
        processTopUp(`${momoProvider} MoMo (${phoneNumber})`);
      }
    }

    if (!cleanDigit && index > 0) {
      pinInputsRef.current[index - 1]?.focus();
    }
  };

  const processTopUp = (methodDescription: string) => {
    setSubmitted(true);
    setLoading(true);
    setLoadingText('Verifying provider...');

    setTimeout(() => {
      setLoadingText('Authorizing transfer...');
      setTimeout(() => {
        setLoadingText('Crediting wallet...');
        setTimeout(() => {
          const txn = topUpWallet(parseFloat(amount), `Wallet top-up via ${methodDescription}`, cardLast4);
          setTransactionId(txn.id);
          setLoading(false);
          setModalVisible(true);
        }, 800);
      }, 1000);
    }, 1000);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.navigate('Ewallet');
  };

  const isMoMo = paymentMethodType === 'momo';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Top Up</Text>
          <View style={styles.iconButton} />
        </View>

        {/* Summary card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Amount to Top Up</Text>
          <Text style={styles.summaryAmount}>${amount}</Text>
          <View style={styles.divider} />

          {isMoMo ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Payment Method</Text>
                <Text style={styles.summaryValue}>{momoProvider} Mobile Money</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Phone Number</Text>
                <Text style={styles.summaryValue}>{phoneNumber}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Card</Text>
                <Text style={styles.summaryValue}>
                  {BRAND_LABELS[cardBrand]} {maskedNumber}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Cardholder</Text>
                <Text style={styles.summaryValue}>{cardHolder}</Text>
              </View>
            </>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Destination</Text>
            <Text style={styles.summaryValue}>ZIKII WALLET</Text>
          </View>
        </View>

        {/* Dynamic Confirmation Inputs */}
        {isMoMo ? (
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.sectionLabel}>Enter MoMo PIN</Text>
            <Text style={styles.hintLabel}>Enter your 5-digit PIN to authorize the payment</Text>

            <View style={styles.pinContainer}>
              {pin.map((digit, index) => (
                <View key={index} style={{ marginHorizontal: 6, position: 'relative' }}>
                  <TextInput
                    ref={(ref: TextInput | null) => {
                      pinInputsRef.current[index] = ref;
                    }}
                    style={styles.pinInputBox}
                    value={digit}
                    onChangeText={(text) => handlePinChange(text, index)}
                    maxLength={1}
                    keyboardType="numeric"
                    secureTextEntry
                    autoFocus={index === 0}
                  />
                  {digit ? <View style={styles.pinFilledDot} /> : null}
                </View>
              ))}
            </View>

            {!!pinError && <Text style={styles.errorTextCentered}>{pinError}</Text>}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionLabel}>Enter CVV to Confirm</Text>
            <Text style={styles.hintLabel}>
              The {cvvLength}-digit security code on the back of your card.
            </Text>

            <View style={[styles.cvvContainer, !!cvvError && styles.cvvContainerError]}>
              {/* <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 8 }} /> */}
              <TextInput
                style={styles.cvvInput}
                value={cvv}
                onChangeText={(t) => {
                  setCvv(t.replace(/[^0-9]/g, ''));
                  setCvvError('');
                }}
                keyboardType="numeric"
                maxLength={cvvLength}
                secureTextEntry
                placeholder={isAmex ? '1234' : '123'}
                placeholderTextColor="#CCC"
                autoFocus
              />
              <Text style={styles.cvvLengthHint}>{cvv.length}/{cvvLength}</Text>
            </View>

            {!!cvvError && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{cvvError}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.secureNote}>
          {/* <Ionicons name="shield-checkmark-outline" size={14} color="#16A34A" /> */}
          <Text style={styles.secureNoteText}>
            {isMoMo
              ? 'Your PIN is encrypted and sent securely to your provider.'
              : 'Your CVV is used for verification only and is never stored.'}
          </Text>
        </View>

        {/* Confirm button (Only shown for Card, since MoMo auto-submits on 4th PIN digit) */}
        {!isMoMo && (
          <TouchableOpacity
            style={[styles.confirmBtn, (cvv.length < cvvLength || submitted) && styles.confirmBtnDisabled]}
            onPress={handleConfirmCard}
            disabled={cvv.length < cvvLength || submitted}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.confirmBtnText}>{loadingText}</Text>
              </View>
            ) : (
              <Text style={styles.confirmBtnText}>
                {submitted ? 'Processing…' : `Confirm & Add $${amount}`}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Loading Overlay (For MoMo auto-submit loading state) */}
        {isMoMo && loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        )}
      </ScrollView>

      <TopupSucessModal
        visible={modalVisible}
        onClose={handleModalClose}
        transactionId={transactionId}
        amount={amount}
        paymentMethod={
          isMoMo ? `${momoProvider} MoMo (${phoneNumber})` : `${BRAND_LABELS[cardBrand]} ${maskedNumber}`
        }
        status="Completed"
        currency="$"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
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
  iconButton: { width: width * 0.06 },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },

  // ── Summary card ──
  summaryCard: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 28,
    borderColor: '#F4F4F4',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryKey: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1A1A1A',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // ── CVV / PIN ──
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  hintLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 16,
    height: 45,
  },
  cvvContainerError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  cvvInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    letterSpacing: 8,
  },
  cvvLengthHint: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
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
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
  },
  errorTextCentered: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
    marginTop: 8,
    textAlign: 'center',
  },

  // ── PIN Inputs ──
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  pinInputBox: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  pinFilledDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PURPLE,
    position: 'absolute',
    top: 16.5,
    left: 16.5,
  },

  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 28,
  },
  secureNoteText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#475569',
    flex: 1,
  },

  // ── Confirm button ──
  confirmBtn: {
    height: 45,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // ── MoMo Loading Overlay ──
  loadingContainer: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
});

export default TopupConfirmation;
