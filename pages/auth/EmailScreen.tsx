import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Polyline } from 'react-native-svg';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  PhoneNumber: undefined;
  Email: undefined;
  PhoneVerification: { phone: string };
  Verification: { email: string }; // Added to support navigation with email
};

type EmailAddressScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Email'>;

const EmailAddressScreen: React.FC = () => {
  const navigation = useNavigation<EmailAddressScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContinue = async () => {
    if (!email || !isValidEmail(email)) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigation.navigate('Verification', { email });
    } catch {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.signinScreen}>
      <View style={styles.signinContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, isLoading ? styles.backBtnDisabled : null]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <View style={styles.mb8}>
            <Text style={styles.signinTitle}>Email Address</Text>
            <Text style={styles.signinSubtitle}>
              Your identity helps you discover new people and opportunities
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Polyline
                  points="22,6 12,13 2,6"
                  stroke="#666"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <TextInput
                style={styles.signinInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>
<View style={styles.formSection}>
          <TouchableOpacity
            style={[styles.signinBtn, (!email || !isValidEmail(email) || isLoading) ? styles.signinBtnDisabled : null]}
            onPress={handleContinue}
            disabled={!email || !isValidEmail(email) || isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" style={styles.spinner} />
                <Text style={styles.signinBtnText}>Sending...</Text>
              </>
            ) : (
              <Text style={styles.signinBtnText}>Verify your Email address</Text>
            )}
          </TouchableOpacity>
            </View>
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
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backBtn: {
    borderRadius: 8,
    paddingVertical: 10,
  },
  backBtnDisabled: {
    opacity: 0.5,
  },
  formSection: {
    flex: 1,
    flexDirection: 'column',
    gap: 16, // Reduced to match SignInScreen/SignUpScreen
  },
  mb8: {
    marginBottom: 48,
    alignItems: 'flex-start',
  },
  signinTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  signinSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  inputGroup: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 32,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  signinInput: {
    width: '100%',
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  signinBtn: {
    width: '100%',
    maxWidth: 400,
    padding: 18,
    backgroundColor: '#FF650E',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 140,
  },
  signinBtnDisabled: {
    backgroundColor: '#FF650E',
  },
  signinBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginRight: 8,
  },
});

export default EmailAddressScreen;