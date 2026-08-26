import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Mail } from 'lucide-react-native';
import ZikiiiInput from '@/components/ZikiiiInput';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  PhoneNumber: undefined;
  Email: { initialValue?: string } | undefined;
  PhoneVerification: { phone: string };
  Verification: { identifier: string; type: 'email' | 'phone'; flow?: 'signup' | 'forgot_password' };
};

type EmailAddressScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Email'>;

const EmailAddressScreen: React.FC = () => {
  const navigation = useNavigation<EmailAddressScreenNavigationProp>();
  const route = useRoute<RouteProp<AppStackParamList, 'Email'>>();
  const [email, setEmail] = useState(route.params?.initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContinue = async () => {
    if (!email || !isValidEmail(email)) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigation.navigate('Verification', { identifier: email, type: 'email' });
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
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Mail size={32} color="#7126D0" />
          </View>
        </View>

        <View style={styles.mb8}>
          <Text style={styles.formHeaderTitle}>Email Address</Text>
          <Text style={styles.formHeaderText}>Enter your email address to receive a verification code.</Text>
        </View>

        <View style={styles.emailForm}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#999" style={styles.inputIcon} />
          <ZikiiiInput
                          icon={Mail}
                          placeholder="Email Address"
                          value={email}
                          onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: null }); }}
                          autoCapitalize="none"
                          error={errors.email}
                        />
            
          </View>

          <TouchableOpacity
            style={[styles.sendCodeBtn, (!email || !isValidEmail(email) || isLoading) ? { opacity: 0.5 } : null]}
            onPress={handleContinue}
            disabled={!email || !isValidEmail(email) || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.sendCodeBtnText}>Send Code</Text>
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
    marginBottom: 40,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
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
  mb8: {
    marginBottom: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  formHeaderTitle: {
    fontSize: 24,
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  formHeaderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Medium',
  },
  emailForm: {
    width: '100%',
    flexDirection: 'column',
    gap: 20,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
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
  sendCodeBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendCodeBtnDisabled: {
    opacity: 0.6,
  },
  sendCodeBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default EmailAddressScreen;
