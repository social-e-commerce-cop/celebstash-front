import { Cashout } from '@/assets/icons/Settings';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BalanceCard = () => {
  const balance = '$80,201.50';
  const date = 'December 21, 2003. 09:20AM';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Total Balance</Text>
      <Text style={styles.balance}>{balance}</Text>
      <Text style={styles.date}>{date}</Text>
      <TouchableOpacity style={styles.button}>
        {Cashout}
        <Text style={styles.buttonText}>Cashout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 300,
    alignSelf: 'center',
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#7126D0',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#8F959E',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#EAEBED',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default BalanceCard;
