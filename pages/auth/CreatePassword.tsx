import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  CreatePassword: { email: string };
  Home: undefined;
};

type CreatePasswordScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CreatePassword'>;
type CreatePasswordScreenRouteProp = RouteProp<AppStackParamList, 'CreatePassword'>;

const CreatePassword: React.FC = () => {
  const navigation = useNavigation<CreatePasswordScreenNavigationProp>();
  const route = useRoute<CreatePasswordScreenRouteProp>();
  const { email } = route.params || { email: 'you@example.com' };
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigation.navigate('Signin');
    } catch {
      setError('Failed to reset password. Please try again.');
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
            <Lock size={32} color="#7126D0" />
          </View>
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>New Password</Text>
          <Text style={styles.subtitle}>
            Create a new, strong password for your account associated with {email}.
          </Text>
        </View>

        <View style={styles.createPasswordForm}>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#999" />
              ) : (
                <Eye size={20} color="#999" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError('');
              }}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#999" />
              ) : (
                <Eye size={20} color="#999" />
              )}
            </TouchableOpacity>
          </View>

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
  createPasswordForm: {
    flexDirection: 'column',
    gap: 20,
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
  createPasswordBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  createPasswordBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default CreatePassword;