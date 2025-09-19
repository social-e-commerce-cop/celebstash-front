import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  PhoneNumber: undefined;
  Email: undefined; // Added to support navigation to Email screen
};

type VerifyIdentityScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Verify'>;

const VerifyIdentity: React.FC = () => {
  const navigation = useNavigation<VerifyIdentityScreenNavigationProp>();
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('phone');

  const handleContinue = () => {
    console.log('Continue with verification method:', selectedMethod);
    // Navigate based on selected method
    if (selectedMethod === 'phone') {
      navigation.navigate('PhoneNumber');
    } else {
      navigation.navigate('Email');
    }
  };

  return (
    <View style={styles.verifyScreen}>
      <View style={styles.verifyContent}>
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
        <View style={styles.mainContent}>
          <View style={styles.identityIcon}>
            <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
<Rect width="50" height="50" rx="25" fill="#FF650E"/>
<Path fill-rule="evenodd" clip-rule="evenodd" d="M36.78 20.2434C36.8499 20.3208 36.9053 20.4127 36.9431 20.514C36.9809 20.6152 37.0004 20.7237 37.0004 20.8334C37.0004 20.943 36.9809 21.0515 36.9431 21.1527C36.9053 21.254 36.8499 21.3459 36.78 21.4234L32.2803 26.4234C32.2106 26.501 32.1279 26.5625 32.0367 26.6045C31.9456 26.6466 31.848 26.6682 31.7493 26.6682C31.6507 26.6682 31.553 26.6466 31.4619 26.6045C31.3708 26.5625 31.288 26.501 31.2183 26.4234L28.9685 23.9234C28.8276 23.7669 28.7485 23.5547 28.7485 23.3334C28.7485 23.1121 28.8276 22.8998 28.9685 22.7434C29.1093 22.5869 29.3003 22.499 29.4994 22.499C29.6986 22.499 29.8896 22.5869 30.0304 22.7434L31.7493 24.655L35.7181 20.2434C35.7878 20.1658 35.8705 20.1042 35.9616 20.0622C36.0527 20.0202 36.1504 19.9985 36.2491 19.9985C36.3477 19.9985 36.4454 20.0202 36.5365 20.0622C36.6276 20.1042 36.7104 20.1658 36.78 20.2434Z" fill="white"/>
<Path d="M14.4999 35C14.4999 35 13 35 13 33.3333C13 31.6667 14.4999 26.6667 21.9995 26.6667C29.4991 26.6667 30.999 31.6667 30.999 33.3333C30.999 35 29.4991 35 29.4991 35H14.4999ZM21.9995 25C23.1929 25 24.3374 24.4732 25.1813 23.5355C26.0252 22.5979 26.4992 21.3261 26.4992 20C26.4992 18.6739 26.0252 17.4021 25.1813 16.4645C24.3374 15.5268 23.1929 15 21.9995 15C20.8061 15 19.6616 15.5268 18.8177 16.4645C17.9738 17.4021 17.4997 18.6739 17.4997 20C17.4997 21.3261 17.9738 22.5979 18.8177 23.5355C19.6616 24.4732 20.8061 25 21.9995 25Z" fill="white"/>
</Svg>
          </View>
          <View style={styles.textContent}>
            <Text style={styles.title}>Verify your identity</Text>
            <Text style={styles.subtitle}>Your identity helps you discover new people and opportunities</Text>
          </View>
          <View style={styles.verificationOptions}>
            <TouchableOpacity
              style={[styles.optionBtn, selectedMethod === 'email' ? styles.optionBtnSelected : null]}
              onPress={() => setSelectedMethod('email')}
            >
              <View style={[styles.optionIcon, selectedMethod === 'email' ? styles.optionIconSelected : null]}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <Polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none" />
                </Svg>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Email</Text>
                <Text style={styles.optionSubtitle}>Verify with your email</Text>
              </View>
              {selectedMethod === 'email' && (
                <View style={styles.checkmark}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke="#FF6B35"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionBtn, selectedMethod === 'phone' ? styles.optionBtnSelected : null]}
              onPress={() => setSelectedMethod('phone')}
            >
              <View style={[styles.optionIcon, selectedMethod === 'phone' ? styles.optionIconSelected : null]}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </Svg>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>Phone number</Text>
                <Text style={styles.optionSubtitle}>Verify with your Phone number</Text>
              </View>
              {selectedMethod === 'phone' && (
                <View style={styles.checkmark}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke="#FF6B35"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  verifyScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  verifyContent: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 0,
    borderRadius: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
  },
  identityIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#FF6B35',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 16, // Adjusted to match SignInScreen and SignUpScreen
    maxWidth: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  verificationOptions: {
    width: '100%',
    maxWidth: 400,
    flexDirection: 'column',
    gap: 16,
    marginBottom: 60,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 16,
    backgroundColor: 'white',
  },
  optionBtnSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#fff8f5',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconSelected: {
    backgroundColor: '#fff0eb',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  checkmark: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  continueBtn: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  continueBtnText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },

});

export default VerifyIdentity;