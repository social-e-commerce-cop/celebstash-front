// FieldEdit.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Close } from "@/assets/icons/Settings";

const { width, height } = Dimensions.get("window");
const PURPLE = "#7126D0";

const FieldEdit = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { fieldKey, value, onSave } = route.params;
  const [text, setText] = useState(value);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            onSave(text);
            navigation.goBack();
          }}
        >
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Input box */}
      <View style={styles.inputBox}>
        <Text style={styles.label}>{fieldKey.toUpperCase()}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Enter your ${fieldKey}`}
          placeholderTextColor="#8A8A8A"
          style={styles.input}
          multiline={fieldKey === "bio"}
        />
        {text.length > 0 && (
          <TouchableOpacity onPress={() => setText("")} style={styles.clearBtn}>
            <Close />
          </TouchableOpacity>
        )}
      </View>

      {/* Info text */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.info}>
          By using <Text style={styles.highlight}>{text || value}</Text>, you agree
          to follow our terms. You do not need to set a username or provide your
          real name to use the app, and we respect your privacy at all times.
        </Text>
        <Text style={[styles.info, { marginTop: 14 }]}>
          You are responsible for any actions taken on your account or device,{" "}
          <Text style={styles.link}>Learn more</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.05,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    paddingTop: height * 0.015,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  done: {
    color: PURPLE,
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FAFAFA",
    position: "relative",
  },
  label: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "#8A8A8A",
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: "#1F2937",
    fontFamily: "Poppins-Regular",
    paddingRight: 30,
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    top: 24,
  },
  info: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#4B5563",
    lineHeight: 20,
  },
  highlight: {
    color: PURPLE,
    fontFamily: "Poppins-Bold",
  },
  link: {
    color: PURPLE,
    fontFamily: "Poppins-Bold",
  },
});

export default FieldEdit;
