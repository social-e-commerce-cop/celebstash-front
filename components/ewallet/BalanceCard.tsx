import { Wallet } from '@/assets/icons/Payment';
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Card } from 'react-native-paper';

const BalanceCard: React.FC = () => {
  return (
    <Card style={styles.balanceCard}>
      <Card.Content>
        <View style={styles.row}>
          {/* Left side */}
          <View style={{ gap: 6 }}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balanceAmount}>$12.00</Text>
          </View>

          {/* Right side */}
          <Wallet />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: '#7D3913',
    borderRadius: 10,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BalanceCard;
