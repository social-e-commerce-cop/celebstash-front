import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addPaymentMethod } from '@/lib/paymentStore';
import { MTNLogo, AirtelLogo } from '@/components/ewallet/CardAssets';

const { width, height } = Dimensions.get('window');

type ActiveTab = 'paypal' | 'card' | 'momo';

const AddWalletScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('card');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // PayPal Form State
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  // MoMo Form State
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [momoPhone, setMomoPhone] = useState('');

  // Format Card Number (adds spaces every 4 digits)
  const formatCardNumber = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const formatted = cleanText.match(/.{1,4}/g)?.join(' ') || cleanText;
    setCardNumber(formatted.slice(0, 19));
  };

  // Format Expiry Date (adds slash after 2 digits)
  const formatExpiry = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (cleanText.length >= 2) {
      setExpiry(`${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`);
    } else {
      setExpiry(cleanText);
    }
  };

  // Detect card type based on number
  const getCardType = () => {
    if (cardNumber.startsWith('4')) return 'visa';
    if (cardNumber.startsWith('5')) return 'mastercard';
    return 'visa'; // Default fallback
  };

  const handleLinkCard = () => {
    if (!cardNumber || cardNumber.length < 15 || !cardName || !expiry || expiry.length < 5 || !cvv || cvv.length < 3) {
      alert('Please fill out all card details correctly.');
      return;
    }

    setLoadingText('Connecting to card issuer...');
    setLoading(true);

    setTimeout(() => {
      setLoadingText('Processing 3D Secure verification...');
      setTimeout(() => {
        const masked = `**** **** **** *${cardNumber.slice(-4)}`;
        const type = getCardType();
        addPaymentMethod({
          name: type === 'visa' ? 'Visa' : 'Mastercard',
          type: 'card',
          detail: masked,
          provider: type
        });
        setLoading(false);
        navigation.goBack();
      }, 1200);
    }, 1000);
  };

  const handleLinkPayPal = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paypalEmail) || !paypalPassword || paypalPassword.length < 4) {
      alert('Please enter a valid PayPal email and password.');
      return;
    }

    setLoadingText('Logging into PayPal secure portal...');
    setLoading(true);

    setTimeout(() => {
      setLoadingText('Retrieving authorization token...');
      setTimeout(() => {
        addPaymentMethod({
          name: 'PayPal',
          type: 'paypal',
          detail: paypalEmail,
          provider: 'paypal'
        });
        setLoading(false);
        navigation.goBack();
      }, 1200);
    }, 1000);
  };

  const handleLinkMoMo = () => {
    if (!momoPhone || momoPhone.length < 7) {
      alert('Please enter a valid Mobile Money number.');
      return;
    }

    setLoadingText(`Contacting ${momoProvider === 'mtn' ? 'MTN' : 'Airtel'} server...`);
    setLoading(true);

    setTimeout(() => {
      setLoadingText('Sending SMS verification pin...');
      setTimeout(() => {
        addPaymentMethod({
          name: momoProvider === 'mtn' ? 'MTN MoMo' : 'Airtel Money',
          type: 'momo',
          detail: `+250 ${momoPhone}`,
          provider: momoProvider
        });
        setLoading(false);
        navigation.goBack();
      }, 1200);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'card' && styles.activeTab]}
          onPress={() => setActiveTab('card')}
        >
          <Ionicons name="card-outline" size={18} color={activeTab === 'card' ? '#7126D0' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'card' && styles.activeTabText]}>Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'paypal' && styles.activeTab]}
          onPress={() => setActiveTab('paypal')}
        >
          <Ionicons name="logo-paypal" size={18} color={activeTab === 'paypal' ? '#7126D0' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'paypal' && styles.activeTabText]}>PayPal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'momo' && styles.activeTab]}
          onPress={() => setActiveTab('momo')}
        >
          <Ionicons name="phone-portrait-outline" size={18} color={activeTab === 'momo' ? '#7126D0' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'momo' && styles.activeTabText]}>MoMo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* CARD FLOW */}
        {activeTab === 'card' && (
          <View style={styles.formContainer}>
            {/* Live Interactive Mock Credit Card */}
            <View style={[
              styles.creditCardMock,
              { backgroundColor: getCardType() === 'visa' ? '#1D2A44' : '#8A1538' }
            ]}>
              <View style={styles.cardHeaderRow}>
                <Ionicons name="hardware-chip-sharp" size={32} color="#F3E5AB" />
                <Text style={styles.cardTypeLabel}>
                  {getCardType() === 'visa' ? 'VISA' : 'MASTERCARD'}
                </Text>
              </View>

              <Text style={styles.mockCardNumber}>
                {cardNumber || 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢'}
              </Text>

              <View style={styles.cardFooterRow}>
                <View>
                  <Text style={styles.mockLabel}>CARDHOLDER</Text>
                  <Text style={styles.mockValue}>{cardName.toUpperCase() || 'YOUR NAME'}</Text>
                </View>
                <View>
                  <Text style={styles.mockLabel}>EXPIRES</Text>
                  <Text style={styles.mockValue}>{expiry || 'MM/YY'}</Text>
                </View>
              </View>
            </View>

            {/* Input Form */}
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Kenny K Shot"
              placeholderTextColor="#999"
              value={cardName}
              onChangeText={setCardName}
            />

            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="4000 1234 5678 9010"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={19}
              value={cardNumber}
              onChangeText={formatCardNumber}
            />

            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="MM/YY"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={formatExpiry}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/[^0-9]/g, ''))}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.actionBtn} onPress={handleLinkCard} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>Link Card Securely</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAYPAL FLOW */}
        {activeTab === 'paypal' && (
          <View style={styles.formContainer}>
            <View style={styles.paypalHeaderLogo}>
              <Text style={styles.paypalTitleText}>Pay<Text style={{ color: '#0079C1' }}>Pal</Text></Text>
              <Text style={styles.paypalSubtitleText}>Link your account for seamless top-ups</Text>
            </View>

            <Text style={styles.inputLabel}>PayPal Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="username@paypal.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={paypalEmail}
              onChangeText={setPaypalEmail}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              placeholderTextColor="#999"
              secureTextEntry
              value={paypalPassword}
              onChangeText={setPaypalPassword}
            />

            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#0070BA' }]} onPress={handleLinkPayPal} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>Agree & Link PayPal Account</Text>
            </TouchableOpacity>
            <Text style={styles.disclaimer}>
              By linking, you authorize CelebStash to request authorization tokens from PayPal on your behalf.
            </Text>
          </View>
        )}

        {/* MOBILE MONEY FLOW */}
        {activeTab === 'momo' && (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Select MoMo Provider</Text>
            <View style={styles.momoProvidersRow}>
              <TouchableOpacity
                style={[
                  styles.momoCard,
                  momoProvider === 'mtn' && { borderColor: '#FFCC00', backgroundColor: '#FFF9E6', borderWidth: 2 }
                ]}
                onPress={() => setMomoProvider('mtn')}
              >
                <MTNLogo size={52} />
                <Text style={styles.momoName}>MTN MoMo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.momoCard,
                  momoProvider === 'airtel' && { borderColor: '#E11900', backgroundColor: '#FFEBEA', borderWidth: 2 }
                ]}
                onPress={() => setMomoProvider('airtel')}
              >
                <AirtelLogo size={52} />
                <Text style={styles.momoName}>Airtel Money</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Mobile Money Number</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.countryCodeText}>+250</Text>
              </View>
              <TextInput
                style={[styles.textInput, { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
                placeholder="78X XXX XXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                value={momoPhone}
                onChangeText={(text) => setMomoPhone(text.replace(/[^0-9]/g, ''))}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: momoProvider === 'mtn' ? '#FFCC00' : '#E11900' }
              ]}
              onPress={handleLinkMoMo}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.actionBtnText,
                momoProvider === 'mtn' && { color: '#000' }
              ]}>
                Link Mobile Money Wallet
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#7126D0" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: height * 0.08,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  activeTabText: {
    color: '#7126D0',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: height * 0.05,
  },
  formContainer: {
    marginTop: 20,
  },
  creditCardMock: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTypeLabel: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1.5,
  },
  mockCardNumber: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginVertical: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mockLabel: {
    color: '#DDD',
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1,
    marginBottom: 2,
  },
  mockValue: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  actionBtn: {
    backgroundColor: '#7126D0',
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  paypalHeaderLogo: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  paypalTitleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003087',
  },
  paypalSubtitleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  disclaimer: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
  momoProvidersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  momoCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeBadge: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  countryCodeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins-Medium',
  },
});

export default AddWalletScreen;
