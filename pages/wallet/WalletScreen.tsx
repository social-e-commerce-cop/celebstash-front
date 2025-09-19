// screens/EwalletScreen.tsx
import { MenuIcon } from '@/assets/icons/Payment';
import Header from '@/components/home/Header';
import React, { useState } from 'react';
import { StyleSheet, Dimensions, View, StatusBar, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import BalanceCard from '@/components/ewallet/BalanceCard';
import TransactionList from '@/components/ewallet/TransactionList';
import AddWalletModal from '@/components/ewallet/AddWalletModal';
import TabBar from '@/components/Tabbar';
 // Adjust the import path as needed

const { width, height } = Dimensions.get('window');

const EwalletScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMenuPress = () => {
    setIsModalVisible(true); // Show the modal when the menu button is clicked
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Close the modal
  };

  return (
    <>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />
      <TransactionList
        ListHeaderComponent={
          <View>
            <Header
              title="E-Wallet"
              onRightPress={handleMenuPress} // Trigger modal on menu press
              RightIcon={<MenuIcon />}
            />
            <Text style={styles.balanceLabel}>My e-wallets</Text>
            <BalanceCard />
            <View style={styles.containerr}>
              <Text style={styles.title}>Transactions History</Text>
              <TouchableOpacity onPress={() => navigation.navigate('TransactionSearch')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      <AddWalletModal visible={isModalVisible} onClose={handleCloseModal} />

    </View>
     <View style={styles.tabBarContainer}>
                 <TabBar />
               </View>
    </>
  );
};

export default EwalletScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.02,
  },
  balanceLabel: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D1E20",
  },
  seeAll: {
    fontSize: 16,
    color: "#FF650E",
    fontWeight: "600",
  },
  containerr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: -12,
    left: 0,
    right: 0,
    paddingHorizontal: width * 0.01,
    paddingVertical: height * 0.015,
    backgroundColor: 'transparent', // Transparent or semi-transparent
    marginHorizontal: 10,
    borderRadius: 50
  },
});