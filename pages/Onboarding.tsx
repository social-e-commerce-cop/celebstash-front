import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Svg, Path } from "react-native-svg";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type AppStackParamList = {
  Splash: undefined;
  OnBoarding: undefined;
  Signin: undefined;
  Signup: undefined;
  Home: undefined;
  ArtHome: undefined;
};




export default function OnboardingScreen() {
    const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>ZIKII</Text>
                    <Text style={styles.logoDot}>.</Text>
                </View>
            </View>

            {/* Hero Section */}
            <View style={styles.heroSection}>
                <View style={styles.profileImages}>
                    <Image
                        source={require("../assets/images/professional-black.png")}
                        style={[styles.profileImage, styles.profile1]}
                    />
                    <Image
                        source={require("../assets/images/smiling-black.png")}
                        style={[styles.profileImage, styles.profile2]}
                    />
                    <Image
                        source={require("../assets/images/black-man.png")}
                        style={[styles.profileImage, styles.profile3]}
                    />
                </View>

              
               
               
            </View>
             <View style={styles.section}>
                  <Text style={styles.heroText}>
                    Own exclusive, limited merchandise from stars and influencers connecting you to their world with every
                    purchase.
                </Text>
                 <TouchableOpacity
                    style={styles.getStartedBtn}
                    onPress={() => navigation.navigate("Signup")} 
                >
                    <Text style={styles.getStartedText}>Get Started</Text>
                 </TouchableOpacity>

               </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 30, fontFamily: "Poppins" },
    header: { paddingVertical: 42, alignItems: "center" },
    logoContainer: { flexDirection: "row", alignItems: "baseline" },
    logoText: { color: "#000", fontSize: 32, fontFamily: "Poppins-Bold" },
    logoDot: { color: "#7126D0", fontSize: 32, fontFamily: "Poppins-Bold" },
    heroSection: { flex: 1, alignItems: "center", justifyContent: "center", gap: 40, textAlign: "center" },
    profileImages: { width: 280, height: 200, position: "relative" },
    profileImage: { position: "absolute", borderRadius: 36, borderWidth: 0 },
    profile1: { width: 200, height: 181, top: -150, left: -20, zIndex: 3 },
    profile2: { width: 211, height: 198, bottom: 45, right: 0, zIndex: 3 },
    profile3: { width: 213, height: 230, bottom: -120, left: -20, zIndex: 3 },
    section: {   alignItems: "center", justifyContent: "center", gap: 30, textAlign: "center", paddingBottom: 60 },
    heroText: { fontSize: 18, lineHeight: 26, color: "#333", textAlign: "center", maxWidth: 320, fontFamily: "Poppins-Bold" },
    getStartedBtn: { backgroundColor: "#7126D0", borderRadius: 5, paddingVertical: 10, paddingHorizontal: 32, width: "100%", maxWidth: 320, alignItems: "center" },
    getStartedText: { color: "#fff", fontSize: 16, fontFamily: "Poppins-Bold" },
});
