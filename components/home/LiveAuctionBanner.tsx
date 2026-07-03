import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

interface LiveAuctionItem {
  id: number;
  title: string;
  currentBid: string;
  image: any;
}

const LIVE_AUCTIONS: LiveAuctionItem[] = [
  {
    id: 1,
    title: 'Travis Scott x Nike',
    currentBid: '$1,250',
    image: require('../../assets/images/feed7.png'),
  },
  {
    id: 2,
    title: 'Off-White Collab Drop',
    currentBid: '$2,100',
    image: require('../../assets/images/storyItem.jpg'),
  },
];

export default function LiveAuctionBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Pulse the live dot
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Auto-cycle auctions
  useEffect(() => {
    if (LIVE_AUCTIONS.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(prev => (prev + 1) % LIVE_AUCTIONS.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const auction = LIVE_AUCTIONS[currentIndex];

  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      {/* Left content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Live badge */}
        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE AUCTION</Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {auction.title}
        </Text>
        <Text style={styles.bidLabel}>
          Current Bid:{' '}
          <Text style={styles.bidAmount}>{auction.currentBid}</Text>
        </Text>
      </Animated.View>

      {/* Right image */}
      <Animated.View style={[styles.imageWrapper, { opacity: fadeAnim }]}>
        <Image source={auction.image} style={styles.image} />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f7f2ff',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#f7f2ff',
  },
  content: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#7126D0',
  },
  liveText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#7126D0',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  bidLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#555',
  },
  bidAmount: {
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  imageWrapper: {
    width: 62,
    height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e8e0f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
