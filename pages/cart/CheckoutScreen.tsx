import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const PURPLE = '#8A3FFC';

// ─── Types ───────────────────────────────────────────────────────────────────
type CheckoutParams = {
  CheckoutScreen: {
    name?: string;
    price?: string | number;
    image?: any;
    artistName?: string;
    selectedSize?: string;
    selectedColor?: string;
    selectedColorValue?: string;
  };
};

type ShippingId = 'none' | 'economy' | 'cargo';

const SHIPPING_OPTIONS = [
  { id: 'economy' as ShippingId, label: 'Economy (In Kigali)',    price: 13, eta: 'Estimate Arrival May 14' },
  { id: 'cargo'   as ShippingId, label: 'Cargo (Outside Kigali)', price: 20, eta: 'Estimate Arrival May 20' },
];

// ─── Icons (inline SVG helpers) ───────────────────────────────────────────────
const BackIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
    <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4D4D" strokeWidth="2">
    <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
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
      placeholderTextColor="#ADADAD"
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

// ─── Main Screen ─────────────────────────────────────────────────────────────
const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<RouteProp<CheckoutParams, 'CheckoutScreen'>>();

  // product params
  const params    = route.params ?? {};
  const name      = params.name        ?? 'Indorerwamo merch';
  const image     = params.image       ?? require('../../assets/images/products/product1.jpg');
  const artistName = params.artistName ?? 'Kenny K Shot';
  const selSize   = params.selectedSize   ?? 'M';
  const selColor  = params.selectedColor  ?? 'Black';
  const rawPrice  = params.price !== undefined ? params.price : 150;
  const unitPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 150;

  // qty
  const [qty, setQty] = useState(1);

  // shipping
  const [shipping, setShipping] = useState<ShippingId>('economy');
  const shippingCost = shipping === 'none' ? 0 : (SHIPPING_OPTIONS.find(o => o.id === shipping)?.price ?? 0);

  // promo
  const [promoApplied, setPromoApplied] = useState(false);

  // delivery form
  const [fullName,   setFullName]   = useState('');
  const [phone,      setPhone]      = useState('');
  const [email,      setEmail]      = useState('');
  const [street,     setStreet]     = useState('');
  const [apt,        setApt]        = useState('');
  const [city,       setCity]       = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zip,        setZip]        = useState('');

  // calculations
  const subtotal = unitPrice * qty;
  const discount = promoApplied ? +(subtotal * 0.25).toFixed(2) : 0;
  const total    = +(subtotal + shippingCost - discount).toFixed(2);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const handleContinue = () => {
    if (shipping !== 'none') {
      const missing = !fullName || !phone || !email || !street || !city || !stateProvince || !zip;
      if (missing) {
        Alert.alert('Missing details', 'Please fill in all required delivery information before continuing.');
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        Alert.alert('Invalid email', 'Please enter a valid email address.');
        return;
      }
    }
    navigation.navigate('PaymentMethods', { total });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5FF" />
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <BackIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* ── Order Summary ── */}
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            <Image source={image} style={styles.productImage} resizeMode="cover" />
            <View style={styles.productInfo}>
              <View style={styles.productTopRow}>
                <Text style={styles.productName} numberOfLines={2}>{name}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <TrashIcon />
                </TouchableOpacity>
              </View>
              <Text style={styles.productVariant}>{selColor} • {selSize}</Text>
              <View style={styles.productBottomRow}>
                <Text style={styles.productPrice}>{fmt(unitPrice)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQty(q => Math.max(1, q - 1))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{qty}</Text>
                  <TouchableOpacity
                    style={[styles.qtyBtn, styles.qtyBtnPlus]}
                    onPress={() => setQty(q => q + 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* ── Choose Shipping ── */}
          <Text style={styles.sectionTitle}>Choose Shipping</Text>
          <View style={styles.card}>
            {/* No delivery */}
            <TouchableOpacity style={styles.shippingRow} onPress={() => setShipping('none')} activeOpacity={0.8}>
              <Radio selected={shipping === 'none'} />
              <Text style={styles.noDeliveryText}>No delivery</Text>
            </TouchableOpacity>

            {SHIPPING_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.shippingOption, shipping === opt.id && styles.shippingOptionSelected]}
                onPress={() => setShipping(opt.id)}
                activeOpacity={0.8}
              >
                <View style={styles.shippingIconCircle}>
                  <TruckIcon color={shipping === opt.id ? '#fff' : PURPLE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shippingLabel}>{opt.label}  <Text style={styles.shippingPrice}>${opt.price}</Text></Text>
                  <Text style={styles.shippingEta}>{opt.eta}</Text>
                </View>
                <Radio selected={shipping === opt.id} />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Delivery Information ── */}
          {shipping !== 'none' && (
            <>
              <Text style={styles.sectionTitle}>Delivery Information</Text>
              <View style={styles.card}>
                <FormInput label="Full Name" value={fullName} onChange={setFullName} placeholder="e.g. Jean Pierre Mugisha" />
                <FormInput label="Phone Number" value={phone} onChange={setPhone} placeholder="+250 7XX XXX XXX" keyboardType="phone-pad" />
                <FormInput label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" />

                {/* divider */}
                <View style={styles.divider} />
                <Text style={styles.subSectionLabel}>Address</Text>

                <FormInput label="Street Address" value={street} onChange={setStreet} placeholder="e.g. KG 215 St, No. 7" />
                <FormInput label="Apartment / Suite / Unit" value={apt} onChange={setApt} placeholder="Apt 4B, Suite 200…" optional />
                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <FormInput label="City" value={city} onChange={setCity} placeholder="Kigali" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput label="State / Province" value={stateProvince} onChange={setStateProvince} placeholder="Kigali City" />
                  </View>
                </View>
                <FormInput label="ZIP / Postal Code" value={zip} onChange={setZip} placeholder="00000" keyboardType="numeric" />
              </View>
            </>
          )}

          {/* ── Promo Code ── */}
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.card}>
            <View style={styles.promoRow}>
              <TouchableOpacity
                style={[styles.promoChip, promoApplied && styles.promoChipApplied]}
                onPress={() => {
                  if (!promoApplied) {
                    setPromoApplied(true);
                    Alert.alert('Promo applied!', '25% discount has been applied to your order.');
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.promoChipText}>{promoApplied ? '✓ 25% OFF' : '25% OFF'}</Text>
              </TouchableOpacity>
              {!promoApplied && (
                <TouchableOpacity style={styles.promoAdd} activeOpacity={0.8}>
                  <Text style={styles.promoAddText}>+</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Price breakdown */}
            <View style={styles.priceDivider} />
            <PriceRow label="Amount" value={fmt(subtotal)} />
            <PriceRow label="Shipping" value={shippingCost > 0 ? `+${fmt(shippingCost)}` : '$0.00'} />
            {promoApplied && <PriceRow label="Discount" value={`−${fmt(discount)}`} valueColor="#FF4D4D" />}
            <View style={styles.totalDivider} />
            <PriceRow label="Total" value={fmt(total)} bold />
          </View>

        </ScrollView>

        {/* ── Footer CTA ── */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.ctaTotal}>{fmt(total)}</Text>
            <Text style={styles.ctaLabel}>Continue to payment  →</Text>
          </TouchableOpacity>
        </View>

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
    backgroundColor: '#F7F5FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAFF',
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
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#8A3FFC',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // ── Order summary ──
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    marginRight: 6,
  },
  productVariant: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    marginBottom: 8,
  },
  productBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  // card row direction for product
  // (card already has padding; we lay image + info side-by-side)
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2EBFF',
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

  // ── Shipping ──
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  noDeliveryText: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginLeft: 10,
  },
  shippingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EEE',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  shippingOptionSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F7F0FF',
  },
  shippingIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEE5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shippingLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  shippingPrice: {
    color: PURPLE,
  },
  shippingEta: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#888',
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
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#444',
    marginBottom: 5,
  },
  optionalTag: {
    fontSize: 12,
    color: '#AAA',
    fontFamily: 'Poppins-Regular',
  },
  textInput: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8E0FF',
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFE',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAFF',
    marginVertical: 14,
  },
  subSectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
  },

  // ── Promo ──
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  promoChip: {
    backgroundColor: PURPLE,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  promoChipApplied: {
    backgroundColor: '#5B21B6',
  },
  promoChipText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  promoAdd: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoAddText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    lineHeight: 26,
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#F0EAFF',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  priceLabelBold: {
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  priceValue: {
    fontSize: 14,
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
    backgroundColor: '#F0EAFF',
    marginTop: 4,
    marginBottom: 12,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#F0EAFF',
  },
  ctaButton: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
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
