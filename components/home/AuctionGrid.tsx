import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const cardWidth = (width * 0.88 - 12) / 2; // Two columns with padding and gap spacing

// Simple verified check badge in orange
const PurpleVerifiedBadge = () => (
  <Svg width="12" height="12" viewBox="0 0 18 18" fill="none">
    <Path
      d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724ZM6.50256 15.462L5.51556 13.8119L3.65481 13.419C3.50581 13.3914 3.38706 13.3115 3.29856 13.179C3.21006 13.047 3.17356 12.9065 3.18906 12.7575L3.36681 10.8405L2.10456 9.40045C1.99856 9.29195 1.94556 9.15845 1.94556 8.99995C1.94556 8.84145 1.99856 8.70795 2.10456 8.59945L3.36681 7.15945L3.18906 5.2432C3.17406 5.0937 3.21056 4.95295 3.29856 4.82095C3.38706 4.68895 3.50581 4.60895 3.65481 4.58095L5.51481 4.1887L6.50181 2.5387C6.58281 2.4047 6.69156 2.3122 6.82806 2.2612C6.96456 2.2097 7.10581 2.21645 7.25181 2.28145L9.00006 3.0202L10.7476 2.28145C10.8941 2.21645 11.0356 2.2097 11.1721 2.2612C11.3086 2.3122 11.4173 2.4047 11.4983 2.5387L12.4846 4.1887L14.3453 4.58095C14.4943 4.60895 14.6131 4.68895 14.7016 4.82095C14.7901 4.95295 14.8266 5.0937 14.8111 5.2432L14.6341 7.15945L15.8956 8.59945C16.0016 8.70795 16.0546 8.84145 16.0546 8.99995C16.0546 9.15845 16.0016 9.2922 15.8956 9.4012L14.6341 10.8405L14.8111 12.7567C14.8261 12.9062 14.7896 13.047 14.7016 13.179C14.6131 13.3115 14.4943 13.3914 14.3453 13.419L12.4853 13.8119L11.4983 15.462C11.4173 15.5954 11.3086 15.688 11.1721 15.7395C11.0356 15.791 10.8943 15.784 10.7483 15.7185L9.00006 14.9797L7.25256 15.7185C7.10606 15.7835 6.96456 15.7902 6.82806 15.7387C6.69156 15.6877 6.58281 15.5952 6.50181 15.4612" fill="#7126D0" />
  </Svg>
);

export interface AuctionItem {
  id: number;
  image: any;
  title: string;
  viewerCount: string;
  artistName: string;
  artistAvatar: any;
  timeAgo: string;
}

interface AuctionGridProps {
  auctions?: AuctionItem[];
}

const AuctionGrid: React.FC<AuctionGridProps> = ({ auctions = [] }) => {
  // If no auctions are available, hide the component entirely
  if (auctions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {auctions.map((item) => (
        <TouchableOpacity key={item.id} activeOpacity={0.95} style={styles.cardWrapper}>
          <ImageBackground source={item.image} style={styles.cardBackground} imageStyle={styles.cardImageStyle}>
            {/* Top Badges */}
            <View style={styles.topBadgesRow}>
              <View style={styles.auctionBadge}>
                <Text style={styles.auctionDot}>•</Text>
                <Text style={styles.auctionText}>Auction</Text>
              </View>

              <View style={styles.viewerBadge}>
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={styles.userIcon}>
                  <Path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                    fill="white"
                  />
                </Svg>
                <Text style={styles.viewerText}>{item.viewerCount}</Text>
              </View>
            </View>

            {/* Bottom Overlay Info */}
            <View style={styles.bottomOverlay}>
              <Text style={styles.titleText} numberOfLines={2}>
                {item.title}
              </Text>

              {/* User row */}
              <View style={styles.userRow}>
                <Image source={item.artistAvatar} style={styles.userAvatar} />
                <View style={styles.userDetails}>
                  <View style={styles.userNameContainer}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {item.artistName}
                    </Text>
                    <PurpleVerifiedBadge />
                  </View>
                  <Text style={styles.timeAgo}>{item.timeAgo}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AuctionGrid;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 12,
  },
  cardWrapper: {
    width: cardWidth,
    height: cardWidth * 1.3,
    borderRadius: 5,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
  },
  cardImageStyle: {
    borderRadius: 5,
    backgroundColor: '#333',
  },
  topBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  auctionDot: {
    color: '#000',
    fontSize: 16,
    marginRight: 3,
    fontWeight: 'bold',
  },
  auctionText: {
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  userIcon: {
    marginRight: 4,
  },
  viewerText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  bottomOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    padding: 8,
    borderRadius: 5,
  },
  titleText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    lineHeight: 15,
    marginBottom: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  userName: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
  },
  timeAgo: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginTop: -2,
  },
});
