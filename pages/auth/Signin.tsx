import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Polyline, Rect, Circle } from 'react-native-svg';

// Define the navigation stack param list
type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
   ForgotPassword: undefined;
   Home: undefined;
};

type SignInScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Signin'>;

const Signin: React.FC = () => {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    console.log('Sign in with:', { email, password });
    navigation.navigate('Home');
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Sign in with:', provider);
  };

  return (
    <View style={styles.signinScreen}>
      <View style={styles.signinContent}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Svg width="24" height="25" viewBox="0 0 24 25" fill="none">
              <Path
                d="M18.3436 11.0328C18.0019 11.376 17.7403 11.7901 17.5773 12.2457C17.4144 12.7014 17.354 13.1873 17.4007 13.6689L17.3844 13.6527C17.4324 14.2197 17.3558 14.7901 17.1601 15.3244C16.9643 15.8587 16.6542 16.3439 16.2514 16.7462C15.8484 17.1484 15.3625 17.4581 14.8273 17.6534C14.2922 17.8488 13.7207 17.9253 13.153 17.8774L13.1692 17.8936C12.4901 17.8305 11.8079 17.978 11.2158 18.3162C10.6237 18.6543 10.1504 19.1665 9.86063 19.783C9.57081 20.3995 9.47841 21.0902 9.59614 21.7611C9.71396 22.4319 10.036 23.0501 10.5186 23.5314C11.0011 24.0127 11.6206 24.3338 12.2926 24.4507C12.9646 24.5677 13.6563 24.4748 14.2735 24.1849C14.8907 23.8949 15.4033 23.4221 15.7414 22.8306C16.0796 22.2391 16.2268 21.5579 16.163 20.8799L16.1801 20.8961C16.1321 20.3292 16.2087 19.7587 16.4044 19.2244C16.6001 18.6901 16.9103 18.2049 17.3131 17.8026C17.7161 17.4004 18.202 17.0907 18.7371 16.8954C19.2723 16.7 19.8437 16.6235 20.4115 16.6714L20.3944 16.6552C20.9491 16.705 21.5076 16.6141 22.0179 16.3911C22.5281 16.1681 22.9738 15.8201 23.3135 15.3793C23.6531 14.9386 23.876 14.4193 23.9611 13.8697C24.0463 13.3201 23.9911 12.7579 23.8007 12.2352C23.6103 11.7126 23.2908 11.2464 22.8719 10.8798C22.453 10.5132 21.9482 10.2581 21.4043 10.1383C20.8603 10.0184 20.2949 10.0374 19.7603 10.1938C19.2257 10.3502 18.7394 10.6388 18.3463 11.0328H18.3436Z"
                fill="#FF650E"
              />
              <Path
                d="M11.6937 15.7715L11.6766 15.7553C12.1592 15.8038 12.6465 15.7447 13.1034 15.5821C13.5603 15.4196 13.9753 15.1578 14.3184 14.8155C14.6614 14.4732 14.9241 14.059 15.0872 13.603C15.2503 13.1469 15.3099 12.6605 15.2617 12.1786L15.2788 12.1948C15.2309 11.6279 15.3075 11.0575 15.5031 10.5231C15.6988 9.98887 16.009 9.50367 16.4118 9.10137C16.8148 8.69915 17.3008 8.38945 17.8359 8.19415C18.3711 7.99872 18.9424 7.92228 19.5102 7.97013L19.4931 7.95393C20.1724 8.01765 20.8547 7.87055 21.4471 7.53281C22.0396 7.19507 22.5132 6.68308 22.8035 6.06668C23.0938 5.4503 23.1865 4.75951 23.0692 4.08854C22.9518 3.41756 22.63 2.79909 22.1475 2.31745C21.6652 1.83583 21.0457 1.51448 20.3736 1.39728C19.7016 1.28007 19.0097 1.37269 18.3923 1.66252C17.7749 1.95233 17.2622 2.42525 16.9239 3.01675C16.5856 3.60824 16.4383 4.28953 16.5021 4.96767L16.4859 4.95057C16.5339 5.51748 16.4575 6.08804 16.2618 6.6224C16.0662 7.15676 15.756 7.64204 15.3532 8.04438C14.9502 8.4466 14.4642 8.7563 13.929 8.9516C13.3937 9.14691 12.8223 9.22323 12.2544 9.17526L12.2707 9.19236C11.7881 9.14385 11.3007 9.20298 10.8438 9.36552C10.387 9.52797 9.97196 9.78988 9.62887 10.1322C9.28577 10.4744 9.02318 10.8886 8.86002 11.3447C8.69694 11.8007 8.63736 12.2872 8.68559 12.769L8.66936 12.7528C8.71714 13.3197 8.64042 13.8901 8.44472 14.4243C8.24892 14.9585 7.93882 15.4437 7.53596 15.8459C7.13307 16.2481 6.64715 16.5577 6.11208 16.7532C5.57701 16.9486 5.00568 17.0252 4.43794 16.9775L4.45416 16.9937C3.77494 16.93 3.09256 17.0771 2.50012 17.4148C1.90769 17.7526 1.43402 18.2645 1.14374 18.881C0.853454 19.4974 0.760677 20.1881 0.878073 20.8591C0.995469 21.5301 1.31732 22.1486 1.79972 22.6302C2.28212 23.1119 2.90158 23.4332 3.57363 23.5503C4.24567 23.6675 4.93756 23.5749 5.55494 23.2851C6.17231 22.9953 6.68512 22.5224 7.0234 21.9309C7.36171 21.3394 7.50901 20.6581 7.44519 19.98L7.46231 19.9962C7.41436 19.4293 7.49098 18.8588 7.68669 18.3245C7.8823 17.7902 8.19249 17.305 8.59535 16.9027C8.9983 16.5005 9.48427 16.1908 10.0194 15.9955C10.5546 15.8001 11.1259 15.7236 11.6937 15.7715Z"
                fill="#FF650E"
              />
              <Path
                d="M5.65202 13.9651C5.99369 13.6221 6.25527 13.2079 6.41811 12.7522C6.58095 12.2965 6.64102 11.8105 6.59404 11.329L6.61116 11.3452C6.5632 10.7782 6.63979 10.2075 6.83559 9.67305C7.0314 9.13861 7.34171 8.65333 7.74483 8.25102C8.14796 7.84873 8.63412 7.53913 9.16949 7.34387C9.70486 7.1486 10.2765 7.07237 10.8444 7.12051L10.8273 7.1043C11.5062 7.16782 12.1884 7.02068 12.7805 6.68295C13.3727 6.34524 13.8461 5.83337 14.1362 5.21717C14.4263 4.60097 14.519 3.91043 14.4016 3.23971C14.2842 2.56899 13.9624 1.95075 13.4802 1.46929C12.9981 0.987837 12.3788 0.666603 11.707 0.549402C11.0352 0.432193 10.3435 0.524733 9.72641 0.814377C9.10919 1.10402 8.59653 1.57668 8.2583 2.1679C7.91999 2.75913 7.7726 3.44013 7.83624 4.11805L7.82002 4.10185C7.86797 4.66872 7.79135 5.23922 7.59564 5.7735C7.39994 6.30779 7.08986 6.793 6.68694 7.19527C6.28404 7.59754 5.79805 7.90717 5.26291 8.10251C4.72777 8.29791 4.15637 8.37441 3.58859 8.32653L3.60482 8.34273C3.05004 8.29305 2.49167 8.38404 1.98147 8.60715C1.47126 8.83027 1.02572 9.1784 0.686131 9.61922C0.346545 10.06 0.123904 10.5793 0.0388246 11.1288C-0.0462455 11.6785 0.00900453 12.2406 0.199455 12.7632C0.389905 13.2858 0.709407 13.7519 1.12834 14.1184C1.54727 14.485 2.05209 14.74 2.596 14.8598C3.13991 14.9796 3.70533 14.9605 4.23987 14.8041C4.77439 14.6477 5.26073 14.3592 5.65382 13.9651H5.65202Z"
                fill="#FF650E"
              />
            </Svg>
            <Text style={styles.logoText}>CelebStash</Text>
          </View>
        </View>
        <View style={styles.mb8}>
          <Text style={styles.formHeaderTitle}>Sign In</Text>
          <Text style={styles.formHeaderText}>Welcome back, you&apos;ve been missed!</Text>
        </View>
        <View style={styles.formSection}>
          <View style={styles.signinForm}>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                  <Path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <Polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none" />
                </Svg>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
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
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.forgotPassword}>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotLink}>Forgot your password?</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.signinBtn} onPress={handleSignIn}>
              <Text style={styles.signinBtnText}>Sign In</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider}>
            <Text style={styles.dividerText}>Or continue with</Text>
          </View>
          <View style={styles.socialLogin}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('google')}>
              <Svg width="20" height="20" viewBox="0 0 24 24">
                <Path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <Path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <Path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <Path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('facebook')}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleSocialLogin('apple')}>
              <Svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </Svg>
            </TouchableOpacity>
          </View>
          <View style={styles.signupLink}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLinkText}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
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
    paddingTop: 20,
    alignItems: 'center',
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoText: {
    color: '#FF650E',
    fontSize: 20,
    fontWeight: '700',
  },
  mb8: {
    alignItems: "flex-start",
   marginTop: 32,
  },
  formHeaderTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  formHeaderText: {
    fontSize: 15,
    color: '#8F959E',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
  },
  signinForm: {
    flexDirection: 'column',
    gap: 36,
  },
  inputGroup: {
    flexDirection: 'column',
    gap: 4,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    color: '#999',
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: 15,
    paddingLeft: 48,
    paddingRight: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  forgotLink: {
    color: '#FF650E',
    fontSize: 14,
    fontWeight: '500',
  },
  signinBtn: {
    backgroundColor: '#FF650E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signinBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    alignItems: 'center',
    marginTop: 45,
    marginBottom: 8,
  },
  dividerText: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    color: '#FF650E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  socialLogin: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  socialBtn: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 56,
  },
  signupText: {
    fontSize: 14,
    color: '#666',
  },
  signupLinkText: {
    color: '#FF650E',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Signin;