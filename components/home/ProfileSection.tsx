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
import { getSessionUser } from "@/lib/session";
import { AddStoryModal } from "./AddStoryModal";

type AppStackParamList = {
  ProfileDetails: { story: { id: number; username: string; image: any; hasSticker?: boolean } };
};

const { width } = Dimensions.get("window");

const STORY_SIZE = width * 0.16; // Perfectly sized avatar bubble
const BORDER_SIZE = STORY_SIZE + 6;

const artists = [
  { id: 1, username: "Kenny K Shot", image: require("../../assets/images/story1.png"), hasSticker: true, isUnseen: true },
  { id: 2, username: "blue_boy", image: require("../../assets/images/storyItem.jpg"), isUnseen: false },
  { id: 3, username: "waggles", image: require("../../assets/images/story3.png"), isUnseen: true },
  { id: 4, username: "steve.loves", image: require("../../assets/images/story4.png"), isUnseen: false },
];

export default function ProfileSection() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const user = getSessionUser();
  const [addStoryVisible, setAddStoryVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Stories & Featured Artists</Text>
      </View>

      {/* Horizontal List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Your Story (+) Bubble - Symmetric for Artists & Users */}
        <TouchableOpacity style={styles.storyContainer} onPress={() => setAddStoryVisible(true)} activeOpacity={0.8}>
          <View style={[styles.imageWrapper, { borderColor: "#E5E7EB" }]}>
            <Image
              source={
                user.role === 'ARTIST'
                  ? require("../../assets/images/black-man.png")
                  : require("../../assets/images/profile.jpg")
              }
              style={styles.storyImage}
            />
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={14} color="#FFF" />
            </View>
          </View>
          <Text style={styles.storyText} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Featured Artists Stories with Unseen Gradient vs Seen Grey Rings */}
        {artists.map((artist) => (
          <TouchableOpacity
            key={artist.id}
            style={styles.storyContainer}
            onPress={() => navigation.navigate("ProfileDetails", { story: artist })}
          >
            <View style={[styles.imageWrapper, { borderColor: artist.isUnseen ? '#7126D0' : '#D1D5DB' }]}>
              <Image source={artist.image} style={styles.storyImage} />
            </View>
            <Text style={styles.storyText} numberOfLines={1}>
              {artist.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Story Modal */}
      <AddStoryModal
        visible={addStoryVisible}
        onClose={() => setAddStoryVisible(false)}
        onStoryCreated={() => {
          navigation.navigate("ProfileDetails", { story: { id: 99, username: user.username || 'You', image: require("../../assets/images/profile.jpg") } });
        }}
      />
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
    color: "#7126D0", // Orange
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
    borderColor: "#7126D0", // Orange border
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
  plusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7126D0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
});
