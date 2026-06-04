import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface HalfCircleProgressProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  unit: string
}

const ProgressCircle: React.FC<HalfCircleProgressProps> = ({
  current,
  total,
  size = 140,
  strokeWidth = 12,
  color = '#7126D0',
  backgroundColor = '#384147',
  unit = ' kcal',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const percentage = (current / total) * 100;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Rotate from 45deg (start) to 225deg (half circle)
  const rotate = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['45deg', '225deg'], // add 45deg offset here
  });

  return (
    <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 40 }}>
      <View
        style={[
          styles.barOverflow,
          { width: size, height: size / 2, overflow: 'hidden', marginBottom: -strokeWidth * 2 },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
              borderBottomColor: color,
              borderRightColor: color,
              transform: [{ rotate }],
            },
          ]}
        />
      </View>

      {/* Centered Text */}
      <View style={styles.textContainer}>
        <Text style={styles.progressText}>{Math.round(current)}{unit}</Text>
        <Text style={styles.progressLabel}>of {total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barOverflow: {
    
  },
  bar: {
  
    top: 0,
    left: 0,
  },
  textContainer: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F2F2F2',
  },
  progressLabel: {
    fontSize: 18,
    color: '#A3A8AA',
  },
});

export default ProgressCircle;
