import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { getSessionUser } from "@/lib/session";
import { resolveImageUrl } from "@/lib/apiClient";
import { storiesService, groupStories, canPostStories, StoryGroup } from "@/lib/storiesService";
import { AddStoryModal } from "./AddStoryModal";

const { width } = Dimensions.get("window");

const STORY_SIZE = width * 0.16; // Perfectly sized avatar bubble
const BORDER_SIZE = STORY_SIZE + 6;

/** Re-read stories when Home regains focus only if the row is older than this. */
const STALE_AFTER_MS = 60 * 1000;

const DEFAULT_AVATAR = require("../../assets/images/profile.jpg");
const avatarSource = (url?: string | null) => (url ? { uri: resolveImageUrl(url) } : DEFAULT_AVATAR);

/**
 * Stories row on Home: every artist with an active (unexpired) story. Purple ring = unseen,
 * grey = all seen. Only artists get the "Your Story" bubble, because only artists can post.
 */
export default function ProfileSection() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const user = getSessionUser();
  const isArtist = canPostStories(user.role);
  const [addStoryVisible, setAddStoryVisible] = useState(false);
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const lastLoadedAt = useRef(0);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const stories = await storiesService.getFeedStories();
      setGroups(groupStories(stories, getSessionUser().id));
      lastLoadedAt.current = Date.now();
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(load, 0);
    // Returning from the viewer marks stories seen; re-read so rings update, but not on every
    // focus — only when the data has aged.
    const unsubscribe = navigation.addListener("focus", () => {
      if (Date.now() - lastLoadedAt.current > STALE_AFTER_MS) load();
    });
    return () => {
      clearTimeout(first);
      unsubscribe();
    };
  }, [navigation, load]);

  const isMine = (g: StoryGroup) => user.id != null && Number(g.userId) === Number(user.id);
  const myGroup = groups.find(isMine);
  const otherGroups = groups.filter((g) => !isMine(g));

  const openGroup = (groupUserId: number) => {
    lastLoadedAt.current = 0; // the viewer changes seen state; refresh on return
    navigation.navigate("ProfileDetails", { groups, startUserId: groupUserId });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Stories & Featured Artists</Text>
      </View>

      {/* Horizontal List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Your Story: artists only. Tap opens your stories if you have any; + adds one. */}
        {isArtist && (
          <TouchableOpacity
            style={styles.storyContainer}
            onPress={() => (myGroup ? openGroup(myGroup.userId) : setAddStoryVisible(true))}
            activeOpacity={0.8}
          >
            <View style={[styles.imageWrapper, { borderColor: myGroup ? "#7126D0" : "#E5E7EB" }]}>
              <Image source={avatarSource(user.profilePicture || user.avatar)} style={styles.storyImage} />
              <TouchableOpacity
                style={styles.plusBadge}
                onPress={() => setAddStoryVisible(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Add to your story"
              >
                <Ionicons name="add" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.storyText} numberOfLines={1}>
              Your Story
            </Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={[styles.storyContainer, { justifyContent: "center", height: BORDER_SIZE }]}>
            <ActivityIndicator color="#7126D0" />
          </View>
        )}

        {!loading && failed && (
          <TouchableOpacity style={[styles.storyContainer, { justifyContent: "center", height: BORDER_SIZE }]} onPress={load}>
            <Ionicons name="refresh" size={22} color="#7126D0" />
            <Text style={styles.storyText}>Retry</Text>
          </TouchableOpacity>
        )}

        {!loading && !failed && otherGroups.length === 0 && !isArtist && (
          <Text style={[styles.storyText, { alignSelf: "center", color: "#888" }]}>No stories available</Text>
        )}

        {otherGroups.map((g) => (
          <TouchableOpacity key={g.userId} style={styles.storyContainer} onPress={() => openGroup(g.userId)}>
            <View style={[styles.imageWrapper, { borderColor: g.hasUnseen ? "#7126D0" : "#D1D5DB" }]}>
              <Image source={avatarSource(g.userAvatar)} style={styles.storyImage} />
            </View>
            <Text style={styles.storyText} numberOfLines={1}>
              {g.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isArtist && (
        <AddStoryModal
          visible={addStoryVisible}
          onClose={() => setAddStoryVisible(false)}
          onStoryCreated={() => {
            load();
          }}
        />
      )}
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
