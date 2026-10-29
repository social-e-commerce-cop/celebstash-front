import CartCard from '@/components/cart/InCartCard';
import React from 'react';
import {
  ScrollView, View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart, refreshCart, updateCartQuantity, removeFromCart } from '@/lib/cartStore';
import { resolveImageUrl } from '@/lib/apiClient';
import { isAuthenticated } from '@/lib/session';
import type { CartItem } from '@/lib/cartService';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';
const PLACEHOLDER = require('../../assets/images/products/product1.jpg');

const fmt = (n: number | undefined | null) => `$${Number(n ?? 0).toFixed(2)}`;

const variantLabel = (item: CartItem) =>
  [item.selectedColor, item.selectedSize ? `Size ${item.selectedSize}` : null].filter(Boolean).join(' - ');

const ActivePage = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { cart, loading, error, pending } = useCart();
  const items = cart?.items ?? [];
  const hasUnavailable = items.some(i => i.available === false);

  // Every change goes to the server first; the list re-renders from the server's answer.
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (err: any) {
      Alert.alert('Cart not updated', err?.message || 'Please try again.');
    }
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity <= 1) return;
    run(() => updateCartQuantity(item.productId, item.quantity - 1));
  };

  const handleIncrease = (item: CartItem) => {
    if (item.stockAvailable !== undefined && item.stockAvailable <= 0) {
      Alert.alert('No more stock', `There are no more units of ${item.productName} available.`);
      return;
    }
    run(() => updateCartQuantity(item.productId, item.quantity + 1));
  };

  const handleRemove = (item: CartItem) => run(() => removeFromCart(item.productId));

  const handleCheckout = () => {
    if (hasUnavailable) {
      Alert.alert('Unavailable item', 'Remove the items marked unavailable before checking out.');
      return;
    }
    navigation.navigate('CheckoutScreen', { fromCart: true });
  };

  if (!isAuthenticated()) {
    return (
      <View style={styles.emptyCart}>
        <Text style={styles.emptyCartText}>Sign in to see your cart</Text>
        <Text style={styles.emptyCartSub}>Your cart is saved to your account.</Text>
      </View>
    );
  }

  if (!cart && loading) {
    return (
      <View style={styles.emptyCart}>
        <ActivityIndicator color={PURPLE} />
      </View>
    );
  }

  if (!cart && error) {
    return (
      <View style={styles.emptyCart}>
        <Text style={styles.emptyCartText}>Could not load your cart</Text>
        <Text style={styles.emptyCartSub}>{error}</Text>
        <TouchableOpacity style={[styles.checkoutButton, { marginTop: 16, paddingHorizontal: 24 }]} onPress={() => refreshCart().catch(() => {})}>
          <Text style={styles.checkoutButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && Boolean(cart)} onRefresh={() => { refreshCart().catch(() => {}); }} />}
      >
        {items.map(item => {
          const busy = pending.includes(item.productId);
          return (
            <View key={item.id} style={busy ? { opacity: 0.5 } : undefined} pointerEvents={busy ? 'none' : 'auto'}>
              <CartCard
                imageSource={item.productImageUrl ? { uri: resolveImageUrl(item.productImageUrl) } : PLACEHOLDER}
                title={item.productName}
                subtitle={variantLabel(item)}
                status={item.available === false ? 'Unavailable' : 'Reserved'}
                price={fmt(item.productPrice)}
                quantity={item.quantity}
                onQuantityDecrease={() => handleDecrease(item)}
                onQuantityIncrease={() => handleIncrease(item)}
                onRemove={() => handleRemove(item)}
              />
            </View>
          );
        })}

        {items.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            {items.map(item => (
              <View key={`line-${item.id}`} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { flex: 1 }]} numberOfLines={1}>
                  {item.productName} × {item.quantity}
                </Text>
                <Text style={styles.summaryValue}>{fmt(item.subtotal)}</Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal ({cart?.totalItems ?? 0} items)</Text>
              <Text style={styles.summaryValue}>{fmt(cart?.totalPrice)}</Text>
            </View>
            <Text style={styles.summaryNote}>Delivery fees are added at checkout.</Text>
          </View>
        )}

        {items.length > 0 && (
          <TouchableOpacity
            style={[styles.checkoutButton, (pending.length > 0 || hasUnavailable) && { opacity: 0.6 }]}
            onPress={handleCheckout}
            disabled={pending.length > 0}
            activeOpacity={0.8}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
          </TouchableOpacity>
        )}

        {items.length === 0 && (
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
    paddingHorizontal: 0,
    backgroundColor: '#fff',
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
    marginHorizontal: 2,
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
    gap: 8,
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
  summaryNote: {
    fontSize: 12,
    color: '#8F959E',
    fontFamily: 'Poppins-Regular',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  checkoutButton: {
    backgroundColor: PURPLE,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
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
    fontSize: width * 0.045,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  emptyCartSub: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});

export default ActivePage;
