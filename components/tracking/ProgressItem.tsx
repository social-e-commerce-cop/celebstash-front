import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

// Single icon SVG (using SvgCircle1 for all steps)
const StepIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
    <Path
      d="M4 16C4 17.5759 4.31039 19.1363 4.91345 20.5922C5.5165 22.0481 6.40042 23.371 7.51472 24.4853C8.62902 25.5996 9.95189 26.4835 11.4078 27.0866C12.8637 27.6896 14.4241 28 16 28C17.5759 28 19.1363 27.6896 20.5922 27.0866C22.0481 26.4835 23.371 25.5996 24.4853 24.4853C25.5996 23.371 26.4835 22.0481 27.0866 20.5922C27.6896 19.1363 28 17.5759 28 16C28 14.4241 27.6896 12.8637 27.0866 11.4078C26.4835 9.95189 25.5996 8.62902 24.4853 7.51472C23.371 6.40042 22.0481 5.5165 20.5922 4.91345C19.1363 4.31039 17.5759 4 16 4C14.4241 4 12.8637 4.31039 11.4078 4.91345C9.95189 5.5165 8.62902 6.40042 7.51472 7.51472C6.40042 8.62902 5.5165 9.95189 4.91345 11.4078C4.31039 12.8637 4 14.4241 4 16Z"
      stroke="#32A06E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19.7333 11.9999C19.4918 11.5809 19.1409 11.2355 18.7181 11.0007C18.2954 10.7658 17.8167 10.6503 17.3333 10.6666H14.6667C13.9594 10.6666 13.2811 10.9475 12.781 11.4476C12.281 11.9477 12 12.626 12 13.3333C12 14.0405 12.281 14.7188 12.781 15.2189C13.2811 15.719 13.9594 15.9999 14.6667 15.9999H17.3333C18.0406 15.9999 18.7189 16.2809 19.219 16.781C19.719 17.2811 20 17.9593 20 18.6666C20 19.3738 19.719 20.0521 19.219 20.5522C18.7189 21.0523 18.0406 21.3333 17.3333 21.3333H14.6667C14.1833 21.3495 13.7046 21.234 13.2819 20.9992C12.8591 20.7643 12.5082 20.4189 12.2667 19.9999M16 9.33325V22.6666"
      stroke="#32A06E"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Checkmarks
const CheckmarkCompleted = () => (
  <Svg width={18} height={17} viewBox="0 0 18 17" fill="none">
    <Path d="M8.99984 1.41675C5.104 1.41675 1.9165 4.60425 1.9165 8.50008C1.9165 12.3959 5.104 15.5834 8.99984 15.5834C12.8957 15.5834 16.0832 12.3959 16.0832 8.50008C16.0832 4.60425 12.8957 1.41675 8.99984 1.41675ZM7.58317 12.0417L4.0415 8.50008L5.04025 7.50133L7.58317 10.0372L12.9594 4.66091L13.9582 5.66675L7.58317 12.0417Z" fill="#32A06E"/>
  </Svg>
);

const CheckmarkIncomplete = () => (
  <Svg width={18} height={17} viewBox="0 0 18 17" fill="none">
    <Path d="M8.99984 1.41675C5.104 1.41675 1.9165 4.60425 1.9165 8.50008C1.9165 12.3959 5.104 15.5834 8.99984 15.5834C12.8957 15.5834 16.0832 12.3959 16.0832 8.50008C16.0832 4.60425 12.8957 1.41675 8.99984 1.41675ZM7.58317 12.0417L4.0415 8.50008L5.04025 7.50133L7.58317 10.0372L12.9594 4.66091L13.9582 5.66675L7.58317 12.0417Z" fill="#8A8A8A"/>
  </Svg>
);

const ProgressItem: React.FC = () => {
  const totalSteps = 4;
  const baseWidth = (width - 40) / (totalSteps + (totalSteps - 1) * 0.5);
  const connectorWidth = baseWidth * 0.5;

  return (
    <View style={styles.container}>
      {/* Icon row with even spacing */}
      <View style={styles.iconRow}>
        <View style={[styles.iconWrapper, { width: baseWidth }]}>
          <StepIcon />
        </View>
        <View style={[styles.iconWrapper, { width: baseWidth }]}>
          <StepIcon />
        </View>
        <View style={[styles.iconWrapper, { width: baseWidth }]}>
          <StepIcon />
        </View>
        <View style={[styles.iconWrapper, { width: baseWidth }]}>
          <StepIcon />
        </View>
      </View>
      {/* Checkmark row with dashed lines between checkmarks */}
      <View style={styles.checkRow}>
        <View style={[styles.checkWrapper, { width: baseWidth }]}>
          <CheckmarkCompleted />
        </View>
        <View style={[styles.connectorContainer, { width: connectorWidth }]}>
          <Svg height={2} width="100%" viewBox="0 0 100 2" preserveAspectRatio="none">
            <Path d="M0 1 H100" stroke="#32A06E" strokeDasharray="4 4" strokeWidth={2} />
          </Svg>
        </View>
        <View style={[styles.checkWrapper, { width: baseWidth }]}>
          <CheckmarkCompleted />
        </View>
        <View style={[styles.connectorContainer, { width: connectorWidth }]}>
          <Svg height={2} width="100%" viewBox="0 0 100 2" preserveAspectRatio="none">
            <Path d="M0 1 H100" stroke="#32A06E" strokeDasharray="4 4" strokeWidth={2} />
          </Svg>
        </View>
        <View style={[styles.checkWrapper, { width: baseWidth }]}>
          <CheckmarkCompleted />
        </View>
        <View style={[styles.connectorContainer, { width: connectorWidth }]}>
          <Svg height={2} width="100%" viewBox="0 0 100 2" preserveAspectRatio="none">
            <Path d="M0 1 H100" stroke="#32A06E" strokeDasharray="4 4" strokeWidth={2} />
          </Svg>
        </View>
        <View style={[styles.checkWrapper, { width: baseWidth }]}>
          <CheckmarkIncomplete />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginVertical: 20,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  iconWrapper: {
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkWrapper: {
    height: 17,
    alignItems: "center",
  },
  connectorContainer: {
    height: 2,
    alignItems: "center",
  },
});

export default ProgressItem;