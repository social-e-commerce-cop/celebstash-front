import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  Verification: { identifier: string; type: 'email' | 'phone'; flow?: 'signup' | 'forgot_password' };
  CreatePassword: { email: string };
  Home: undefined;
};

type VerificationScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Verification'>;
type VerificationScreenRouteProp = RouteProp<AppStackParamList, 'Verification'>;

const CodeVerification: React.FC = () => {
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const route = useRoute<VerificationScreenRouteProp>();
  const { identifier, type, flow } = route.params || { identifier: 'you@example.com', type: 'email', flow: 'signup' };

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (flow === 'forgot_password') {
        navigation.navigate('CreatePassword', { email: identifier });
      } else {
        navigation.navigate('Signin');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(30);
      console.log('Resending code to:', identifier);
    }
  };

  return (
    <View style={styles.verificationScreen}>
      <View style={styles.verificationContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, isLoading ? styles.backBtnDisabled : null]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={28} color="#7126D0" />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {identifier}. Please enter it below.
          </Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={styles.otpInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                editable={!isLoading}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendLink, timer > 0 ? styles.resendLinkDisabled : null]}>
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.verifyBtn, (code.join('').length !== 6 || isLoading) ? styles.verifyBtnDisabled : null]}
            onPress={handleVerify}
            disabled={code.join('').length !== 6 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  verificationScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  verificationContent: {
    flex: 1,
    maxWidth: 400,
    marginHorizontal: 'auto',
    width: '100%',
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    width: 40,
  },
  backBtnDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Medium',
  },
  formSection: {
    width: '100%',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
    fontSize: 24,
    color: '#111827',
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    fontFamily: 'Poppins-Medium',
    padding: 0,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  resendLink: {
    fontSize: 16,
    color: '#7126D0',
    fontFamily: 'Poppins-Bold',
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },
  verifyBtn: {
     backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default CodeVerification;