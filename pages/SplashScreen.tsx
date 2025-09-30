import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Home: undefined;
};

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const float1Anim = useRef(new Animated.Value(0)).current;
  const float2Anim = useRef(new Animated.Value(0)).current;
  const float3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnBoarding'); // Navigate after 3 seconds
    }, 3000);

    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Float animations for decorative circles
    const createFloatAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: -20,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]);
    };

    pulseAnimation.start();
    createFloatAnimation(float1Anim, 0).start();
    createFloatAnimation(float2Anim, 2000).start();
    createFloatAnimation(float3Anim, 4000).start();

    return () => {
      clearTimeout(timer);
      pulseAnimation.stop();
    };
  }, [navigation, pulseAnim, float1Anim, float2Anim, float3Anim]);

  const LogoIcon = () => (
   <Svg width="44" height="44" viewBox="0 0 44 44" fill="none">
<Path d="M33.6299 19.3103C33.0035 19.9394 32.5239 20.6988 32.2251 21.534C31.9263 22.3694 31.8158 23.2603 31.9012 24.1432L31.8714 24.1135C31.9594 25.1529 31.8189 26.1987 31.4601 27.1783C31.1013 28.1577 30.5328 29.0473 29.7942 29.7848C29.0555 30.5222 28.1645 31.09 27.1833 31.4481C26.2023 31.8063 25.1547 31.9465 24.1138 31.8588L24.1436 31.8885C22.8985 31.7728 21.6479 32.0432 20.5623 32.6631C19.4768 33.2831 18.6091 34.2221 18.0778 35.3524C17.5465 36.4826 17.3771 37.7489 17.5929 38.9788C17.8089 40.2086 18.3994 41.342 19.2841 42.2244C20.1688 43.1069 21.3045 43.6954 22.5364 43.9098C23.7684 44.1243 25.0365 43.954 26.1681 43.4225C27.2997 42.8909 28.2394 42.024 28.8593 40.9395C29.4792 39.8551 29.7491 38.6064 29.6321 37.3633L29.6635 37.393C29.5756 36.3538 29.7159 35.3078 30.0747 34.3282C30.4335 33.3487 31.0021 32.4592 31.7407 31.7216C32.4795 30.9842 33.3704 30.4165 34.3514 30.0584C35.3326 29.7002 36.3801 29.5599 37.4211 29.6477L37.3897 29.618C38.4067 29.7093 39.4306 29.5428 40.3661 29.1339C41.3016 28.725 42.1186 28.0869 42.7414 27.2789C43.3641 26.4709 43.7726 25.5188 43.9286 24.5113C44.0848 23.5037 43.9837 22.473 43.6346 21.5147C43.2856 20.5565 42.6999 19.7018 41.9319 19.0298C41.1639 18.3577 40.2384 17.8901 39.2412 17.6703C38.244 17.4505 37.2072 17.4855 36.2272 17.7721C35.2472 18.0589 34.3556 18.5879 33.6348 19.3103H33.6299Z" fill="white"/>
<Path d="M21.4384 27.9977L21.407 27.968C22.2917 28.0569 23.1851 27.9485 24.0229 27.6505C24.8604 27.3525 25.6213 26.8725 26.2503 26.245C26.8792 25.6175 27.3608 24.8582 27.6597 24.0221C27.9589 23.186 28.0681 22.2942 27.9797 21.4108L28.0111 21.4405C27.9232 20.4011 28.0636 19.3553 28.4223 18.3757C28.7811 17.3962 29.3497 16.5067 30.0883 15.7691C30.8271 15.0317 31.718 14.464 32.699 14.1059C33.6802 13.7476 34.7277 13.6075 35.7687 13.6952L35.7373 13.6655C36.9826 13.7823 38.2335 13.5126 39.3196 12.8935C40.4059 12.2743 41.2742 11.3356 41.8064 10.2055C42.3385 9.07551 42.5086 7.80906 42.2934 6.57894C42.0782 5.34882 41.4882 4.21495 40.6037 3.33196C39.7194 2.44897 38.5837 1.85985 37.3516 1.64498C36.1195 1.43009 34.8511 1.5999 33.7192 2.13124C32.5873 2.66257 31.6473 3.52958 31.027 4.614C30.4068 5.6984 30.1367 6.94743 30.2537 8.19069L30.224 8.15934C30.3121 9.19868 30.1719 10.2447 29.8133 11.2244C29.4547 12.204 28.886 13.0937 28.1474 13.8313C27.4087 14.5687 26.5176 15.1365 25.5364 15.4946C24.555 15.8526 23.5074 15.9925 22.4664 15.9046L22.4961 15.9359C21.6115 15.847 20.7179 15.9554 19.8803 16.2534C19.0427 16.5512 18.2818 17.0314 17.6528 17.6589C17.0238 18.2864 16.5424 19.0458 16.2433 19.8818C15.9443 20.7179 15.8351 21.6098 15.9235 22.4932L15.8937 22.4635C15.9813 23.5027 15.8407 24.5485 15.4819 25.5279C15.1229 26.5072 14.5544 27.3967 13.8159 28.1341C13.0772 28.8715 12.1864 29.4392 11.2054 29.7975C10.2244 30.1558 9.177 30.2962 8.13614 30.2087L8.16589 30.2384C6.92064 30.1216 5.66962 30.3912 4.58347 31.0105C3.49734 31.6297 2.62895 32.5683 2.09678 33.6984C1.56458 34.8285 1.39449 36.0949 1.60972 37.325C1.82495 38.5551 2.41501 39.689 3.2994 40.5719C4.18381 41.455 5.31949 42.0441 6.55157 42.2589C7.78364 42.4738 9.05211 42.304 10.184 41.7727C11.3158 41.2413 12.256 40.3744 12.8761 39.29C13.4964 38.2055 13.7664 36.9565 13.6494 35.7132L13.6808 35.7429C13.5929 34.7036 13.7334 33.6578 14.0922 32.6782C14.4508 31.6987 15.0195 30.8092 15.7581 30.0716C16.4968 29.3342 17.3878 28.7664 18.3688 28.4084C19.35 28.0502 20.3974 27.9099 21.4384 27.9977Z" fill="white"/>
<Path d="M10.362 24.6861C10.9884 24.0571 11.468 23.2978 11.7665 22.4623C12.0651 21.6269 12.1752 20.7359 12.0891 19.8531L12.1205 19.8828C12.0325 18.8433 12.1729 17.797 12.5319 16.8173C12.8909 15.8375 13.4598 14.9478 14.1989 14.2102C14.9379 13.4727 15.8292 12.9051 16.8107 12.5471C17.7922 12.1891 18.8402 12.0493 19.8814 12.1376L19.85 12.1079C21.0948 12.2243 22.3453 11.9546 23.431 11.3354C24.5166 10.7163 25.3844 9.77785 25.9164 8.64815C26.4482 7.51844 26.6181 6.25245 26.403 5.0228C26.1878 3.79315 25.5978 2.65971 24.7138 1.77704C23.8298 0.894368 22.6944 0.305438 21.4628 0.0905711C20.2313 -0.124313 18.9632 0.0453437 17.8318 0.576357C16.7002 1.10737 15.7603 1.97392 15.1402 3.05783C14.52 4.14173 14.2498 5.39025 14.3664 6.63308L14.3367 6.60338C14.4246 7.64266 14.2841 8.68856 13.9253 9.66809C13.5666 10.6476 12.9981 11.5372 12.2594 12.2747C11.5207 13.0122 10.6298 13.5798 9.64867 13.9379C8.66758 14.2962 7.62002 14.4364 6.57909 14.3486L6.60884 14.3783C5.59174 14.2873 4.56806 14.4541 3.63269 14.8631C2.69731 15.2722 1.88048 15.9104 1.25791 16.7186C0.635332 17.5266 0.227157 18.4787 0.0711784 19.4862C-0.0847835 20.4939 0.0165083 21.5245 0.365667 22.4825C0.714825 23.4406 1.30058 24.2952 2.06862 24.9671C2.83666 25.6392 3.76216 26.1066 4.75934 26.3264C5.75651 26.546 6.79311 26.5109 7.77309 26.2243C8.75305 25.9375 9.64467 25.4085 10.3653 24.6861H10.362Z" fill="white"/>
</Svg>

  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <View style={styles.splashScreen}>
        <Animated.View
          style={[styles.circle, styles.circle1, { transform: [{ translateY: float1Anim }] }]}
        />
        <Animated.View
          style={[styles.circle, styles.circle2, { transform: [{ translateY: float2Anim }] }]}
        />
        <Animated.View
          style={[styles.circle, styles.circle3, { transform: [{ translateY: float3Anim }] }]}
        />

        <View style={styles.splashContent}>
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoIcon, { transform: [{ scale: pulseAnim }] }]}>
              <LogoIcon />
            </Animated.View>
            <Text style={styles.logoText}>CelebStash</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    width,
    height,
    backgroundColor: '#FF650E',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  splashContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  logoIcon: {},
  logoText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: height * 0.1,
    left: -60,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: height * 0.2,
    right: -40,
  },
  circle3: {
    width: 60,
    height: 60,
    top: height * 0.6,
    left: width * 0.1,
  },
});
