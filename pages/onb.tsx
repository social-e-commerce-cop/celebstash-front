import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
  StatusBar,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define navigation stack param list for type safety
type RootStackParamList = {
  signin: undefined;
};

// Define navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animated values for each image position, width, and height
  const image1Position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const image2Position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const image3Position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const image1Width = useRef(new Animated.Value(160)).current;
  const image1Height = useRef(new Animated.Value(160)).current;
  const image2Width = useRef(new Animated.Value(170)).current;
  const image2Height = useRef(new Animated.Value(170)).current;
  const image3Width = useRef(new Animated.Value(180)).current;
  const image3Height = useRef(new Animated.Value(180)).current;

  // Scale values for responsive design, rounded to 2 decimal places
  const scale: number = Math.round(Math.min(screenWidth / 375, screenHeight / 812) * 100) / 100;
  const imageContainerWidth: number = Math.round(screenWidth * 0.75);
  const imageContainerHeight: number = Math.round(screenHeight * 0.25);

  // Define positions, widths, and heights for the animation cycle
  const positions = useMemo(
    () => [
      {
        x: Math.round(-imageContainerWidth * 0.1),
        y: Math.round(-imageContainerHeight * 0.3),
        width: Math.round(140 * scale),
        height: Math.round(140 * scale),
      }, // Top left
      {
        x: Math.round(imageContainerWidth * 0.2),
        y: Math.round(imageContainerHeight * 0.1),
        width: Math.round(180 * scale),
        height: Math.round(180 * scale),
      }, // Bottom right
      {
        x: Math.round(-imageContainerWidth * 0.1),
        y: Math.round(imageContainerHeight * 0.3),
        width: Math.round(160 * scale),
        height: Math.round(160 * scale),
      }, // Bottom left
    ],
    [imageContainerWidth, imageContainerHeight, scale]
  );

  useEffect(() => {
    // Set initial positions, widths, and heights
    image1Position.setValue({ x: positions[0].x, y: positions[0].y });
    image2Position.setValue({ x: positions[1].x, y: positions[1].y });
    image3Position.setValue({ x: positions[2].x, y: positions[2].y });
    image1Width.setValue(positions[0].width);
    image1Height.setValue(positions[0].height);
    image2Width.setValue(positions[1].width);
    image2Height.setValue(positions[1].height);
    image3Width.setValue(positions[2].width);
    image3Height.setValue(positions[2].height);

    let animationSequence: Animated.CompositeAnimation;

    const animateImages = () => {
      const duration = 3000;
      const delay = 1000;

      const createAnimation = (
        animatedPosition: Animated.ValueXY,
        animatedWidth: Animated.Value,
        animatedHeight: Animated.Value,
        fromIndex: number,
        toIndex: number
      ) => {
        return Animated.parallel([
          Animated.timing(animatedPosition, {
            toValue: { x: positions[toIndex].x, y: positions[toIndex].y },
            duration,
            useNativeDriver: true, // Native driver for position
          }),
          Animated.timing(animatedWidth, {
            toValue: positions[toIndex].width,
            duration,
            useNativeDriver: false, // Width/height animations require non-native driver
          }),
          Animated.timing(animatedHeight, {
            toValue: positions[toIndex].height,
            duration,
            useNativeDriver: false, // Width/height animations require non-native driver
          }),
        ]);
      };

      // Animation sequence: each image moves to the next position, width, and height in cycle
      animationSequence = Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          createAnimation(image1Position, image1Width, image1Height, 0, 1),
          createAnimation(image2Position, image2Width, image2Height, 1, 2),
          createAnimation(image3Position, image3Width, image3Height, 2, 0),
        ]),
        Animated.delay(delay),
        Animated.parallel([
          createAnimation(image1Position, image1Width, image1Height, 1, 2),
          createAnimation(image2Position, image2Width, image2Height, 2, 0),
          createAnimation(image3Position, image3Width, image3Height, 0, 1),
        ]),
        Animated.delay(delay),
        Animated.parallel([
          createAnimation(image1Position, image1Width, image1Height, 2, 0),
          createAnimation(image2Position, image2Width, image2Height, 0, 1),
          createAnimation(image3Position, image3Width, image3Height, 1, 2),
        ]),
      ]);

      // Start animation after a slight delay to ensure initial values are set
      setTimeout(() => {
        Animated.loop(animationSequence).start();
      }, 100);
    };

    animateImages();

    // Cleanup animation on unmount
    return () => {
      if (animationSequence) {
        animationSequence.stop();
      }
      // Stop individual animations to prevent frozen state
      image1Position.stopAnimation();
      image2Position.stopAnimation();
      image3Position.stopAnimation();
      image1Width.stopAnimation();
      image1Height.stopAnimation();
      image2Width.stopAnimation();
      image2Height.stopAnimation();
      image3Width.stopAnimation();
      image3Height.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#000000" barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: screenHeight * 0.06 }]}>
          <View style={styles.logo}>
            <Svg width={24 * scale} height={25 * scale} viewBox="0 0 24 25" fill="none">
              <Path
                d="M18.3436 11.0328C18.0019 11.376 17.7403 11.7901 17.5773 12.2457C17.4144 12.7014 17.354 13.1873 17.4007 13.6689L17.3844 13.6527C17.4324 14.2197 17.3558 14.7901 17.1601 15.3244C16.9643 15.8587 16.6542 16.3439 16.2514 16.7462C15.8484 17.1484 15.3625 17.4581 14.8273 17.6534C14.2922 17.8488 13.7207 17.9253 13.153 17.8774L13.1692 17.8936C12.4901 17.8305 11.8079 17.978 11.2158 18.3162C10.6237 18.6543 10.1504 19.1665 9.86063 19.783C9.57081 20.3995 9.47841 21.0902 9.59614 21.7611C9.71396 22.4319 10.036 23.0501 10.5186 23.5314C11.0011 24.0127 11.6206 24.3338 12.2926 24.4507C12.9646 24.5677 13.6563 24.4748 14.2735 24.1849C14.8907 23.8949 15.4033 23.4221 15.7414 22.8306C16.0796 22.2391 16.2268 21.5579 16.163 20.8799L16.1801 20.8961C16.1321 20.3292 16.2087 19.7587 16.4044 19.2244C16.6001 18.6901 16.9103 18.2049 17.3131 17.8026C17.7161 17.4004 18.202 17.0907 18.7371 16.8954C19.2723 16.7 19.8437 16.6235 20.4115 16.6714L20.3944 16.6552C20.9491 16.705 21.5076 16.6141 22.0179 16.3911C22.5281 16.1681 22.9738 15.8201 23.3135 15.3793C23.6531 14.9386 23.876 14.4193 23.9611 13.8697C24.0463 13.3201 23.9911 12.7579 23.8007 12.2352C23.6103 11.7126 23.2908 11.2464 22.8719 10.8798C22.453 10.5132 21.9482 10.2581 21.4043 10.1383C20.8603 10.0184 20.2949 10.0374 19.7603 10.1938C19.2257 10.3502 18.7394 10.6388 18.3463 11.0328H18.3436Z"
                fill="#FF650E"
              />
              <Path
                d="M11.6937 15.7715L11.6766 15.7553C12.1592 15.8038 12.6465 15.7447 13.1034 15.5821C13.5603 15.4196 13.9753 15.1578 14.3184 14.8155C14.6614 14.4732 14.9241 14.059 15.0872 13.603C15.2503 13.1469 15.3099 12.6605 15.2617 12.1786L15.2788 12.1948C15.2309 11.6279 15.3075 11.0575 15.5031 10.5231C15.6988 9.98887 16.009 9.50367 16.4118 9.10137C16.8148 8.69915 17.3008 8.38945 17.8359 8.19415C18.3711 7.99872 18.9424 7.92228 19.5102 7.97013L19.4931 7.95393C20.1724 8.01765 20.8547 7.87055 21.4471 7.53281C22.0396 7.19507 22.5132 6.68308 22.8035 6.06668C23.0938 5.4503 23.1865 4.75951 23.0692 4.08854C22.9518 3.41756 22.63 2.79909 22.1475 2.31745C21.6652 1.83583 21.0457 1.51448 20.3736 1.39728C19.7016 1.28007 19.0097 1.37269 18.3923 1.66252C17.7749 1.95233 17.2622 2.42525 16.9239 3.01675C16.5856 3.60824 16.4383 4.28953 16.5021 4.96767L16.4859 4.95057C16.5339 5.51748 16.4575 6.08804 16.2618 6.6224C16.0662 7.15676 15.756 7.64204 15.3532 8.04438C14.9502 8.4466 14.4642 8.7563 13.929 8.9516C13.3937 9.14691 12.8223 9.22323 12.2544 9.17526L12.2707 9.19236C11.7881 9.14385 11.3007 9.20298 10.8438 9.36552C10.387 9.52797 9.97196 9.78988 9.62887 10.1322C9.28577 10.4744 9.02318 10.8886 8.86002 11.3447C8.69694 11.8007 8.63736 12.2872 8.68559 12.769L8.66936 12.7528C8.71714 13.3197 8.64042 13.8901 8.44472 14.4243C8.24892 14.9585 7.93882 15.4437 7.53596 15.8459C7.13307 16.2481 6.64715 16.5577 6.11208 16.7532C5.57701 16.9486 5.00568 17.0252 4.43794 16.9775L4.45416 16.9937C3.77494 16.93 3.09256 17.0771 2.50012 17.4148C1.90769 17.7526 1.43402 18.2645 1.14374 18.881C0.853454 19.4974 0.760677 20.1881 0.878073 20.8591C0.995469 21.5301 1.31732 22.1486 1.79972 22.6302C2.28212 23.1119 2.90158 23.4332 3.57363 23.5503C4.24567 23.6675 4.93756 23.5749 5.55494 23.2851C6.17231 22.9953 6.68512 22.5224 7.0234 21.9309C7.36171 21.3394 7.50901 20.6581 7.44519 19.98L7.46231 19.9962C7.41436 19.4293 7.49098 18.8588 7.68669 18.3245C7.8823 17.7902 8.19249 17.305 8.59535 16.9027C8.9983 16.5005 9.48427 16.1908 10.0194 15.9955C10.5546 15.8001 11.1259 15.7236 11.6937 15.7715Z"
                fill="#FF650E"
              />
              <Path
                d="M5.65202 13.9651C5.99369 13.6221 6.25527 13.2079 6.41811 12.7522C6.58095 12.2965 6.64102 11.8105 6.59404 11.329L6.61116 11.3452C6.5632 10.7782 6.63979 10.2075 6.83559 9.67305C7.0314 9.13861 7.34171 8.65333 7.74483 8.25102C8.14796 7.84873 8.63412 7.53913 9.16949 7.34387C9.70486 7.1486 10.2765 7.07237 10.8444 7.12051L10.8273 7.1043C11.5062 7.16782 12.1884 7.02068 12.7805 6.68295C13.3727 6.34524 13.8461 5.83337 14.1362 5.21717C14.4263 4.60097 14.519 3.91043 14.4016 3.23971C14.2842 2.56899 13.9624 1.95075 13.4802 1.46929C12.9981 0.987837 12.3788 0.666603 11.707 0.549402C11.0352 0.432193 10.3435 0.524733 9.72641 0.814377C9.10919 1.10402 8.59653 1.57668 8.2583 2.1679C7.91999 2.75913 7.7726 3.44013 7.83624 4.11805L7.82002 4.10185C7.86797 4.66872 7.79135 5.23922 7.59564 5.7735C7.39994 6.30779 7.08986 6.793 6.68694 7.19527C6.28404 7.59754 5.79805 7.90717 5.26291 8.10251C4.72777 8.29791 4.15637 8.37441 3.58859 8.32653L3.60482 8.34273C3.05004 8.29305 2.49167 8.38404 1.98147 8.60715C1.47126 8.83027 1.02572 9.1784 0.686131 9.61922C0.346545 10.06 0.123904 10.5793 0.0388246 11.1288C-0.0462455 11.6785 0.00900453 12.2406 0.199455 12.7632C0.389905 13.2858 0.709407 13.7519 1.12834 14.1184C1.54727 14.485 2.05209 14.74 2.596 14.8598C3.13991 14.9796 3.70533 14.9605 4.23987 14.8041C4.77439 14.6477 5.26073 14.3592 5.65382 13.9651H5.65202Z"
                fill="#FF650E"
              />
            </Svg>
            <Text style={[styles.logoText, { fontSize: 24 * scale }]}>CelebStash</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.profileImages, { width: imageContainerWidth, height: imageContainerHeight }]}>
            <Animated.View
              style={
                [
                  styles.animatedImageContainer,
                  {
                    transform: [{ translateX: image1Position.x }, { translateY: image1Position.y }],
                    zIndex: positions[0].width,
                  },
                ] as StyleProp<ViewStyle>
              }
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
                }}
                style={[styles.profileImage, { width: image1Width, height: image1Height }]}
                onError={(e) => console.log("Image 1 load error:", e.nativeEvent.error)}
                defaultSource={require("../assets/images/fallback.jpg")}
              />
            </Animated.View>

            <Animated.View
              style={
                [
                  styles.animatedImageContainer,
                  {
                    transform: [{ translateX: image2Position.x }, { translateY: image2Position.y }],
                    zIndex: positions[1].width,
                  },
                ] as StyleProp<ViewStyle>
              }
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
                }}
                style={[styles.profileImage, { width: image2Width, height: image2Height }]}
                onError={(e) => console.log("Image 2 load error:", e.nativeEvent.error)}
                defaultSource={require("../assets/images/fallback.jpg")}
              />
            </Animated.View>

            <Animated.View
              style={
                [
                  styles.animatedImageContainer,
                  {
                    transform: [{ translateX: image3Position.x }, { translateY: image3Position.y }],
                    zIndex: positions[2].width,
                  },
                ] as StyleProp<ViewStyle>
              }
            >
              <Image
                source={require("../assets/images/black-man.png")}
                style={[styles.profileImage, { width: image3Width, height: image3Height }]}
                onError={(e) => console.log("Image 3 load error:", e.nativeEvent.error)}
                defaultSource={require("../assets/images/fallback.jpg")}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.heroText, { fontSize: Math.max(16, 18 * scale) }]}>
            Own exclusive, limited merchandise from stars and influencers connecting you to their world with every purchase.
          </Text>
          <TouchableOpacity
            style={[styles.getStartedBtn, { width: screenWidth * 0.85 }]}
            onPress={() => navigation.navigate("signin")}
          >
            <Text style={[styles.getStartedText, { fontSize: Math.max(14, 16 * scale) }]}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    paddingBottom: 20,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Requires React Native >= 0.71; use marginRight for older versions
  },
  logoText: {
    color: "#FF650E",
    fontWeight: "700",
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  profileImages: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  animatedImageContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#FF650E",
    resizeMode: "cover",
  },
  section: {
    alignItems: "center",
    justifyContent: "center",
    gap: 30, // Requires React Native >= 0.71; use marginVertical for older versions
    paddingBottom: 40,
  },
  heroText: {
    fontWeight: "bold",
    lineHeight: 26,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  getStartedBtn: {
    backgroundColor: "#FF650E",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
  },
  getStartedText: {
    color: "#fff",
    fontWeight: "600",
  },
});