import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";

interface VideoPickerRowProps {
  videos: string[];
  onChange: (newVideos: string[]) => void;
}

const { width, height } = Dimensions.get("window");

const VideoPickerRow: React.FC<VideoPickerRowProps> = ({ videos, onChange }) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChange([...videos, uri]);
    }
  };

  const removeVideo = (uri: string) =>
    onChange(videos.filter((v) => v !== uri));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left Section: Videos label */}
        <View style={styles.leftSection}>
          <Text style={styles.label}>Video</Text>
        </View>

        {/* Right Section: Button + thumbnails */}
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={pickVideo} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select Video</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoRow}
          >
            {videos.map((uri, idx) => (
              <TouchableOpacity key={idx} onPress={() => setPreviewUri(uri)}>
                <View style={styles.thumbnail}>
                  <Video
                    source={{ uri }}
                    style={{ width: "100%", height: "100%" }}
                    isMuted
                    shouldPlay={false}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal Preview */}
      <Modal visible={!!previewUri} transparent animationType="fade">
        <View style={styles.modal}>
          {previewUri && (
        <Video
  source={{ uri: previewUri }}
  style={styles.modalVideo}
  useNativeControls
  isLooping
/>
          )}

          <TouchableOpacity
            onPress={() => setPreviewUri(null)}
            style={styles.modalButton}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (previewUri) removeVideo(previewUri);
              setPreviewUri(null);
            }}
            style={[styles.modalButton, { backgroundColor: "red" }]}
          >
            <Text style={styles.modalButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.03,
    marginBottom: height * 0.04,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftSection: {
    width: width * 0.25,
    justifyContent: "flex-start",
  },
  rightSection: {
    width: width * 0.65,
  },
  label: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  selectButton: {
    alignSelf: "flex-start",
  },
  selectButtonText: {
    fontSize: width * 0.045,
    color: "#FF6600",
    fontWeight: "600",
  },
  videoRow: {
    alignItems: "center",
  },
  thumbnail: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.02,
    marginRight: width * 0.03,
    backgroundColor: "#f0f0f0",
    marginTop: height * 0.025,
    overflow: "hidden",
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalVideo: {
    width: width * 0.8,
    height: height * 0.5,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  modalButton: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.015,
    borderRadius: width * 0.02,
    backgroundColor: "#e5dfdaff",
  },
  modalButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "500",
  },
});

export default VideoPickerRow;
