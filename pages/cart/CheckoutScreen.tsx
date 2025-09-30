import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import CheckoutCard from '@/components/cart/CheckoutCard';
import ShippingCard from '@/components/cart/ShippingCard';
import PromoCode from '@/components/cart/PromoCode';
import MainButton from '@/components/buttons/Mainbutton';


const { width, height } = Dimensions.get('window');

const CheckoutScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const handleTrackOrder = () => console.log('Tracking order...');
  const handlePayment = ()  => navigation.navigate('PaymentMethods')

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Checkout</Text>

        <View style={styles.iconButton} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.05 }} // adds space at bottom
      >
        <CheckoutCard
          imageSource={require('../../assets/images/cart/order2.png')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="In cart"
          price="$150.00"
          buttonText="1"
          onButtonPress={handleTrackOrder}
          buttonStyle={{ backgroundColor: '#8F959E57'}}
          buttonTextStyle={{color: '#000' }}
        />
        <ShippingCard />
        <PromoCode />
        <MainButton
          total=""
          label="Continue to Payment"
          arrow={'\u2192'}
          onPress={handlePayment}
          buttonStyle={{ backgroundColor: '#FF650E' }} 
          totalStyle={{ fontSize: 20 }} 
          labelStyle={{ fontWeight: 'bold' }} 
          arrowStyle={{ fontSize: 24 }} 
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04,
    backgroundColor: '#f5f8faff',
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {
    padding: width * 0.015,
  },
});

export default CheckoutScreen;
