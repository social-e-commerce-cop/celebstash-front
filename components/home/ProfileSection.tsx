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

const { width } = Dimensions.get("window");

const STORY_SIZE = width * 0.16; // Perfectly sized avatar bubble
const BORDER_SIZE = STORY_SIZE + 6;

const artists = [
  { id: 1, username: "sabanok...", image: require("../../assets/images/story1.png") },
  { id: 2, username: "blue_boy", image: require("../../assets/images/storyItem.jpg") },
  { id: 3, username: "waggles", image: require("../../assets/images/story3.png") },
  { id: 4, username: "steve.loves", image: require("../../assets/images/story4.png") },
];

export default function ProfileSection() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  return (
    <View style={styles.container}>
      {/* Header with See All */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Featured Artists</Text>
      </View>

      {/* Horizontal List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {artists.map((artist) => (
          <TouchableOpacity
            key={artist.id}
            style={styles.storyContainer}
            onPress={() => navigation.navigate("ProfileDetails", { story: artist })}
          >
            <View style={styles.imageWrapper}>
              <Image source={artist.image} style={styles.storyImage} />
            </View>
            <Text style={styles.storyText} numberOfLines={1}>
              {artist.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "black",
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#8A3FFC", // Vibrant Purple
  },
  scrollContainer: {
    paddingRight: 10,
  },
  storyContainer: {
    alignItems: "center",
    marginRight: 14,
  },
  imageWrapper: {
    borderWidth: 3,
    borderColor: "#8A3FFC", // Vibrant Purple border
    borderRadius: BORDER_SIZE / 2,
    padding: 2,
  },
  storyImage: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
  },
  storyText: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "black",
    textAlign: "center",
    maxWidth: STORY_SIZE + 10,
  },
});
