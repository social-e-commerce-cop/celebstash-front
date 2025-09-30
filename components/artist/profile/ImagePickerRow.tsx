import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface ImagePickerRowProps {
  images: string[];
  onChange: (newImages: string[]) => void;
}

const { width, height } = Dimensions.get("window");

const ImagePickerRow: React.FC<ImagePickerRowProps> = ({ images, onChange }) => {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChange([...images, uri]);
    }
  };

  const removeImage = (uri: string) =>
    onChange(images.filter((img) => img !== uri));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Left Section: Photos label */}
        <View style={styles.leftSection}>
          <Text style={styles.label}>Photoes</Text>
        </View>

        {/* Right Section: Button + thumbnails */}
        <View style={styles.rightSection}>
          <TouchableOpacity onPress={pickImage} style={styles.selectImageButton}>
            <Text style={styles.selectImageText}>Select Image</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageRow}
          >
            {images.map((uri, idx) => (
              <TouchableOpacity key={idx} onPress={() => setPreviewUri(uri)}>
                <Image source={{ uri }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Modal Preview */}
      <Modal visible={!!previewUri} transparent animationType="fade">
        <View style={styles.modal}>
          <Image source={{ uri: previewUri ?? "" }} style={styles.modalImage} />
          <TouchableOpacity
            onPress={() => setPreviewUri(null)}
            style={styles.modalButton}
          >
            <Text style={styles.modalButtonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (previewUri) removeImage(previewUri);
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
    paddingTop: height * 0.06,
    marginBottom: height * 0.04,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftSection: {
    width: width * 0.25, // 25% for the label
    justifyContent: "flex-start",
  },
  rightSection: {
    width: width * 0.65, // 70% for button + thumbnails
  },
  label: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  selectImageButton: {
    alignSelf: "flex-start",
  },
  selectImageText: {
    fontSize: width * 0.045,
    color: "#FF6600",
    fontWeight: "600",
  },
  imageRow: {
    alignItems: "center",
  },
  thumbnail: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.02,
    marginRight: width * 0.03,
    backgroundColor: "#f0f0f0",
    marginTop: height * 0.025,
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: width * 0.8,
    height: height * 0.5,
    resizeMode: "contain",
  },
  modalButton: {
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: width * 0.02,
    backgroundColor: "#FF6600",
  },
  modalButtonText: {
    color: "white",
    fontSize: width * 0.045,
    fontWeight: "500",
  },
});

export default ImagePickerRow;
