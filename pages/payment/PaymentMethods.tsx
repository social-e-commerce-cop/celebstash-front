import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView, TextInput } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PaymentMethodItem from '@/components/payment/PaymentMethodItem';
import PaymentMethodCard from '@/components/payment/PaymentMethodCard';
import MainButton from '@/components/buttons/Mainbutton';
import { AppleIcon, GoogleIcon, MasterCardIcon, PayPalIcon, VisaIcon } from '@/assets/icons/Payment';

const { width, height } = Dimensions.get('window');

const PaymentMethods = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<any>();
  
  // State to track the selected payment method and phone number
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+250');

  const handleSelect = (name: string) => {
    setSelectedMethod(name);
  };

  const handleConfirmation = () => {
    if (selectedMethod) {
      const isMoMo = ['MTN MoMo', 'Airtel Money'].includes(selectedMethod);
      if (isMoMo && (!phoneNumber || phoneNumber.length < 7)) {
        alert('Please enter a valid Mobile Money number');
        return;
      }

      navigation.navigate('PinEntry', {
        total: route.params?.total,
        isMusic: route.params?.isMusic,
        musicItem: route.params?.musicItem,
        paymentMethod: isMoMo ? `${selectedMethod} (${countryCode} ${phoneNumber})` : selectedMethod,
      }); // Go to PinEntry screen
    } else {
      alert('Please select a payment method');
    }
  };

  const paymentMethods = [
    // Cards
    { name: 'Visa (**** **** *** *567)', icon: <VisaIcon /> },
    { name: 'Mastercard (**** **** **** *123)', icon: <MasterCardIcon /> },
    // MoMo options
    { name: 'MTN MoMo', icon: <View style={[styles.momoIconBg, { backgroundColor: '#FFCC00' }]}><Text style={styles.momoIconText}>⚡</Text></View> },
    { name: 'Airtel Money', icon: <View style={[styles.momoIconBg, { backgroundColor: '#E11900' }]}><Text style={styles.momoIconText}>🔴</Text></View> },
    // E-Wallets / Others
    { name: 'Paypal', icon: <PayPalIcon /> },
    { name: 'Google Pay', icon: <GoogleIcon /> },
    { name: 'Apple Pay', icon: <AppleIcon /> },
  ];

  const isMoMoSelected = ['MTN MoMo', 'Airtel Money'].includes(selectedMethod || '');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Payment Methods</Text>

        <View style={styles.iconButton} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.05 }}
      >
        <Text style={styles.label}>Select the payment method you want to use</Text>

        <PaymentMethodItem
          name="My Wallet"
          amount="$300.00"
          selected={selectedMethod === 'My Wallet'}
          onPress={() => handleSelect('My Wallet')}
        />

        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.name}
            name={method.name}
            icon={method.icon}
            selected={selectedMethod === method.name}
            onPress={() => handleSelect(method.name)}
          />
        ))}

        {/* Conditional Phone Input for MoMo */}
        {isMoMoSelected && (
          <View style={styles.phoneInputSection}>
            <Text style={styles.phoneLabel}>Enter Mobile Money Account Number</Text>
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

        <MainButton
          label="Confirm Payment"
          onPress={handleConfirmation}
          buttonStyle={{ marginTop: 20, justifyContent: 'center', borderRadius: 5, paddingVertical: 10 }}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: {
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  label: {
    fontSize: 16,
    color: '#303030',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: "Poppins-Bold",
  },
  iconButton: {},
  momoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoIconText: {
    fontSize: 14,
  },
  phoneInputSection: {
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  phoneLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#7126D0',
    height: 48,
    overflow: 'hidden',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    height: '100%',
  },
  countryCodeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1F2937',
  },
  phoneTextInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#1F2937',
  },
});

export default PaymentMethods;
