import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  value = '',
  onChangeText,
  placeholder = 'Search messages…',
}) => {
  const handleChange = (text: string) => {
    onChangeText?.(text);
    onSearch?.(text);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={value}
        onChangeText={handleChange}
        returnKeyType="search"
        onSubmitEditing={() => onSearch?.(value.trim())}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => { onChangeText?.(''); onSearch?.(''); }}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    padding: 0,
  },
});

export default SearchBar;
