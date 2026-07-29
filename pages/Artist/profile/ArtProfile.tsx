import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');
const PURPLE = '#7126D0';

type TabType = 'Feed' | 'Shop' | 'Music' | 'Event' | 'Auction';

interface ProductItem {
  id: string;
  title: string;
  artist: string;
  price: string;
  badge?: 'NEW' | 'LTD';
  image: any;
}

interface ReleaseItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  badge?: 'EARLY';
  image: any;
}

const PRODUCTS: ProductItem[] = [
  {
    id: '1',
    title: 'Ethereal Tide Heavyweight...',
    artist: 'by Anelia',
    price: '$38',
    badge: 'NEW',
    image: require('../../../assets/images/product1.jpg'),
  },
  {
    id: '2',
    title: 'Ethereal Tide Purple Vinyl',
    artist: 'by Anelia',
    price: '$38',
    badge: 'LTD',
    image: require('../../../assets/images/drop1.jpg'),
  },
  {
    id: '3',
    title: 'Slow Soundscapes (Hardco...',
    artist: 'by Anelia',
    price: '$38',
    image: require('../../../assets/images/product3.jpg'),
  },
  {
    id: '4',
    title: 'Ambient Ocean Poster Print',
    artist: 'by Anelia',
    price: '$38',
    image: require('../../../assets/images/product4.jpg'),
  },
  {
    id: '5',
    title: 'Slow Soundscapes (Hardco...',
    artist: 'by Anelia',
    price: '$38',
    image: require('../../../assets/images/product5.jpg'),
  },
  {
    id: '6',
    title: 'Ambient Ocean Poster Print',
    artist: 'by Anelia',
    price: '$38',
    image: require('../../../assets/images/feed7.png'),
  },
];

const RELEASES: ReleaseItem[] = [
  {
    id: '1',
    title: 'Glow in the Mist',
    artist: 'Anelia',
    duration: '5:42',
    badge: 'EARLY',
    image: require('../../../assets/images/drop1.jpg'),
  },
  {
    id: '2',
    title: 'Ambient Ocean Drift',
    artist: 'Anelia',
    duration: '4:15',
    image: require('../../../assets/images/story2.png'),
  },
  {
    id: '3',
    title: 'Slow Soundscapes LP',
    artist: 'Anelia',
    duration: '6:01',
    image: require('../../../assets/images/story3.png'),
  },
  {
    id: '4',
    title: 'Vinyl Night Reprise',
    artist: 'Anelia',
    duration: '3:54',
    image: require('../../../assets/images/feed6.jpg'),
  },
];

