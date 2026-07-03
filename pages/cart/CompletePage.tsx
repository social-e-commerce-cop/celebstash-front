import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import OrderCard from '@/components/cart/OrderCard';
import ReviewModal from '../../components/Reviews/ReviewModal';

const { width } = Dimensions.get('window');
const GREEN = '#32A06E';

interface ReviewData { rating: number; feedback: string; }

const COMPLETED_ORDERS = [
  {
    id: 1,
    imageSource: require('../../assets/images/cart/order1.jpg'),
    title: "Kendric's Jacket on Tour",
    subtitle: 'Kendric Lamar',
    price: '$150.00',
    date: 'May 12, 2024',
  },
  {
    id: 2,
    imageSource: require('../../assets/images/cart/order3.jpg'),
    title: 'Tour Merch Hoodie',
    subtitle: 'Kendric Lamar',
    price: '$120.00',
    date: 'Apr 28, 2024',
  },
  {
    id: 3,
    imageSource: require('../../assets/images/cart/order4.jpg'),
    title: 'Limited Edition Cap',
    subtitle: 'Kendric Lamar',
    price: '$80.00',
    date: 'Apr 10, 2024',
  },
  {
    id: 4,
    imageSource: require('../../assets/images/cart/order1.jpg'),
    title: 'Backstage Pass Tee',
    subtitle: 'Kendric Lamar',
    price: '$95.00',
    date: 'Mar 22, 2024',
  },
];

const CompletePage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(COMPLETED_ORDERS[0]);
  const [reviewedIds, setReviewedIds] = useState<number[]>([]);

  const handleReview = (order: typeof COMPLETED_ORDERS[0]) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleSubmitReview = (reviewData: ReviewData) => {
    setReviewedIds(prev => [...prev, selectedOrder.id]);
    console.log('Review submitted:', reviewData);
  };

  const totalSpent = COMPLETED_ORDERS.reduce((sum, o) => {
    return sum + parseFloat(o.price.replace('$', ''));
  }, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '' }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary banner */}
        {/* <View style={styles.summaryBanner}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{COMPLETED_ORDERS.length}</Text>
            <Text style={styles.summaryLabel}>Orders</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{reviewedIds.length}/{COMPLETED_ORDERS.length}</Text>
            <Text style={styles.summaryLabel}>Reviewed</Text>
          </View>
        </View> */}

        {/* Section label */}
        {/* <Text style={styles.sectionLabel}>✓ Completed Orders</Text> */}

        {/* Order cards */}
        {COMPLETED_ORDERS.map(order => {
          const isReviewed = reviewedIds.includes(order.id);
          return (
            <View key={order.id}>
              <OrderCard
                imageSource={order.imageSource}
                title={order.title}
                subtitle={order.subtitle}
                status="Completed"
                price={order.price}
                buttonText={isReviewed ? 'Reviewed ✓' : 'Review'}
                onButtonPress={() => !isReviewed && handleReview(order)}
                statusPillStyle={styles.completedPill}
                statusTextStyle={styles.completedPillText}
                buttonStyle={isReviewed ? styles.reviewedButton : undefined}
              />
              <Text style={styles.orderDate}>Delivered {order.date}</Text>
            </View>
          );
        })}
      </ScrollView>

      <ReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitReview}
        imageSource={selectedOrder.imageSource}
        title={selectedOrder.title}
        subtitle={selectedOrder.subtitle}
        price={selectedOrder.price}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    fontFamily: 'Poppins-Bold',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '',
  },
  sectionLabel: {
    fontSize: width * 0.04,
    color: '#222',
    marginBottom: 10,
    marginTop: 4,
    fontFamily: 'Poppins-Bold',
  },
  orderDate: {
    fontSize: 14,
    color: '#AAA',
    marginTop: -10,
    marginBottom: 12,
    paddingLeft: 4,
    fontFamily: 'Poppins-Bold',
  },
  completedPill: {
    backgroundColor: '#EAF7F2',
    borderColor: '#B6E8D4',
  },
  completedPillText: {
    color: GREEN,
  },
  reviewedButton: {
    backgroundColor: '#888',
  },
});

export default CompletePage;
