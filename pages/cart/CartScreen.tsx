import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import ActivePage from './ActivePage';
import CompletePage from './CompletePage';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import TabBar from '@/components/Tabbar';

const { width, height } = Dimensions.get('window');

const Cart = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Complete'>('Active');
  const navigation = useNavigation();

  const renderContent = () => {
    if (activeTab === 'Active') return <ActivePage />;
    return <CompletePage />;
  };

  return (
    <>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.05} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Cart</Text>

        <View style={styles.iconButton} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Active' && styles.activeTabBorder]}
          onPress={() => setActiveTab('Active')}
        >
          <Text style={activeTab === 'Active' ? styles.activeTabText : styles.inactiveTabText}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Complete' && styles.activeTabBorder]}
          onPress={() => setActiveTab('Complete')}
        >
          <Text style={activeTab === 'Complete' ? styles.activeTabText : styles.inactiveTabText}>
            Complete
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderContent()}
     
    </View>
     <View style={styles.tabBarContainer}>
             <TabBar />
           </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.09,
    backgroundColor: '#fff',
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerTitle: {
    color: "#000",
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.08,
  },
  iconButton: {
    // padding: width * 0.015,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.01,
    borderBottomWidth: 2,
    borderColor: '#eee',
  },
  tabButton: {
    flex: 1,
    
    paddingVertical: height * 0.015,
    borderBottomWidth: height * 0.005, // relative thickness for bottom border
    borderBottomColor: 'transparent', // default hidden
  },
  activeTabBorder: {
    borderBottomColor: '#7126D0', // orange bottom border for active tab
  },
  activeTabText: {
    color: '#000', // black for active tab
    fontFamily: 'Poppins-Bold',
    fontSize: width * 0.045,
  },
  inactiveTabText: {
    color: '#8F959E', // grey color for inactive tab
    fontSize: width * 0.045,
    fontFamily: 'Poppins-Regular',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});

export default Cart;
