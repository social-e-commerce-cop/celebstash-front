import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const PromoCodeDetail = () => {
  const [amount] = useState(1200.00);
  const [shipping] = useState(20.00);
  const [discount, setDiscount] = useState(0.00);
  const [total, setTotal] = useState(amount + shipping);

  const applyPromo = () => {
    const disc = amount * 0.25;
    setDiscount(disc);
    setTotal(amount + shipping - disc);
    Alert.alert('Success', '25% discount applied!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.priceContainer}>
        <View style={styles.amountSection}>
          <Text style={styles.labelPrice}>Amount</Text>
          <Text style={styles.value}>${amount.toFixed(2)}</Text>
        </View>

        <View style={styles.shippingSection}>
          <Text style={styles.labelPrice}>Shipping</Text>
          <Text style={styles.value}>+$ {shipping.toFixed(2)}</Text>
        </View>

        <View style={styles.discountSection}>
          <Text style={styles.labelPrice}>Discount</Text>
          <Text style={styles.value}>-$ {discount.toFixed(2)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalSection}>
          <Text style={styles.labelPrice}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    paddingVertical: 20,
    justifyContent: 'center',
  },
  promoSection: {
    marginBottom: 30,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoButton: {
    backgroundColor: '#FF650E',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF650E',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelPrice: {
    color: '#303030', 
    fontSize: 16,
  },
  priceContainer: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderRadius: 10
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shippingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  discountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 2,
  },
  value: {
    fontSize: 16,
    color: '#000',
     fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});

export default PromoCodeDetail;