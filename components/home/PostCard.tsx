import React, { useState } from 'react';
import Svg, { Path } from "react-native-svg";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Modal,
  ScrollView,
} from 'react-native';

import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

const { width } = Dimensions.get('window');
const horizontalPadding = 24;
const imageSpacing = 12;

interface PostCardProps {
  userName: string;
  userImage: any;
  timeAgo: string;
  verified: boolean;
  postText: string;
  mainImage: any;
  price: string;
  images: any[];
  likes: string;
  comments: string;
  shares: string;
  trending: string;
}

const CollapsiblePostText: React.FC<{ text: string; numberOfLines?: number }> = ({ text, numberOfLines = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongText = text.split(' ').length > 20;

  return (
    <View>
      <Text
        style={styles.postText}
        numberOfLines={expanded ? undefined : numberOfLines}
      >
        {text}
      </Text>

      {isLongText && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.readMoreText}>
            {expanded ? 'Show less' : '... Read more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const PostCard: React.FC<PostCardProps> = ({
  userName,
  userImage,
  timeAgo,
  verified,
  postText,
  mainImage,
  price,
  images,
  likes,
  comments,
  shares,
  trending,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const extraPhotosCount = images.length - 2;
  const displayImages = images.slice(0, 2);

  const handleViewAll = () => setIsModalVisible(true);
  const handleLike = () => setIsLiked(!isLiked);
  const closeModal = () => setIsModalVisible(false);

 const navigation = useNavigation<StackNavigationProp<any>>();

 const handleDetails = () => navigation.navigate("ProductDetails");

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleDetails}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={userImage} style={styles.userAvatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userName}{' '}
              {verified && (
                <Text style={styles.verified}>
                  <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" >
                                <Path d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724ZM6.50256 15.462L5.51556 13.8119L3.65481 13.419C3.50581 13.3914 3.38706 13.3115 3.29856 13.179C3.21006 13.047 3.17356 12.9065 3.18906 12.7575L3.36681 10.8405L2.10456 9.40045C1.99856 9.29195 1.94556 9.15845 1.94556 8.99995C1.94556 8.84145 1.99856 8.70795 2.10456 8.59945L3.36681 7.15945L3.18906 5.2432C3.17406 5.0937 3.21056 4.95295 3.29856 4.82095C3.38706 4.68895 3.50581 4.60895 3.65481 4.58095L5.51481 4.1887L6.50181 2.5387C6.58281 2.4047 6.69156 2.3122 6.82806 2.2612C6.96456 2.2097 7.10581 2.21645 7.25181 2.28145L9.00006 3.0202L10.7476 2.28145C10.8941 2.21645 11.0356 2.2097 11.1721 2.2612C11.3086 2.3122 11.4173 2.4047 11.4983 2.5387L12.4846 4.1887L14.3453 4.58095C14.4943 4.60895 14.6131 4.68895 14.7016 4.82095C14.7901 4.95295 14.8266 5.0937 14.8111 5.2432L14.6341 7.15945L15.8956 8.59945C16.0016 8.70795 16.0546 8.84145 16.0546 8.99995C16.0546 9.15845 16.0016 9.2922 15.8956 9.4012L14.6341 10.8405L14.8111 12.7567C14.8261 12.9062 14.7896 13.047 14.7016 13.179C14.6131 13.3115 14.4943 13.3914 14.3453 13.419L12.4853 13.8119L11.4983 15.462C11.4173 15.5954 11.3086 15.688 11.1721 15.7395C11.0356 15.791 10.8943 15.784 10.7483 15.7185L9.00006 14.9797L7.25256 15.7185C7.10606 15.7835 6.96456 15.7902 6.82806 15.7387C6.69156 15.6877 6.58281 15.5952 6.50181 15.4612" fill="#FF650E" />
                              </Svg>
                </Text>
              )}
            </Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>
        <View style={styles.mateButton}>
          <Text style={styles.mateText}>Mate</Text>
        </View>
      </View>

      {/* Post Text */}
      <CollapsiblePostText text={postText} />

      {/* Main Image with Price */}
      <View style={styles.mainImageContainer}>
        <Image source={mainImage} style={styles.mainImage} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{price}</Text>
        </View>
      </View>

      {/* Secondary Images */}
      <View style={styles.secondaryImages}>
        {displayImages.map((img, index) => (
          <Image key={index} source={img} style={styles.secondaryImage} />
        ))}
        {extraPhotosCount > 0 && (
          <TouchableOpacity onPress={handleViewAll} style={styles.blurContainer}>
            <ImageBackground
              source={images[2] || images[1]}
              style={styles.secondaryImage}
              blurRadius={10}
            >
              <View style={styles.blurOverlay}>
                <Text style={styles.blurText}>+{extraPhotosCount} photos</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
      </View>

      {/* Footer Stats */}
      <View style={styles.footer}>
        <View style={styles.statsLeft}>
          <TouchableOpacity style={styles.statItem} onPress={handleLike}>
  <Svg
    width={17}
    height={18}
    viewBox="0 0 19 18"
    fill={isLiked ? "#FF650E" : "white"}
    stroke={!isLiked ? "#000" : "none"}
    strokeWidth={!isLiked ? 1.5 : 0}
  >
    <Path
      d="M9.5 16.0125L8.4125 15.0225C4.55 11.52 2 9.2025 2 6.375C2 4.0575 3.815 2.25 6.125 2.25C7.43 2.25 8.6825 2.8575 9.5 3.81C10.3175 2.8575 11.57 2.25 12.875 2.25C15.185 2.25 17 4.0575 17 6.375C17 9.2025 14.45 11.52 10.5875 15.0225L9.5 16.0125Z"
      fill={isLiked ? "#FF650E" : "white"}
      stroke={!isLiked ? "#000" : "none"}
      strokeWidth={!isLiked ? 1.5 : 0}
    />
  </Svg>
  <Text style={styles.statNumber}>{likes}</Text>
</TouchableOpacity>

          <View style={styles.statItem}>
            <Text style={styles.statIcon}>
                <Svg width="19" height="19" viewBox="0 0 17 17" fill="none">
<Path d="M8.5 14.5C9.68669 14.5 10.8467 14.1481 11.8334 13.4888C12.8201 12.8295 13.5892 11.8925 14.0433 10.7961C14.4974 9.69975 14.6162 8.49335 14.3847 7.32946C14.1532 6.16558 13.5818 5.09648 12.7426 4.25736C11.9035 3.41825 10.8344 2.8468 9.67054 2.61529C8.50666 2.38378 7.30026 2.5026 6.2039 2.95673C5.10754 3.41085 4.17047 4.17989 3.51118 5.16658C2.85189 6.15328 2.5 7.31331 2.5 8.5C2.5 9.492 2.74 10.4273 3.16667 11.2513L2.5 14.5L5.74867 13.8333C6.57267 14.26 7.50867 14.5 8.5 14.5Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</Svg>

            </Text>
            <Text style={styles.statNumber}>{comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>
                <Svg width="19" height="19" viewBox="0 0 15 13" fill="none">
<Path d="M13.9713 6.02877L8.63792 0.695435C8.54468 0.602229 8.42591 0.538758 8.29661 0.513046C8.1673 0.487335 8.03328 0.500537 7.91148 0.550983C7.78968 0.60143 7.68557 0.686856 7.61232 0.796463C7.53906 0.90607 7.49995 1.03494 7.49992 1.16677V3.5301C5.67878 3.69863 3.98607 4.54068 2.75305 5.89145C1.52002 7.24223 0.835433 9.00452 0.833252 10.8334V11.8334C0.833357 11.9718 0.876525 12.1067 0.956768 12.2195C1.03701 12.3322 1.15035 12.4172 1.28107 12.4626C1.41179 12.5081 1.5534 12.5117 1.68627 12.473C1.81914 12.4343 1.93668 12.3553 2.02259 12.2468C2.67582 11.4702 3.47721 10.8315 4.37998 10.3681C5.28276 9.90459 6.26881 9.62562 7.28059 9.54743C7.31392 9.54343 7.39725 9.53677 7.49992 9.5301V11.8334C7.49995 11.9653 7.53906 12.0941 7.61232 12.2037C7.68557 12.3133 7.78968 12.3988 7.91148 12.4492C8.03328 12.4997 8.1673 12.5129 8.29661 12.4872C8.42591 12.4614 8.54468 12.398 8.63792 12.3048L13.9713 6.97144C14.0962 6.84642 14.1664 6.67688 14.1664 6.5001C14.1664 6.32333 14.0962 6.15379 13.9713 6.02877ZM8.83325 10.2241V8.83344C8.83325 8.65662 8.76301 8.48706 8.63799 8.36203C8.51297 8.23701 8.3434 8.16677 8.16659 8.16677C7.99659 8.16677 7.30259 8.2001 7.12525 8.22344C5.32845 8.3888 3.6181 9.07146 2.20125 10.1888C2.36208 8.71839 3.05961 7.359 4.16029 6.37087C5.26096 5.38275 6.68744 4.83533 8.16659 4.83344C8.3434 4.83344 8.51297 4.7632 8.63799 4.63817C8.76301 4.51315 8.83325 4.34358 8.83325 4.16677V2.7761L12.5573 6.5001L8.83325 10.2241Z" fill="black"/>
</Svg>

            </Text>
            <Text style={styles.statNumber}>{shares}</Text>
          </View>
        </View>
        <View style={styles.trendingBadge}>
          <Text style={styles.trendingText}>{trending}</Text>
        </View>
      </View>

      {/* Modal for View All Photos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              {images.map((img, index) => (
                <Image key={index} source={img} style={styles.modalImage} />
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
     </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: horizontalPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: width - 2 * horizontalPadding,
    marginBottom: 30,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userAvatar: { width: width * 0.1, height: width * 0.1, borderRadius: (width * 0.1)/2, marginRight: 12 },
  userDetails: { flex: 1 },
  userName: { fontSize: width * 0.04, fontWeight: '600', color: '#000', marginBottom: 2 },
  verified: { color: '#f28c38', fontSize: width * 0.035, fontWeight: 'bold' },
  timeAgo: { fontSize: width * 0.035, color: '#666' },
  mateButton: { backgroundColor: '#FF650E26', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  mateText: { color: '#FF650E', fontSize: width * 0.035, fontWeight: '500' },
  postText: { fontSize: width * 0.04, lineHeight: width * 0.056, color: '#000', marginBottom: 15 },
  readMoreText: { color: '#555', fontWeight: 'bold', marginTop: -10, marginBottom: 15 },
  mainImageContainer: { position: 'relative', marginBottom: 12 },
  mainImage: { width: '100%', height: width * 0.35, borderRadius: 20 },
  priceTag: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  priceText: { color: '#fff', fontSize: width * 0.035, fontWeight: 'bold' },
  secondaryImages: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  secondaryImage: { width: (width - horizontalPadding*0.7 - imageSpacing) / 2.6, height: width * 0.35, borderRadius: 20 },
  blurContainer: { width: (width - horizontalPadding*2 - imageSpacing) / 3, height: width * 0.3, borderRadius: 8, overflow: 'hidden' },
  blurOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  blurText: { color: '#fff', fontSize: width * 0.04, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' , marginTop: 8},
  statsLeft: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  statIcon: { fontSize: width * 0.045, marginRight: 4 },
  likedIcon: { color: '#f28c38' },
  likeIconContainer: {
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 12,
},
  unlikedIcon: { color: '#fff', backgroundColor: '#000', padding: 2, borderRadius: 4 },
  statNumber: { fontSize: width * 0.035, color: '#000', fontWeight: '500' },
  trendingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  trendingText: { color: '#FF650E', fontSize: width * 0.035, fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: width - 32, maxHeight: '80%' },
  modalImage: { width: '100%', height: width * 0.5, borderRadius: 8, marginBottom: 8 },
  closeButton: { backgroundColor: '#f28c38', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontSize: width * 0.04, fontWeight: '500' },
});

export default PostCard;
