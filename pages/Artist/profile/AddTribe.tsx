import FormRow from "@/components/artist/profile/FormRow";
import Header from "@/components/artist/profile/Header";
import CoverImagePickerRow from "@/components/artist/profile/TribeCoverImage";
import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet, View, StatusBar, TouchableOpacity, Dimensions, Text } from "react-native";

const { width, height } = Dimensions.get("window");

const CreateTribeScreen = ({ navigation }: any) => {
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

const [formData, setFormData] = useState({
    name: '',
    price: '',
    gender: 'female',
    description: '',
    links: '',
  });

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value.toString() }));
  };


  const validateAndSubmit = () => {
    if (!name ) {
      Alert.alert("Error", "Name and Price are required!");
      return;
    }
    console.log({ name, description,  images });
    Alert.alert("Success", "Tribe created successfully!");
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#000" />
      <Header
      title="Create Tribe"
        onBack={() => navigation.goBack()}
        onDone={validateAndSubmit}
        doneDisabled={!name }
      />
      <ScrollView>
        <CoverImagePickerRow images={images} onChange={setImages} />
          <View style={styles.separator}></View>
        <FormRow
        label="Name"
        value={formData.name}
        onChange={(value) => handleChange('name', value)}
        placeholder="Enter name of your product"
      />
      <FormRow
        label="Description"
        value={formData.description}
        onChange={(value) => handleChange('description', value)}
        placeholder="Enter the story behind this product of yours."
        multiline
        showBottomBorder={false}
      />
    <View style={styles.separator}></View>
     <TouchableOpacity  style={styles.selectImageButton}>
                <Text style={styles.selectImageText}>Invite people</Text>
              </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateTribeScreen;

const styles = StyleSheet.create({
    separator: { height: 2, backgroundColor: "#8F959E57" },
      selectImageButton: {
    alignSelf: "flex-start",
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.03,
  },
  selectImageText: {
    fontSize: width * 0.045,
    color: "#FF6600",
    fontWeight: "600",
  },
});
