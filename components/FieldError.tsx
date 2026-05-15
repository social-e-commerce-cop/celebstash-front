import React from 'react';
import { View, Text } from 'react-native';
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
      className="flex-row items-center mt-1.5 px-3 py-1.5 bg-red-50/50 rounded-lg self-start border border-red-100/50"
    >
      <Ionicons name="alert-circle" size={14} color="#F43F5E" />
      <Text className="text-rose-500 font-poppins-medium text-[11px] ml-1.5 tracking-tight">
        {message}
      </Text>
    </Animated.View>
  );
};

export default FieldError;
