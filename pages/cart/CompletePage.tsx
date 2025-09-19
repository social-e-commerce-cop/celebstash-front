import OrderCard from '@/components/cart/OrderCard';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import ReviewModal from '../../components/Reviews/ReviewModal'; // Adjust the import path as needed

// Define the review data interface
interface ReviewData {
  rating: number;
  feedback: string;
}

const CompletePage = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleTrackOrder = () => {
    setModalVisible(true);
  };

  const handleSubmitReview = (reviewData: ReviewData) => {
    console.log('Rating:', reviewData.rating, 'Feedback:', reviewData.feedback);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <OrderCard
          imageSource={require('../../assets/images/cart/order1.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="Complete"
          price="$150.00"
          buttonText="Review"
          onButtonPress={handleTrackOrder}
          statusPillStyle={{ backgroundColor: '#DDF1E8' }}
          statusTextStyle={{ color: '#32A06E' }}
        />
        <OrderCard
          imageSource={require('../../assets/images/cart/order3.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="Complete"
          price="$150.00"
          buttonText="Review"
          onButtonPress={handleTrackOrder}
          statusPillStyle={{ backgroundColor: '#DDF1E8' }}
          statusTextStyle={{ color: '#32A06E' }}
        />
        <OrderCard
          imageSource={require('../../assets/images/cart/order4.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="Complete"
          price="$150.00"
          buttonText="Review"
          onButtonPress={handleTrackOrder}
          statusPillStyle={{ backgroundColor: '#DDF1E8' }}
          statusTextStyle={{ color: '#32A06E' }}
        />
        <OrderCard
          imageSource={require('../../assets/images/cart/order1.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          status="Complete"
          price="$150.00"
          buttonText="Review"
          onButtonPress={handleTrackOrder}
          statusPillStyle={{ backgroundColor: '#DDF1E8' }}
          statusTextStyle={{ color: '#32A06E' }}
        />
        <ReviewModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSubmit={handleSubmitReview}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CompletePage;