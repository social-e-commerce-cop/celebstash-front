import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Phone, Mail } from 'lucide-react-native';
import ZikiiiInput from '@/components/ZikiiiInput';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  PhoneNumber: { initialValue?: string } | undefined;
  Email: undefined;
  Verification: { identifier: string; type: 'email' | 'phone'; flow?: 'signup' | 'forgot_password' };
};

type PhoneNumberScreenNavigationProp = StackNavigationProp<AppStackParamList, 'PhoneNumber'>;

const PhoneNumber: React.FC = () => {
  const navigation = useNavigation<PhoneNumberScreenNavigationProp>();
  const route = useRoute<RouteProp<AppStackParamList, 'PhoneNumber'>>();
  const [phone, setPhone] = useState(route.params?.initialValue || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleSendCode = async () => {
    if (!phone) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.navigate('Verification', { identifier: phone, type: 'phone' });
    } catch (error) {
      console.error('Error sending SMS code:', error);
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
            <Phone size={28} color="#7126D0" />
          </View>
        </View>

        <View style={styles.mb8}>
          <Text style={styles.formHeaderTitle}>Phone Number</Text>
          <Text style={styles.formHeaderText}>Enter your phone number to receive a verification code.</Text>
        </View>

        <View style={styles.phoneForm}>
          <View style={styles.inputContainer}>
            <ZikiiiInput
                icon={Phone}
                placeholder="Phone Number"
                value={phone}
                onChangeText={(text) => { setPhone(text); setErrors({ ...errors, phone: null }); }}
                autoCapitalize="none"
                error={errors.phone}
              />
          </View>

          <TouchableOpacity
            style={[styles.sendCodeBtn, (!phone || isLoading) ? styles.sendCodeBtnDisabled : null]}
            onPress={handleSendCode}
            disabled={!phone || isLoading}
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
  phoneForm: {
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

export default PhoneNumber;