import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";

type AppStackParamList = {
  ProfileDetails: { story: { id: number; username: string; image: any } };
};

const { width } = Dimensions.get("window");
const STORY_SIZE = width * 0.18;
const BORDER_SIZE = STORY_SIZE + 6;

const stories = [
  { id: 1, username: "Kenny k shot", image: require("../../../assets/images/storyItem.jpg") },
  { id: 2, username: "blue_bouy", image: require("../../../assets/images/story2.png") },
  { id: 3, username: "waggles", image: require("../../../assets/images/story3.png") },
  { id: 4, username: "steve.loves", image: require("../../../assets/images/story4.png") },
  { id: 5, username: "steve.loves", image: require("../../../assets/images/story1.png") },
];

// your profile image
const profilePicture = require("../../../assets/images/storyItem.jpg");

export default function ProfileSection() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [hasStory, setHasStory] = useState(false);

  const handleAddStory = () => {
    setHasStory(true);
    alert("Story added!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My social feed</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* --- Add Story --- */}
        <TouchableOpacity style={styles.storyContainer} onPress={handleAddStory}>
          <View
            style={[
              styles.imageWrapper,
              { borderColor: hasStory ? "#7126D0" : "transparent" }, // ✅ No border until story is added
            ]}
          >
            <Image source={profilePicture} style={styles.storyImage} />
            <View style={styles.addIconContainer}>
              <Ionicons name="add-circle" size={22} color="#7126D0" />
            </View>
          </View>
          <Text style={styles.storyText} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* --- Other Stories --- */}
        {stories.map((story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyContainer}
            onPress={() => navigation.navigate("ProfileDetails", { story })}
          >
            <View style={[styles.imageWrapper, { borderColor: "#7126D0" }]}>
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
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: 24,
  },
  storyContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  imageWrapper: {
    borderWidth: 2,
    borderRadius: BORDER_SIZE / 2,
    padding: 2,
    position: "relative",
  },
  storyImage: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
  },
  storyText: {
    marginTop: 5,
    fontSize: width * 0.03,
    maxWidth: STORY_SIZE + 10,
    textAlign: "center",
  },
  addIconContainer: {
    position: "absolute",
    bottom: 2,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 99,
  },
});
