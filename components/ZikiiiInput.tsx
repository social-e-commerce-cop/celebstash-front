import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import FieldError from './FieldError';

interface ZikiiiInputProps extends TextInputProps {
  icon?: LucideIcon;
  error?: string | null;
  containerStyle?: object;
}

const ZikiiiInput: React.FC<ZikiiiInputProps> = ({ 
  icon: Icon, 
  error, 
  secureTextEntry, 
  containerStyle,
  style,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const actualSecureTextEntry = isPassword && !showPassword;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View 
        style={[
          styles.container, 
          error ? styles.containerError : isFocused ? styles.containerFocused : null
        ]}
      >
        {Icon && (
          <Icon 
            size={20} 
            color={error ? '#F43F5E' : isFocused ? '#7126D0' : '#999'} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[styles.input, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={actualSecureTextEntry}
          placeholderTextColor="#999"
          {...props}
        />

        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            {showPassword ? (
              <EyeOff size={20} color="#999" />
            ) : (
              <Eye size={20} color="#999" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      <FieldError message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderColor: '#F3F4F6',
    height: 48,
  },
  containerFocused: {
    borderColor: '#7126D0',
  },
  containerError: {
    borderColor: '#FDA4AF', // rose-300
    backgroundColor: '#FFF1F2', // rose-50
  },
  icon: {
    marginRight: 12,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    color: '#1F2937', // gray-800
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    height: '100%',
    paddingVertical: 0,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ZikiiiInput;
