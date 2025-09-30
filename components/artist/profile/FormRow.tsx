import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface Option {
  label: string;
  value: string | number;
}

interface FormRowProps {
  label: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  type?: 'default' | 'numeric';
  options?: Option[];
  multiline?: boolean;
}

const FormRow: React.FC<FormRowProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'default',
  options,
  multiline = false,
}) => {
  const [fieldValue, setFieldValue] = useState<string | number>(value || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleChange = (val: string | number) => {
    setFieldValue(val);
    if (onChange) onChange(val);
    setDropdownOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        {options ? (
          <>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={{ color: fieldValue ? '#000' : '#303030', fontSize: 16 }}>
                {fieldValue
                  ? options.find(opt => opt.value === fieldValue)?.label
                  : placeholder || 'Select'}
              </Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled>
                  {options.map(item => (
                    <TouchableOpacity
                      key={item.value.toString()}
                      style={styles.optionItem}
                      onPress={() => handleChange(item.value)}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <TextInput
            style={[styles.input, multiline && styles.multilineInput]}
            value={fieldValue.toString()}
            onChangeText={handleChange as (text: string) => void}
            placeholder={placeholder}
            placeholderTextColor="#303030"
            keyboardType={type === 'numeric' ? 'numeric' : 'default'}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start', // label aligns top for multiline
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  label: {
    flex: 1, // takes 1 part of the row
    fontSize: 16,
    color: '#000',
    marginTop: 7,
    textAlignVertical: 'top',
    fontWeight: 'bold',
  },
  inputWrapper: {
    flex: 3, // takes 2 parts of the row
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#8F959E57',
    paddingTop: 8,
    paddingBottom: 24,
    fontSize: 16,
    color: '#303030',
    fontWeight: '600',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 200,
    zIndex: 1000,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
});

export default FormRow;
