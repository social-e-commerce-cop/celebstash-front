import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';
const PURPLE_LIGHT = '#F0E8FF';
const GREEN = '#32A06E';
const GREEN_LIGHT = '#EAF7F2';

// ─── Icons ───────────────────────────────────────────────────────────────────
const PackageIcon = ({ color = PURPLE }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TruckIcon = ({ color = PURPLE }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M1 3h15v13H1z" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="18.5" r="1.5" />
    <Circle cx="18.5" cy="18.5" r="1.5" />
  </Svg>
);

const CheckCircleIcon = ({ color = GREEN }: { color?: string }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </Svg>
);

const CircleDotIcon = ({ active = false }: { active?: boolean }) => (
  <View style={[styles.stepDot, active && styles.stepDotActive]}>
    {active && <View style={styles.stepDotInner} />}
  </View>
);

// ─── Step Data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    icon: 'receipt-outline',
    label: 'Order\nConfirmed',
    done: true,
    date: 'May 12',
  },
  {
    id: 2,
    icon: 'cube-outline',
    label: 'Packed &\nReady',
    done: true,
    date: 'May 14',
  },
  {
    id: 3,
    icon: 'car-outline',
    label: 'Shipped\nOut',
    done: true,
    date: 'May 16',
  },
  {
    id: 4,
    icon: 'home-outline',
    label: 'Delivered',
    done: false,
    date: 'May 20',
  },
];