const ArtProfile: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<TabType>('Feed');
  const [isMated, setIsMated] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Artist Profile Header ── */}
        <View style={styles.headerContainer}>
          {/* Top Row: Avatar + Info + Menu */}
          <View style={styles.profileTopRow}>
            <Image
              source={require('../../../assets/images/black-man.png')}
              style={styles.avatar}
            />

            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.artistName}>Kenny K Shot</Text>
                <Ionicons name="checkmark-circle" size={16} color={PURPLE} style={styles.verifiedIcon} />
              </View>
              <Text style={styles.handle}>@Artist</Text>

              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  <Text style={styles.statNumber}>12.4K</Text> Followers
                </Text>
                <Text style={styles.statDot}>•</Text>
                <Text style={styles.statText}>
                  <Text style={styles.statNumber}>40</Text> Drops
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('ArtSettings')}>
              <Ionicons name="menu-outline" size={24} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons Row: Mate + Message */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.mateBtn, isMated && styles.matedBtn]}
              onPress={() => setIsMated(!isMated)}
              activeOpacity={0.8}
            >
              <Text style={[styles.mateBtnText, isMated && styles.matedBtnText]}>
                {isMated ? 'Mated' : 'Mate'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageBtn}
              onPress={() => navigation.navigate('MessagesScreen')}
              activeOpacity={0.8}
            >
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>

          {/* Bio paragraph */}
          <Text style={styles.bioText}>
            Multi-instrumental ambient producer & digital designer. Crafting slow soundscapes for busy minds. Weekly vinyl & digital drops. 🌊
          </Text>

          {/* Premium Access Banner */}
          <View style={styles.premiumBanner}>
            <View style={styles.premiumTextWrap}>
              <View style={styles.premiumTagRow}>
                <View style={styles.purpleDot} />
                <Text style={styles.premiumTag}>PREMIUM ACCESS</Text>
              </View>
              <Text style={styles.premiumTitle}>Are you an artist who wants to sell your merch?</Text>
              <Text style={styles.premiumSubtitle}>Restart Pro for only $0.89</Text>
            </View>

            <TouchableOpacity style={styles.claimBtn} activeOpacity={0.85}>
              <Text style={styles.claimBtnText}>Claim Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sub-Tabs Bar: Feed | Shop | Music | Event | Auction ── */}
        <View style={styles.tabsBar}>
          {(['Feed', 'Shop', 'Music', 'Event', 'Auction'] as const).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, isActive && styles.activeTabItem]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tab Content Views ── */}
        {activeTab === 'Feed' && (
          <View style={styles.tabContent}>
            {/* Feed Post 1 */}
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={require('../../../assets/images/black-man.png')}
                  style={styles.postAvatar}
                />
                <View style={styles.postHeaderInfo}>
                  <View style={styles.postNameRow}>
                    <Text style={styles.postArtistName}>VORTEX</Text>
                    <Ionicons name="checkmark-circle" size={14} color={PURPLE} />
                  </View>
                  <Text style={styles.postTime}>1h ago</Text>
                </View>
                <TouchableOpacity style={styles.postPlusBtn}>
                  <Ionicons name="add" size={20} color="#111" />
                </TouchableOpacity>
              </View>

              <Text style={styles.postCaption}>
                VORTEX TOUR KICKS OFF TONIGHT. 🛍️ #NEONNIGHTS
              </Text>

              <Image
                source={require('../../../assets/images/feed6.jpg')}
                style={styles.postMedia}
              />

              <View style={styles.postActionBar}>
                <View style={styles.actionItem}>
                  <Ionicons name="heart" size={20} color={PURPLE} />
                  <Text style={styles.actionCount}>15.2K</Text>
                </View>
                <View style={styles.actionItem}>
                  <Ionicons name="chatbubble-outline" size={20} color="#111" />
                  <Text style={styles.actionCount}>15.2K</Text>
                </View>
                <TouchableOpacity style={styles.actionItem}>
                  <Ionicons name="share-outline" size={20} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionItem, { marginLeft: 'auto' }]}>
                  <Ionicons name="repeat-outline" size={20} color="#111" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Feed Post 2 with Shoppable Tag */}
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={require('../../../assets/images/black-man.png')}
                  style={styles.postAvatar}
                />
                <View style={styles.postHeaderInfo}>
                  <View style={styles.postNameRow}>
                    <Text style={styles.postArtistName}>VORTEX</Text>
                    <Ionicons name="checkmark-circle" size={14} color={PURPLE} />
                  </View>
                  <Text style={styles.postTime}>1h ago</Text>
                </View>
                <TouchableOpacity style={styles.postPlusBtn}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#111" />
                </TouchableOpacity>
              </View>

              <Text style={styles.postCaption}>
                VORTEX TOUR KICKS OFF TONIGHT. 🛍️ #NEONNIGHTS
              </Text>

              <View style={styles.mediaWrap}>
                <Image
                  source={require('../../../assets/images/feed6.jpg')}
                  style={styles.postMedia}
                />
                {/* Shoppable Tag Banner */}
                <View style={styles.shoppableTag}>
                  <Text style={styles.shoppableTitle}>Iwear Collection</Text>
                  <View style={styles.shoppablePriceBadge}>
                    <Text style={styles.shoppablePrice}>$1,250</Text>
                  </View>
                </View>
              </View>

              <View style={styles.postActionBar}>
                <View style={styles.actionItem}>
                  <Ionicons name="heart" size={20} color={PURPLE} />
                  <Text style={styles.actionCount}>15.2K</Text>
                </View>
                <View style={styles.actionItem}>
                  <Ionicons name="chatbubble-outline" size={20} color="#111" />
                  <Text style={styles.actionCount}>15.2K</Text>
                </View>
                <TouchableOpacity style={styles.actionItem}>
                  <Ionicons name="share-outline" size={20} color="#111" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionItem, { marginLeft: 'auto' }]}>
                  <Ionicons name="repeat-outline" size={20} color="#111" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'Shop' && (
          <View style={styles.shopGrid}>
            {PRODUCTS.map(item => (
              <View key={item.id} style={styles.productCard}>
                <View style={styles.productImgWrap}>
                  <Image source={item.image} style={styles.productImg} />
                  {item.badge && (
                    <View
                      style={[
                        styles.badgePill,
                        item.badge === 'LTD' ? styles.badgeLtd : styles.badgeNew,
                      ]}
                    >
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.productArtist}>{item.artist}</Text>

                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <TouchableOpacity style={styles.cartIconBtn}>
                      <Ionicons name="bag-handle-outline" size={16} color={PURPLE} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Music' && (
          <View style={styles.tabContent}>
            {/* Featured LP Player Hero */}
            <View style={styles.lpCard}>
              <Image
                source={require('../../../assets/images/drop1.jpg')}
                style={styles.lpHeroImg}
              />
              <View style={styles.lpOverlay}>
                <TouchableOpacity
                  style={styles.lpPlayCircle}
                  onPress={() => setIsPlayingMusic(!isPlayingMusic)}
                >
                  <Ionicons
                    name={isPlayingMusic ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <View style={styles.lpFooter}>
                  <View style={styles.lpTextWrap}>
                    <Text style={styles.lpTitle}>Ethereal Tide LP</Text>
                    <Text style={styles.lpSub}>12 tracks • Released today</Text>
                  </View>

                  <TouchableOpacity style={styles.streamBtn}>
                    <Text style={styles.streamBtnText}>STREAM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Releases Section */}
            <Text style={styles.sectionHeading}>ALL RELEASES</Text>
            <View style={styles.releasesList}>
              {RELEASES.map(track => (
                <TouchableOpacity key={track.id} style={styles.releaseRow} activeOpacity={0.7}>
                  <Image source={track.image} style={styles.releaseThumb} />
                  <View style={styles.releaseInfo}>
                    <View style={styles.releaseTitleRow}>
                      <Text style={styles.releaseTitle}>{track.title}</Text>
                      {track.badge && (
                        <View style={styles.earlyBadge}>
                          <Text style={styles.earlyBadgeText}>{track.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.releaseArtist}>{track.artist}</Text>
                  </View>
                  <Text style={styles.releaseDuration}>{track.duration}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Floating Mini Player Bar */}
            {isPlayingMusic && (
              <View style={styles.miniPlayerBar}>
                <Image
                  source={require('../../../assets/images/drop1.jpg')}
                  style={styles.miniPlayerThumb}
                />
                <Text style={styles.miniPlayerTitle} numberOfLines={1}>
                  Glow in the Mist
                </Text>
                <View style={styles.miniPlayerControls}>
                  <TouchableOpacity onPress={() => setIsPlayingMusic(false)}>
                    <Ionicons name="pause" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ marginLeft: 12 }}>
                    <Ionicons name="play-skip-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'Event' && (
          <View style={styles.tabContent}>
            {[
              { title: 'Vortex Neon World Tour', location: 'Los Angeles, CA', date: 'AUG 12 • 8:00 PM' },
              { title: 'Live Vinyl & Acoustic Session', location: 'London, UK', date: 'SEP 04 • 7:30 PM' },
              { title: 'CelebStash Exclusive Meet & Greet', location: 'New York, NY', date: 'OCT 18 • 6:00 PM' },
            ].map((event, idx) => (
              <View key={idx} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                  <Text style={styles.eventLoc}>{event.location}</Text>
                </View>
                <TouchableOpacity style={styles.ticketBtn}>
                  <Text style={styles.ticketBtnText}>Get Tickets</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Auction' && (
          <View style={styles.tabContent}>
            {[
              { title: 'Signed Ethereal Vinyl #001', currentBid: '$340', timeLeft: '02h 14m' },
              { title: 'Worn Vortex Tour Hoodie', currentBid: '$520', timeLeft: '05h 40m' },
            ].map((auc, idx) => (
              <View key={idx} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{auc.title}</Text>
                  <Text style={styles.eventDate}>Current Bid: {auc.currentBid}</Text>
                  <Text style={styles.eventLoc}>Ends in: {auc.timeLeft}</Text>
                </View>
                <TouchableOpacity style={styles.ticketBtn}>
                  <Text style={styles.ticketBtnText}>Place Bid</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header ──
  headerContainer: {
    paddingTop: height * 0.055,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  handle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  statNumber: {
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  statDot: {
    marginHorizontal: 6,
    color: '#9CA3AF',
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  mateBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  matedBtn: {
    backgroundColor: '#EDE9FE',
  },
  mateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  matedBtnText: {
    color: PURPLE,
  },
  messageBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  messageBtnText: {
    color: '#111',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  bioText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    lineHeight: 19,
    marginBottom: 14,
  },

  // ── Premium Access Banner ──
  premiumBanner: {
    backgroundColor: '#F5F3FF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  premiumTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  premiumTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  purpleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PURPLE,
    marginRight: 6,
  },
  premiumTag: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    letterSpacing: 0.5,
  },
  premiumTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
    lineHeight: 18,
  },
  premiumSubtitle: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  claimBtn: {
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexShrink: 0,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },

  // ── Sub-Tabs Bar ──
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: PURPLE,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: PURPLE,
    fontFamily: 'Poppins-Bold',
  },

  // ── Tab Content ──
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postArtistName: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  postTime: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  postPlusBtn: {
    padding: 4,
  },
  postCaption: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    lineHeight: 18,
    marginBottom: 10,
  },
  mediaWrap: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  postMedia: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  shoppableTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shoppableTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  shoppablePriceBadge: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  shoppablePrice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#374151',
  },

  // ── Shop Grid ──
  shopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  productImgWrap: {
    position: 'relative',
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeNew: {
    backgroundColor: PURPLE,
  },
  badgeLtd: {
    backgroundColor: '#D946EF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'Poppins-Bold',
  },
  productInfo: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  productTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  productArtist: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  cartIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Music Section ──
  lpCard: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  lpHeroImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 16,
  },
  lpPlayCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 35,
  },
  lpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lpTextWrap: {
    flex: 1,
  },
  lpTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  lpSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  streamBtn: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  streamBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  releasesList: {
    gap: 12,
  },
  releaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
  },
  releaseThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 12,
  },
  releaseInfo: {
    flex: 1,
  },
  releaseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  releaseTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  earlyBadge: {
    backgroundColor: '#F59E0B',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  earlyBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Poppins-Bold',
  },
  releaseArtist: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  releaseDuration: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },

  // ── Mini Player ──
  miniPlayerBar: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  miniPlayerThumb: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 10,
  },
  miniPlayerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Event / Auction Cards ──
  eventCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#111',
  },
  eventDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: PURPLE,
    marginTop: 2,
  },
  eventLoc: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginTop: 1,
  },
  ticketBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ticketBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
});

export default ArtProfile;
