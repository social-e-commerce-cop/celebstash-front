import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface OrderTrackingProps {
  status: string;
  location: string;
  time: string;
}

const OrderTrackingCard: React.FC<OrderTrackingProps> = ({ status, location, time }) => {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          {/* Custom SVG Icon */}
         <Svg width="50" height="50" viewBox="0 0 54 58" fill="none" >
<Rect x="16.0044" y="0.5" width="22" height="22" rx="11" stroke="#FF650E"/>
<Circle cx="27.0044" cy="11.5" r="7.5" fill="#FF650E"/>
<Line x1="27.5044" y1="28" x2="27.5044" y2="58" stroke="#FF650E" stroke-dasharray="2 2"/>
</Svg>


          <View style={styles.details}>
            <Text style={styles.status}>{status}</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingRight: 12,
    width: width * 0.9,
    alignSelf: 'center',
    marginBottom: 5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 5
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  location: {
    fontSize: 16,
    color: '#8A8A8A',
    flexWrap: 'wrap',
    fontWeight: '400'
  },
  time: {
    fontSize: 16,
    color: '#8A8A8A',
    marginLeft: 6,
    textAlign: 'right',
  },
});

export default OrderTrackingCard;
