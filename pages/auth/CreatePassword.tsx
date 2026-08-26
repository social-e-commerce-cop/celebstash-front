import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ZikiiiInput from '@/components/ZikiiiInput';

import { authService } from '@/lib/authService';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  CreatePassword: { email: string; otp?: string };
  Home: undefined;
};

type CreatePasswordScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CreatePassword'>;
type CreatePasswordScreenRouteProp = RouteProp<AppStackParamList, 'CreatePassword'>;

const CreatePassword: React.FC = () => {
  const navigation = useNavigation<CreatePasswordScreenNavigationProp>();
  const route = useRoute<CreatePasswordScreenRouteProp>();
  const { email, otp = '' } = (route.params as any) || {};
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const handleCreatePassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.completePasswordReset({
        identifier: email,
        otp: otp,
        newPassword: password,
        confirmPassword: confirmPassword,
      });
      navigation.navigate('Signin');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.createPasswordScreen}>
      <View style={styles.createPasswordContent}>
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
            <Lock size={28} color="#7126D0" />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Create a new, strong password for your account associated with {email}.
          </Text>
        </View>

        <View style={styles.createPasswordForm}>
          <ZikiiiInput
            icon={Lock}
            placeholder="New Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError('');
              setErrors({ ...errors, password: null });
            }}
            secureTextEntry
            error={errors.password}
          />
          
          <ZikiiiInput
            icon={Lock}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError('');
              setErrors({ ...errors, confirmPassword: null });
            }}
            secureTextEntry
            error={errors.confirmPassword}
          />

          {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.createPasswordBtn, isLoading || !password || !confirmPassword ? styles.createPasswordBtnDisabled : null]}
            onPress={handleCreatePassword}
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.createPasswordBtnText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  createPasswordScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  createPasswordContent: {
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
  createPasswordForm: {
    flexDirection: 'column',
    gap: 10,
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
    paddingRight: 48,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    fontFamily: 'Poppins-Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -4,
    fontFamily: 'Poppins-Regular',
  },
  createPasswordBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  createPasswordBtnDisabled: {
    opacity: 0.6,
  },
  createPasswordBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default CreatePassword;
