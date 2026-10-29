import React, { useState } from 'react';
import {
  View, Text, Image, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, StatusBar, Alert,
  Platform, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { useCart } from '@/lib/cartStore';
import { resolveImageUrl } from '@/lib/apiClient';
import { ordersService, LocationResponse, DeliveryOption } from '@/lib/ordersService';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';
const PLACEHOLDER = require('../../assets/images/products/product1.jpg');

// ─── Icons (inline SVG helpers) ───────────────────────────────────────────────
const BackIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
    <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TruckIcon = ({ color = '#fff' }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <Path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="5.5" cy="18.5" r="1.5" />
    <Circle cx="18.5" cy="18.5" r="1.5" />
  </Svg>
);

// ─── Input row ────────────────────────────────────────────────────────────────
type InputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  optional?: boolean;
};

const FormInput: React.FC<InputProps> = ({
  label, value, onChange, placeholder, keyboardType = 'default', optional,
}) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>
      {label}{optional ? <Text style={styles.optionalTag}> (optional)</Text> : null}
    </Text>
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder ?? label}
      placeholderTextColor="#9CA3AF"
      keyboardType={keyboardType}
      autoCapitalize="words"
    />
  </View>
);

// ─── Radio button ─────────────────────────────────────────────────────────────
const Radio = ({ selected }: { selected: boolean }) => (
  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
    {selected && <View style={styles.radioInner} />}
  </View>
);

const fmt = (n: number | undefined | null) => `$${Number(n ?? 0).toFixed(2)}`;

/**
 * Checkout for the server-side cart. Nothing here decides a price: the screen shows the cart
 * totals the backend returned plus the delivery fee of the chosen saved address, and the order
 * itself is priced again by the backend when it is created (PinEntry → POST /api/orders).
 */
