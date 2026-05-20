import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

interface FieldErrorProps {
  message?: string | null;
}

const FieldError: React.FC<FieldErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Animated.View 
      entering={FadeInUp.duration(300)} 
      exiting={FadeOutDown.duration(200)}
      style={styles.container}
    >
      <Ionicons name="alert-circle" size={14} color="#F43F5E" />
      <Text style={styles.text}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#F43F5E',
    fontFamily: 'poppins-medium',
    fontSize: 16,
    marginLeft: 6,
    letterSpacing: -0.5,
  },
});

export default FieldError;
