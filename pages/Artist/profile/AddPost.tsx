import FormRow from "@/components/artist/profile/FormRow";
import Header from "@/components/artist/profile/Header";
import ImagePickerRow from "@/components/artist/profile/ImagePickerRow";
import VideoPickerRow from "@/components/artist/profile/VideoPicker";
import React, { useState } from "react";
import { ScrollView, KeyboardAvoidingView, Platform, Alert, StyleSheet, View, StatusBar, ActivityIndicator } from "react-native";
import { productService } from "@/services/productService";
import { uploadService } from "@/services/uploadService";
import { ProductType } from "@/types/api";

interface FormData {
  name: string;
  price: string;
  gender: string;
  description: string;
  stockQuantity: string;
}

const CreatePostScreen = ({ navigation }: any) => {
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: '',
    gender: 'female',
    description: '',
    stockQuantity: '1',
  });

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value.toString() }));
  };

  const validateAndSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert("Error", "Product name is required!");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert("Error", "Valid price is required!");
      return;
    }

    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      Alert.alert("Error", "Valid stock quantity is required!");
      return;
    }

    if (images.length === 0) {
      Alert.alert("Error", "At least one product image is required!");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Upload the main product image
      console.log('Uploading product image...');
      const imageUrl = await uploadService.uploadProductImage(
        images[0], 
        `product_${Date.now()}.jpg`
      );

      // Step 2: Create the product
      console.log('Creating product...');
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || 'No description provided',
        price: parseFloat(formData.price),
        imageUrl: imageUrl,
        stockQuantity: parseInt(formData.stockQuantity),
        productType: ProductType.REGULAR,
      };

      const createdProduct = await productService.createProduct(productData);

      setLoading(false);
      
      Alert.alert(
        "Success!",
        `Product "${createdProduct.name}" created successfully!\n\nStatus: PENDING\n\nYour product is now awaiting admin approval. Once approved, you'll be able to create a post for it.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error: any) {
      setLoading(false);
      console.error('Failed to create product:', error);
      Alert.alert(
        "Error",
        error?.message || "Failed to create product. Please try again."
      );
    }
  };



  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#000" />
      <Header
        title="Create Product"
        onBack={() => navigation.goBack()}
        onDone={validateAndSubmit}
        doneDisabled={loading || !formData.name || !formData.price || images.length === 0}
      />
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF650E" />
        </View>
      )}

      <ScrollView>
        <ImagePickerRow images={images} onChange={setImages} />
        <VideoPickerRow 
          videos={videos} 
          onChange={(newVideos) => setVideos(newVideos)} 
        />
        <View style={styles.separator}></View>
        
        <FormRow
          label="Product Name"
          value={formData.name}
          onChange={(value) => handleChange('name', value)}
          placeholder="Enter name of your product"
        />
        
        <FormRow
          label="Price (RWF)"
          value={formData.price}
          onChange={(value) => handleChange('price', value)}
          placeholder="Enter price"
          type="numeric"
        />
        
        <FormRow
          label="Stock Quantity"
          value={formData.stockQuantity}
          onChange={(value) => handleChange('stockQuantity', value)}
          placeholder="Enter available quantity"
          type="numeric"
        />
        
        <FormRow
          label="Category"
          value={formData.gender}
          onChange={(value) => handleChange('gender', value)}
          options={[
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Unisex', value: 'unisex' },
          ]}
        />
        
        <FormRow
          label="Description"
          value={formData.description}
          onChange={(value) => handleChange('description', value)}
          placeholder="Enter the story behind this product..."
          multiline
          showBottomBorder={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
    separator: { 
        height: 2, 
        backgroundColor: "#8F959E57" 
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});
