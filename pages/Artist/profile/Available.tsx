import ClothingCollage from '@/components/artist/profile/ProductsCollage';
import React from 'react'
import { View } from 'react-native'

const Available = () => {
const products= [
    { id: '1', image: require('@/assets/images/products/product1.jpg'), price: '23' },
     { id: '2', image: require('@/assets/images/products/product2.jpg'), price: '23' },
      { id: '3', image: require('@/assets/images/products/product3.jpg'), price: '23' },
       { id: '4', image: require('@/assets/images/products/product4.jpg'), price: '23' },
        { id: '5', image: require('@/assets/images/products/product5.jpg'), price: '23' },
         { id: '6', image: require('@/assets/images/products/product6.jpg'), price: '23' },
          { id: '7', image: require('@/assets/images/products/product7.jpg'), price: '23' },
  ];
  return (
    <View>
       <ClothingCollage products={products} />
    </View>
  )
}

export default Available