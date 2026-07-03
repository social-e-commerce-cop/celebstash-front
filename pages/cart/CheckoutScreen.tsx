import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, StatusBar, Alert,
  Platform, KeyboardAvoidingView, Keyboard, Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

type CheckoutParams = {
  CheckoutScreen: {
    name?: string;
    price?: string | number;
    image?: any;
    artistName?: string;
    selectedSize?: string;
    selectedColor?: string;
    selectedColorValue?: string;
    fromCart?: boolean;
    cartItems?: Array<{ id: number; title: string; subtitle: string; price: number; quantity: number; imageSource: any }>;
    isDigital?: boolean;
    isMusic?: boolean;
    musicItem?: { title: string; artist: string; image: any } | null;
  };
};

type ShippingId = 'none' | 'economy' | 'cargo';

const SHIPPING_OPTIONS = [
  { id: 'economy' as ShippingId, label: 'Economy (In Kigali)',    price: 13, eta: 'Estimate Arrival May 14' },
  { id: 'cargo'   as ShippingId, label: 'Cargo (Outside Kigali)', price: 20, eta: 'Estimate Arrival May 20' },
];

// ─── Icons (inline SVG helpers) ───────────────────────────────────────────────
const BackIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
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
      placeholderTextColor="#333qa"
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

  // keyboard visibility
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  // product params
  const params    = route.params ?? {};
  const fromCart  = params.fromCart ?? false;
  const cartItems = params.cartItems ?? [];
  const isDigital = params.isDigital ?? false;
  const isMusic   = (params.isMusic ?? false) || !!params.musicItem;

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
  const [shipping, setShipping] = useState<ShippingId>(isDigital ? 'none' : 'economy');
  const shippingCost = shipping === 'none' ? 0 : (SHIPPING_OPTIONS.find(o => o.id === shipping)?.price ?? 0);

  // promo
  const [appliedPromos, setAppliedPromos] = useState<{code: string, discount: number}[]>([]);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const promoAnim = useRef(new Animated.Value(0)).current;

  const VALID_CODES: Record<string, number> = { 'ZIKI25': 25, 'CELEB10': 10, 'VIP50': 50 };

  const handleAddPromo = () => {
    setShowPromoInput(v => {
      const next = !v;
      Animated.timing(promoAnim, { toValue: next ? 1 : 0, duration: 250, useNativeDriver: false }).start();
      return next;
    });
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (VALID_CODES[code]) {
      if (appliedPromos.some(p => p.code === code)) {
        setPromoMessage(`⚠ Code ${code} is already applied.`);
        return;
      }
      setAppliedPromos(prev => [...prev, { code, discount: VALID_CODES[code] }]);
      setPromoMessage(`✓ Promo code ${code} applied!`);
      setPromoCode('');
    } else {
      setPromoMessage('✗ Invalid promo code. Try ZIKI25, CELEB10 or VIP50.');
    }
  };

  const removePromo = (code: string) => {
    setAppliedPromos(prev => prev.filter(p => p.code !== code));
    setPromoMessage('');
  };
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
  const baseAmount = fromCart 
    ? cartItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    : unitPrice * qty;
  const effectiveShippingCost = isMusic ? 0 : shippingCost;
  const totalDiscountPercent = Math.min(appliedPromos.reduce((sum, p) => sum + p.discount, 0), 100);
  const discountAmount = +(baseAmount * totalDiscountPercent / 100).toFixed(2);
  const total    = +(baseAmount + effectiveShippingCost - discountAmount).toFixed(2);

  const promoInputHeight = promoAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 90] });

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const handleContinue = () => {
    // Contact details are always required
    const missingContact = !fullName || !phone || !email;
    if (missingContact) {
      Alert.alert('Missing details', 'Please fill in all required contact information before continuing.');
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    // Address details are required only if shipping is selected
    if (shipping !== 'none') {
      const missingAddress = !street || !city || !stateProvince || !zip;
      if (missingAddress) {
        Alert.alert('Missing details', 'Please fill in all required delivery address information before continuing.');
        return;
      }
    }

    navigation.navigate('PaymentMethods', {
      total,
      isMusic,
      musicItem: params.musicItem,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'android' ? -200 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF6ED" />
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
          {fromCart && cartItems.length > 0 ? (
            <View style={styles.card}>
              {cartItems.map((item: any, idx: number) => (
                <View key={item.id} style={[styles.cartItemRow, idx < cartItems.length - 1 && styles.cartItemBorder]}>
                  <Image source={item.imageSource} style={styles.cartItemImage} resizeMode="cover" />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.cartItemSub}>{item.subtitle}</Text>
                    <Text style={styles.cartItemPrice}>{fmt(item.price)}</Text>
                  </View>
                  <View style={styles.cartItemQtyBadge}>
                    <Text style={styles.cartItemQtyText}>×{item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.card, styles.orderSummaryCard]}>
              <Image source={image} style={styles.productImage} resizeMode="cover" />
              <View style={styles.productInfo}>
                <View style={styles.productDetailsRow}>
                  <View style={styles.productTextCol}>
                    <Text style={styles.productName} numberOfLines={2}>{name}</Text>
                    {isMusic
                      ? <Text style={styles.productVariant}>🎵 Digital Download</Text>
                      : <Text style={styles.productVariant}>{selColor} - {selSize}</Text>
                    }
                    <Text style={styles.productPrice}>{fmt(unitPrice)}</Text>
                  </View>
                  <View style={styles.productActionsCol}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.trashBtn}>
                      <TrashIcon />
                    </TouchableOpacity>
                    {/* Only show qty stepper for physical products */}
                    {!isMusic && (
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
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ── Choose Shipping ── */}
          {!isDigital && (
            <>
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
                      <TruckIcon color={shipping === opt.id ? PURPLE : PURPLE} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.shippingLabel}>{opt.label}  <Text style={styles.shippingPrice}>${opt.price}</Text></Text>
                      <Text style={styles.shippingEta}>{opt.eta}</Text>
                    </View>
                    <Radio selected={shipping === opt.id} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── Contact / Delivery Information ── */}
          <Text style={styles.sectionTitle}>
            {shipping === 'none' ? 'Contact Information' : 'Delivery Information'}
          </Text>
          <View style={styles.card}>
            <FormInput label="Full Name" value={fullName} onChange={setFullName} placeholder="e.g. Jean Pierre Mugisha" />
            <FormInput label="Phone Number" value={phone} onChange={setPhone} placeholder="+250 7XX XXX XXX" keyboardType="phone-pad" />
            <FormInput label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" />

            {shipping !== 'none' && (
              <>
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
              </>
            )}
          </View>

          {/* ── Promo Code ── */}
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.card}>
            <View style={styles.promoHeaderRow}>
              <Text style={styles.promoHeading}>Have a promo code?</Text>
              <TouchableOpacity
                style={styles.promoAddBtn}
                onPress={handleAddPromo}
                activeOpacity={0.8}
              >
                <Text style={styles.promoAddBtnText}>{showPromoInput ? '− Close' : '+ Add Code'}</Text>
              </TouchableOpacity>
            </View>

            {/* Expandable input */}
            <Animated.View style={{ overflow: 'hidden', height: promoInputHeight }}>
              <View style={styles.promoInputRow}>
                <TextInput
                  style={styles.promoInput}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholder="Enter promo code (e.g. ZIKI25)"
                  placeholderTextColor="#BDBDBD"
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.promoApplyBtn} onPress={applyPromo}>
                  <Text style={styles.promoApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Applied Promos */}
            {appliedPromos.length > 0 && (
              <View style={styles.appliedPromosContainer}>
                {appliedPromos.map(promo => (
                  <View key={promo.code} style={styles.promoChipCard}>
                    <Text style={styles.promoChipCardText}>{promo.code} ({promo.discount}%)</Text>
                    <TouchableOpacity onPress={() => removePromo(promo.code)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                      <Text style={styles.promoChipCardRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Promo message */}
            {!!promoMessage && (
              <View style={[styles.promoMsgBox, appliedPromos.length > 0 ? styles.promoMsgSuccess : styles.promoMsgError]}>
                <Text style={[styles.promoMsgText, appliedPromos.length > 0 ? styles.promoMsgTextSuccess : styles.promoMsgTextError]}>
                  {promoMessage}
                </Text>
              </View>
            )}

            {/* Price breakdown */}
            <View style={styles.priceDivider} />
            <PriceRow label="Amount" value={fmt(baseAmount)} />
            {!isMusic && (
              <PriceRow label="Shipping" value={shippingCost > 0 ? `+${fmt(shippingCost)}` : '$0.00'} />
            )}
            {appliedPromos.length > 0 && <PriceRow label={`Discount (${totalDiscountPercent}%)`} value={`−${fmt(discountAmount)}`} valueColor={PURPLE} />}
            <View style={styles.totalDivider} />
            <PriceRow label="Total" value={fmt(total)} bold />
          </View>

          {/* ── Continue Button ── */}
          <TouchableOpacity style={styles.ctaButton} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.ctaLabel}>Continue to payment</Text>
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
