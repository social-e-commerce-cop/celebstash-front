import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface ConversationItemProps {
  isGroup?: boolean;
  groupMembers?: { avatar: any }[];
  name: string;
  lastMessage: string;
  unreadCount?: number;
  hasStory?: boolean;
}

const AVATAR_SIZE = 50; // size of the avatar image
const STORY_BORDER_WIDTH = 2; // width of the orange border
const BORDER_PADDING = 3; // space between avatar and border

const ConversationItem: React.FC<ConversationItemProps> = ({
  isGroup,
  groupMembers = [],
  name,
  lastMessage,
  unreadCount,
  hasStory = false,
}) => {
  const renderAvatar = () => {
    if (isGroup && groupMembers.length) {
      return (
        <View style={styles.groupAvatarContainer}>
          {groupMembers.slice(0, 3).map((member, index) => (
            <View
              key={index}
              style={[
                styles.groupAvatarWrapper,
                hasStory && styles.groupStoryBorder,
                { left: index * 18, zIndex: 3 - index },
              ]}
            >
              <Image source={member.avatar} style={styles.groupAvatar} />
            </View>
          ))}
        </View>
      );
    }

    if (!groupMembers[0]) return null;

    return (
      <View
        style={[
          styles.singleAvatarWrapper,
          hasStory && styles.singleStoryBorder,
        ]}
      >
        <Image source={groupMembers[0].avatar} style={styles.singleAvatar} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderAvatar()}
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{name}</Text>
        <Text numberOfLines={1} style={styles.messageText}>
          {lastMessage}
        </Text>
      </View>
      {unreadCount ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  textContainer: { flex: 1, marginLeft: 14 },
  nameText: { fontSize: 16, fontWeight: "bold", color: "#000" },
  messageText: { color: "#303030B2", fontSize: 14, marginTop: 2 },
  badge: {
    backgroundColor: "#FF650E",
    borderRadius: 50,
    minWidth: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  singleAvatarWrapper: {
    width: AVATAR_SIZE + (STORY_BORDER_WIDTH + BORDER_PADDING) * 2,
    height: AVATAR_SIZE + (STORY_BORDER_WIDTH + BORDER_PADDING) * 2,
    borderRadius: (AVATAR_SIZE + (STORY_BORDER_WIDTH + BORDER_PADDING) * 2) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  singleAvatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  singleStoryBorder: {
    borderWidth: STORY_BORDER_WIDTH,
    borderColor: "#FF650E",
    padding: BORDER_PADDING, 
  },

  groupAvatarContainer: { width: 70, height: 48, flexDirection: "row", alignItems: "center", position: "relative" },
  groupAvatarWrapper: {
    width: 38 + (STORY_BORDER_WIDTH + BORDER_PADDING) * 2,
    height: 38 + (STORY_BORDER_WIDTH + BORDER_PADDING) * 2,
    borderRadius: (38 + (STORY_BORDER_WIDTH + BORDER_PADDING) * 2) / 2,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  groupAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: '#fff' },
  groupStoryBorder: {
    borderWidth: STORY_BORDER_WIDTH,
    borderColor: "#FF650E",
    padding: BORDER_PADDING,
  },
});

export default ConversationItem;
