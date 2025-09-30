import { Addres } from '@/assets/icons/Settings';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Rect, Circle } from 'react-native-svg';

interface Address {
  id: number;
  label: string;
  details: string;
}

interface AddressItemProps {
  address: Address;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const AddressItem: React.FC<AddressItemProps> = ({ address, isSelected, onSelect }) => {
  return (
    <TouchableOpacity onPress={() => onSelect(address.id)} style={styles.container}>
      <View style={styles.leftIcon}>
        <Addres />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{address.label}</Text>
        <Text style={styles.address}>{address.details}</Text>
      </View>
      {isSelected && (
        <View style={styles.rightIcon}>
          <Svg width="23" height="23" viewBox="0 0 23 23" fill="none">
            <Rect x="0.5" y="0.5" width="22" height="22" rx="11" stroke="#FF650E" />
            <Circle cx="11.5" cy="11.5" r="7.5" fill="#FF650E" />
          </Svg>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  leftIcon: {  marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  rightIcon: { width: 23, height: 23, marginLeft: 10 },
  addressIcon: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#666' },
  content: { flex: 1 },
  label: { fontWeight: 'bold', fontSize: 16, color: '#1D1E20', marginBottom: 5 },
  address: { color: '#303030B2', fontWeight: 'bold', fontSize: 16, },
});

export default AddressItem;