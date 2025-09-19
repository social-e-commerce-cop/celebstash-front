// components/AddWalletModal.tsx
import React from 'react';
import { StyleSheet, Dimensions, View, Text, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { AddWalletBtn, TopUpBtn } from '@/assets/icons/Payment';

const { width, height } = Dimensions.get('window');

interface AddWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddWalletModal: React.FC<AddWalletModalProps> = ({ visible, onClose }) => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleAddWallet = () => {
    navigation.navigate('AddWalletScreen'); // Replace with your actual screen name
    onClose();
  };

  const handleTopUp = () => {
    navigation.navigate('TopupWallet'); // Replace with your actual screen name
    onClose();
  };

  // Handle closing the modal when clicking outside
  const handleOverlayPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
        <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      <TouchableOpacity style={styles.modalOverlay} onPress={handleOverlayPress} activeOpacity={1}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add wallet</Text>
          <TouchableOpacity style={styles.modalButton} onPress={handleAddWallet}>
            <AddWalletBtn />
            <Text style={styles.modalButtonText}> Add wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButton} onPress={handleTopUp}>
            <TopUpBtn />
            <Text style={styles.modalButtonText}>Top-up E-wallet</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: width * 0.04,
    borderTopRightRadius: width * 0.04,
    width: width,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.06,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1E20',
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#fff',
    paddingVertical: height * 0.02,
    borderRadius: width * 0.04,
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: '#0000001A',
    alignItems: 'center',
    flexDirection: 'row', 
    gap: 20,
    paddingLeft: width * 0.05,
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1E20',
  },
});

export default AddWalletModal;