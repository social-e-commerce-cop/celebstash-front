import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSearch} activeOpacity={0.7}>
        <Ionicons
          name="search"
          size={20}
          color="#8A8A8A"
          style={{ marginHorizontal: 8 }}
        />
      </TouchableOpacity>
      <TextInput
        placeholder="Search"
        placeholderTextColor="#8A8A8A"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={handleSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8F959E33',
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#8A8A8A',
    fontWeight: 'bold',
  },
});

export default SearchBar;
