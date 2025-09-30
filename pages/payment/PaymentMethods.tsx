import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PaymentMethodItem from '@/components/payment/PaymentMethodItem';
import PaymentMethodCard from '@/components/payment/PaymentMethodCard';
import MainButton from '@/components/buttons/Mainbutton';
import { AppleIcon, GoogleIcon, MasterCardIcon, PayPalIcon, VisaIcon } from '@/assets/icons/Payment';

const { width, height } = Dimensions.get('window');

const PaymentMethods = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  // State to track the selected payment method
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleSelect = (name: string) => {
    setSelectedMethod(name);
  };

  const handleConfirmation = () => {
    if (selectedMethod) {
      navigation.navigate('PinEntry'); // Go to Home screen
    } else {
      alert('Please select a payment method'); // Optional alert if nothing is selected
    }
  };

  const paymentMethods = [
    { name: 'Paypal', icon: <PayPalIcon /> },
    { name: 'Google Pay', icon: <GoogleIcon /> },
    { name: 'Apple Pay', icon: <AppleIcon /> },
    { name: '**** **** *** *567', icon: <VisaIcon />},
    { name: '**** **** **** *123', icon: <MasterCardIcon /> },
  ];

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
            backgroundColor={selectedMethod === method.name ? '#fff' : '#fff'}
            textColor={selectedMethod === method.name ? '#000' : '#000'}
            borderRadius={8}
            onPress={() => handleSelect(method.name)}
          />
        ))}

        <MainButton
          total=""
          label="Confirm Payment"
          arrow=''
          onPress={handleConfirmation}
          buttonStyle={{ backgroundColor: '#FF650E', marginTop: 20 }} 
          totalStyle={{ fontSize: 20 }} 
          labelStyle={{ fontWeight: 'bold' }} 
          arrowStyle={{ fontSize: 24 }} 
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
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    color: '#303030',
    marginBottom: 20,
    paddingHorizontal: 10,
    fontWeight: 'bold'
  },
  iconButton: {}
});

export default PaymentMethods;
