import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// ─── Data ────────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Single', 'Album', 'EP', 'Live'];

interface Release {
  id: string;
  title: string;
  artist: string;
  type: 'Single' | 'Album' | 'EP' | 'Live';
  price: number;
  accesses: number;
  daysLeft: number;
  image: any;
  artistImage: any;
  featured?: boolean;
}

const ALL_RELEASES: Release[] = [
  {
    id: '1',
    title: "IF THE WORLD WAS ENDING FT TAYE P",
    artist: 'Justin Timberlake',
    type: 'Single',
    price: 10.25,
    accesses: 3,
    daysLeft: 2,
    image: require('@/assets/images/drop1.jpg'),
    artistImage: require('@/assets/images/prof.jpg'),
    featured: true,
  },
  {
    id: '2',
    title: "Mama – Acoustic Sessions",
    artist: 'Chris Brown',
    type: 'Album',
    price: 14.99,
    accesses: 5,
    daysLeft: 5,
    image: require('@/assets/images/storyItem.jpg'),
    artistImage: require('@/assets/images/profile.jpg'),
  },
  {
    id: '3',
    title: "Corazol ft T-Pain, Usher",
    artist: 'The Weeknd',
    type: 'EP',
    price: 8.50,
    accesses: 2,
    daysLeft: 8,
    image: require('@/assets/images/products/product1.jpg'),
    artistImage: require('@/assets/images/black-man.png'),
  },
  {
    id: '4',
    title: "Lost In Translation Live",
    artist: 'Drake',
    type: 'Live',
    price: 12.00,
    accesses: 10,
    daysLeft: 3,
    image: require('@/assets/images/products/product2.jpg'),
    artistImage: require('@/assets/images/prof.jpg'),
  },
  {
    id: '5',
    title: "Midnight Chapter",
    artist: 'Kendrick Lamar',
    type: 'Album',
    price: 18.00,
    accesses: 7,
    daysLeft: 12,
    image: require('@/assets/images/products/product3.jpg'),
    artistImage: require('@/assets/images/profile.jpg'),
  },
  {
    id: '6',
    title: "Golden Hour Singles",
    artist: 'Justin Timberlake',
    type: 'Single',
    price: 6.99,
    accesses: 4,
    daysLeft: 1,
    image: require('@/assets/images/products/product4.jpg'),
    artistImage: require('@/assets/images/prof.jpg'),
  },
];

// ─── Icons ───────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
    <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const VerifiedIcon = () => (
  <Svg width="13" height="13" viewBox="0 0 24 24" fill="#7126D0">
    <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
    <Polygon points="5,3 19,12 5,21" />
  </Svg>
);

const ClockIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" strokeLinecap="round" />
  </Svg>
);

// ─── Featured Hero Card ───────────────────────────────────────────────────────
const FeaturedCard = ({ item, onPress }: { item: Release; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.featuredCard}>
    <ImageBackground source={item.image} style={styles.featuredBg} imageStyle={styles.featuredImageStyle}>
      <View style={styles.featuredOverlay}>
        {/* Top row */}
        <View style={styles.featuredTopRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type}</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>${item.price}</Text>
          </View>
        </View>

        {/* Artist row */}
        <View style={styles.featuredArtistRow}>
          <Image source={item.artistImage} style={styles.featuredArtistAvatar} />
          <View>
            <Text style={styles.featuredArtistName}>{item.artist}</Text>
            <View style={styles.verifiedRow}>
              <VerifiedIcon />
              <Text style={styles.verifiedText}>Verified Artist</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.featuredTitle}>{item.title}</Text>

        {/* Footer */}
        <View style={styles.featuredFooter}>
          <View style={styles.featuredMeta}>
            <ClockIcon />
            <Text style={styles.featuredMetaText}>{item.daysLeft}d left • {item.accesses} accesses</Text>
          </View>
          <TouchableOpacity style={styles.featuredAccessBtn} onPress={onPress} activeOpacity={0.85}>
            <PlayIcon />
            <Text style={styles.featuredAccessText}>Get Access</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  </TouchableOpacity>
);

