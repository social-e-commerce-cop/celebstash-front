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
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { addCard, validateLuhn, detectCardBrand, CardBrand } from '@/lib/cardStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

const BRAND_COLORS: Record<CardBrand, string> = {
  visa: '#1A1F71',
  mastercard: '#8A1538',
  amex: '#007CC3',
  unknown: '#374151',
};
const BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  amex: 'AMEX',
  unknown: 'CARD',
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const formatCardNumber = (text: string): string => {
  const clean = text.replace(/[^0-9]/g, '');
  const groups = clean.match(/.{1,4}/g) ?? [];
  return groups.join(' ').slice(0, 19);
};

const formatExpiry = (text: string): string => {
  const clean = text.replace(/[^0-9]/g, '');
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
  return clean;
};

const isExpiryValid = (expiry: string): boolean => {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [mm, yy] = expiry.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const expDate = new Date(2000 + yy, mm - 1, 1);
  return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
};

// â”€â”€â”€ Main Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const AddCardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const returnTo = route.params?.returnTo;

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const brand = detectCardBrand(cardNumber.replace(/\s/g, ''));
  const isAmex = brand === 'amex';
  const cvvLength = isAmex ? 4 : 3;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const rawNumber = cardNumber.replace(/\s/g, '');

    if (!cardName.trim()) errs.cardName = 'Cardholder name is required.';
    if (rawNumber.length < 13) {
      errs.cardNumber = 'Card number is too short.';
    } else if (!validateLuhn(rawNumber)) {
      errs.cardNumber = 'Invalid card number (failed Luhn check).';
    }
    if (!isExpiryValid(expiry)) errs.expiry = 'Invalid or expired date.';
    if (cvv.length < cvvLength) errs.cvv = `CVV must be ${cvvLength} digits.`;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      // Save card â€” CVV is discarded here, never stored
      addCard({
        holderName: cardName.trim(),
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiry,
      });
      setLoading(false);

      if (returnTo) {
        navigation.navigate(returnTo);
      } else {
        navigation.goBack();
      }
    }, 1500);
  };

  const cardBg = BRAND_COLORS[brand];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Live card preview */}
        <View style={[styles.cardPreview, { backgroundColor: cardBg }]}>
          <View style={styles.previewCircle} />
          <View style={styles.previewCircle2} />

          <View style={styles.previewTop}>
            <Ionicons name="hardware-chip-sharp" size={30} color="#F3E5AB" />
            <Text style={styles.previewBrand}>{BRAND_LABELS[brand]}</Text>
          </View>

          <Text style={styles.previewNumber}>
            {cardNumber || 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢'}
          </Text>

          <View style={styles.previewBottom}>
            <View>
              <Text style={styles.previewMetaLabel}>CARDHOLDER</Text>
              <Text style={styles.previewMetaValue}>
                {cardName.toUpperCase() || 'YOUR NAME'}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.previewMetaLabel}>EXPIRES</Text>
              <Text style={styles.previewMetaValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Cardholder Name */}
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={[styles.input, !!errors.cardName && styles.inputError]}
            placeholder="e.g. Kenny K Shot"
            placeholderTextColor="#999"
            value={cardName}
            onChangeText={(t) => { setCardName(t); setErrors((e) => ({ ...e, cardName: '' })); }}
            autoCapitalize="words"
          />
          {!!errors.cardName && <Text style={styles.errorText}>{errors.cardName}</Text>}

          {/* Card Number */}
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={[styles.input, !!errors.cardNumber && styles.inputError]}
            placeholder="4000 1234 5678 9010"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={19}
            value={cardNumber}
            onChangeText={(t) => {
              setCardNumber(formatCardNumber(t));
              setErrors((e) => ({ ...e, cardNumber: '' }));
            }}
          />
          {!!errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}

          {/* Expiry + CVV row */}
          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={[styles.input, !!errors.expiry && styles.inputError]}
                placeholder="MM/YY"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5}
                value={expiry}
                onChangeText={(t) => {
                  setExpiry(formatExpiry(t));
                  setErrors((e) => ({ ...e, expiry: '' }));
                }}
              />
              {!!errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={[styles.input, !!errors.cvv && styles.inputError]}
                placeholder={isAmex ? '1234' : '123'}
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={cvvLength}
                secureTextEntry
                value={cvv}
                onChangeText={(t) => {
                  setCvv(t.replace(/[^0-9]/g, ''));
                  setErrors((e) => ({ ...e, cvv: '' }));
                }}
              />
              {!!errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
            </View>
          </View>

          {/* Security note */}
          <View style={styles.secureNote}>
            <Text style={styles.secureNoteText}>
              CVV is used for verification only and is never stored on our servers.
            </Text>
          </View>

          {/* Luhn info */}
          <View style={styles.luhnNote}>
            <Text style={styles.luhnNoteText}>
              Card numbers are validated using the Luhn algorithm.
            </Text>
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.saveBtnText}>Saving Cardâ€¦</Text>
            </View>
          ) : (
            <Text style={styles.saveBtnText}>Save Card Securely</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // â”€â”€ Card preview â”€â”€
  cardPreview: {
    borderRadius: 18,
    padding: 20,
    height: 200,
    justifyContent: 'space-between',
    marginVertical: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
    position: 'relative',
  },
  previewCircle: {
    position: 'absolute',
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -width * 0.15,
    right: -width * 0.1,
  },
  previewCircle2: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -width * 0.05,
    left: -width * 0.05,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBrand: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 2,
  },
  previewNumber: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  previewBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  previewMetaLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1,
    marginBottom: 2,
  },
  previewMetaValue: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },

  // â”€â”€ Form â”€â”€
  form: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#DC2626',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
  },
  secureNoteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#065F46',
    lineHeight: 16,
  },
  luhnNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  luhnNoteText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    lineHeight: 16,
  },

  // â”€â”€ Save button â”€â”€
  saveBtn: {
    backgroundColor: PURPLE,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

export default AddCardScreen;
