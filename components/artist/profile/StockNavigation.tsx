import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Available from '@/pages/Artist/profile/Available';
import SoldOut from '@/pages/Artist/profile/SoldOut';
import Posts from '@/pages/Artist/profile/Post';

const { width, height } = Dimensions.get('window');

const StockNavigation = () => {
  const [activeTab, setActiveTab] = useState<'Post' | 'Available' | 'Soldout'>('Post');

const renderContent = () => {
  if (activeTab === 'Post') return <Posts />;
  if (activeTab === 'Available') return <Available />;
  if (activeTab === 'Soldout') return <SoldOut />; 
  return null; 
};


  return (
    <>
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Post' && styles.activeTabBorder]}
          onPress={() => setActiveTab('Post')}
        >
          <Text style={activeTab === 'Post' ? styles.activeTabText : styles.inactiveTabText}>
            Post
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Available' && styles.activeTabBorder]}
          onPress={() => setActiveTab('Available')}
        >
          <Text style={activeTab === 'Available' ? styles.activeTabText : styles.inactiveTabText}>
            Available
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Soldout' && styles.activeTabBorder]}
          onPress={() => setActiveTab('Soldout')}
        >
          <Text style={activeTab === 'Soldout' ? styles.activeTabText : styles.inactiveTabText}>
            Soldout
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderContent()}
     
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.09,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {
    padding: width * 0.015,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
    borderBottomWidth: 2,
    borderColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: height * 0.005, // relative thickness for bottom border
    borderBottomColor: 'transparent', // default hidden
  },
  activeTabBorder: {
    borderBottomColor: '#ff6600', // orange bottom border for active tab
  },
  activeTabText: {
    color: '#000', // black for active tab
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  inactiveTabText: {
    color: '#8F959E', // grey color for inactive tab
    fontSize: width * 0.045,
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

export default StockNavigation;
