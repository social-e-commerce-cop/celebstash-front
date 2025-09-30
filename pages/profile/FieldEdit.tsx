// FieldEdit.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Close } from "@/assets/icons/Settings";

const { width, height } = Dimensions.get("window");

const FieldEdit = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { fieldKey, value, onSave } = route.params;
  const [text, setText] = useState(value);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>{fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}</Text>
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
        <Text style={styles.label}>{fieldKey}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
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
      <View style={{ marginTop: 20 }}>
        <Text style={styles.info}>
          By using <Text style={styles.highlight}>{text || value}</Text>, you agree
          to follow our terms. You do not need to set a username or provide your
          real name to use the app, and we respect your privacy at all times.
        </Text>
        <Text style={[styles.info, { marginTop: 12 }]}>
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
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.06,
    backgroundColor: "#fff" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  done: { color: "#FF650E", fontSize: 18, fontWeight: "bold" },
  inputBox: {
    borderWidth: 2,
    borderColor: "#8F959E57",
    borderRadius: 10,
    padding: 12,
    position: "relative",
  },
  label: { fontSize: 14, fontWeight: "bold", color: "#000",  },
  input: { fontSize: 16, marginTop: 4, fontWeight: "bold" },
  clearBtn: { position: "absolute", right: 10, top: "40%" },
  info: { fontSize: 14, color: "#000", lineHeight: 20, fontWeight: "bold" },
  highlight: { color: "#FF650E", fontWeight: "600" },
  link: { color: "#FF650E", fontWeight: "600" },
});

export default FieldEdit;
