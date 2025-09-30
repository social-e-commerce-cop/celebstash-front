import FormRow from "@/components/artist/profile/FormRow";
import Header from "@/components/artist/profile/Header";
import ImagePickerRow from "@/components/artist/profile/ImagePickerRow";
import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet, View } from "react-native";

interface FormData {
  name: string;
  price: string;
  gender: string;
  description: string;
  links: string;
}

const CreatePostScreen = ({ navigation }: any) => {
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [gender, setGender] = useState("Female");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState("");

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
    if (!name || !price) {
      Alert.alert("Error", "Name and Price are required!");
      return;
    }
    console.log({ name, price, gender, description, links, images });
    Alert.alert("Success", "Post created successfully!");
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Header
        onBack={() => navigation.goBack()}
        onDone={validateAndSubmit}
        doneDisabled={!name || !price}
      />
      <ScrollView>
        <ImagePickerRow images={images} onChange={setImages} />
          <View style={styles.separator}></View>
        <FormRow
        label="Name"
        value={formData.name}
        onChange={(value) => handleChange('name', value)}
        placeholder="Enter name of your product"
      />
      <FormRow
        label="Price"
        value={formData.price}
        onChange={(value) => handleChange('price', value)}
        placeholder="Enter price of your product"
        type="numeric"
      />
      <FormRow
        label="Gender"
        value={formData.gender}
        onChange={(value) => handleChange('gender', value)}
        options={[
          { label: 'Female', value: 'female' },
          { label: 'Male', value: 'male' },
        ]}
      />
      <FormRow
        label="Description"
        value={formData.description}
        onChange={(value) => handleChange('description', value)}
        placeholder="Enter the story behind this product of yours."
        multiline
      />
      <FormRow
        label="Links"
        value={formData.links}
        onChange={(value) => handleChange('links', value)}
        placeholder="Any external links for your product"
      />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
    separator: { height: 2, backgroundColor: "#8F959E57" },
});
