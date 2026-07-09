import { Wallet } from '@/assets/icons/Payment';
import React from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '@/lib/walletStore';

const { width } = Dimensions.get('window');

const BalanceCard: React.FC = () => {
  const { balance } = useWallet();

  return (
    <LinearGradient
      colors={['#7126D0', '#3D0C91']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceCard}
    >
      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.row}>
        {/* Left side */}
        <View style={{ gap: 6 }}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceSub}>ZIKII WALLET</Text>
        </View>

        {/* Right side */}
        <View style={styles.iconContainer}>
          <Wallet />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    borderRadius: 16,
    marginBottom: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#7126D0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  circle1: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -width * 0.15,
    right: -width * 0.1,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -width * 0.05,
    left: -width * 0.05,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
  balanceSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BalanceCard;
