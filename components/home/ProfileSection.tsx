import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type AppStackParamList = {
  ProfileDetails: { story: { id: number; username: string; image: any } };
};

const { width } = Dimensions.get("window"); // get screen width

// adjust story size relative to screen width
const STORY_SIZE = width * 0.18; // 18% of screen width
const BORDER_SIZE = STORY_SIZE + 6;

const stories = [
  { id: 1, username: "Kenny k shot", image: require("../../assets/images/storyItem.jpg") },
  { id: 2, username: "blue_bouy", image: require("../../assets/images/story2.png") },
  { id: 3, username: "waggles", image: require("../../assets/images/story3.png") },
  { id: 4, username: "steve.loves", image: require("../../assets/images/story4.png") },
  { id: 5, username: "steve.loves", image: require("../../assets/images/story1.png") },
];

export default function ProfileSection() {
  const navigation =
    useNavigation<StackNavigationProp<AppStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My social feed</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {stories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyContainer}
            onPress={() => navigation.navigate("ProfileDetails", { story })}
          >
            <View style={styles.imageWrapper}>
              <Image source={story.image} style={styles.storyImage} />
            </View>
            <Text style={styles.storyText} numberOfLines={1}>
              {story.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingLeft: 0,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: width * 0.05, // responsive font size
    fontWeight: "bold",
    marginBottom: 24,
  },
  storyContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: "#FF650E",
    borderRadius: BORDER_SIZE / 2,
    padding: 2,
  },
  storyImage: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
  },
  storyText: {
    marginTop: 5,
    fontSize: width * 0.03, // responsive text size
    maxWidth: STORY_SIZE + 10,
    textAlign: "center",
  },
});
