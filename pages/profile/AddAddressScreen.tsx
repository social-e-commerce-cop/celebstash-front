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
    <ScrollView style={styles.container}>
         <StatusBar barStyle="dark-content" backgroundColor="#000" />
         {/* Header */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>
              Address
            </Text>

            <View style={styles.iconButton} />
          </View>
      <Text style={styles.headerText}>
        Your address helps you discover new people and opportunities
      </Text>

      {/* Description */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Description"
          placeholderTextColor="#000"
          multiline
          numberOfLines={8}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Street Address */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Street Address"
          placeholderTextColor="#000"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
      </View>

      {/* Apt */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Apt, etc (or leave blank)"
          placeholderTextColor="#000"
          value={apt}
          onChangeText={setApt}
        />
      </View>

      {/* City */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="City"
          placeholderTextColor="#000"
          value={city}
          onChangeText={setCity}
        />
      </View>

      {/* State & Zip Code */}
      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <TextInput
            style={styles.halfInput}
            placeholder="State"
            placeholderTextColor="#000"
            value={state}
            onChangeText={setState}
          />
        </View>
        <View style={styles.halfInputContainer}>
          <TextInput
            style={styles.halfInput}
            placeholder="Zip Code"
            placeholderTextColor="#000"
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
    backgroundColor: "#f5f8faff",   
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.04, 
},
    headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: { color: "#000", fontWeight: "bold" },
  iconButton: {},
  headerText: { fontSize: 16, color: '#000', marginBottom: 20, textAlign: 'left', fontWeight: 'bold' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 14, color: '#333', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#8F959E57',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    color: '#000'
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#8F959E57',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight:100,
    color: '#000',
  },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  halfInputContainer: { flex: 0.48 },
  halfInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  mapContainer: { height: mapHeight, marginBottom: 20, borderRadius: 10, overflow: 'hidden' },
  map: { flex: 1 },
  addButton: {
    backgroundColor: '#FF650E',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 100,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default AddAddressForm;
