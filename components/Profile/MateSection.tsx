import { MessagingIcon, ShareIcon } from '@/assets/icons/Payment';
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const MateCard = () => {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.iconButton}>
        <MessagingIcon />
      </TouchableOpacity>
      <TouchableOpacity style={styles.mateButton}>
        <Text style={styles.buttonText}>Mate</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
      <ShareIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 20,
    marginVertical: 20
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8F959E57',
    borderRadius: 50,
  },
  mateButton: {
    width: 150,
    height: 50,
     justifyContent: 'center',
      alignItems: 'center',
    backgroundColor: '#FF650E',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'semibold'
  },
});

export default MateCard;