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
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

type AppStackParamList = {
  ProfileDetails: { story: { id: number; username: string; image: any } };
};

type ProfileDetailsScreenRouteProp = RouteProp<AppStackParamList, "ProfileDetails">;

// Stories list for each artist to display multiple stories at the top
const artistStoriesMap: Record<string, { image: any; likes: string; bookmarks: string }[]> = {
  "blue_boy": [
    { image: require("../../assets/images/storyItem.jpg"), likes: "12.2k", bookmarks: "346.8k" },
    { image: require("../../assets/images/products/product1.jpg"), likes: "8.4k", bookmarks: "120.5k" },
    { image: require("../../assets/images/drop1.jpg"), likes: "15.1k", bookmarks: "412.3k" },
  ],
  "steve.loves": [
    { image: require("../../assets/images/story2.png"), likes: "10.2k", bookmarks: "220.1k" },
    { image: require("../../assets/images/products/product3.jpg"), likes: "6.7k", bookmarks: "98.4k" },
    { image: require("../../assets/images/products/product2.jpg"), likes: "11.5k", bookmarks: "310.2k" },
  ],
  "waggles": [
    { image: require("../../assets/images/story3.png"), likes: "14.5k", bookmarks: "512.0k" },
    { image: require("../../assets/images/products/product4.jpg"), likes: "9.2k", bookmarks: "143.6k" },
    { image: require("../../assets/images/products/product5.jpg"), likes: "18.3k", bookmarks: "621.9k" },
  ],
  "sabanok...": [
    { image: require("../../assets/images/story1.png"), likes: "15.4k", bookmarks: "480.2k" },
    { image: require("../../assets/images/products/product6.jpg"), likes: "11.2k", bookmarks: "180.5k" },
    { image: require("../../assets/images/products/product7.jpg"), likes: "22.1k", bookmarks: "540.9k" },
  ],
};

const getStoriesForArtist = (username: string) => {
  return artistStoriesMap[username] || [
    { image: require("../../assets/images/story1.png"), likes: "5.2k", bookmarks: "88.1k" },
    { image: require("../../assets/images/products/product6.jpg"), likes: "7.1k", bookmarks: "115.4k" },
    { image: require("../../assets/images/products/product7.jpg"), likes: "12.3k", bookmarks: "245.8k" },
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

  const pressStartTime = useRef(0);
  const hasNavigatedAway = useRef(false);
  const stories = getStoriesForArtist(currentArtist.username);
  const currentStory = stories[currentStoryIndex];

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

        <TouchableOpacity style={styles.actionCircle} activeOpacity={0.8}>
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <Path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

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
});
