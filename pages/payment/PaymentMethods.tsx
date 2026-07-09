import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PaymentMethodItem from '@/components/payment/PaymentMethodItem';
import PaymentMethodCard from '@/components/payment/PaymentMethodCard';
import MainButton from '@/components/buttons/Mainbutton';
import { AppleIcon, GoogleIcon, MasterCardIcon, PayPalIcon, VisaIcon } from '@/assets/icons/Payment';
import { useWallet } from '@/lib/walletStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

type MoMoProvider = 'MTN MoMo' | 'Airtel Money';

const MOMO_CONFIG: Record<MoMoProvider, { color: string; bg: string; selectedBg: string; emoji: string; hint: string }> = {
  'MTN MoMo': {
    color: '#B45309',
    bg: '#FFCC00',
    selectedBg: '#FFFBEB',
    emoji: 'âš¡',
    hint: 'MTN Rwanda numbers start with 078 or 079',
  },
  'Airtel Money': {
    color: '#B91C1C',
    bg: '#E11900',
    selectedBg: '#FFF5F5',
    emoji: 'ðŸ”´',
    hint: 'Airtel Rwanda numbers start with 072 or 073',
  },
};

const PaymentMethods = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  const { balance } = useWallet();

  const total: number = route.params?.total ?? 0;
  const isMusic = route.params?.isMusic ?? false;
  const musicItem = route.params?.musicItem;

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode] = useState('+250');
  const [phoneError, setPhoneError] = useState('');

  const hasSufficientFunds = balance >= total;

  const handleSelect = (name: string) => {
    if (name === 'My Wallet' && !hasSufficientFunds) {
      Alert.alert(
        'Insufficient Wallet Balance',
        `Your wallet balance ($${balance.toFixed(2)}) is less than the order total ($${total.toFixed(2)}).\n\nYou need $${(total - balance).toFixed(2)} more. Would you like to top up?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Top Up Wallet', onPress: () => navigation.navigate('TopupWallet') },
        ]
      );
      return;
    }
    // Reset phone input when switching methods
    if (!['MTN MoMo', 'Airtel Money'].includes(name)) {
      setPhoneNumber('');
      setPhoneError('');
    }
    setSelectedMethod(name);
  };

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    setPhoneNumber(digits);
    if (digits.length >= 7) setPhoneError('');
  };

  const handleConfirmation = () => {
    if (!selectedMethod) {
      Alert.alert('No Payment Method', 'Please select a payment method to continue.');
      return;
    }

    const isMoMo = ['MTN MoMo', 'Airtel Money'].includes(selectedMethod);
    if (isMoMo) {
      if (!phoneNumber || phoneNumber.length < 7) {
        setPhoneError('Please enter a valid Mobile Money number.');
        return;
      }
    }

    navigation.navigate('PinEntry', {
      total,
      isMusic,
      musicItem,
      paymentMethod: isMoMo
        ? `${selectedMethod} (${countryCode} ${phoneNumber})`
        : selectedMethod,
    });
  };

  const cardMethods = [
    { name: 'Visa (**** **** *** *567)', icon: <VisaIcon /> },
    { name: 'Mastercard (**** **** **** *123)', icon: <MasterCardIcon /> },
    { name: 'Paypal', icon: <PayPalIcon /> },
    { name: 'Google Pay', icon: <GoogleIcon /> },
    { name: 'Apple Pay', icon: <AppleIcon /> },
  ];

  const momoMethods: MoMoProvider[] = ['MTN MoMo', 'Airtel Money'];
  const isMoMoSelected = momoMethods.includes(selectedMethod as MoMoProvider);
  const activeMoMo = isMoMoSelected ? MOMO_CONFIG[selectedMethod as MoMoProvider] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.05 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Select the payment method you want to use</Text>

        {/* â”€â”€ Wallet â”€â”€ */}
        <PaymentMethodItem
          name="My Wallet"
          amount={`$${balance.toFixed(2)}`}
          selected={selectedMethod === 'My Wallet'}
          onPress={() => handleSelect('My Wallet')}
        />

        {!hasSufficientFunds && (
          <View style={styles.insufficientBanner}>
            <Ionicons name="warning-outline" size={16} color="#92400E" />
            <Text style={styles.insufficientText}>
              Wallet balance (${balance.toFixed(2)}) is insufficient for this order (${total.toFixed(2)}).
            </Text>
            <TouchableOpacity style={styles.topUpShortcut} onPress={() => navigation.navigate('TopupWallet')}>
              <Text style={styles.topUpShortcutText}>Top Up</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* â”€â”€ Cards & Digital Wallets â”€â”€ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>Cards & Digital Wallets</Text>
          <View style={styles.sectionLine} />
        </View>

        {cardMethods.map((method) => (
          <PaymentMethodCard
            key={method.name}
            name={method.name}
            icon={method.icon}
            selected={selectedMethod === method.name}
            onPress={() => handleSelect(method.name)}
          />
        ))}

        {/* â”€â”€ Mobile Money â”€â”€ */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>Mobile Money</Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.momoRow}>
          {momoMethods.map((provider) => {
            const cfg = MOMO_CONFIG[provider];
            const isActive = selectedMethod === provider;
            return (
              <TouchableOpacity
                key={provider}
                style={[
                  styles.momoCard,
                  isActive && { borderColor: cfg.bg, backgroundColor: cfg.selectedBg },
                ]}
                onPress={() => handleSelect(provider)}
                activeOpacity={0.8}
              >
                <Text style={[styles.momoName, isActive && { color: cfg.color }]}>
                  {provider}
                </Text>

                {/* Selected checkmark */}
                {isActive && (
                  <View style={[styles.momoCheckBadge, { backgroundColor: cfg.bg }]}>
                    <Ionicons name="checkmark" size={10} color={provider === 'MTN MoMo' ? '#000' : '#fff'} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* â”€â”€ MoMo Phone Input (shown when MTN or Airtel selected) â”€â”€ */}
        {isMoMoSelected && activeMoMo && (
          <View style={[styles.momoInputPanel, { borderColor: activeMoMo.bg + '60', backgroundColor: activeMoMo.selectedBg }]}>
            {/* Panel header */}
            <View style={styles.momoInputHeader}>
              <View style={[styles.momoInputIconBg, { backgroundColor: activeMoMo.bg }]}>
                <Text style={styles.momoInputEmoji}>{activeMoMo.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.momoInputTitle, { color: activeMoMo.color }]}>
                  {selectedMethod} Number
                </Text>
                <Text style={styles.momoInputHint}>{activeMoMo.hint}</Text>
              </View>
            </View>

            {/* Phone input row */}
            <View style={[
              styles.phoneInputContainer,
              { borderColor: phoneError ? '#DC2626' : activeMoMo.bg },
            ]}>
              <View style={[styles.countryCodeBox, { backgroundColor: activeMoMo.bg + '30' }]}>
                <Text style={[styles.countryCodeText, { color: activeMoMo.color }]}>
                  {countryCode}
                </Text>
              </View>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="788 000 000"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={12}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
              />
              {phoneNumber.length >= 7 && (
                <View style={styles.phoneValidIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                </View>
              )}
            </View>

            {/* Inline error */}
            {!!phoneError && (
              <View style={styles.phoneErrorRow}>
                <Ionicons name="warning-outline" size={13} color="#DC2626" />
                <Text style={styles.phoneErrorText}>{phoneError}</Text>
              </View>
            )}

            {/* Summary preview */}
            {phoneNumber.length >= 7 && (
              <View style={styles.momoSummaryRow}>
                <Ionicons name="information-circle-outline" size={14} color={activeMoMo.color} />
                <Text style={[styles.momoSummaryText, { color: activeMoMo.color }]}>
                  Payment of{' '}
                  <Text style={{ fontFamily: 'Poppins-Bold' }}>${total.toFixed(2)}</Text>
                  {' '}will be charged to{' '}
                  <Text style={{ fontFamily: 'Poppins-Bold' }}>{countryCode} {phoneNumber}</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        <MainButton
          label="Confirm Payment"
          onPress={handleConfirmation}
          buttonStyle={{ marginTop: 24, justifyContent: 'center', borderRadius: 5, paddingVertical: 10 }}
          labelStyle={{ fontFamily: 'Poppins-Bold', fontSize: 16 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04,
    backgroundColor: '#f5f8faff',
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },
  headerTitle: {
    color: '#000',
    fontFamily: 'Poppins-Bold',
    fontSize: width * 0.045,
  },
  label: {
    fontSize: 16,
    color: '#303030',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: 'Poppins-Bold',
  },
  iconButton: {},

  // â”€â”€ Section divider â”€â”€
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    marginTop: 4,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // â”€â”€ Insufficient balance â”€â”€
  insufficientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  insufficientText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#78350F',
    lineHeight: 17,
  },
  topUpShortcut: {
    backgroundColor: PURPLE,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  topUpShortcutText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-Bold' },

  // â”€â”€ Mobile Money cards row â”€â”€
  momoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  momoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  momoLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoEmoji: { fontSize: 20 },
  momoName: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  momoCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // â”€â”€ MoMo phone input panel â”€â”€
  momoInputPanel: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  momoInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  momoInputIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoInputEmoji: { fontSize: 18 },
  momoInputTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  momoInputHint: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    lineHeight: 15,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    height: 52,
    overflow: 'hidden',
  },
  countryCodeBox: {
    paddingHorizontal: 14,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCodeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  phoneTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
  phoneValidIcon: {
    paddingRight: 12,
  },
  phoneErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneErrorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
  },
  momoSummaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    padding: 10,
  },
  momoSummaryText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 17,
  },
});

export default PaymentMethods;
