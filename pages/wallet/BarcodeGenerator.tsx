import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
import Barcode from 'react-native-barcode-builder';

const { width } = Dimensions.get('window');

const BarcodeScreen: React.FC = () => {
  const barcodeValue = '05111140759';

  if (!Barcode) {
    console.error('Barcode component is not available. Check react-native-barcode-builder installation.');
    return <View><Text>Error loading barcode.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Barcode
        value={barcodeValue}
        format="CODE128"
        height={120}
        width={2}
   
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  barcode: {
    width: width - 40,
    alignSelf: 'center',
  },
});

export default BarcodeScreen;