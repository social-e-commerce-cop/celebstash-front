import React from "react";
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MetricCard from "@/components/artist/Dashboard/MetricCard";
import { Conversations, Flopping, Orders, Trending, Views, Visitor } from "@/assets/icons/Settings";
import ProgressCircle from "@/components/artist/Dashboard/ProgressCircle";
import BalanceCard from "@/components/artist/Dashboard/BalanceCard";

const { width, height } = Dimensions.get('window');

const Dashboard: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Dashboard</Text>

        <View style={styles.iconButton} />
      </View>

     <View style={styles.header}>
        <Text style={styles.title}>Welcome to your Dashboard!</Text>
        <Text style={styles.subtitle}>Hi, Saint welcome back!</Text>
      </View>
      <View style={styles.cardRow}>
        <MetricCard
          icon={Visitor}
          trendIcon={Trending}
          number="0"
          label="Total Visitor"
          change="0%"
        />
          <MetricCard
          icon={Orders}
          trendIcon={Trending}
          number="0"
          label="Total Orders"
          change="0%"
        />
      </View>
      <View style={styles.cardRow}>
        <MetricCard
          icon={Views}
          trendIcon={Flopping}
          number="0"
          label="Total Views"
          change="0%"
        />
          <MetricCard
          icon={Conversations}
          trendIcon={Trending}
          number="0"
          label="Conversations"
          change="0%"
        />
      </View>
      <ProgressCircle current={0} total={0} unit=" kcal" />
      <BalanceCard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.06,
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.02,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  iconButton: {},
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: height * 0.03,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    textAlign: 'center',
  },
});

export default Dashboard;
