import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";

interface CustomSwitchProps {
  label?: string;
  initialValue?: boolean;
  onValueChange?: (value: boolean) => void;
}

const SwitchToggle: React.FC<CustomSwitchProps> = ({
  label = "Enable Notification",
  initialValue = false,
  onValueChange,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialValue);
  const translateX = useState(new Animated.Value(initialValue ? 20 : 0))[0];

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);

    Animated.timing(translateX, {
      toValue: newValue ? 20 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (onValueChange) onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Custom switch */}
      <TouchableOpacity style={[styles.switch, isEnabled && styles.switchEnabled]} onPress={toggleSwitch}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  label: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  switch: {
    width: 42,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D9D9D9",
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingVertical: 3,
  },
  switchEnabled: {
    backgroundColor: "#fff", // light orange background when ON
    borderColor: "#D9D9D9", // orange border
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 11,
    backgroundColor: "#FF650E",
  },
});

export default SwitchToggle;
