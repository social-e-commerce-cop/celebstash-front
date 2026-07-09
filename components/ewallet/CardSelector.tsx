import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCards, SavedCard, CardBrand } from '@/lib/cardStore';
import { CardChip, VisaLogoWhite, MastercardLogo, AmexLogoWhite } from '@/components/ewallet/CardAssets';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

const BRAND_BG: Record<CardBrand, string> = {
  visa:       '#1A1F71',
  mastercard: '#1C1C1C',
  amex:       '#007CC3',
  unknown:    '#374151',
};

const BrandLogo: React.FC<{ brand: CardBrand }> = ({ brand }) => {
  switch (brand) {
    case 'visa':       return <VisaLogoWhite width={38} />;
    case 'mastercard': return <MastercardLogo size={30} />;
    case 'amex':       return <AmexLogoWhite />;
    default:           return <Ionicons name="card" size={18} color="#fff" />;
  }
};

interface CardSelectorProps {
  selectedCardId: string | null;
  onSelectCard: (card: SavedCard) => void;
  onAddNew: () => void;
}

const CardItem: React.FC<{
  card: SavedCard;
  selected: boolean;
  onPress: () => void;
}> = ({ card, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.cardItem, selected && styles.cardItemSelected]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {/* Mini card thumbnail with real logo */}
    <View style={[styles.miniCard, { backgroundColor: BRAND_BG[card.brand] }]}>
      {/* Decorative shimmer circles */}
      <View style={styles.miniCircle} />
      {/* Chip */}
      <CardChip size={0.55} />
      {/* Brand logo */}
      <View style={styles.miniLogoRow}>
        <BrandLogo brand={card.brand} />
      </View>
    </View>

    {/* Card info */}
    <View style={styles.cardInfo}>
      <Text style={styles.maskedNumber}>{card.maskedNumber}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.holderName}>{card.holderName}</Text>
        <Text style={styles.expiry}>· Exp {card.expiry}</Text>
        {card.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
    </View>

    {/* Radio */}
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioDot} />}
    </View>
  </TouchableOpacity>
);

const CardSelector: React.FC<CardSelectorProps> = ({
  selectedCardId,
  onSelectCard,
  onAddNew,
}) => {
  const cards = useCards();

  return (
    <View>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          selected={selectedCardId === card.id}
          onPress={() => onSelectCard(card)}
        />
      ))}

      {/* Add new card */}
      <TouchableOpacity style={styles.addNewCard} onPress={onAddNew} activeOpacity={0.7}>
        <View style={styles.addNewIcon}>
          <Ionicons name="add" size={20} color={PURPLE} />
        </View>
        <Text style={styles.addNewText}>Add New Card</Text>
        <Ionicons name="chevron-forward" size={18} color={PURPLE} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 12,
  },
  cardItemSelected: {
    borderColor: PURPLE,
    backgroundColor: '#F5EEFF',
  },

  // ── Mini card thumbnail ──
  miniCard: {
    width: 72,
    height: 48,
    borderRadius: 8,
    padding: 6,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  miniCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -18,
    right: -12,
  },
  miniLogoRow: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Card info ──
  cardInfo: { flex: 1 },
  maskedNumber: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  holderName: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  expiry: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#065F46',
  },

  // ── Radio ──
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: PURPLE },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PURPLE,
  },

  // ── Add new card ──
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5EEFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 12,
  },
  addNewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
  },
});

export default CardSelector;