const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { cart, loading: cartLoading, error: cartError } = useCart();
  const items = cart?.items ?? [];

  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('SELF_PICKUP');

  // Saved delivery addresses (server-side locations, each with a server-decided fee)
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | 'new' | null>(null);

  // contact + new address form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zip, setZip] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [locationsLoaded, setLocationsLoaded] = useState(false);

  // Saved addresses are fetched the first time the buyer chooses delivery.
  const chooseDelivery = () => {
    setDeliveryOption('DELIVERY');
    if (locationsLoaded || locationsLoading) return;
    setLocationsLoading(true);
    ordersService.getMyActiveLocations()
      .then(list => {
        const active = Array.isArray(list) ? list : [];
        setLocations(active);
        setSelectedLocationId(active.length > 0 ? active[0].id : 'new');
      })
      .catch(() => setSelectedLocationId('new'))
      .finally(() => {
        setLocationsLoading(false);
        setLocationsLoaded(true);
      });
  };

  const selectedLocation = typeof selectedLocationId === 'number'
    ? locations.find(l => l.id === selectedLocationId) ?? null
    : null;
  const subtotal = Number(cart?.totalPrice ?? 0);
  const deliveryFee = deliveryOption === 'DELIVERY' && selectedLocation ? Number(selectedLocation.deliveryFee ?? 0) : 0;
  const estimatedTotal = +(subtotal + deliveryFee).toFixed(2);

  const handleContinue = async () => {
    if (submitting) return;
    if (items.length === 0) {
      Alert.alert('Cart is empty', 'Add items to your cart before checking out.');
      return;
    }
    if (items.some(i => i.available === false)) {
      Alert.alert('Unavailable item', 'Remove unavailable items from your cart first.');
      return;
    }
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please enter your name and phone number.');
      return;
    }

    let locationId: number | undefined;
    if (deliveryOption === 'DELIVERY') {
      if (selectedLocationId === 'new' || selectedLocationId === null) {
        if (!street.trim() || street.trim().length < 5 || !city.trim()) {
          Alert.alert('Missing address', 'Please enter a street address (at least 5 characters) and city.');
          return;
        }
        setSubmitting(true);
        try {
          const saved = await ordersService.createLocation({
            name: (fullName.trim() || 'Delivery address').slice(0, 100).padEnd(3, ' '),
            address: [street.trim(), apt.trim()].filter(Boolean).join(', ').slice(0, 200),
            city: city.trim() || undefined,
            state: stateProvince.trim() || undefined,
            zipCode: zip.trim() || undefined,
          });
          setLocations(prev => [...prev, saved]);
          setSelectedLocationId(saved.id);
          locationId = saved.id;
        } catch (err: any) {
          Alert.alert('Could not save address', err?.message || 'Please check the address and try again.');
          return;
        } finally {
          setSubmitting(false);
        }
      } else {
        locationId = selectedLocationId;
      }
    }

    const contactNote = `Contact: ${fullName.trim()}, ${phone.trim()}`;
    navigation.navigate('PaymentMethods', {
      // Shown to the buyer only; the backend recomputes the payable amount from the cart.
      total: estimatedTotal,
      orderDraft: {
        deliveryOption,
        locationId,
        notes: [contactNote, notes.trim()].filter(Boolean).join(' | ').slice(0, 1000),
      },
    });
  };

  if (!cart && cartLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={PURPLE} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── Order Summary ── */}
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.noDeliveryText}>
                {cartError ? cartError : 'Your cart is empty.'}
              </Text>
            </View>
          ) : (
            <View style={styles.card}>
              {items.map((item, idx) => (
                <View key={item.id} style={[styles.cartItemRow, idx < items.length - 1 && styles.cartItemBorder]}>
                  <Image
                    source={item.productImageUrl ? { uri: resolveImageUrl(item.productImageUrl) } : PLACEHOLDER}
                    style={styles.cartItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.productName}</Text>
                    {(item.selectedColor || item.selectedSize) ? (
                      <Text style={styles.cartItemSub}>
                        {[item.selectedColor, item.selectedSize ? `Size ${item.selectedSize}` : null].filter(Boolean).join(' - ')}
                      </Text>
                    ) : null}
                    <Text style={styles.cartItemPrice}>{fmt(item.productPrice)}</Text>
                  </View>
                  <View style={styles.cartItemQtyBadge}>
                    <Text style={styles.cartItemQtyText}>×{item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Delivery ── */}
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.shippingRow} onPress={() => setDeliveryOption('SELF_PICKUP')} activeOpacity={0.8}>
              <Radio selected={deliveryOption === 'SELF_PICKUP'} />
              <Text style={styles.noDeliveryText}>Self pickup (no delivery fee)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shippingOption, deliveryOption === 'DELIVERY' && styles.shippingOptionSelected]}
              onPress={chooseDelivery}
              activeOpacity={0.8}
            >
              <View style={styles.shippingIconCircle}>
                <TruckIcon color={PURPLE} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shippingLabel}>Deliver to my address</Text>
                <Text style={styles.shippingEta}>The delivery fee is set by Ziki for your address</Text>
              </View>
              <Radio selected={deliveryOption === 'DELIVERY'} />
            </TouchableOpacity>

            {deliveryOption === 'DELIVERY' && (
              <>
                {locationsLoading && <ActivityIndicator color={PURPLE} style={{ marginVertical: 8 }} />}
                {locations.map(loc => (
                  <TouchableOpacity key={loc.id} style={styles.shippingRow} onPress={() => setSelectedLocationId(loc.id)} activeOpacity={0.8}>
                    <Radio selected={selectedLocationId === loc.id} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shippingLabel} numberOfLines={1}>{loc.address}</Text>
                      <Text style={styles.shippingEta}>
                        {[loc.city, loc.state].filter(Boolean).join(', ')} · Delivery {fmt(loc.deliveryFee)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {!locationsLoading && (
                  <TouchableOpacity style={styles.shippingRow} onPress={() => setSelectedLocationId('new')} activeOpacity={0.8}>
                    <Radio selected={selectedLocationId === 'new'} />
                    <Text style={styles.noDeliveryText}>Use a new address</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* ── Contact / Delivery Information ── */}
          <Text style={styles.sectionTitle}>
            {deliveryOption === 'DELIVERY' && selectedLocationId === 'new' ? 'Delivery Information' : 'Contact Information'}
          </Text>
          <View style={styles.card}>
            <FormInput label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
            <FormInput label="Phone Number" value={phone} onChange={setPhone} placeholder="+250 7XX XXX XXX" keyboardType="phone-pad" />

            {deliveryOption === 'DELIVERY' && selectedLocationId === 'new' && (
              <>
                <View style={styles.divider} />
                <Text style={styles.subSectionLabel}>Address</Text>

                <FormInput label="Street Address" value={street} onChange={setStreet} placeholder="e.g. KG 215 St, No. 7" />
                <FormInput label="Apartment / Suite / Unit" value={apt} onChange={setApt} placeholder="Apt 4B, Suite 200…" optional />
                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <FormInput label="City" value={city} onChange={setCity} placeholder="Kigali" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput label="State / Province" value={stateProvince} onChange={setStateProvince} placeholder="Kigali City" optional />
                  </View>
                </View>
                <FormInput label="ZIP / Postal Code" value={zip} onChange={setZip} placeholder="00000" keyboardType="numeric" optional />
              </>
            )}
            <FormInput label="Notes for the seller" value={notes} onChange={setNotes} placeholder="Anything we should know?" optional />
          </View>

          {/* ── Price breakdown ── */}
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.card}>
            <PriceRow label={`Subtotal (${cart?.totalItems ?? 0} items)`} value={fmt(subtotal)} />
            <PriceRow
              label="Delivery"
              value={deliveryOption === 'SELF_PICKUP' ? '$0.00' : selectedLocation ? fmt(deliveryFee) : 'Set when address is saved'}
            />
            <View style={styles.totalDivider} />
            <PriceRow label="Total" value={fmt(estimatedTotal)} bold />
            <Text style={styles.shippingEta}>The final amount is confirmed by Ziki when your order is placed.</Text>
          </View>

          {/* ── Continue Button ── */}
          <TouchableOpacity
            style={[styles.ctaButton, (submitting || items.length === 0) && { opacity: 0.6 }]}
            onPress={handleContinue}
            disabled={submitting || items.length === 0}
            activeOpacity={0.85}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.ctaLabel}>Continue to payment</Text>}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Small price row helper ───────────────────────────────────────────────────
const PriceRow = ({
  label, value, bold, valueColor,
}: { label: string; value: string; bold?: boolean; valueColor?: string }) => (
  <View style={styles.priceRow}>
    <Text style={[styles.priceLabel, bold && styles.priceLabelBold]}>{label}</Text>
    <Text style={[styles.priceValue, bold && styles.priceValueBold, valueColor ? { color: valueColor } : {}]}>{value}</Text>
  </View>
);

export default CheckoutScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: height * 0.05,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  // Section heading
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginBottom: 10,
    marginTop: 6,
  },

  // Card wrapper
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 16,
    marginBottom: 18,
  },

  // ── Order summary (Single) ──
  orderSummaryCard: {
    backgroundColor: '#F5EEFF', // Light purple background
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 5,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 90,
  },
  productTextCol: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  productActionsCol: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  trashBtn: {
    padding: 4,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginRight: 6,
  },
  productVariant: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#888',
  },
  productPrice: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  qtyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 5,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: PURPLE,
  },
  qtyBtnText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    lineHeight: 22,
  },
  qtyValue: {
    width: 30,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },

  // ── Cart items (multi) ──
  cartItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  cartItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  cartItemImage: { width: 56, height: 56, borderRadius: 8, marginRight: 12 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 14, fontFamily: 'Poppins-Bold', color: '#111', marginBottom: 2 },
  cartItemSub: { fontSize: 12, color: '#888', marginBottom: 4, fontFamily: 'Poppins-Regular' },
  cartItemPrice: { fontSize: 14, fontFamily: 'Poppins-Bold', color: PURPLE },
  cartItemQtyBadge: { backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cartItemQtyText: { fontSize: 13, fontWeight: '700', color: '#333' },

  // ── Shipping ──
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  noDeliveryText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginLeft: 10,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#EEE',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  shippingOptionSelected: {
    borderColor: PURPLE,
    backgroundColor: '#f7edfeff',
  },
  shippingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#e2c2f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shippingLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  shippingPrice: {
    color: PURPLE,
  },
  shippingEta: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: PURPLE,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PURPLE,
  },

  // ── Delivery form ──
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#444',
    marginBottom: 5,
  },
  optionalTag: {
    fontSize: 14,
    color: '#AAA',
    fontFamily: 'Poppins-Regular',
  },
  textInput: {
    height: 46,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFE',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFE8D6',
    marginVertical: 14,
  },
  subSectionLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#888',
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
  },

  // ── Promo ──
  promoHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  promoHeading: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#111' },
  promoAddBtn: { backgroundColor: PURPLE, borderRadius: 5, paddingHorizontal: 16, paddingVertical: 8 },
  promoAddBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Bold' },
  promoInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  promoInput: { flex: 1, height: 46, borderRadius: 5, borderWidth: 1, borderColor: '#F3F4F6', paddingHorizontal: 14, backgroundColor: '#FAFAFE', fontSize: 16, fontFamily: 'Poppins-Regular', color: '#111' },
  promoApplyBtn: { backgroundColor: '#111', borderRadius: 5, paddingHorizontal: 20, paddingVertical: 12 },
  promoApplyText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-Bold' },
  
  appliedPromosContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  promoChipCard: { backgroundColor: PURPLE, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoChipCardText: { color: '#fff', fontSize: 13, fontFamily: 'Poppins-Bold' },
  promoChipCardRemove: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold', marginTop: -2 },

  promoMsgBox: { borderRadius: 5, padding: 12, marginBottom: 14 },
  promoMsgSuccess: { backgroundColor: '#EAF7F2' },
  promoMsgError: { backgroundColor: '#F0E8FF' },
  promoMsgText: { fontSize: 14, fontFamily: 'Poppins-Medium' },
  promoMsgTextSuccess: { color: '#32A06E' },
  promoMsgTextError: { color: '#E02020' },
  priceDivider: {
    height: 1,
    backgroundColor: '#e2c2f9ff',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  priceLabelBold: {
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  priceValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#111',
  },
  priceValueBold: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: PURPLE,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#e2c2f9ff',
    marginTop: 4,
    marginBottom: 12,
  },

  // ── CTA Button ──
  ctaButton: {
    backgroundColor: PURPLE,
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 36 : 28,
  },
  ctaTotal: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  ctaLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
});
