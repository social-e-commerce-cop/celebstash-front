import ReviewCard from '@/components/Reviews/ReviewCard';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get('window');

const ProductReviews: React.FC = () => {
  const navigation = useNavigation();

  // Responsive bar widths in pixels
  const barWidths: Record<number, number> = {
    1: width * 0.02,
    2: width * 0.05,
    3: width * 0.2,
    4: width * 0.6,
    5: width * 1.0, // full width
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: height * 0.1 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>All reviews</Text>

          <TouchableOpacity style={styles.iconButton}>
            <Svg width={width * 0.06} height={width * 0.06} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15.014 16.636L8.986 13.894M15.112 7.582L8.888 10.977M6.015 15.809C6.44377 15.809 6.86833 15.7245 7.26446 15.5605C7.66059 15.3964 8.02052 15.1559 8.3237 14.8527C8.62689 14.5495 8.86738 14.1896 9.03147 13.7935C9.19555 13.3973 9.28 12.9728 9.28 12.544C9.28 12.1152 9.19555 11.6907 9.03147 11.2945C8.86738 10.8984 8.62689 10.5385 8.3237 10.2353C8.02052 9.93211 7.66059 9.69162 7.26446 9.52753C6.86833 9.36345 6.44377 9.279 6.015 9.279C5.14907 9.279 4.3186 9.62299 3.7063 10.2353C3.09399 10.8476 2.75 11.6781 2.75 12.544C2.75 13.4099 3.09399 14.2404 3.7063 14.8527C4.3186 15.465 5.14907 15.809 6.015 15.809ZM17.985 9.28C18.4138 9.28 18.8383 9.19555 19.2345 9.03147C19.6306 8.86738 19.9905 8.62689 20.2937 8.3237C20.5969 8.02052 20.8374 7.66059 21.0015 7.26446C21.1655 6.86833 21.25 6.44377 21.25 6.015C21.25 5.58623 21.1655 5.16167 21.0015 4.76554C20.8374 4.36941 20.5969 4.00948 20.2937 3.7063C19.9905 3.40311 19.6306 3.16261 19.2345 2.99853C18.8383 2.83445 18.4138 2.75 17.985 2.75C17.1191 2.75 16.2886 3.09399 15.6763 3.7063C15.064 4.3186 14.72 5.14907 14.72 6.015C14.72 6.88093 15.064 7.7114 15.6763 8.3237C16.2886 8.93601 17.1191 9.28 17.985 9.28ZM17.985 21.25C18.8509 21.25 19.6814 20.906 20.2937 20.2937C20.906 19.6814 21.25 18.8509 21.25 17.985C21.25 17.1191 20.906 16.2886 20.2937 15.6763C19.6814 15.064 18.8509 14.72 17.985 14.72C17.1191 14.72 16.2886 15.064 15.6763 15.6763C15.064 16.2886 14.72 17.1191 14.72 17.985C14.72 18.8509 15.064 19.6814 15.6763 20.2937C16.2886 20.906 17.1191 21.25 17.985 21.25Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.headerStats}>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { fontSize: width * 0.05 }]}>4.8</Text>
            <View style={styles.stars}>
              <Text style={[styles.star, { fontSize: width * 0.045 }]}>★</Text>
              <Text style={[styles.star, { fontSize: width * 0.045 }]}>★</Text>
              <Text style={[styles.star, { fontSize: width * 0.045 }]}>★</Text>
              <Text style={[styles.star, { fontSize: width * 0.045 }]}>★</Text>
              <Text style={[styles.star, { fontSize: width * 0.045 }]}>★</Text>
            </View>
            <Text style={[styles.reviews, { fontSize: width * 0.04 }]}>1.5K Reviews</Text>
          </View>

          <View style={styles.ratingBars}>
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { fontSize: width * 0.04 }]}>5 </Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidths[5] }]} />
              </View>
            </View>
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { fontSize: width * 0.04 }]}>4 </Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidths[4] }]} />
              </View>
            </View>
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { fontSize: width * 0.04 }]}>3 </Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidths[3] }]} />
              </View>
            </View>
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { fontSize: width * 0.04 }]}>2 </Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidths[2] }]} />
              </View>
            </View>
            <View style={styles.barRow}>
              <Text style={[styles.barLabel, { fontSize: width * 0.04 }]}>1 </Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: barWidths[1] }]} />
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Reviews individually */}
      <ReviewCard
        userName="Kenny K Shot"
        time="1h"
        rating={5.0}
        review="Worn by Kendrick Lamar during the Mr. Morale
Tour, this piece carries the energy of sold-out arenas, poetic verses, and raw, unfiltered 
emotion. From the backstage pulse to the 
spotlight on stage, this jacket has witnessed
the power of art to move millions."
        profileImage={require('../../assets/images/feed6.jpg')}
      />
      <ReviewCard
        userName="Jane Doe"
        time="2h"
        rating={4.5}
        review="Worn by Kendrick Lamar during the Mr. Morale
Tour, this piece carries the energy of sold-out arenas, poetic verses, and raw, unfiltered 
emotion. From the backstage pulse to the 
spotlight on stage, this jacket has witnessed
the power of art to move millions."
        profileImage={require('../../assets/images/feed6.jpg')}
      />
      <ReviewCard
        userName="John Smith"
        time="3h"
        rating={5.0}
        review="Worn by Kendrick Lamar during the Mr. Morale
Tour, this piece carries the energy of sold-out arenas, poetic verses, and raw, unfiltered 
emotion. From the backstage pulse to the 
spotlight on stage, this jacket has witnessed
the power of art to move millions."
        profileImage={require('../../assets/images/feed6.jpg')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.05,
    backgroundColor: '#f5f8faff',
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {
    padding: 5,
  },
  header: {
    marginBottom: height * 0.02,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height * 0.015,
    backgroundColor: '#fff',
    padding: width * 0.04,
    borderRadius: 15
  },
  ratingContainer: {
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  rating: {
    fontWeight: 'bold',
  },
  stars: {
    flexDirection: 'row',
  },
  star: {
    color: '#FFA500',
  },
  reviews: {
    color: '#666',
    marginTop: 5,
  },
  ratingBars: {
    flex: 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.005,
  },
  barLabel: {
    width: width * 0.09,
    textAlign: 'right',
    marginRight: width * 0.02,
    fontWeight: 'bold'
  },
  barContainer: {
    flex: 1,
    height: height * 0.01,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFA500',
    borderRadius: 4,
  },
});

export default ProductReviews;
