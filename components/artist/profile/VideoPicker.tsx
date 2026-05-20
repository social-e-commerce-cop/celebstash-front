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
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoPickerRowProps {
  videos: string[];
  onChange: (newVideos: string[]) => void;
}

const { width, height } = Dimensions.get("window");

const VideoThumbnail = ({ uri, onPress }: { uri: string, onPress: () => void }) => {
  const player = useVideoPlayer(uri, player => {
    player.muted = true;
    player.pause();
  });

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.thumbnail}>
        <VideoView 
          player={player} 
          style={{ width: "100%", height: "100%" }} 
          nativeControls={false} 
        />
      </View>
    </TouchableOpacity>
  );
};

const PreviewVideoModal = ({ previewUri, setPreviewUri, removeVideo }: any) => {
  const player = useVideoPlayer(previewUri, player => {
    player.loop = true;
    player.play();
  });

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.modal}>
        <VideoView
          player={player}
          style={styles.modalVideo}
          nativeControls
        />

        <TouchableOpacity
          onPress={() => setPreviewUri(null)}
          style={styles.modalButton}
        >
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            removeVideo(previewUri);
            setPreviewUri(null);
          }}
          style={[styles.modalButton, { backgroundColor: "red" }]}
        >
          <Text style={styles.modalButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

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
              <VideoThumbnail key={idx} uri={uri} onPress={() => setPreviewUri(uri)} />
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal Preview */}
      {previewUri && (
        <PreviewVideoModal 
          previewUri={previewUri} 
          setPreviewUri={setPreviewUri} 
          removeVideo={removeVideo} 
        />
      )}
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
