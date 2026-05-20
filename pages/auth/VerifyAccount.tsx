import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, ShieldCheck, Mail, Phone, CheckCircle2 } from 'lucide-react-native';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: { methodType?: 'email' | 'phone'; contactValue?: string } | undefined;
  PhoneNumber: { initialValue?: string } | undefined;
  Email: { initialValue?: string } | undefined;
};

type VerifyIdentityScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Verify'>;

const VerifyIdentity: React.FC = () => {
  const navigation = useNavigation<VerifyIdentityScreenNavigationProp>();
  const route = useRoute<RouteProp<AppStackParamList, 'Verify'>>();
  
  const initialMethod = route.params?.methodType || 'phone';
  const contactValue = route.params?.contactValue || '';

  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>(initialMethod);

  const handleContinue = () => {
    console.log('Continue with verification method:', selectedMethod);
    const valueToPass = selectedMethod === initialMethod ? contactValue : '';
    if (selectedMethod === 'phone') {
      navigation.navigate('PhoneNumber', { initialValue: valueToPass });
    } else {
      navigation.navigate('Email', { initialValue: valueToPass });
    }
  };

  return (
    <View style={styles.verifyScreen}>
      <View style={styles.verifyContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={28} color="#7126D0" />
            </View>
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title}>Verify your identity</Text>
            <Text style={styles.subtitle}>Choose how you want to receive your verification code.</Text>
          </View>

          <View style={styles.verificationOptions}>
            <TouchableOpacity
              style={[styles.optionBtn, selectedMethod === 'email' ? styles.optionBtnSelected : null]}
              onPress={() => setSelectedMethod('email')}
            >
              <View style={[styles.optionIcon, selectedMethod === 'email' ? styles.optionIconSelected : null]}>
                <Mail size={24} color={selectedMethod === 'email' ? '#7126D0' : '#999'} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, selectedMethod === 'email' ? styles.optionTitleSelected : null]}>Email</Text>
                <Text style={styles.optionSubtitle}>Send code to your email</Text>
              </View>
              {selectedMethod === 'email' && (
                <View style={styles.checkmark}>
                  <CheckCircle2 size={24} color="#7126D0" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionBtn, selectedMethod === 'phone' ? styles.optionBtnSelected : null]}
              onPress={() => setSelectedMethod('phone')}
            >
              <View style={[styles.optionIcon, selectedMethod === 'phone' ? styles.optionIconSelected : null]}>
                <Phone size={24} color={selectedMethod === 'phone' ? '#7126D0' : '#999'} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, selectedMethod === 'phone' ? styles.optionTitleSelected : null]}>Phone number</Text>
                <Text style={styles.optionSubtitle}>Send code to your phone</Text>
              </View>
              {selectedMethod === 'phone' && (
                <View style={styles.checkmark}>
                  <CheckCircle2 size={24} color="#7126D0" />
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
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  verifyContent: {
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
    
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
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
    paddingHorizontal: 20,
  },
  title: {
   fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Poppins-Medium',
  },
  verificationOptions: {
    width: '100%',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 36,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 5,
    backgroundColor: 'white',
    position: 'relative',
  },
  optionBtnSelected: {
    borderColor: '#7126D0',
    backgroundColor: '#F9FAFB',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconSelected: {
    backgroundColor: '#F3E8FF',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  optionTitleSelected: {
    color: '#7126D0',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  checkmark: {
    marginLeft: 12,
  },
  continueBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  continueBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default VerifyIdentity;