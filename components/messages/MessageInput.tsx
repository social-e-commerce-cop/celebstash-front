import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

interface MessageInputProps {
  text: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onAddImage: (uri: string) => void; // returns selected image URI
  onRecordVoice?: () => void;
  onOpenGif?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  text,
  onChangeText,
  onSend,
  onAddImage,
  onRecordVoice,
  onOpenGif,
}) => {
  const showSend = text.trim().length > 0;

  // Function to pick image from device
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      onAddImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Type a message"
          style={styles.textInput}
          multiline
        />

        {/* GIF or Send inside input */}
        {showSend ? (
          <TouchableOpacity onPress={onSend} style={styles.sendButton}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onOpenGif} style={styles.gifButton}>
            <Text style={styles.gifText}>GIF</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Voice and Image icons outside input */}
      {!showSend && (
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={onRecordVoice} style={styles.iconButton}>
            <Ionicons name="mic" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
            <Ionicons name="image" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,  // compact vertical padding
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EAEC",
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 6,  // smaller padding for compact height
  },
  textInput: {
    flex: 1,
    height: 40,          // fixed compact height
    marginRight: 6,
  },
  gifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  gifText: {
    color: "#000",
    fontWeight: "700",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FB923C",
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcons: {
    flexDirection: "row",
    marginLeft: 8,
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
  },
});

