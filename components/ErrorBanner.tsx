import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorBannerProps {
  message: string | null;
  onClose: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Error</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity 
        onPress={onClose}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={22} color="#EF4444" style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 9999,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#991B1B',
    fontFamily: 'poppins-bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  message: {
    color: '#DC2626',
    fontFamily: 'poppins-medium',
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default ErrorBanner;
