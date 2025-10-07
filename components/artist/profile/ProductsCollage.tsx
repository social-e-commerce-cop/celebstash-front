import { Price } from '@/assets/icons/Settings';
import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Dimensions,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';

const { width } = Dimensions.get('window');
const GAP = 14;
const NUM_COLUMNS = 2;
const ITEM_WIDTH = (width - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface Product {
  id: string;
  image: ImageSourcePropType;
  price: string;
  aspectRatio?: number;
}

interface ClothingCollageProps {
  products: Product[];
}

const ClothingCollage: React.FC<ClothingCollageProps> = ({ products: initialProducts }) => {
  const [columns, setColumns] = useState<Product[][]>([[], []]);

  useEffect(() => {
    const leftCol: Product[] = [];
    const rightCol: Product[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    initialProducts.forEach((item) => {
      const aspectRatio = 0.7 + Math.random() * 0.8;
      const enhancedItem = { ...item, aspectRatio };
      const itemHeight = ITEM_WIDTH * aspectRatio;

      // Put item in shorter column
      if (leftHeight <= rightHeight) {
        leftCol.push(enhancedItem);
        leftHeight += itemHeight + GAP;
      } else {
        rightCol.push(enhancedItem);
        rightHeight += itemHeight + GAP;
      }
    });

    setColumns([leftCol, rightCol]);
  }, [initialProducts]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.row}>
        {columns.map((col, colIndex) => (
          <View key={colIndex} style={{ flex: 1, marginLeft: colIndex === 0 ? 0 : GAP }}>
            {col.map((item) => {
              const itemHeight = ITEM_WIDTH * (item.aspectRatio ?? 1);
              return (
                <View
                  key={item.id}
                  style={[styles.itemContainer, { height: itemHeight, marginBottom: GAP }]}
                >
                  <Image source={item.image} style={styles.image} resizeMode="cover" />
                  <View style={styles.badge}>
                    {Price}
                    <Text style={styles.badgeText}>{item.price}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: { flexDirection: 'row' },
  itemContainer: {
    width: ITEM_WIDTH,
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#00000080',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 36,
    gap: 5,
    justifyContent: 'center',
  },
  icon: { width: 12, height: 12, marginRight: 5, tintColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ClothingCollage;
