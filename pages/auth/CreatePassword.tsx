import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

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
  CreatePassword: undefined; // Added to support navigation
};

type CreatePasswordScreenNavigationProp = StackNavigationProp<AppStackParamList, 'CreatePassword'>;

const CreatePassword: React.FC = () => {
  const navigation = useNavigation<CreatePasswordScreenNavigationProp>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePassword = async () => {
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Create new password:', password);
      // Optionally navigate to another screen, e.g., navigation.navigate('Signin');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (error) setError('');
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (error) setError('');
  };

  return (
    <View style={styles.createPasswordScreen}>
      {/* Mobile status bar simulation */}
     

      <View style={styles.createPasswordContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, isLoading ? styles.backBtnDisabled : null]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Svg width={wp('6%')} height={wp('6%')} viewBox="0 0 24 24" fill="none">
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
            <Svg width={wp('6%')} height={wp('6%')} viewBox="0 0 24 24" fill="white">
              <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </Svg>
          </View>
        </View>

        {/* Title and subtitle */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previous used passwords.
          </Text>
        </View>

        {/* Password input form */}
        <View style={styles.createPasswordForm}>
          <View style={styles.inputContainer}>
            <Svg style={styles.inputIcon} width={wp('5%')} height={wp('5%')} viewBox="0 0 24 24" fill="none">
              <Rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <Circle cx="12" cy="16" r="1" fill="currentColor" />
              <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
            </Svg>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Password..."
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Svg style={styles.inputIcon} width={wp('5%')} height={wp('5%')} viewBox="0 0 24 24" fill="none">
              <Rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <Circle cx="12" cy="16" r="1" fill="currentColor" />
              <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
            </Svg>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor="#999"
            />
          </View>

          {error && <Text style={styles.errorMessage}>{error}</Text>}

          <TouchableOpacity
            style={[styles.createPasswordBtn, isLoading || !password || !confirmPassword ? styles.createPasswordBtnDisabled : null]}
            onPress={handleCreatePassword}
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="white" style={styles.spinner} />
                <Text style={styles.createPasswordBtnText}>Creating...</Text>
              </>
            ) : (
              <Text style={styles.createPasswordBtnText}>Create new Password</Text>
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
    position: 'relative',
    paddingHorizontal: 10,
    paddingVertical: 35,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  

  createPasswordContent: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('3%'),
    maxWidth: wp('100%'),
    marginHorizontal: 'auto',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('6%'),
  },
  backBtn: {
    padding: wp('2%'),
    borderRadius: 8,
  },
  backBtnDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('6%'),
  },
  orangeIcon: {
    width: wp('15%'),
    height: wp('15%'),
    backgroundColor: '#FF6B35',
    borderRadius: wp('7.5%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    marginBottom: hp('3.5%'),
  },
  title: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#333',
    marginBottom: hp('2%'),
  },
  subtitle: {
    fontSize: wp('4%'),
    color: '#666',
    lineHeight: wp('5%'),
    textAlign: 'center',
    paddingHorizontal: wp('3%'),
  },
  createPasswordForm: {
    flexDirection: 'column',
    minHeight: hp('25%'),
    gap: 16, // Aligned with SignInScreen/SignUpScreen
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
  },
  inputIcon: {
    position: 'absolute',
    left: wp('4%'),
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('4%'),
    paddingLeft: wp('12%'),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: wp('4%'),
    color: '#333',
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorMessage: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 8,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2.5%'),
    color: '#cc0000',
    fontSize: wp('3.5%'),
    textAlign: 'center',
  },
  createPasswordBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: hp('2%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
    width: '100%',
    marginBottom: hp('5%'),
    marginTop: hp('6%'),
  },
  createPasswordBtnDisabled: {
    backgroundColor: '#FF650E',
  },
  createPasswordBtnText: {
    color: 'white',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  spinner: {
    marginRight: wp('2%'),
  },

});

export default CreatePassword;