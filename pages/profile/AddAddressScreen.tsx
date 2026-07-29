import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

const { width, height } = Dimensions.get('window');
const mapHeight = height * 0.3;
const PURPLE = "#7126D0";

const AddAddressForm: React.FC = () => {
  const [description, setDescription] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [region, setRegion] = useState<Region>({
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleAddAddress = () => {
    console.log({
      description,
      streetAddress,
      apt,
      city,
      state,
      zipCode,
      location: region,
    });
  };

  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.headerText}>
        Your address helps you discover new people and opportunities
      </Text>

      {/* Description */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Description"
          placeholderTextColor="#8A8A8A"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Street Address */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          placeholderTextColor="#8A8A8A"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </View>

      {/* Apt */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Apt, Suite, Unit, etc (or leave blank)"
          placeholderTextColor="#8A8A8A"
          value={apt}
          onChangeText={setApt}
        />
      </View>

      {/* City */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#8A8A8A"
          value={city}
          onChangeText={setCity}
        />
      </View>

      {/* State & Zip Code */}
      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#8A8A8A"
            value={state}
            onChangeText={setState}
          />
        </View>
        <View style={styles.halfInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Zip Code"
            placeholderTextColor="#8A8A8A"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          <Marker coordinate={region} pinColor="orange" />
        </MapView>
      </View>

      {/* Add Address Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
        <Text style={styles.addButtonText}>Add Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F8FA",   
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03, 
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.015,
    paddingTop: height * 0.01,
  },
  headerTitle: { 
    color: "#000", 
    fontFamily: "Poppins-Bold",
    fontSize: 18,
  },
  headerText: { 
    fontSize: 14, 
    color: '#4B5563', 
    marginBottom: 20, 
    textAlign: 'left', 
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  inputContainer: { 
    marginBottom: 15 
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
    color: '#1F2937',
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#FAFAFA',
  },
  rowContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 15 
  },
  halfInputContainer: { 
    flex: 0.48 
  },
  mapContainer: { 
    height: mapHeight, 
    marginBottom: 25, 
    borderRadius: 10, 
    overflow: 'hidden' 
  },
  map: { 
    flex: 1 
  },
  addButton: {
    backgroundColor: PURPLE,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 100,
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontFamily: 'Poppins-Bold' 
  },
});

export default AddAddressForm;
