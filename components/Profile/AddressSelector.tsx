import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AddressItem from './AddressItem';
import { useNavigation } from "@react-navigation/native"; // 👈 import navigation hook
import { StackNavigationProp } from "@react-navigation/stack";

const AddressSelector: React.FC = () => {
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const addresses: { id: number; label: string; details: string }[] = [
    { id: 1, label: 'Home', details: '11243 Thimson Sir, Sheldon Hawaii Street' },
    { id: 2, label: 'Office', details: '11243 Thimson Sir, Sheldon Hawaii Street' },
    { id: 3, label: 'Parents', details: '11243 Thimson Sir, Sheldon Hawaii Street' },
    { id: 4, label: 'Friend', details: '11243 Thimson Sir, Sheldon Hawaii Street' },
  ];

  const navigation = useNavigation<StackNavigationProp<any>>(); 

  return (
    <View style={styles.container}>
      {addresses.map((address) => (
        <AddressItem
          key={address.id}
          address={address}
          isSelected={selectedAddressId === address.id}
          onSelect={setSelectedAddressId}
        />
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddAddress") }>
        <Text style={styles.addButtonText}>+ Add New Shipping Address</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  addButton: {
    height: 55,
width: '100%',
    padding: 10,
    backgroundColor: '#D9DBDE73',
    borderRadius: 5,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,           // add border width
    borderColor: '#9DB2CE',      // add border color
    borderStyle: 'dashed',    // make it dashed
  },
  addButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});

export default AddressSelector;