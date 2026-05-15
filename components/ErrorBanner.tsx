import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string | null;
  onClose: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <View className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex-row items-center shadow-sm">
      <View className="bg-red-100 p-2 rounded-full mr-3">
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
      </View>
      <View className="flex-1">
        <Text className="text-red-800 font-poppins-bold text-xs uppercase tracking-wider mb-0.5">Error</Text>
        <Text className="text-red-600 font-poppins-medium text-sm leading-5">{message}</Text>
      </View>
      <TouchableOpacity 
        onPress={onClose}
        className="ml-2 p-1"
      >
        <Ionicons name="close" size={22} color="#EF4444" opacity={0.6} />
      </TouchableOpacity>
    </View>
  );
};

export default ErrorBanner;
