import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { User, Mail, Lock, AtSign } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import GoogleLogo from '@/components/GoogleLogo';
import ZikiiiInput from '@/components/ZikiiiInput';
import { setSessionUser } from '@/lib/session';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: { methodType?: 'email' | 'phone'; contactValue?: string } | undefined;
  Verification: { identifier: string; type: 'email' | 'phone'; flow?: 'signup' | 'forgot_password' };
};

type SignUpScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Signup'>;

const Signup: React.FC = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const isEmailValid = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isPhoneValid = (phone: string) => /^\+?[0-9]{10,15}$/.test(phone);
  
  const isStep1Valid = fullName.length > 2 && (isEmailValid(emailOrPhone) || isPhoneValid(emailOrPhone)) && password.length >= 6;
  const isStep2Valid = username.length >= 3;

  const handleNextStep = () => {
    const newErrors: Record<string, string | null> = {};
    
    if (fullName.length <= 2) newErrors.fullName = "Name is too short";
    if (!isEmailValid(emailOrPhone) && !isPhoneValid(emailOrPhone)) newErrors.emailOrPhone = "Invalid email or phone";
    if (password.length < 6) newErrors.password = "Min 6 characters";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handleSignUp = () => {
    if (username.length < 3) {
      setErrors({ username: "Username is too short" });
      return;
    }
    
    console.log('Sign up with:', { fullName, emailOrPhone, password, username });
    
    // Save to global session store
    setSessionUser({ fullName, username, email: emailOrPhone });
    
    const isEmail = isEmailValid(emailOrPhone);
    const methodType = isEmail ? 'email' : 'phone';
    
    navigation.navigate('Verification', { identifier: emailOrPhone, type: methodType });
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Sign up with:', provider);
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
          <Text style={styles.title}>
            {step === 1 ? 'Create an account' : 'Choose a username'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Join us to explore exclusive merchandise from your favorite stars!'
              : 'This will be your unique identity in the Zikiii community.'}
          </Text>
        </View>

        <View style={styles.formArea}>
          {step === 1 ? (
            <>
              <ZikiiiInput
                icon={User}
                placeholder="Full Name"
                value={fullName}
                onChangeText={(text) => { setFullName(text); setErrors({ ...errors, fullName: null }); }}
                error={errors.fullName}
              />
              
              <ZikiiiInput
                icon={Mail}
                placeholder="Email or Phone Number"
                value={emailOrPhone}
                onChangeText={(text) => { setEmailOrPhone(text); setErrors({ ...errors, emailOrPhone: null }); }}
                autoCapitalize="none"
                error={errors.emailOrPhone}
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
                style={[styles.mainBtn, !isStep1Valid && styles.disabledBtn]}
                onPress={handleNextStep}
              >
                <Text style={styles.mainBtnText}>Next</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <ZikiiiInput
                icon={AtSign}
                placeholder="Username"
                value={username}
                onChangeText={(text) => { setUsername(text); setErrors({ ...errors, username: null }); }}
                autoCapitalize="none"
                error={errors.username}
              />

              <TouchableOpacity 
                style={[styles.mainBtn, !isStep2Valid && styles.disabledBtn]}
                onPress={handleSignUp}
              >
                <Text style={styles.mainBtnText}>Create Account</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryBtn}
                onPress={() => setStep(1)}
              >
                <Text style={styles.secondaryBtnText}>Back to Basic Info</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {step === 1 && (
          <>
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
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
                <Text style={styles.footerLinkText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    marginBottom: 8,
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
  mainBtn: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  mainBtnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  secondaryBtnText: {
    color: '#7126D0',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  footerLinkText: {
    color: '#7126D0',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
});

export default Signup;