import React from 'react';
import { View, StyleSheet, Dimensions, Platform, Text } from 'react-native';
// react-native-barcode-svg draws with react-native-svg (already a dependency). The previous
// library, react-native-barcode-builder, required the unmaintained @react-native-community/art
// native module, which has no New Architecture support.
import Barcode from 'react-native-barcode-svg';

const { width } = Dimensions.get('window');

const BarcodeScreen: React.FC = () => {
  const barcodeValue = '05111140759';

  if (!Barcode) {
    return <View><Text>Error loading barcode.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Barcode
        value={barcodeValue}
        format="CODE128"
        height={120}
        singleBarWidth={2}
        maxWidth={width - 40}
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
