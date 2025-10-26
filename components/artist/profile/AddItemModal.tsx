import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { AddPost, AddTribe } from "@/assets/icons/Settings";

const { width } = Dimensions.get("window");

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleCreatePost = () => {
    onClose();
    navigation.navigate("CreatePost"); // navigate to CreatePost page
  };

  const handleTribe = () => {
    onClose();
    navigation.navigate("CreateTribe"); // navigate to Tribe page
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.modal}>
        <View style={styles.bar} />

        <TouchableOpacity style={styles.option} onPress={handleCreatePost}>
          {AddPost}
          <Text style={styles.optionText}>Create Post</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleTribe}>
          {AddTribe}
          <Text style={styles.optionText}>Tribe</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -width / 2 }, { translateY: -100 }], // center modal
    width: width,
    backgroundColor: "#fff",
   borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 48,
  },
  bar: {
    width: 40,
    height: 4,
    backgroundColor: "#8F959E",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: "#1D1E20",
    fontWeight: "600",
  },
});

export default AddItemModal;
