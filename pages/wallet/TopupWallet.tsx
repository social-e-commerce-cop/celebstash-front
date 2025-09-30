// screens/TopUpScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

// Predefined suggestion amounts
const suggestionAmounts = [10, 20, 30, 40, 100, 200, 300, 400, 500, 600, 700, 800];

const TopUpScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [amount, setAmount] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestionAmounts);

  // Handle text input change and filter suggestions
// Handle text input change and filter suggestions
const handleAmountChange = (text: string) => {
  const numericValue = text.replace(/[^0-9]/g, ''); // Only numbers
  setAmount(numericValue);

  if (!numericValue) {
    setFilteredSuggestions(suggestionAmounts);
    return;
  }

  // Match suggestions starting with what the user typed
  const filtered = suggestionAmounts.filter(amount =>
    amount.toString().startsWith(numericValue)
  );

  setFilteredSuggestions(filtered);
};

const goToPinPage = () => {
  if (amount) {
    navigation.navigate("TopupConfirmation", { amount });
  }
};


  // Handle selecting a suggestion
  const handleSelectAmount = (value: number) => {
    setAmount(value.toString());
    setFilteredSuggestions(suggestionAmounts.filter(amount => amount >= value));
  };

  // Reset suggestions when input is cleared
  useEffect(() => {
    if (!amount) {
      setFilteredSuggestions(suggestionAmounts);
    }
  }, [amount]);

  // Render each suggestion card
  const renderSuggestion = ({ item }: { item: number }) => (
    <TouchableOpacity 
      style={styles.suggestionCard} 
      onPress={() => handleSelectAmount(item)}
    >
      <Text style={styles.suggestionText}>${item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>
          Top Up E-Wallet
        </Text>

        <TouchableOpacity  style={styles.iconButton}>
          
        </TouchableOpacity>
      </View>
      <Text style={styles.instruction}>Enter the amount of top up</Text>
      <TextInput
        style={styles.amountInput}
        value={amount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        placeholder="$0"
        placeholderTextColor="#888"
        returnKeyType="done"          // ✅ Show "Done" button on keyboard
  onSubmitEditing={goToPinPage}
      />
      <FlatList
        data={filteredSuggestions}
        renderItem={renderSuggestion}
        keyExtractor={(item) => item.toString()}
        numColumns={4}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.suggestionsContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No suggestions available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {},
  instruction: {
    fontSize: 16,
    color: '#000000ff',
    marginBottom: height * 0.04,
    textAlign: 'center'
  },
  amountInput: {
    backgroundColor: '#F4F5F7',
    borderRadius: 10,
    padding: width * 0.05,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D1E20',
    textAlign: 'center',
    marginBottom: height * 0.02,
    borderColor: '#8F959E57',
    borderWidth: 1,
    paddingVertical: height * 0.06,
  },
  suggestionsContainer: {
    paddingBottom: height * 0.02,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
  },
  suggestionCard: {
    backgroundColor: '#F4F5F7',
    borderWidth: 1,
    borderColor: '#0000001A',
    borderRadius: 5,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    margin: width * 0.01,
    alignItems: 'center',
    justifyContent: 'center',
    width: (width * 0.9 - 3 * width * 0.01) / 4, // Adjust for 4 columns with margins
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#303030',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: height * 0.02,
  },
});

export default TopUpScreen;