const EVENTS = [
  {
    id: 1,
    status: 'Order in Transit',
    location: '488 Bangkok, Thailand FR-956',
    time: '10:40 AM',
    date: 'May 20',
    done: true,
  },
  {
    id: 2,
    status: 'Departed from Facility',
    location: 'Kigali Sorting Centre, Rwanda',
    time: '06:15 AM',
    date: 'May 18',
    done: true,
  },
  {
    id: 3,
    status: 'Arrived at Hub',
    location: 'Nairobi International Hub, Kenya',
    time: '11:55 PM',
    date: 'May 17',
    done: true,
  },
  {
    id: 4,
    status: 'Shipment Dispatched',
    location: 'Bangkok Export Centre, Thailand',
    time: '02:30 PM',
    date: 'May 16',
    done: true,
  },
  {
    id: 5,
    status: 'Package Picked Up',
    location: 'Seller Warehouse, Bangkok',
    time: '09:00 AM',
    date: 'May 14',
    done: true,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const TrackOrder = () => {
  const navigation = useNavigation();

  const currentStep = STEPS.filter(s => s.done).length;
  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Card */}
        <View style={styles.productCard}>
          <Image
            source={require('../../assets/images/cart/order1.jpg')}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>Kendric's Jacket on Tour</Text>
            <Text style={styles.productSubtitle}>Kendric Lamar</Text>
            <View style={styles.deliveryBadge}>
              <TruckIcon color={PURPLE} />
              <Text style={styles.deliveryText}>Est. Delivery: May 20</Text>
            </View>
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>$150.00</Text>
          </View>
        </View>

        {/* Order Number + Tracking ID */}
        <View style={styles.trackingInfoRow}>
          <View style={styles.trackingInfoBox}>
            <Text style={styles.trackingInfoLabel}>Order #</Text>
            <Text style={styles.trackingInfoValue}>ZK-2024-8821</Text>
          </View>
          <View style={styles.trackingDivider} />
          <View style={styles.trackingInfoBox}>
            <Text style={styles.trackingInfoLabel}>Tracking ID</Text>
            <Text style={styles.trackingInfoValue}>TH-FR-956</Text>
          </View>
        </View>

        {/* Step Progress Bar */}
        <View style={styles.stepCard}>
          <Text style={styles.stepCardTitle}>Delivery Progress</Text>

          {/* Progress Line */}
          <View style={styles.progressWrapper}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>

            {/* Step dots */}
            <View style={styles.stepsRow}>
              {STEPS.map((step, idx) => (
                <View key={step.id} style={styles.stepItem}>
                  <View style={[
                    styles.stepIconCircle,
                    step.done ? styles.stepIconDone : styles.stepIconPending,
                  ]}>
                    {step.done
                      ? <CheckCircleIcon color="#fff" />
                      : <Ionicons name={step.icon as any} size={16} color="#aaa" />
                    }
                  </View>
                  <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepDate}>{step.date}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Current Status Banner */}
        <View style={styles.statusBanner}>
          <View style={styles.statusBannerLeft}>
            <TruckIcon color={PURPLE} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.statusBannerTitle}>Package in Transit</Text>
              <Text style={styles.statusBannerSub}>Your package is on its way! Expected arrival May 20</Text>
            </View>
          </View>
        </View>

        {/* Event Timeline */}
        <Text style={styles.timelineTitle}>Shipment Events</Text>
        <View style={styles.timelineCard}>
          {EVENTS.map((event, idx) => (
            <View key={event.id} style={styles.eventRow}>
              {/* Left: dot + line */}
              <View style={styles.eventLeft}>
                <View style={[styles.eventDot, event.done && styles.eventDotDone]} />
                {idx < EVENTS.length - 1 && <View style={styles.eventLine} />}
              </View>

              {/* Right: info */}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventStatus}>{event.status}</Text>
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                <Text style={styles.eventLocation}>{event.location}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const STEP_COUNT = STEPS.length;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: height * 0.04,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    height: height * 0.07,
    backgroundColor: '#F5F7FA',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: width * 0.046,
    fontWeight: '700',
    color: '#111',
    fontFamily: 'Poppins-Bold',
  },

  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 40,
    paddingTop: 14,
  },

  // Product card
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  productImage: {
    width: width * 0.22,
    height: height * 0.11,
    borderRadius: 10,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  productSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    gap: 6,
  },
  deliveryText: {
    fontSize: 12,
    color: PURPLE,
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  priceTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceTagText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },

  // Tracking info row
  trackingInfoRow: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  trackingInfoBox: {
    flex: 1,
    alignItems: 'center',
  },
  trackingInfoLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  trackingInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    fontFamily: 'Poppins-Bold',
  },
  trackingDivider: {
    width: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 10,
  },

  // Step card
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  stepCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  progressWrapper: {
    position: 'relative',
  },
  progressTrack: {
    position: 'absolute',
    top: 18,
    left: '8%',
    right: '8%',
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    zIndex: 0,
  },
  progressFill: {
    height: '100%',
    backgroundColor: PURPLE,
    borderRadius: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  stepItem: {
    alignItems: 'center',
    width: width / STEP_COUNT - 10,
  },
  stepIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#EEE',
    backgroundColor: '#F8F8F8',
  },
  stepIconDone: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  stepIconPending: {
    backgroundColor: '#F8F8F8',
    borderColor: '#DDD',
  },
  stepLabel: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 15,
    fontFamily: 'Poppins-Regular',
  },
  stepLabelDone: {
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  stepDate: {
    fontSize: 10,
    color: '#bbb',
    marginTop: 3,
    fontFamily: 'Poppins-Regular',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#fff',
  },
  stepDotActive: {
    borderColor: PURPLE,
    backgroundColor: '#fff',
  },
  stepDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PURPLE,
    margin: 2,
  },

  // Status banner
  statusBanner: {
    backgroundColor: PURPLE_LIGHT,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D4B8F7',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: PURPLE,
    marginBottom: 2,
    fontFamily: 'Poppins-Bold',
  },
  statusBannerSub: {
    fontSize: 12,
    color: '#C84A00',
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },

  // Timeline
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  eventLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 14,
  },
  eventDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
    marginTop: 4,
  },
  eventDotDone: {
    backgroundColor: PURPLE,
  },
  eventLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#F0F0F0',
    marginTop: 4,
    marginBottom: 0,
    minHeight: 36,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  eventStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    flex: 1,
    fontFamily: 'Poppins-Bold',
  },
  eventTime: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  eventLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular',
  },
  eventDate: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Poppins-Regular',
  },
});

export default TrackOrder;

