import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Mail } from 'lucide-react-native';
import ZikiiiInput from '@/components/ZikiiiInput';

import { authService } from '@/lib/authService';

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
  EmailVerification: { email: string };
  ForgotPassword: undefined; 
  CreatePassword: { email: string; otp?: string };
  Verification: { identifier: string; type: 'email' | 'phone'; flow?: 'signup' | 'forgot_password' };
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ForgotPassword'>;

const ForgotPassword: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!emailOrPhone) return;

    setIsLoading(true);
    setApiError(null);
    try {
      await authService.initiatePasswordReset(emailOrPhone);
      const type = emailOrPhone.includes('@') ? 'email' : 'phone';
      navigation.navigate('Verification', { identifier: emailOrPhone, type, flow: 'forgot_password' });
    } catch (error: any) {
      setApiError(error.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.forgotPasswordScreen}>
      <View style={styles.forgotPasswordContent}>
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
            <Mail size={28} color="#7126D0" />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your password.
          </Text>
        </View>

        {apiError ? (
          <View style={{ backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: '#DC2626', fontSize: 13, textAlign: 'center', fontFamily: 'Poppins-Medium' }}>
              {apiError}
            </Text>
          </View>
        ) : null}

        <View style={styles.forgotForm}>
          <View style={styles.inputContainer}>
            <ZikiiiInput
                            icon={Mail}
                            placeholder="Email or Phone Number"
                            value={emailOrPhone}
                            onChangeText={(text) => { setEmailOrPhone(text); setErrors({ ...errors, emailOrPhone: null }); }}
                            autoCapitalize="none"
                            error={errors.emailOrPhone}
                          />
          </View>

          <TouchableOpacity
            style={[styles.sendEmailBtn, (!emailOrPhone || isLoading) ? styles.sendEmailBtnDisabled : null]}
            onPress={handleSendEmail}
            disabled={!emailOrPhone || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.sendEmailBtnText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  forgotPasswordScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  forgotPasswordContent: {
    flex: 1,
    flexDirection: 'column',
    maxWidth: 400,
    marginHorizontal: 'auto',
    width: '100%',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  forgotForm: {
    flexDirection: 'column',
    gap: 14,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    fontFamily: 'Poppins-Regular',
  },
  sendEmailBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sendEmailBtnDisabled: {
    opacity: 0.6,
  },
  sendEmailBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default ForgotPassword;
