import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { storiesService } from "@/lib/storiesService";

const { width, height } = Dimensions.get("window");

type AppStackParamList = {
  ProfileDetails: { story: { id: number; username: string; image: any } };
};

type ProfileDetailsScreenRouteProp = RouteProp<AppStackParamList, "ProfileDetails">;

// Stories list for each artist to display multiple stories at the top
const artistStoriesMap: Record<string, { id?: number; image: any; likes: string; bookmarks: string }[]> = {
  "blue_boy": [
    { id: 201, image: require("../../assets/images/storyItem.jpg"), likes: "12.2k", bookmarks: "346.8k" },
    { id: 202, image: require("../../assets/images/products/product1.jpg"), likes: "8.4k", bookmarks: "120.5k" },
    { id: 203, image: require("../../assets/images/drop1.jpg"), likes: "15.1k", bookmarks: "412.3k" },
  ],
  "steve.loves": [
    { id: 204, image: require("../../assets/images/story2.png"), likes: "10.2k", bookmarks: "220.1k" },
  ],
  "waggles": [
    { id: 205, image: require("../../assets/images/story3.png"), likes: "14.5k", bookmarks: "512.0k" },
  ],
  "sabanok...": [
    { id: 206, image: require("../../assets/images/story1.png"), likes: "15.4k", bookmarks: "480.2k" },
  ],
};

const getStoriesForArtist = (username: string) => {
  return artistStoriesMap[username] || [
    { id: 207, image: require("../../assets/images/story1.png"), likes: "5.2k", bookmarks: "88.1k" },
  ];
};

const artists = [
  { id: 1, username: "sabanok...", image: require("../../assets/images/story1.png") },
  { id: 2, username: "blue_boy", image: require("../../assets/images/storyItem.jpg") },
  { id: 3, username: "waggles", image: require("../../assets/images/story3.png") },
  { id: 4, username: "steve.loves", image: require("../../assets/images/story4.png") },
];

const ProfileDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<ProfileDetailsScreenRouteProp>();
  const [currentArtist, setCurrentArtist] = useState(route.params?.story || artists[0]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState(false);
  const [replyText, setReplyText] = useState('');

  const pressStartTime = useRef(0);
  const hasNavigatedAway = useRef(false);
  const stories = getStoriesForArtist(currentArtist.username);
  const currentStory = stories[currentStoryIndex];

  const handleSendReaction = (emoji: string) => {
    storiesService.reactToStory(currentStory.id || 1, emoji);
    Alert.alert('Quick Reaction', `Sent ${emoji} to ${currentArtist.username}!`);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    storiesService.replyToStory(currentStory.id || 1, replyText.trim());
    setReplyText('');
    Alert.alert('Reply Sent', `Your message was sent to ${currentArtist.username}`);
  };

  // Story ticking timer effect
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          return 1;
        }
        return p + 0.01;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentStoryIndex, isPaused, currentArtist]);

  // Handle auto-advance when progress reaches 1
  useEffect(() => {
    if (progress >= 1) {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex((prev) => prev + 1);
        setProgress(0);
      } else {
        // Find next artist
        const currentIndex = artists.findIndex((a) => a.username === currentArtist.username);
        if (currentIndex !== -1 && currentIndex < artists.length - 1) {
          setCurrentArtist(artists[currentIndex + 1]);
          setCurrentStoryIndex(0);
          setProgress(0);
        } else {
          if (!hasNavigatedAway.current) {
            hasNavigatedAway.current = true;
            navigation.goBack();
          }
        }
      }
    }
  }, [progress]);

  // Reset states when switching story item or artist
  useEffect(() => {
    setProgress(0);
  }, [currentStoryIndex, currentArtist]);

  const handleTapLeft = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      // Find previous artist
      const currentIndex = artists.findIndex((a) => a.username === currentArtist.username);
      if (currentIndex > 0) {
        const prevArtist = artists[currentIndex - 1];
        const prevStories = getStoriesForArtist(prevArtist.username);
        setCurrentArtist(prevArtist);
        setCurrentStoryIndex(prevStories.length - 1);
        setProgress(0);
      } else {
        setProgress(0);
      }
    }
  };

  const handleTapRight = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Find next artist
      const currentIndex = artists.findIndex((a) => a.username === currentArtist.username);
      if (currentIndex !== -1 && currentIndex < artists.length - 1) {
        setCurrentArtist(artists[currentIndex + 1]);
        setCurrentStoryIndex(0);
        setProgress(0);
      } else {
        if (!hasNavigatedAway.current) {
          hasNavigatedAway.current = true;
          navigation.goBack();
        }
      }
    }
  };

  const handlePressIn = () => {
    setIsPaused(true);
    pressStartTime.current = Date.now();
  };

  const handlePressOutLeft = () => {
    setIsPaused(false);
    const duration = Date.now() - pressStartTime.current;
    if (duration < 300) {
      handleTapLeft();
    }
  };

  const handlePressOutRight = () => {
    setIsPaused(false);
    const duration = Date.now() - pressStartTime.current;
    if (duration < 300) {
      handleTapRight();
    }
  };

  const selectArtist = (artist: typeof artists[0]) => {
    setCurrentArtist(artist);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsLiked(false);
    setIsBookmarked(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Story Background Image */}
      <Image source={currentStory.image} style={styles.storyImage} />

      {/* Progress Bars Indicator at the top */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => {
          let fillWidth = "0%";
          if (index < currentStoryIndex) {
            fillWidth = "100%";
          } else if (index === currentStoryIndex) {
            fillWidth = `${progress * 100}%`;
          }
          return (
            <View key={index} style={styles.progressBarBackground}>
              <View style={[styles.progressBarFilled, { width: fillWidth as any }]} />
            </View>
          );
        })}
      </View>

      {/* Top Header details */}
      <View style={styles.topHeader}>
        <Image source={currentArtist.image} style={styles.profilePic} />
        <View style={styles.headerInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{currentArtist.username}</Text>
            {/* Orange/Red verification badge */}
            <View style={styles.verifiedBadge}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="#7126D0" stroke="#7126D0" strokeWidth="1">
                <Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </Svg>
            </View>
          </View>
          <Text style={styles.timeText}>{currentStoryIndex + 1}h</Text>
        </View>

        {/* Translucent Mate button */}
        <TouchableOpacity style={styles.mateButton} activeOpacity={0.8}>
          <Text style={styles.mateText}>Mate</Text>
        </TouchableOpacity>
      </View>

      {/* Invisible Tap Areas for Instagram Navigation */}
      <View style={styles.tapContainer}>
        <TouchableOpacity
          style={styles.tapLeft}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOutLeft}
        />
        <TouchableOpacity
          style={styles.tapRight}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOutRight}
        />
      </View>

      {/* Interactive Shoppable Sticker for Artists */}
      {((currentArtist as any).hasSticker || currentArtist.username === 'Kenny K Shot' || currentArtist.username === 'sabanok...') && (
        <TouchableOpacity
          style={styles.storySticker}
          activeOpacity={0.85}
          onPress={() => {
            navigation.navigate('ProductDetails', {
              name: 'Eras Tour Crystal Jacket',
              price: '$250',
              image: require('../../assets/images/feed6.jpg'),
              description: 'Official Limited Edition Merch as seen on story.',
              artistName: currentArtist.username,
              verified: true,
            });
          }}
        >
          <View style={styles.stickerIconBadge}>
            <Ionicons name="bag-handle" size={16} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stickerTitle}>Tap to Shop Merch</Text>
            <Text style={styles.stickerSub}>Eras Tour Crystal Jacket • $250</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#7126D0" />
        </TouchableOpacity>
      )}

      {/* Floating Vertical Actions on the Right */}
      <View style={styles.rightActionsPanel}>
        <TouchableOpacity
          style={styles.actionCircle}
          onPress={() => setIsLiked(!isLiked)}
          activeOpacity={0.8}
        >
          <Svg width="26" height="26" viewBox="0 0 24 24" fill={isLiked ? "#7126D0" : "none"} stroke={isLiked ? "#7126D0" : "#fff"} strokeWidth="2.5">
            <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.actionText}>{currentStory.likes}</Text>

        <TouchableOpacity
          style={styles.actionCircle}
          onPress={() => setIsBookmarked(!isBookmarked)}
          activeOpacity={0.8}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill={isBookmarked ? "#fff" : "none"} stroke="#fff" strokeWidth="2.5">
            <Path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.actionText}>{currentStory.bookmarks}</Text>

        {/* Analytics Drawer Trigger Button */}
        <TouchableOpacity
          style={styles.actionCircle}
          onPress={() => setShowAnalyticsDrawer(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="bar-chart-outline" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.actionText}>Stats</Text>
      </View>

      {/* Quick Emoji Reaction Bar & DM Reply Input */}
      <View style={styles.interactiveBottomBar}>
        <View style={styles.emojiQuickRow}>
          {['❤️', '🔥', '👏', '😂', '😮', '🎉'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiBubble}
              onPress={() => handleSendReaction(emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.replyInputRow}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Send message to ${currentArtist.username}...`}
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={replyText}
            onChangeText={setReplyText}
          />
          {replyText.trim().length > 0 && (
            <TouchableOpacity style={styles.sendReplyBtn} onPress={handleSendReply}>
              <Ionicons name="send" size={16} color="#7126D0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Owner Analytics & Viewer Drawer */}
      {showAnalyticsDrawer && (
        <View style={styles.analyticsDrawerOverlay}>
          <View style={styles.analyticsDrawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Story Analytics & Viewers</Text>
              <TouchableOpacity onPress={() => setShowAnalyticsDrawer(false)}>
                <Ionicons name="close" size={22} color="#111" />
              </TouchableOpacity>
            </View>

            <View style={styles.analyticsStatsGrid}>
              <View style={styles.analyticsStatBox}>
                <Text style={styles.analyticsStatNumber}>1.4K</Text>
                <Text style={styles.analyticsStatLabel}>Total Views</Text>
              </View>
              <View style={styles.analyticsStatBox}>
                <Text style={styles.analyticsStatNumber}>94%</Text>
                <Text style={styles.analyticsStatLabel}>Completion Rate</Text>
              </View>
              <View style={styles.analyticsStatBox}>
                <Text style={styles.analyticsStatNumber}>4.8s</Text>
                <Text style={styles.analyticsStatLabel}>Avg Watch Time</Text>
              </View>
            </View>

            <Text style={styles.viewersSectionTitle}>Recent Viewers ({currentStory.likes})</Text>
            <ScrollView style={styles.viewersList} showsVerticalScrollIndicator={false}>
              {[
                { name: 'Alex Johnson', time: '10m ago', reaction: '🔥' },
                { name: 'Sarah Connor', time: '25m ago', reaction: '❤️' },
                { name: 'Michael Scott', time: '1h ago', reaction: '👏' },
                { name: 'Dwight Schrute', time: '2h ago', reaction: '😂' },
              ].map((item, idx) => (
                <View key={idx} style={styles.viewerRow}>
                  <View style={styles.viewerAvatarPlaceholder}>
                    <Text style={styles.viewerAvatarChar}>{item.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.viewerName}>{item.name}</Text>
                    <Text style={styles.viewerTime}>{item.time}</Text>
                  </View>
                  <Text style={{ fontSize: 16 }}>{item.reaction}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bottom Row containing horizontal list of stories & close X */}
      <View style={styles.bottomSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomScrollView}
        >
          {artists.map((artist) => {
            const isActive = artist.username === currentArtist.username;
            return (
              <TouchableOpacity
                key={artist.id}
                style={styles.bottomStoryBubble}
                onPress={() => selectArtist(artist)}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    styles.bottomImageRing,
                    isActive && styles.bottomImageRingActive,
                  ]}
                >
                  <Image source={artist.image} style={styles.bottomStoryImage} />
                </View>
                <Text style={styles.bottomStoryLabel} numberOfLines={1}>
                  {artist.username}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Close Button X below story bubble */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            if (!hasNavigatedAway.current) {
              hasNavigatedAway.current = true;
              navigation.goBack();
            }
          }}
          activeOpacity={0.8}
        >
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <Path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    position: "absolute",
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    position: "absolute",
    top: height * 0.055,
    left: 0,
    right: 0,
    zIndex: 11,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 2.5,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFilled: {
    height: "100%",
    backgroundColor: "#fff",
  },
  topHeader: {
    position: "absolute",
    top: height * 0.075,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
    zIndex: 10,
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  verifiedBadge: {
    justifyContent: "center",
    alignItems: "center",
  },
  timeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: -2,
  },
  mateButton: {
    backgroundColor: "#F5F0FD",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#7126D0",
  },
  mateText: {
    color: "#7126D0",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  tapContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 1,
  },
  tapLeft: {
    flex: 3,
    height: "100%",
  },
  tapRight: {
    flex: 7,
    height: "100%",
  },
  rightActionsPanel: {
    position: "absolute",
    right: 16,
    top: height * 0.35,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center",
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    // backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    marginTop: 2,
    marginBottom: 10,
  },
  bottomSection: {
    position: "absolute",
    bottom: height * 0.04,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  bottomScrollView: {
    paddingHorizontal: width * 0.04,
    paddingBottom: 8,
  },
  bottomStoryBubble: {
    alignItems: "center",
    marginHorizontal: 10,
    width: 70,
  },
  bottomImageRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    padding: 2,
  },
  bottomImageRingActive: {
    borderColor: "#7126D0",
  },
  bottomStoryImage: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
  },
  bottomStoryLabel: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    marginTop: 4,
    textAlign: "center",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  storySticker: {
    position: "absolute",
    bottom: height * 0.2,
    left: width * 0.08,
    right: width * 0.22,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  stickerIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7126D0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stickerTitle: {
    color: "#111",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  stickerSub: {
    color: "#666",
    fontSize: 10,
    fontFamily: "Poppins-Medium",
  },
  interactiveBottomBar: {
    position: "absolute",
    bottom: height * 0.14,
    left: 16,
    right: 76,
    zIndex: 15,
  },
  emojiQuickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emojiBubble: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  emojiText: {
    fontSize: 20,
  },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  replyInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    paddingVertical: 0,
  },
  sendReplyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  analyticsDrawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
    zIndex: 30,
  },
  analyticsDrawerContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: height * 0.6,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  drawerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#111",
  },
  analyticsStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  analyticsStatBox: {
    flex: 1,
    backgroundColor: "#F5F0FD",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(113, 38, 208, 0.15)",
  },
  analyticsStatNumber: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#7126D0",
  },
  analyticsStatLabel: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#666",
    marginTop: 2,
  },
  viewersSectionTitle: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 8,
  },
  viewersList: {
    maxHeight: 200,
  },
  viewerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  viewerAvatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#7126D0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  viewerAvatarChar: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
  viewerName: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#111",
  },
  viewerTime: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#888",
  },
});
