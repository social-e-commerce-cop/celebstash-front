// EditProfile.tsx
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import ImageUpload from "@/components/Profile/ImageUpload";

const { width, height } = Dimensions.get("window");

const EditProfile = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [profile, setProfile] = useState({
    name: "Nadette Ange 🦋",
    username: "_Ange Nadette BATETE",
    gender: "Female",
    bio: "I am a positive person. I love to travel and eat. Always available for chat.",
    links: "https://instagram.com/_b.a.t.e.t.e.05",
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.containerized}>
          {/* Header */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>
              Edit profile
            </Text>

            <View style={styles.iconButton} />
          </View>

          <ImageUpload />
        </View>

        <View style={styles.separator}></View>

        {/* Profile Fields */}
        <View style={styles.containerized}>
          {Object.entries(profile).map(([key, value]) => {
            if (key === "avatar") return null;

            // Determine if this field should have a bottom border
            const isLinks = key === "links";

            return (
              <View key={key} style={styles.field}>
                <Text style={styles.labell}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.valueContainer,
                    isLinks && { borderBottomWidth: 0, marginBottom: 0 }, // no border for links
                  ]}
                  onPress={() =>
                    navigation.navigate("FieldEdit", {
                      fieldKey: key,
                      value,
                      onSave: (newValue: string) =>
                        setProfile({ ...profile, [key]: newValue }),
                    })
                  }
                >
                  <Text style={styles.inputValue}>{value}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.separator}></View>
         <View style={styles.containerized}>
             <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Switch to professional account</Text>
      </TouchableOpacity>
         </View>
          <View style={styles.separator}></View>
         <View style={styles.containerized}>
             <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Verify')}>
        <Text style={styles.optionText}>Verify your account</Text>
      </TouchableOpacity>
         </View>
          <View style={styles.separator}></View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f8faff" },
  containerized: { paddingHorizontal: width * 0.06, paddingTop: height * 0.03, paddingBottom: height * 0.02 },
  scrollContent: {},
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: { color: "#000", fontWeight: "bold" },
  iconButton: {},
  field: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  labell: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
    width: 90,
    paddingBottom: 25,
  },
  valueContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#8F959E57",
    paddingBottom: 25,
  },
  inputValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  separator: { height: 2, backgroundColor: "#8F959E57" },
   option: {
    paddingBottom: 5,
  },
  optionText: {
    color: "#FF650E",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default EditProfile;
