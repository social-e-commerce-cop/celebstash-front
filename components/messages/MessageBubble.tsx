import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useEvent } from "expo";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface MessageBubbleProps {
  type: "incoming" | "outgoing";
  text?: string;
  image?: boolean;
  uri?: string; // for voice note
  time: string;
  showAvatar?: boolean;
  showDate?: boolean;
  onImagePress?: () => void;
  previousType?: "incoming" | "outgoing";
}

const formatDate = (time: string) => {
  const messageDate = new Date(time);
  const now = new Date();

  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};

const formatTime = (time: string) => {
  const date = new Date(time);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  type,
  text,
  image,
  uri,
  time,
  showAvatar = true,
  showDate = false,
  onImagePress,
  previousType,
}) => {
  const isOutgoing = type === "outgoing";
  const player = useAudioPlayer(uri || '');
  const isPlaying = useEvent(player, 'playingChange', { playing: player.playing }).playing;

  const playVoiceNote = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View>
      {showDate && (
        <View style={styles.dateWrapper}>
          <Text style={styles.dateText}>
            {formatDate(time)} {formatTime(time)}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.row,
          isOutgoing ? styles.rowOut : styles.rowIn,
          previousType && previousType !== type ? { marginTop: 20 } : {},
        ]}
      >
        {!isOutgoing && (
          <View style={{ width: 44, marginRight: 8, alignItems: "center" }}>
            {showAvatar && (
              <Image
                source={require("../../assets/images/feed6.jpg")}
                style={styles.smallAvatar}
              />
            )}
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isOutgoing && !image ? styles.bubbleOut : {},
            !isOutgoing ? styles.bubbleIn : {},
            image && styles.imageBubble,
          ]}
        >
          {image ? (
            <TouchableOpacity onPress={onImagePress} activeOpacity={0.9}>
              <Image
                source={require("../../assets/images/feed6.jpg")}
                style={styles.imagePreview}
              />
            </TouchableOpacity>
          ) : uri ? (
            <TouchableOpacity
              onPress={playVoiceNote}
              style={styles.voiceNote}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#fff"
              />
              <Text style={{ color: "#fff", marginLeft: 8 }}>Voice Note</Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={[styles.text, isOutgoing ? styles.textOut : styles.textIn]}
            >
              {text}
            </Text>
          )}
        </View>

        {isOutgoing && <View style={{ paddingRight: 10 }} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", marginVertical: 4 },
  rowIn: { justifyContent: "flex-start" },
  rowOut: { justifyContent: "flex-end" },
  smallAvatar: { width: 36, height: 36, borderRadius: 18 },
  bubble: { maxWidth: "78%", padding: 12, borderRadius: 12 },
  bubbleIn: { backgroundColor: "#F3F4F6", borderTopLeftRadius: 4 },
  bubbleOut: { backgroundColor: "#FB923C", borderTopRightRadius: 4 },
  imageBubble: {
    padding: 0,
    marginRight: 0,
    width: width * 0.7,
    borderRadius: 12,
  },
  imagePreview: { width: width * 0.68, height: 160, borderRadius: 12 },
  text: { fontSize: 14 },
  textIn: { color: "#1D1E20" },
  textOut: { color: "#fff" },
  dateWrapper: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 8,
  },
  dateText: { fontSize: 13, color: "#8A8A8A" },
  voiceNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FB923C",
    padding: 8,
    borderRadius: 20,
  },
});
