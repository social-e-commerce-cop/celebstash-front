import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

interface MetricCardProps {
  icon?: React.ReactNode;
  trendIcon?: React.ReactNode;
  number?: string | number;
  label?: string;
  change?: string;
  changeColor?: string;
}

const { width } = Dimensions.get('window');

const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  trendIcon,
  number = '0',
  label = '',
  change = '0%',
  changeColor,
}) => {
  // Automatically decide color based on whether change is positive or negative
  const autoColor = change.startsWith('-') ? '#E53636' : '#4CAF50'; // red if negative
  const displayColor = changeColor || autoColor;

  return (
    <View style={styles.card}>
      {/* Top Row */}
      <View style={styles.topRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <View style={styles.numberWrapper}>
          <Text style={styles.number}>{number}</Text>
        </View>
        {trendIcon && <View style={styles.trendWrapper}>{trendIcon}</View>}
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.change, { color: displayColor }]}>{change}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.42,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  trendWrapper: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#8F959E',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MetricCard;
