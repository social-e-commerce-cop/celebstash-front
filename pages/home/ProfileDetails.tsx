import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// Define stack params
type AppStackParamList = {
  ProfileDetails: { story: { username: string; time: string; image: any } };
};

type ProfileDetailsScreenNavigationProp = StackNavigationProp<
  AppStackParamList,
  "ProfileDetails"
>;
type ProfileDetailsScreenRouteProp = RouteProp<AppStackParamList, "ProfileDetails">;

type Props = {
  navigation: ProfileDetailsScreenNavigationProp;
  route: ProfileDetailsScreenRouteProp;
};

// Map story image names to actual require statements
const storyImagesMap: Record<string, any> = {
  story1: require("../../assets/images/story1.png"),
  story2: require("../../assets/images/story2.png"),
  story3: require("../../assets/images/story3.png"),
  story4: require("../../assets/images/story4.png"),
};


const ProfileDetails: React.FC<Props> = ({ route, navigation }) => {
  const { story } = route.params;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) {
          clearInterval(interval);
          navigation.goBack();
          return 1;
        }
        return p + 0.01;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [navigation]);

  // List of story keys
  const storyKeys = ["story1", "story2", "story3", "story4"];

  return (
    <View style={styles.container}>
      {/* Story Background */}
       <StatusBar backgroundColor="#000000" barStyle="dark-content" />
      <Image source={story.image} style={styles.storyImage} />

      {/* Top bar */}
      <View style={styles.topBar}>
       <Image
    source={story.image} // <-- Use the story's actual image
    style={styles.profilePic}
  />
        <View style={{ flex: 1 }}>

          <View style={styles.warapper}>
            <Text style={styles.username}>{story.username}</Text>
            <Svg width="18" height="18" viewBox="0 0 18 18" fill="none" >
              <Path d="M8.21256 10.0724L6.86556 8.72995C6.79556 8.65995 6.71031 8.62245 6.60981 8.61745C6.50881 8.61245 6.41706 8.65145 6.33456 8.73445C6.25456 8.81445 6.21456 8.90295 6.21456 8.99995C6.21456 9.09695 6.25456 9.18545 6.33456 9.26545L7.78806 10.7189C7.90956 10.8399 8.05106 10.9004 8.21256 10.9004C8.37406 10.9004 8.51556 10.8399 8.63706 10.7189L11.6656 7.69045C11.7386 7.61745 11.7768 7.53145 11.7803 7.43245C11.7838 7.33295 11.7456 7.24195 11.6656 7.15945C11.5831 7.07695 11.4938 7.03495 11.3978 7.03345C11.3018 7.03195 11.2128 7.07245 11.1308 7.15495L8.21256 10.0724ZM6.50256 15.462L5.51556 13.8119L3.65481 13.419C3.50581 13.3914 3.38706 13.3115 3.29856 13.179C3.21006 13.047 3.17356 12.9065 3.18906 12.7575L3.36681 10.8405L2.10456 9.40045C1.99856 9.29195 1.94556 9.15845 1.94556 8.99995C1.94556 8.84145 1.99856 8.70795 2.10456 8.59945L3.36681 7.15945L3.18906 5.2432C3.17406 5.0937 3.21056 4.95295 3.29856 4.82095C3.38706 4.68895 3.50581 4.60895 3.65481 4.58095L5.51481 4.1887L6.50181 2.5387C6.58281 2.4047 6.69156 2.3122 6.82806 2.2612C6.96456 2.2097 7.10581 2.21645 7.25181 2.28145L9.00006 3.0202L10.7476 2.28145C10.8941 2.21645 11.0356 2.2097 11.1721 2.2612C11.3086 2.3122 11.4173 2.4047 11.4983 2.5387L12.4846 4.1887L14.3453 4.58095C14.4943 4.60895 14.6131 4.68895 14.7016 4.82095C14.7901 4.95295 14.8266 5.0937 14.8111 5.2432L14.6341 7.15945L15.8956 8.59945C16.0016 8.70795 16.0546 8.84145 16.0546 8.99995C16.0546 9.15845 16.0016 9.2922 15.8956 9.4012L14.6341 10.8405L14.8111 12.7567C14.8261 12.9062 14.7896 13.047 14.7016 13.179C14.6131 13.3115 14.4943 13.3914 14.3453 13.419L12.4853 13.8119L11.4983 15.462C11.4173 15.5954 11.3086 15.688 11.1721 15.7395C11.0356 15.791 10.8943 15.784 10.7483 15.7185L9.00006 14.9797L7.25256 15.7185C7.10606 15.7835 6.96456 15.7902 6.82806 15.7387C6.69156 15.6877 6.58281 15.5952 6.50181 15.4612" fill="#FF650E" />
            </Svg>
          </View>
          {/* <Text style={styles.time}>{story.time}</Text> */}
          <Text style={styles.time}>1h</Text>
        </View>
        <TouchableOpacity style={styles.mateButton}>
          <Text style={styles.mateText}>Mate</Text>
        </TouchableOpacity>
      </View>

      {/* Reactions */}
      <View style={styles.reactions}>
        <Text style={styles.emoji}>❤️</Text>
        <Text style={styles.emoji}>😂</Text>
        <TouchableOpacity style={styles.addReaction}>
          <Svg width={15} height={14} viewBox="0 0 15 14" fill="none">
            <Path
              d="M14.5 7.99805H8.5V13.998H6.5V7.99805H0.5V5.99805H6.5V-0.00195312H8.5V5.99805H14.5V7.99805Z"
              fill="white"
            />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        {storyKeys.map((key, i) => (
          <View key={i} style={styles.storyThumbWrapper}>
            <Image source={storyImagesMap[key]} style={styles.storyThumb} />
            <Text style={styles.storyLabel}>user{i + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  storyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
    marginTop: height * 0.09,
  },
  profilePic: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: (width * 0.1) / 2,
    marginRight: width * 0.03,
  },
  warapper: { flexDirection: "row", alignItems: "center", flex: 1, gap: 4 },
  username: { color: "#fff", fontWeight: "bold", fontSize: width * 0.045 },
  time: { color: "#ccc", fontSize: width * 0.035 },
  mateButton: {
    backgroundColor: "#FF650E26",
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.05,
    borderRadius: 20,
    marginRight: width * 0.02,
  },
  mateText: { color: "#FF650E", fontWeight: "bold", fontSize: width * 0.04 },
  reactions: {
    position: "absolute",
    right: width * 0.01,
    top: height * 0.53,
    alignItems: "center",
  },
  emoji: { fontSize: width * 0.08, marginVertical: height * 0.01 },
  addReaction: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: (width * 0.12) / 2,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.015,
  },
  bottomBar: {
    position: "absolute",
    bottom: height * 0.09,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  storyThumbWrapper: { alignItems: "center", marginHorizontal: width * 0.025 },
  storyThumb: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: (width * 0.14) / 2,
    borderWidth: 2,
    borderColor: "#FF650E",
  },
  storyLabel: {
    color: "#fff",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
    width: width * 0.15,
    textAlign: "center",
  },
});

export default ProfileDetails;
