import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { CardChip, VisaLogoWhite, MastercardLogo, AmexLogoWhite } from '@/components/ewallet/CardAssets';
import { useCards, SavedCard, deleteCard, setDefaultCard, CardBrand } from '@/lib/cardStore';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

// â”€â”€â”€ Brand card backgrounds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const BRAND_BG: Record<CardBrand, string> = {
  visa:       '#1A1F71',
  mastercard: '#1C1C1C',
  amex:       '#007CC3',
  unknown:    '#374151',
};

const BrandLogo: React.FC<{ brand: CardBrand }> = ({ brand }) => {
  switch (brand) {
    case 'visa':       return <VisaLogoWhite width={52} />;
    case 'mastercard': return <MastercardLogo size={42} />;
    case 'amex':       return <AmexLogoWhite />;
    default:           return <Ionicons name="card" size={28} color="#fff" />;
  }
};

// â”€â”€â”€ Card Visual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CardVisual: React.FC<{ card: SavedCard }> = ({ card }) => {
  const bg = BRAND_BG[card.brand];
  return (
    <View style={[styles.cardVisual, { backgroundColor: bg }]}>
      {/* Decorative circles */}
      <View style={styles.cardCircle} />
      <View style={styles.cardCircle2} />

      {/* Top row: chip + logo */}
      <View style={styles.cardTop}>
        <CardChip />
        <BrandLogo brand={card.brand} />
      </View>

      {/* Masked number */}
      <Text style={styles.cardMaskedNumber}>{card.maskedNumber}</Text>

      {/* Bottom row: cardholder + expiry */}
      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.cardMetaLabel}>CARDHOLDER</Text>
          <Text style={styles.cardMetaValue}>{card.holderName.toUpperCase()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardMetaLabel}>EXPIRES</Text>
          <Text style={styles.cardMetaValue}>{card.expiry}</Text>
        </View>
      </View>

      {card.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}
    </View>
  );
};

// â”€â”€â”€ Main Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ManageCardsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const cards = useCards();

  const handleDelete = (card: SavedCard) => {
    Alert.alert(
      'Remove Card',
      `Remove card ending in ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteCard(card.id) },
      ]
    );
  };

  const handleSetDefault = (card: SavedCard) => {
    if (card.isDefault) return;
    setDefaultCard(card.id);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F0FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Cards</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={56} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No saved cards</Text>
            <Text style={styles.emptySubtitle}>Add a card to top up your wallet quickly</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addCardBtn}
            onPress={() => navigation.navigate('AddCard')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={22} color="#fff" />
            <Text style={styles.addCardBtnText}>Add New Card</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <CardVisual card={item} />

            {/* Actions */}
            <View style={styles.cardActions}>
              {item.isDefault ? (
                <View style={styles.defaultIndicator}>
                  <Text style={styles.defaultIndicatorText}>Default Card</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.setDefaultBtn}
                  onPress={() => handleSetDefault(item)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.setDefaultBtnText}>Set as Default</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
                activeOpacity={0.75}
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                <Text style={styles.deleteBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: height * 0.05,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#000' },
  listContent: { padding: 16, paddingBottom: 40 },

  // â”€â”€ Card visual â”€â”€
  cardContainer: { marginBottom: 20 },
  cardVisual: {
    borderRadius: 18,
    padding: 22,
    height: 200,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  cardCircle: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -width * 0.15,
    right: -width * 0.12,
  },
  cardCircle2: {
    position: 'absolute',
    width: width * 0.38,
    height: width * 0.38,
    borderRadius: width * 0.19,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -width * 0.06,
    left: -width * 0.06,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMaskedNumber: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMetaLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  cardMetaValue: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.5,
  },
  defaultBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(22, 163, 74, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  defaultBadgeText: { color: '#fff', fontSize: 11, fontFamily: 'Poppins-Bold' },

  // â”€â”€ Actions â”€â”€
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  defaultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultIndicatorText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#16A34A',
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5EEFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  setDefaultBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  deleteBtnText: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#DC2626',
  },

  // â”€â”€ Add card button â”€â”€
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: PURPLE,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 4,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addCardBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },

  // â”€â”€ Empty state â”€â”€
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: 'Poppins-Bold', color: '#9CA3AF' },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
  },
});

export default ManageCardsScreen;