// ─── Regular Release Card ─────────────────────────────────────────────────────
const ReleaseCard = ({ item, onPress }: { item: Release; onPress: () => void }) => (
  <TouchableOpacity style={styles.releaseCard} activeOpacity={0.88} onPress={onPress}>
    <ImageBackground source={item.image} style={styles.releaseCardBg} imageStyle={styles.releaseCardImage}>
      {/* Dark overlay */}
      <View style={styles.releaseCardOverlay} />

      {/* Type tag */}
      <View style={styles.releaseTypeBadge}>
        <Text style={styles.releaseTypeBadgeText}>{item.type}</Text>
      </View>

      {/* Days badge */}
      <View style={styles.daysBadge}>
        <Text style={styles.daysBadgeNumber}>{item.daysLeft}</Text>
        <Text style={styles.daysBadgeLabel}>days</Text>
      </View>
    </ImageBackground>

    {/* Info row below image */}
    <View style={styles.releaseInfo}>
      <Image source={item.artistImage} style={styles.releaseArtistAvatar} />
      <View style={styles.releaseTextCol}>
        <Text style={styles.releaseTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.releaseArtistRow}>
          <Text style={styles.releaseArtistName}>{item.artist}</Text>
          <VerifiedIcon />
        </View>
        <View style={styles.releaseBottomRow}>
          <Text style={styles.releasePrice}>${item.price}</Text>
          <Text style={styles.releaseAccesses}>{item.accesses} accesses</Text>
        </View>
      </View>
    </View>

    {/* CTA */}
    <TouchableOpacity style={styles.releaseAccessBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.releaseAccessText}>Get Access</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AllReleasesScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeFilter, setActiveFilter] = useState('All');
  const scrollY = useRef(new Animated.Value(0)).current;

  const filtered = activeFilter === 'All'
    ? ALL_RELEASES
    : ALL_RELEASES.filter(r => r.type === activeFilter);

  const featured = ALL_RELEASES.find(r => r.featured);
  const rest = filtered.filter(r => !r.featured);

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.98)'],
    extrapolate: 'clamp',
  });

  const handleAccess = (item: Release) => {
    navigation.navigate('ProductDetails', {
      name: item.title,
      price: item.price,
      image: item.image,
      description: `Exclusive premium release by ${item.artist}. Get limited-time access now.`,
      artistName: item.artist,
      verified: true,
      category: 'Music',
      artistImage: item.artistImage,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Sticky animated header */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: headerBg }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.stickyTitle}>All Releases</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dark hero area */}
        <View style={styles.heroArea}>
          <Text style={styles.heroTitle}>Exclusive Music Drops</Text>
          <Text style={styles.heroSub}>Get limited-time access to your favorite artists' latest work.</Text>
        </View>

        {/* Featured card */}
        {featured && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionLabel}>Featured Drop</Text>
            <FeaturedCard item={featured} onPress={() => handleAccess(featured)} />
          </View>
        )}

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Releases grid */}
        <View style={styles.releasesGrid}>
          {rest.map(item => (
            <ReleaseCard key={item.id} item={item} onPress={() => handleAccess(item)} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = (width - 48) / 2;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.055,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    borderRadius: 20,
  },
  stickyTitle: {
    color: '#000',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ── Hero ──
  heroArea: {
    paddingTop: height * 0.14,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroLabel: {
    color: '#7126D0',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#000',
    fontSize: 34,
    fontFamily: 'Poppins-Bold',
    lineHeight: 40,
    marginBottom: 10,
  },
  heroSub: {
    color: '#475467',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },

  // ── Featured ──
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionLabel: {
    color: '#475467',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  featuredCard: {
    borderRadius: 8,
    overflow: 'hidden',
    height: 220,
  },
  featuredBg: {
    flex: 1,
  },
  featuredImageStyle: {
    resizeMode: 'cover',
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 18,
    justifyContent: 'space-between',
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: '#7126D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
  },
  priceBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceBadgeText: {
    color: '#111',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  featuredArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featuredArtistAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#7126D0',
  },
  featuredArtistName: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    lineHeight: 24,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featuredMetaText: {
    color: '#aaa',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  featuredAccessBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#7126D0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  featuredAccessText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },

  // ── Filters ──
  filterList: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  filterChipActive: {
    backgroundColor: '#7126D0',
    borderColor: '#7126D0',
  },
  filterChipText: {
    color: '#344054',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
  filterChipTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  // ── Release cards grid ──
  releasesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 16,
  },
  releaseCard: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F2F4F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  releaseCardBg: {
    width: '100%',
    height: CARD_W,
  },
  releaseCardImage: {
    resizeMode: 'cover',
  },
  releaseCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  releaseTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(113,38,208,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  releaseTypeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  daysBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  daysBadgeNumber: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    lineHeight: 16,
  },
  daysBadgeLabel: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  releaseInfo: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    alignItems: 'flex-start',
  },
  releaseArtistAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#7126D0',
    marginTop: 2,
  },
  releaseTextCol: {
    flex: 1,
  },
  releaseTitle: {
    color: '#1A1A1A',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    lineHeight: 16,
    marginBottom: 3,
  },
  releaseArtistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  releaseArtistName: {
    color: '#475467',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  releaseBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  releasePrice: {
    color: '#7126D0',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  releaseAccesses: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  releaseAccessBtn: {
    margin: 10,
    marginTop: 0,
    backgroundColor: '#7126D0',
    borderRadius: 7,
    paddingVertical: 8,
    alignItems: 'center',
  },
  releaseAccessText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
});
