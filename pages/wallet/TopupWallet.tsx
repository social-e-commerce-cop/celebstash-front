import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

interface MoMoProvider {
  id: string;
  name: string;
  brandColor: string;
  textColor: string;
  accentBg: string;
  logo: string;
}

const PROVIDERS: MoMoProvider[] = [
  { id: 'mtn', name: 'MTN MoMo', brandColor: '#FFCC00', textColor: '#000', accentBg: '#FFF9E6', logo: '⚡' },
  { id: 'airtel', name: 'Airtel Money', brandColor: '#E11900', textColor: '#FFF', accentBg: '#FFEBEA', logo: '🔴' },
];

const SUGGESTIONS = [10, 20, 50, 100, 200, 500];

const TopUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [selectedProvider, setSelectedProvider] = useState<MoMoProvider>(PROVIDERS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [countryCode, setCountryCode] = useState('+250'); // Default country code

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const handlePhoneChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setPhoneNumber(numericValue);
  };

  const handleSelectSuggestion = (val: number) => {
    setAmount(val.toString());
  };

  const handleContinue = () => {
    if (!amount || !phoneNumber || phoneNumber.length < 7) {
      return;
    }
    navigation.navigate("TopupConfirmation", {
      amount,
      provider: selectedProvider.name,
      phoneNumber: `${countryCode} ${phoneNumber}`
    });
  };

  const isFormValid = amount && phoneNumber && phoneNumber.length >= 7;

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Up via MoMo</Text>
          <View style={{ width: width * 0.06 }} />
        </View>

        {/* 1. Choose MoMo Provider */}
        <Text style={styles.sectionLabel}>Select Mobile Money Provider</Text>
        <View style={styles.providersContainer}>
          {PROVIDERS.map((provider) => {
            const isSelected = selectedProvider.id === provider.id;
            return (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerCard,
                  isSelected && { 
                    borderColor: provider.brandColor,
                    backgroundColor: provider.accentBg,
                    borderWidth: 2 
                  }
                ]}
                onPress={() => setSelectedProvider(provider)}
                activeOpacity={0.8}
              >
                <Text style={styles.providerLogo}>{provider.logo}</Text>
                <Text style={styles.providerName}>{provider.name}</Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: provider.brandColor }]}>
                    <Ionicons name="checkmark" size={10} color={provider.textColor} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Mobile Wallet Number */}
        <Text style={styles.sectionLabel}>Mobile Money Account Number</Text>
        <View style={styles.phoneInputContainer}>
          <TouchableOpacity style={styles.countryCodeSelector} activeOpacity={0.7}>
            <Text style={styles.countryCodeText}>{countryCode}</Text>
            <Ionicons name="chevron-down" size={12} color="#666" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TextInput
            style={styles.phoneTextInput}
            placeholder="788 000 000"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={12}
            value={phoneNumber}
            onChangeText={handlePhoneChange}
          />
        </View>

        {/* 3. Enter Top Up Amount */}
        <Text style={styles.sectionLabel}>Enter Top Up Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#DDD"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        {/* Suggestions chips */}
        <View style={styles.suggestionsWrapper}>
          {SUGGESTIONS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.suggestionChip,
                amount === val.toString() && {
                  backgroundColor: selectedProvider.brandColor,
                  borderColor: selectedProvider.brandColor,
                }
              ]}
              onPress={() => handleSelectSuggestion(val)}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.suggestionText,
                  amount === val.toString() && { color: selectedProvider.textColor, fontWeight: '700' }
                ]}
              >
                ${val}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Info */}
        {isFormValid && (
          <View style={styles.summaryBox}>
            <Ionicons name="information-circle-outline" size={18} color="#7126D0" style={{ marginRight: 8 }} />
            <Text style={styles.summaryText}>
              Authorize transfer of <Text style={{ fontWeight: 'bold' }}>${amount}</Text> from your <Text style={{ fontWeight: 'bold' }}>{selectedProvider.name}</Text> account to E-Wallet balance.
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isFormValid && styles.disabledButton,
            isFormValid && { backgroundColor: selectedProvider.brandColor }
          ]}
          onPress={handleContinue}
          disabled={!isFormValid}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.submitButtonText,
            isFormValid && { color: selectedProvider.textColor }
          ]}>
            Continue with {selectedProvider.name}
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
    paddingBottom: height * 0.05,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.03,
  },
  backButton: {
    padding: 4,
  },
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
  providersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  providerCard: {
    width: (width * 0.88 - 12) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  providerLogo: {
    fontSize: 24,
    marginBottom: 6,
  },
  providerName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    height: 50,
  },
  countryCodeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  phoneTextInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    height: 90,
  },
  currencyPrefix: {
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    height: '100%',
    padding: 0,
  },
  suggestionsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },
  suggestionChip: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#F5EEFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#5B21B6',
    lineHeight: 18,
  },
  submitButton: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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