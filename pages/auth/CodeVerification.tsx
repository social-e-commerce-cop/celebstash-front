import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import Svg, { Path, Stop, LinearGradient, Defs } from 'react-native-svg';

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
};

type PhoneVerificationScreenNavigationProp = StackNavigationProp<AppStackParamList, 'PhoneVerification'>;
type PhoneVerificationScreenRouteProp = StackScreenProps<AppStackParamList, 'PhoneVerification'>['route'];

const CodeVerification: React.FC = () => {
  const navigation = useNavigation<PhoneVerificationScreenNavigationProp>();
  const route = useRoute<PhoneVerificationScreenRouteProp>();
  const { phone } = route.params || { phone: '' };
  const [code, setCode] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(28);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(React.RefObject<TextInput | null>)[]>([
    React.createRef<TextInput | null>(),
    React.createRef<TextInput | null>(),
    React.createRef<TextInput | null>(),
    React.createRef<TextInput | null>(),
  ]);

  useEffect(() => {
    inputRefs.current[0]?.current?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
    }
  };

  const handleConfirm = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 4) {
      setError('Please enter the complete verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (verificationCode === '7423') {
        console.log('Verification successful for phone:', phone);
        // Replace with navigation to next screen, e.g., navigation.navigate('Home');
      } else {
        setError('Invalid verification code. Please try again.');
        setCode(['', '', '', '']);
        inputRefs.current[0]?.current?.focus();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCountdown(28);
      setCanResend(false);
      setCode(['', '', '', '']);
      inputRefs.current[0]?.current?.focus();
    } catch {
      setError('Failed to resend code. Please try again.');
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
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
        <View style={styles.formSection}>
          <View style={styles.cloudContainer}>
            <Svg width="86" height="60" viewBox="0 0 86 60" fill="none">
              <Path
                d="M70.0716 16.3282C69.7186 16.3282 69.3656 16.3407 69.0125 16.3659C67.8227 9.74667 61.8213 4.69749 54.5778 4.69749C51.2699 4.69749 48.2234 5.75254 45.7653 7.52352C43.1111 3.02699 38.0904 0 32.3374 0C23.8126 0 16.909 6.63175 16.909 14.821C16.909 15.3359 16.9352 15.8509 16.9875 16.3533C16.6344 16.3282 16.2814 16.3156 15.9284 16.3156C7.40355 16.3156 0.5 22.9474 0.5 31.1366C0.5 39.3258 7.40355 45.9576 15.9284 45.9576H70.0585C78.5834 45.9576 85.4869 39.3258 85.4869 31.1366C85.4869 22.9474 78.5964 16.3282 70.0716 16.3282Z"
                fill="white"
              />
              <Path
                d="M70.0716 16.3282C69.7186 16.3282 69.3656 16.3407 69.0125 16.3659C67.8227 9.74667 61.8213 4.69749 54.5778 4.69749C51.2699 4.69749 48.2234 5.75254 45.7653 7.52352C43.1111 3.02699 38.0904 0 32.3374 0C23.8126 0 16.909 6.63175 16.909 14.821C16.909 15.3359 16.9352 15.8509 16.9875 16.3533C16.6344 16.3282 16.2814 16.3156 15.9284 16.3156C7.40355 16.3156 0.5 22.9474 0.5 31.1366C0.5 39.3258 7.40355 45.9576 15.9284 45.9576H70.0585C78.5834 45.9576 85.4869 39.3258 85.4869 31.1366C85.4869 22.9474 78.5964 16.3282 70.0716 16.3282Z"
                fill="url(#paint0_linear_0_11976)"
              />
              <Path
                d="M38.6002 3.29055C37.175 2.85095 35.6452 2.6123 34.0632 2.6123C25.8391 2.6123 19.1839 9.01798 19.1839 16.9058C19.1839 17.4082 19.2101 17.898 19.2624 18.3878C18.9224 18.3627 18.5825 18.3502 18.2425 18.3502C10.0184 18.3502 3.36328 24.7558 3.36328 32.6436C3.36328 35.2436 4.0824 37.6677 5.33759 39.7652C4.77537 33.3093 5.78214 21.0004 21.8774 21.3018C21.7205 17.1067 22.4919 3.89344 38.6002 3.29055Z"
                fill="#F0AE22"
              />
              <Path
                d="M23.394 45.9575H70.0715C78.5963 45.9575 85.4999 39.3257 85.4999 31.1365C85.4999 29.3907 85.1861 27.7076 84.5977 26.1501C74.4646 45.3546 40.1561 43.659 23.394 45.9575Z"
                fill="#FF650E"
              />
              <Path
                d="M55.3751 42.3026H51.9626V31.4381C51.9626 26.7029 47.9486 22.8469 43.0194 22.8469C38.0901 22.8469 34.0761 26.7029 34.0761 31.4381V42.3026H30.6636V31.4381C30.6636 24.8817 36.2073 19.5562 43.0324 19.5562C49.8575 19.5562 55.4013 24.8817 55.4013 31.4381V42.3026H55.3751Z"
                fill="url(#paint1_linear_0_11976)"
              />
              <Path
                d="M60.6054 58.7312C60.6054 59.4345 60.017 59.9997 59.2848 59.9997H26.7283C25.9961 59.9997 25.4077 59.4345 25.4077 58.7312V38.4214C25.4077 37.718 25.9961 37.1528 26.7283 37.1528H59.2717C60.0039 37.1528 60.5923 37.718 60.5923 38.4214V58.7312H60.6054Z"
                fill="url(#paint2_linear_0_11976)"
              />
              <Path d="M51.9497 37.14C51.9497 37.14 54.8916 33.6233 55.2577 29.8303V37.14H51.9497Z" fill="#5C5A5A" />
              <Path
                d="M60.6055 58.7313V46.2842C49.8841 55.0009 34.4164 58.2791 25.6562 59.4723C25.8916 59.7863 26.2838 59.9998 26.7284 59.9998H59.2719C60.0171 60.0124 60.6055 59.4346 60.6055 58.7313Z"
                fill="url(#paint3_linear_0_11976)"
              />
              <Path
                d="M45.9093 45.1286C45.9093 43.5837 44.6018 42.3402 43.0066 42.3402C41.3984 42.3402 40.104 43.5962 40.104 45.1286C40.104 46.0455 40.5747 46.8619 41.2807 47.3768L40.3524 53.6946H45.6608L44.7325 47.3768C45.4517 46.8619 45.9093 46.058 45.9093 45.1286Z"
                fill="#72716F"
              />
              <Path
                d="M40.3525 53.6943C40.3525 53.6943 44.4973 52.1746 44.8111 47.8541L45.674 53.6943H40.3525Z"
                fill="#5C5A5A"
              />
              <Defs>
                <LinearGradient id="paint0_linear_0_11976" x1="22.2222" y1="3.97591" x2="71.296" y2="48.0484" gradientUnits="userSpaceOnUse">
                  <Stop stopColor="#EBC428" />
                  <Stop offset="1" stopColor="#FF650E" />
                </LinearGradient>
                <LinearGradient id="paint1_linear_0_11976" x1="43.0324" y1="19.5562" x2="43.0324" y2="42.3026" gradientUnits="userSpaceOnUse">
                  <Stop stopColor="#72716F" />
                  <Stop offset="1" stopColor="#5B5953" />
                </LinearGradient>
                <LinearGradient id="paint2_linear_0_11976" x1="29.2111" y1="38.8553" x2="55.5153" y2="59.8568" gradientUnits="userSpaceOnUse">
                  <Stop stopColor="#FFEA97" />
                  <Stop offset="1" stopColor="#EBC428" />
                </LinearGradient>
                <LinearGradient id="paint3_linear_0_11976" x1="43.1309" y1="46.2842" x2="43.1309" y2="60" gradientUnits="userSpaceOnUse">
                  <Stop stopColor="#EAB531" />
                  <Stop offset="1" stopColor="#EAB531" stopOpacity="0" />
                </LinearGradient>
              </Defs>
            </Svg>
          </View>
          <View style={styles.mb8}>
            <Text style={styles.formHeaderTitle}>Verification code</Text>
          </View>
          <View style={styles.codeInputs}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs.current[index]}
                style={[styles.codeInput, error ? styles.codeInputError : null]}
                value={digit}
                onChangeText={(value) => handleInputChange(index, value)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyDown(index, key)}
                keyboardType="numeric"
                maxLength={1}
                editable={!isLoading}
                textAlign="center"
              />
            ))}
          </View>
          {error && <Text style={styles.errorMessage}>{error}</Text>}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>
              {countdown > 0 ? (
                `00:${countdown.toString().padStart(2, '0')} resend confirmation code.`
              ) : (
                <>
                  {"Didn't receive the code? "}
                  <Text
                    style={[styles.resendBtn, isLoading ? styles.resendBtnDisabled : null]}
                    onPress={handleResendCode}
                  >
                    Resend
                  </Text>
                </>
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.signinBtn, isLoading || code.some((digit) => !digit) ? styles.signinBtnDisabled : null]}
            onPress={handleConfirm}
            disabled={isLoading || code.some((digit) => !digit)}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" style={styles.spinner} />
                <Text style={styles.signinBtnText}>Verifying...</Text>
              </>
            ) : (
              <Text style={styles.signinBtnText}>Confirm Code</Text>
            )}
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
    paddingVertical: 40,
    paddingHorizontal: 20,
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
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
  },
  backBtnDisabled: {
    opacity: 0.5,
  },
  formSection: {
    flex: 1,
    flexDirection: 'column',
   paddingTop: 60,
    alignItems: 'center',
    gap: 16,
  },
  cloudContainer: {
    
  },
  mb8: {
    marginBottom: 8,
    alignItems: 'center',
  },
  formHeaderTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#333',
    marginBottom: 68,
    textAlign: 'center',
  },
  codeInputs: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 68,
  },
  codeInput: {
    width: 56,
    height: 56,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  codeInputError: {
    borderColor: '#ef4444',
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendBtn: {
    color: '#FF650E',
    fontWeight: '600',
    fontSize: 14,
  },
  resendBtnDisabled: {
    opacity: 0.5,
  },
  signinBtn: {
    backgroundColor: '#FF650E',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 280,
  },
  signinBtnDisabled: {
    backgroundColor: '#ccc',
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

export default CodeVerification;