import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Polyline, Rect } from 'react-native-svg';

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Send reset email to:', email);
      navigation.navigate('CreatePassword', { email });
    } catch {
      // Handle error if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.forgotPasswordScreen}>
     

      <View style={styles.forgotPasswordContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, isLoading ? styles.backBtnDisabled : null]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Orange icon */}
        <View style={styles.iconContainer}>
          <View style={styles.orangeIcon}>
           <Svg width="50" height="50" viewBox="0 0 50 50" fill="none">
<Rect width="50" height="50" rx="25" fill="#FF650E"/>
<Path d="M24 15C22.6739 15 21.4021 15.5268 20.4645 16.4645C19.5268 17.4021 19 18.6739 19 20C19 21.3261 19.5268 22.5979 20.4645 23.5355C21.4021 24.4732 22.6739 25 24 25C25.3261 25 26.5979 24.4732 27.5355 23.5355C28.4732 22.5979 29 21.3261 29 20C29 18.6739 28.4732 17.4021 27.5355 16.4645C26.5979 15.5268 25.3261 15 24 15ZM24 26C21.605 26 19.425 26.694 17.822 27.672C17.022 28.16 16.338 28.736 15.844 29.362C15.358 29.976 15 30.713 15 31.5C15 32.345 15.411 33.011 16.003 33.486C16.563 33.936 17.302 34.234 18.087 34.442C19.665 34.859 21.771 35 24 35L24.685 34.995C24.8525 34.9927 25.0167 34.9484 25.1626 34.8661C25.3085 34.7838 25.4313 34.6662 25.5199 34.524C25.6085 34.3819 25.66 34.2198 25.6696 34.0525C25.6792 33.8853 25.6467 33.7184 25.575 33.567C25.1958 32.7644 24.9994 31.8877 25 31C25 29.748 25.383 28.588 26.037 27.627C26.1342 27.4842 26.1928 27.3186 26.207 27.1465C26.2212 26.9743 26.1905 26.8014 26.118 26.6446C26.0455 26.4878 25.9336 26.3524 25.7932 26.2517C25.6528 26.151 25.4888 26.0884 25.317 26.07C24.8863 26.0233 24.4473 26 24 26ZM31.316 27.051C31.1109 26.9827 30.8891 26.9827 30.684 27.051L27.684 28.051C27.4848 28.1173 27.3115 28.2447 27.1888 28.415C27.066 28.5854 26.9999 28.79 27 29V30.671C26.9999 31.7406 27.3942 32.7727 28.1075 33.5698C28.8207 34.3668 29.8029 34.8729 30.866 34.991C30.956 35.001 31.0453 35.001 31.134 34.991C32.1971 34.8729 33.1793 34.3668 33.8925 33.5698C34.6058 32.7727 35.0001 31.7406 35 30.671V29C35.0001 28.79 34.934 28.5854 34.8112 28.415C34.6885 28.2447 34.5152 28.1173 34.316 28.051L31.316 27.051Z" fill="white"/>
</Svg>

          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don&apos;t worry! It happens. Please enter the address associated with your account
          </Text>
        </View>

        {/* Email input form */}
        <View style={styles.forgotForm}>
          <View style={styles.inputContainer}>
            <Svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <Polyline
                points="22,6 12,13 2,6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </Svg>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendEmailBtn, isLoading || !email ? styles.sendEmailBtnDisabled : null]}
            onPress={handleSendEmail}
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" style={styles.spinner} />
                <Text style={styles.sendEmailBtnText}>Sending...</Text>
              </>
            ) : (
              <Text style={styles.sendEmailBtnText}>Send me email</Text>
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
    position: 'relative',
    paddingHorizontal: 10,
    paddingVertical: 35,
  },
  forgotPasswordContent: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingVertical: 24,
    maxWidth: 400,
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  backBtn: {
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  orangeIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#FF6B35',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  forgotForm: {
    flexDirection: 'column',
    minHeight: 200,
    gap: 16, // Aligned with SignInScreen/SignUpScreen
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'white',
  },
  sendEmailBtn: {
    backgroundColor: '#FF650E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 40,
  },
  sendEmailBtnDisabled: {
    backgroundColor: '#FF650E',
  },
  sendEmailBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spinner: {
    marginRight: 8,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
  },
});

export default ForgotPassword;