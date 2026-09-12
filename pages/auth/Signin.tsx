import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Mail, Lock } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleLogo from '@/components/GoogleLogo';
import ZikiiiInput from '@/components/ZikiiiInput';

import { ActivityIndicator } from 'react-native';
import { authService } from '../../lib/authService';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  ArtHome: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Signin'>;

const Signin: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const isEmailValid = (e: string) => /\S+@\S+\.\S+/.test(e);
  const isFormValid = (isEmailValid(email) || email.length >= 3) && password.length >= 6;

  const handleSignIn = async () => {
    const newErrors: Record<string, string | null> = {};
    setApiError(null);
    
    if (!email.trim()) newErrors.email = "Email or phone is required";
    if (password.length < 6) newErrors.password = "Min 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.login({ emailOrPhone: email.trim(), password });
        if (response.success) {
          // Route on the role the backend actually returned — never infer it from the address.
          const role = (response.role || response.user?.role || 'USER').toUpperCase();
          const isArtist = role === 'ARTIST';
          if (isArtist) {
            navigation.navigate('ArtHome');
          } else {
            navigation.navigate('Home');
          }
        } else {
          setApiError(response.message || 'Login failed. Please check credentials.');
        }
      } catch (err: any) {
        setApiError(err.message || 'Failed to connect to backend server');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Sign in with:', provider);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>ZIKII</Text>
            <Text style={styles.logoDot}>.</Text>
          </View>
        </View>

        <View style={styles.headerArea}>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Welcome back, you've been missed!</Text>
        </View>

        <View style={styles.formArea}>
          <ZikiiiInput
            icon={Mail}
            placeholder="Email Address"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrors({ ...errors, email: null }); }}
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email}
          />

          <ZikiiiInput
            icon={Lock}
            placeholder="Password"
            value={password}
            onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
            secureTextEntry
            error={errors.password}
          />

          <TouchableOpacity 
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotBtnText}>Forgot your password?</Text>
          </TouchableOpacity>

          {apiError && (
            <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 6, marginBottom: 12 }}>
              <Text style={{ color: '#DC2626', fontFamily: 'Poppins-Medium', fontSize: 13, textAlign: 'center' }}>
                {apiError}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.mainBtn, (!isFormValid || isLoading) && styles.disabledBtn]}
            onPress={handleSignIn}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.mainBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity 
            style={styles.socialIconBtn}
            onPress={() => handleSocialLogin('google')}
          >
            <GoogleLogo size={24} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialIconBtn}
            onPress={() => handleSocialLogin('facebook')}
          >
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialIconBtn}
            onPress={() => handleSocialLogin('apple')}
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLinkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    padding: 24,
  },
  content: {
    flex: 1,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    color: '#000',
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
  },
  logoDot: {
    color: '#7126D0',
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
  },
  headerArea: {
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
  },
 subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    lineHeight: 24,
  },
  formArea: {
    flexDirection: 'column',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  forgotBtnText: {
    color: '#7126D0',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  mainBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  mainBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIconBtn: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginHorizontal: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
  },
  footerLinkText: {
    color: '#7126D0',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});

export default Signin;
