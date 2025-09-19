import React from 'react';
import { View, Text, Image, Dimensions, StyleSheet, ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

// Array of image imports
const drops = [
  require('../../assets/images/drop1.jpg'),
  require('../../assets/images/drop2.gif'),
  require('../../assets/images/feed3.png'),
  require('../../assets/images/feed7.png'), 
  require('../../assets/images/drop1.jpg'),
];

const LatestDrops = () => (
  <View style={styles.latestDrops}>
    <Text style={styles.sectionTitle}>Latest drops</Text>

    {/* Horizontal scrollable container */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.dropsContainer}
    >
      {drops.map((image, index) => (
        <Image
          key={index}
          source={image}
          style={styles.dropImage}
          resizeMode="cover"
        />
      ))}
    </ScrollView>
  </View>
);

export default LatestDrops;

const styles = StyleSheet.create({
  latestDrops: {
    marginVertical: height * 0.02,
  },
  dropsContainer: {
    paddingHorizontal: width * 0.00,
    gap: width * 0.03,
    paddingVertical: height * 0.02,
  },
  dropImage: {
    width: width * 0.28,
    height: height * 0.2,
    borderRadius: width * 0.05,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: height * 0.01,
  },
});
