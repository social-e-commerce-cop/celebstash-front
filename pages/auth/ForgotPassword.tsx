import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Mail } from 'lucide-react-native';

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
  CreatePassword: { email: string};
  Verification: { identifier: string; type: 'email' | 'phone' };
};

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AppStackParamList, 'ForgotPassword'>;

const ForgotPassword: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendEmail = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigation.navigate('Verification', { identifier: email, type: 'email' });
    } catch (error) {
      console.error('Error sending reset email:', error);
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
            <Mail size={32} color="#7126D0" />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your password.
          </Text>
        </View>

        <View style={styles.forgotForm}>
          <View style={styles.inputContainer}>
            <Mail size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendEmailBtn, (!email || isLoading) ? styles.sendEmailBtnDisabled : null]}
            onPress={handleSendEmail}
            disabled={!email || isLoading}
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
    width: 80,
    height: 80,
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
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  forgotForm: {
    flexDirection: 'column',
    gap: 24,
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
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    shadowColor: '#7126D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendEmailBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendEmailBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default ForgotPassword;