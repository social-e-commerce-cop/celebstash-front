import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TrackCard from '@/components/cart/TrackCard';
import ProgressItem from '@/components/tracking/ProgressItem';
import OrderTrackingCard from '@/components/tracking/OrderItem';

const { width, height } = Dimensions.get('window');

const TrackOrder = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Track Order</Text>

        <View style={styles.iconButton} />
      </View>
      <ScrollView
       showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: height * 0.05 }} 
        >
 <TrackCard
          imageSource={require('../../assets/images/cart/order1.jpg')}
          title="Kendric's Jacket on Tour"
          subtitle="Kendric Lamar"
          price="$150.00"
         
        />
        <ProgressItem />
         <Text style={[styles.headerTitle, { fontSize: width * 0.045, marginVertical: height * 0.02 }]}>Order Status Details</Text>
        <OrderTrackingCard 
        status="Order in Transit - May 20" 
        location="488 Bangkok Thailand FR-956" 
        time="10:40AM" 
      />
       <OrderTrackingCard 
        status="Order in Transit - May 20" 
        location="488 Bangkok Thailand FR-956" 
        time="10:40AM" 
      />
       <OrderTrackingCard 
        status="Order in Transit - May 20" 
        location="488 Bangkok Thailand FR-956" 
        time="10:40AM" 
      />
       <OrderTrackingCard 
        status="Order in Transit - May 20" 
        location="488 Bangkok Thailand FR-956" 
        time="10:40AM" 
      />
       <OrderTrackingCard 
        status="Order in Transit - May 20" 
        location="488 Bangkok Thailand FR-956" 
        time="10:40AM" 
      />
      <OrderTrackingCard 
        status="Order in Transit - May 20" 
        location="488 Bangkok Thailand FR-956" 
        time="10:40AM" 
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
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
    borderBottomWidth: 2,
    borderColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: height * 0.005, // relative thickness for bottom border
    borderBottomColor: 'transparent', // default hidden
  },
  activeTabBorder: {
    borderBottomColor: '#ff6600', // orange bottom border for active tab
  },
  activeTabText: {
    color: '#000', // black for active tab
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  inactiveTabText: {
    color: '#8F959E', // grey color for inactive tab
    fontSize: width * 0.045,
  },
});

export default TrackOrder;
