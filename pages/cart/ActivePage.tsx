import CartCard from '@/components/cart/InCartCard';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

// Simulated cart state (in a real app this would come from context/store)
const INITIAL_CART = [
  {
    id: 1,
    title: "Indorerwamo merch",
    subtitle: "Black - Medium",
    price: 150.00,
    quantity: 1,
    imageSource: require('../../assets/images/cart/order2.png'),
  },
  {
    id: 2,
    title: "Kendrick's Tour Hoodie",
    subtitle: "White - Large",
    price: 120.00,
    quantity: 1,
    imageSource: require('../../assets/images/cart/order1.jpg'),
  },
];

const ActivePage = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [cartItems, setCartItems] = useState(INITIAL_CART);

  const handleTrackOrder = () => navigation.navigate('TrackOrder');

  const handleDecrease = (id: number) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item)
    );
  };

  const handleIncrease = (id: number) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
    );
  };

  const handleRemove = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    navigation.navigate('CheckoutScreen', {
      fromCart: true,
      cartItems: cartItems,
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 13;
  const total = subtotal + shipping;

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '' }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart items */}
        {cartItems.length > 0 && (
          <>
            {cartItems.map(item => (
              <CartCard
                key={item.id}
                imageSource={item.imageSource}
                title={item.title}
                subtitle={item.subtitle}
                status="In Cart"
                price={fmt(item.price)}
                quantity={item.quantity}
                onQuantityDecrease={() => handleDecrease(item.id)}
                onQuantityIncrease={() => handleIncrease(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </>
        )}

        {/* Order Summary Card */}
        {cartItems.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</Text>
              <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
            </View>
            {/* <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping (Economy)</Text>
              <Text style={styles.summaryValue}>{fmt(shipping)}</Text>
            </View> */}
            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotal}>{fmt(total)}</Text>
            </View>
          </View>
        )}

        {/* Checkout Button */}
        {cartItems.length > 0 && (
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        )}

        {cartItems.length === 0 && (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>Your cart is empty</Text>
            <Text style={styles.emptyCartSub}>Add items from the shop to start shopping</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 0, // Change this value to reduce or increase horizontal padding
    backgroundColor: "#fff"
  },
  sectionLabel: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: '#222',
    marginBottom: 10,
    marginTop: 6,
    fontFamily: 'Poppins-Bold',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginHorizontal: 2
  },
  summaryTitle: {
    fontSize: 16,
    color: '#111',
    marginBottom: 14,
    fontFamily: 'Poppins-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111',
    fontFamily: 'Poppins-Medium',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  summaryTotalLabel: {
    fontSize: 16,
    color: '#111',
    fontFamily: 'Poppins-Bold',
  },
  summaryTotal: {
    fontSize: 18,
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },
  checkoutButton: {
    backgroundColor: '#7126D0',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 0, // added margin to keep it from touching screen edges
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  emptyCart: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptyCartSub: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
});

export default ActivePage;

