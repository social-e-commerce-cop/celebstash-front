import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { EditIcon } from "@/assets/icons/Payment";

interface UserInfoProps {
  name: string;
  email: string;
  bio: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ name, email, bio }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(
    require("../../assets/images/upload.png")
  ); // default placeholder
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleEditPress = () => setModalVisible(true);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage({ uri: result.assets[0].uri });
      simulateUpload();
    }
  };

  const chooseFromDevice = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage({ uri: result.assets[0].uri });
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        setUploaded(true);
      }
    }, 200);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setUploading(false);
    setUploadProgress(0);
    setUploaded(false);
  };

  const handleUpload = () => {
    // Add actual upload logic here if needed
    setModalVisible(false);
    setUploadProgress(0);
    setUploaded(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image source={selectedImage} style={styles.avatar} />
        <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
          <EditIcon />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.bio}>{bio}</Text>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={selectedImage} style={styles.previewImage} />

            {/* Show option buttons before & during uploading, hide after */}
            {!uploaded && (
              <>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={takePhoto}
                  disabled={uploading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      uploading && { opacity: 0.5 },
                    ]}
                  >
                    Take Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={chooseFromDevice}
                  disabled={uploading}
                >
                  <Text
                    style={[
                      styles.optionText,
                      uploading && { opacity: 0.5 },
                    ]}
                  >
                    Choose from Device
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Uploading progress */}
            {uploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progress, { width: `${uploadProgress}%` }]}
                  />
                </View>
                <Text style={{ color: "#FF650E", fontSize: 20 }}>
                  {uploadProgress}%
                </Text>
              </View>
            )}

            {/* After upload, show only Upload button */}
            {uploaded && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleUpload}
              >
                <Text style={styles.uploadText}>Upload</Text>
              </TouchableOpacity>
            )}

            {/* Cancel is always available */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: -56, paddingHorizontal: 16 },
  avatarWrapper: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 45,
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6600",
    borderRadius: 50,
    padding: 4,
  },
  name: { marginTop: 14, fontSize: 20, fontWeight: "700", color: "#000" },
  email: {
    fontSize: 14,
    color: "#8A8A8A",
    fontWeight: "500",
    marginTop: 2,
  },
  bio: {
    textAlign: "center",
    fontSize: 16,
    color: "#1D1E20",
    fontWeight: "500",
    marginTop: 14,
    paddingHorizontal: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "93%",
    backgroundColor: "#fff",
    paddingVertical: 90,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 60,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 8,
    width: "100%",
  },
  optionText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  progressContainer: {
    width: "70%",
    marginVertical: 15,
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },
  progressBar: {
    width: "80%",
    height: 3,
    backgroundColor: "#8A8A8A",
    borderRadius: 10,
    marginVertical: 4,
  },
  progress: {
    height: "100%",
    backgroundColor: "#FF650E",
    borderRadius: 10,
  },
  uploadButton: {
    backgroundColor: "#FF650E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginVertical: 8,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontSize: 16, textAlign: "center" },
  cancelButton: {
    backgroundColor: "#8F959E57",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
    width: "100%",
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: { textAlign: "center", fontSize: 16, color: "#303030" },
});

export default UserInfo;
