import SwitchToggle from '@/components/Profile/SwitchToggle';
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

const SecurityScreen = () => {
const navigation = useNavigation<StackNavigationProp<any>>();
  return (
   <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />
       {/* Header */}
              <View style={styles.headerOverlay}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                  <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
                </TouchableOpacity>
        
                <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Security</Text>
        
                <View style={styles.iconButton} />
              </View>
     <View>
        <SwitchToggle label='FaceID' description='use FaceID to login in your account'/>
        <SwitchToggle label='Remember me' description='Save your password on device'/>
        <SwitchToggle label='Touch ID' description='Use touch ID to login to your account'/>
     </View>
   </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f8faff",
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
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
  iconButton: {},
})

export default SecurityScreen
