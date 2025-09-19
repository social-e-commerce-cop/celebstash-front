import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';
import { Picker } from '@react-native-picker/picker';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  PhoneNumber: undefined;
  Email: undefined; // Added for consistency with VerifyIdentityScreen
  Verification: undefined;
};

type PhoneNumberScreenNavigationProp = StackNavigationProp<AppStackParamList, 'PhoneNumber'>;

const PhoneNumber: React.FC = () => {
  const navigation = useNavigation<PhoneNumberScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('787 289 178');
  const [countryCode, setCountryCode] = useState('+250');

  const handleContinue = () => {
    if (phoneNumber.trim()) {
      console.log('Continue with:', `${countryCode} ${phoneNumber}`);
      navigation.navigate("Verification")
      // Navigate to the next screen (e.g., a verification code entry screen)
      // For now, logging the phone number as no specific screen is defined
      // Example: navigation.navigate('VerifyCode', { phone: `${countryCode} ${phoneNumber}` });
    }
  };

  return (
    <View style={styles.signinScreen}>
      <View style={styles.signinContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={styles.mb8}>
          <Text style={styles.formHeaderTitle}>Phone Number</Text>
          <Text style={styles.formHeaderText}>Your identity helps you discover new people and opportunities</Text>
        </View>
             <View style={styles.inputGroup}>
      <View style={styles.phoneInputContainer}>
        {/* Country selector */}
        <View style={styles.countrySelector}>
          {/* Rwanda flag (SVG) */}
          <Svg width="24" height="24" viewBox="0 0 24 25">
            <Path d="M12 1.25C5.775 1.25 0.75 6.275 0.75 12.5H23.25C23.25 6.275 18.225 1.25 12 1.25Z" fill="#42ADE2" />
            <Path d="M21.75 18.125H2.25C4.2 21.5 7.8375 23.75 12 23.75C16.1625 23.75 19.8 21.5 21.75 18.125Z" fill="#699635" />
            <Path
              d="M21.75 18.1249C22.725 16.4749 23.25 14.5624 23.25 12.4999H0.75C0.75 14.5624 1.3125 16.4749 2.25 18.1249H21.75Z"
              fill="#FFE62E"
            />
          </Svg>

          {/* Picker for country codes */}
          <Picker
            selectedValue={countryCode}
            onValueChange={(itemValue) => setCountryCode(itemValue)}
            style={styles.countryCode}
          >
            <Picker.Item label="+250" value="+250" />
            <Picker.Item label="+1" value="+1" />
            <Picker.Item label="+44" value="+44" />
            <Picker.Item label="+33" value="+33" />
            <Picker.Item label="+49" value="+49" />
          </Picker>
        </View>

        {/* Phone number input */}
        <TextInput
          style={styles.phoneNumberInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />
      </View>
    </View>
        <View style={styles.formSection}>
    
          <TouchableOpacity
            style={[styles.signinBtn, !phoneNumber.trim() ? styles.signinBtnDisabled : null]}
            onPress={handleContinue}
            disabled={!phoneNumber.trim()}
          >
            <Text style={styles.signinBtnText}>Verify your phone number</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  signinScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingVertical: 8,
    paddingHorizontal: 35,
  },
  signinContent: {
    flex: 1,
    flexDirection: 'column',
    maxWidth: 400,
    marginHorizontal: 'auto',
    width: '100%',
    paddingTop: 40,
  },
  header: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24, // Adjusted from 32px to match layout flow
  },
  mb8: {
    marginBottom: 48, // Matches SignInScreen and SignUpScreen for consistent spacing
    alignItems: 'flex-start'
  },
  formHeaderTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  formHeaderText: {
    fontSize: 15,
    color: '#8F959E',
    fontWeight: 'semibold',
  },
  formSection: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 20,
  },
  inputGroup: {
    flexDirection: 'column',
    gap: 4,
  },
phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  countryCode: {
    width: 100,
    marginLeft: 0,
  },
  phoneNumberInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 0,
    color: "#000",
  },
  signinBtn: {
    backgroundColor: '#FF650E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signinBtnDisabled: {
    backgroundColor: '#ccc',
  },
  signinBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhoneNumber;