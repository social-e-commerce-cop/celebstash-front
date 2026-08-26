import React, { useEffect } from 'react';
import { Platform } from 'react-native';

// Polyfill codegenNativeComponent for web/SSR to avoid crashes in packages like react-native-screens
if (Platform.OS === 'web' || typeof window === 'undefined') {
  try {
    const RN = require('react-native');
    if (RN && !RN.codegenNativeComponent) {
      RN.codegenNativeComponent = () => () => null;
    }
  } catch (e) {
    // Ignore
  }
}

import * as NavigationBar from 'expo-navigation-bar';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';

import { useNavigation } from '@react-navigation/native';

import Onboarding from '@/pages/Onboarding';
import SplashScreen from '@/pages/SplashScreen';
import Signin from '@/pages/auth/Signin';
import Signup from '@/pages/auth/Signup';
import VerifyAccount from '@/pages/auth/VerifyAccount';
import PhoneNumber from '@/pages/auth/PhoneNumber';
import EmailAdressScreen from '@/pages/auth/EmailScreen';
import CodeVerification from '@/pages/auth/CodeVerification';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import CreatePassword from '@/pages/auth/CreatePassword';

import HomeScreen from '@/pages/HomeScreen';
import BrowseScreen from '@/pages/home/BrowseScreen';
import MusicScreen from '@/pages/home/MusicScreen';
import ProfileDetails from '@/pages/home/ProfileDetails';
import Drops from '@/pages/home/Drops';
import ShopScreen from '@/pages/home/ShopScreen';

import ProductDetails from '@/pages/product/ProductDetails';
import ProductReviews from '@/pages/product/ProductReviews';
import TrackOrder from '@/pages/product/TrackOrder';

import Cart from '@/pages/cart/CartScreen';
import ActivePage from '@/pages/cart/ActivePage';
import CompletePage from '@/pages/cart/CompletePage';
import CheckoutScreen from '@/pages/cart/CheckoutScreen';

import PaymentMethods from '@/pages/payment/PaymentMethods';
import PinEntry from '@/pages/payment/PaymentConfirmation';

import EwalletScreen from '@/pages/wallet/WalletScreen';
import AddWalletScreen from '@/pages/wallet/AddWalletScreen';
import TransactionsSearch from '@/pages/wallet/TransactionHistory';
import TransactionsDetails from '@/pages/wallet/TransactionDetails';
import TopUpScreen from '@/pages/wallet/TopupWallet';
import TopupPinEntry from '@/pages/wallet/TopupConfirmation';
import ManageCardsScreen from '@/pages/wallet/ManageCardsScreen';
import AddCardScreen from '@/pages/wallet/AddCardScreen';

import Messages from '@/pages/message/Messages';
import Notifications from '@/pages/message/Notifications';

import MyProfile from '@/pages/profile/MyProfile';
import SettingsScreen from '@/pages/profile/Settings';
import EditProfile from '@/pages/profile/EditProfile';
import FieldEdit from '@/pages/profile/FieldEdit';
import Address from '@/pages/profile/Address';
import AddAddressForm from '@/pages/profile/AddAddressScreen';
import NotificationScreen from '@/pages/profile/Notifications';
import Security from '@/pages/profile/Security';
import Wallet from '@/pages/profile/Wallet';
import PrivacyScreen from '@/pages/profile/Privacy';
import LanguageScreen from '@/pages/profile/Language';
import BecomeArtist from '@/pages/profile/BecomeArtist';
import AdminArtistApplications from '@/pages/admin/AdminArtistApplications';

import CreatePostScreen from '@/pages/Artist/profile/AddPost';
import ArtistHomeScreen from '@/pages/Artist/Home/HomeArtist';
import ArtProfile from '@/pages/Artist/profile/ArtProfile';
import Post from '@/pages/Artist/profile/Post';
import Available from '@/pages/Artist/profile/Available';
import SoldOut from '@/pages/Artist/profile/SoldOut';
import CreateTribeScreen from '@/pages/Artist/profile/AddTribe';
import ArtSettingsScreen from '@/pages/Artist/ArtSettings';
import Dashboard from '@/pages/Artist/Dashboard/Dashboard';

import MessagesScreen from '@/pages/messages/MessageScreen';
import ChatScreen from '@/pages/messages/ChatScreen';
import AllReleasesScreen from '@/pages/music/AllReleasesScreen';
import LibraryScreen from '@/pages/music/LibraryScreen';

type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Verify: undefined;
  PhoneNumber: undefined;
  Email: undefined;
  Verification: { identifier: string; type: 'email' | 'phone'; flow?: 'signup' | 'forgot_password' };
  ForgotPassword: undefined;
  CreatePassword: { email: string };
  Home: undefined;
  Browse: { initialQuery?: string };
  Music: { initialQuery?: string };
  Drops: undefined;
  Shop: undefined;
  ProfileDetails: { story: { username: string; time: string; image: any } };
  ProductDetails: {
    name?: string;
    price?: string | number;
    image?: any;
    description?: string;
    artistName?: string;
    verified?: boolean;
  };
  ProductReviews: undefined;
  CartScreen: undefined;
  ActivePage: undefined;
  CompletePage: undefined;
  CheckoutScreen: {
    name?: string;
    price?: string | number;
    image?: any;
    artistName?: string;
    selectedSize?: string;
    selectedColor?: string;
    selectedColorValue?: string;
  };
  PaymentMethods: undefined;
  PinEntry: undefined;
  TrackOrder: undefined;
  Ewallet: undefined;
  TransactionSearch: undefined;
  TransactionDetails: { transactionId: string } | undefined;
  TopupWallet: undefined;
  TopupConfirmation: {
    amount: string;
    paymentMethodType: 'card' | 'momo';
    // Card params
    cardId?: string;
    cardLast4?: string;
    cardBrand?: string;
    cardHolder?: string;
    maskedNumber?: string;
    // MoMo params
    momoProvider?: 'MTN' | 'Airtel';
    phoneNumber?: string;
  } | undefined;
  AddWalletScreen: undefined;
  ManageCards: undefined;
  AddCard: { returnTo?: string } | undefined;
  Messages: undefined;
  Notifications: undefined;
  MyProfile: undefined;
  Settings: undefined;
  ArtSettings: undefined;
  EditProfile: undefined;
  FieldEdit: undefined;
  AddressSetting: undefined;
  AddAddress: undefined;
  NotificationSettings: undefined;
  Security: undefined;
  Wallet: undefined;
  Privacy: undefined;
  Language: undefined;
  BecomeArtist: undefined;
  AdminArtistApplications: undefined;
  CreatePost: undefined;
  CreateTribe: undefined;
  ArtHome: undefined;
  ArtProfile: undefined;
  Post: undefined;
  Soldout: undefined;
  Available: undefined;
  Dashboard: undefined;
  MessagesScreen: undefined;
  ChatScreen: { conversationId: string };
  CreateGroupScreen: undefined;
  ChatInfoScreen: { conversationId: string };
  GroupSettingsScreen: { conversationId: string };
  SharedMediaScreen: { conversationId: string; initialTab?: string };
  VoiceCallScreen: { name: string; avatar: any };
  VideoCallScreen: { name: string; avatar: any };
  AllReleases: undefined;
  Library: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

const SplashScreenWrapper = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('OnBoarding');
    }, 7000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return <SplashScreen />;
};

export default function App() {
  useEffect(() => {
    async function hideSystemNavBar() {
      if (Platform.OS === 'android') {
        try {
          await NavigationBar.setVisibilityAsync('hidden');
        } catch (error) {
          console.log('Error hiding navigation bar:', error);
        }
      }
    }
    hideSystemNavBar();
  }, []);

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreenWrapper} />
        <Stack.Screen name="OnBoarding" component={Onboarding} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Verify" component={VerifyAccount} />
        <Stack.Screen name="PhoneNumber" component={PhoneNumber} />
        <Stack.Screen name="Email" component={EmailAdressScreen} />
        <Stack.Screen name="Verification" component={CodeVerification} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="CreatePassword" component={CreatePassword} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Browse" component={BrowseScreen} />
        <Stack.Screen name="Music" component={MusicScreen} />
        <Stack.Screen name="Drops" component={Drops} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="ProductReviews" component={ProductReviews} />
        <Stack.Screen name="CartScreen" component={Cart} />
        <Stack.Screen name="ActivePage" component={ActivePage} />
        <Stack.Screen name="CompletePage" component={CompletePage} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="PinEntry" component={PinEntry} />
        <Stack.Screen name="TrackOrder" component={TrackOrder} />
        <Stack.Screen name="Ewallet" component={EwalletScreen} />
        <Stack.Screen name="TransactionSearch" component={TransactionsSearch} />
        <Stack.Screen name="TransactionDetails" component={TransactionsDetails} />
        <Stack.Screen name="TopupWallet" component={TopUpScreen} />
        <Stack.Screen name="TopupConfirmation" component={TopupPinEntry} />
        <Stack.Screen name="AddWalletScreen" component={AddWalletScreen} />
        <Stack.Screen name="ManageCards" component={ManageCardsScreen} />
        <Stack.Screen name="AddCard" component={AddCardScreen} />
        <Stack.Screen name="Messages" component={Messages} />
        <Stack.Screen name="Notifications" component={Notifications} />
        <Stack.Screen name="MyProfile" component={MyProfile} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ArtSettings" component={ArtSettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="FieldEdit" component={FieldEdit} />
        <Stack.Screen name="AddressSetting" component={Address} />
        <Stack.Screen name="AddAddress" component={AddAddressForm} />
        <Stack.Screen name="NotificationSettings" component={NotificationScreen} />
        <Stack.Screen name="Security" component={Security} />
        <Stack.Screen name="Wallet" component={Wallet} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="BecomeArtist" component={BecomeArtist} />
        <Stack.Screen name="AdminArtistApplications" component={AdminArtistApplications} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="CreateTribe" component={CreateTribeScreen} />
        <Stack.Screen name="ArtHome" component={ArtistHomeScreen} />
        <Stack.Screen name="ArtProfile" component={ArtProfile} />
        <Stack.Screen name="Post" component={Post} />
        <Stack.Screen name="Available" component={Available} />
        <Stack.Screen name="Soldout" component={SoldOut} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="MessagesScreen" component={MessagesScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="CreateGroupScreen" component={require('../pages/messages/CreateGroupScreen').default} />
        <Stack.Screen name="ChatInfoScreen" component={require('../pages/messages/ChatInfoScreen').default} />
        <Stack.Screen name="GroupSettingsScreen" component={require('../pages/messages/GroupSettingsScreen').default} />
        <Stack.Screen name="SharedMediaScreen" component={require('../pages/messages/SharedMediaScreen').default} />
        <Stack.Screen name="VoiceCallScreen" component={require('../pages/messages/VoiceCallScreen').default} />
        <Stack.Screen name="VideoCallScreen" component={require('../pages/messages/VideoCallScreen').default} />

        <Stack.Screen name="AllReleases" component={AllReleasesScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
      </Stack.Navigator>
  );
}
