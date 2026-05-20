import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Mail, Lock } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleLogo from '@/components/GoogleLogo';
import ZikiiiInput from '@/components/ZikiiiInput';

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
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const isEmailValid = (e: string) => /\S+@\S+\.\S+/.test(e);
  const isFormValid = isEmailValid(email) && password.length >= 6;

  const handleSignIn = () => {
    const newErrors: Record<string, string | null> = {};
    
    if (!isEmailValid(email)) newErrors.email = "Invalid email";
    if (password.length < 6) newErrors.password = "Min 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Sign in with:', { email, password });
      if (email.toLowerCase() === 'artist@zikiii.com') {
        navigation.navigate('ArtHome');
      } else {
        navigation.navigate('Home');
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
            <View style={styles.logoBox}>
              <Ionicons name="flash" size={18} color="white" />
            </View>
            <Text style={styles.logoText}>Zikiii</Text>
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

          <TouchableOpacity 
            style={[styles.mainBtn, !isFormValid && styles.disabledBtn]}
            onPress={handleSignIn}
          >
            <Text style={styles.mainBtnText}>Sign In</Text>
          </TouchableOpacity>

          {/* Quick Demo Logins Section */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoLabel}>Quick Demo Logins</Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity 
                style={styles.demoBtn} 
                onPress={() => { setEmail('user@zikiii.com'); setPassword('password123'); }}
              >
                <Text style={styles.demoBtnText}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.demoBtn, styles.demoBtnArtist]} 
                onPress={() => { setEmail('artist@zikiii.com'); setPassword('password123'); }}
              >
                <Text style={[styles.demoBtnText, styles.demoBtnTextArtist]}>Artist</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    alignItems: 'center',
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: '#7126D0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#7126D0',
    fontSize: 28,
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
  demoContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    marginBottom: 12,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnArtist: {
    backgroundColor: '#7126D0',
  },
  demoBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },
  demoBtnTextArtist: {
    color: 'white',
  },
});

export default Signin;