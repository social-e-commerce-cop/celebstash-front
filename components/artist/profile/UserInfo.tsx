import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

interface UserInfoProps {
  name: string;
  email: string;
  bio: string;
}

const UserInfo: React.FC<UserInfoProps> = ({ name, email, bio }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image
          source={require("../../../assets/images/prof.jpg")} // default avatar
          style={styles.avatar}
        />
      </View>

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
      <Text style={styles.bio}>{bio}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: -56, paddingHorizontal: 16 },
  avatarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 45,
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  name: { marginTop: 14, fontSize: 20, fontWeight: "700", color: "#000" },
  email: {
    fontSize: 14,
    color: "#8A8A8A",
    fontWeight: "500",
    marginTop: 2,
  },
  bio: {
    textAlign: "center",
    fontSize: 16,
    color: "#1D1E20",
    fontWeight: "bold",
    marginTop: 14,
    paddingHorizontal: 24,
  },
});

export default UserInfo;
