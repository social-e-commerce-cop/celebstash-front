import MainButton from '@/components/buttons/Mainbutton';
import CartCard from '@/components/cart/InCartCard';
import OrderCard from '@/components/cart/OrderCard';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const ActivePage = () => {

    const navigation = useNavigation<StackNavigationProp<any>>();

  const [cartQuantity, setCartQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([{ id: 1, title: "Kendrick's Jacket on Tour" }]); 

  const handleTrackOrder = () => navigation.navigate('TrackOrder');
  const handleDecrease = () => { if (cartQuantity > 1) setCartQuantity(cartQuantity - 1); };
  const handleIncrease = () => setCartQuantity(cartQuantity + 1);
  const handleRemove = () => setCartItems(prev => prev.filter(item => item.id !== 1));
  const handleCkeckout = ()  => navigation.navigate('CheckoutScreen')

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <ScrollView
        contentContainerStyle={{  paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <OrderCard
          imageSource={require('../../assets/images/cart/order1.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="In delivery"
          price="$150.00"
          buttonText="Track order"
          onButtonPress={handleTrackOrder}
        />
        <CartCard
          imageSource={require('../../assets/images/cart/order2.png')}
          title="Kendrick's Jacket on Tour"
          subtitle="Kendrick Lamar"
          status="In Cart"
          price="$150.00"
          quantity={cartQuantity}
          onQuantityDecrease={handleDecrease}
          onQuantityIncrease={handleIncrease}
          onRemove={handleRemove}
        />
        <OrderCard
          imageSource={require('../../assets/images/cart/order3.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="In delivery"
          price="$150.00"
          buttonText="Track order"
          onButtonPress={handleTrackOrder}
        />
        <OrderCard
          imageSource={require('../../assets/images/cart/order4.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="In delivery"
          price="$150.00"
          buttonText="Track order"
          onButtonPress={handleTrackOrder}
        />
        <MainButton
          total="$999.99"
          label="Checkout"
          arrow={'\u2192'}
          onPress={handleCkeckout}
          buttonStyle={{ backgroundColor: '#FF6B35' }} 
          totalStyle={{ fontSize: 20 }} 
          labelStyle={{ fontWeight: 'bold' }} 
          arrowStyle={{ fontSize: 24 }} 
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ActivePage;
