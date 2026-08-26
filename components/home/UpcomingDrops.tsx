import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import Svg, { Path } from "react-native-svg";
import TabBar from "@/components/Tabbar";

const { width, height } = Dimensions.get("window");

// Ticking Countdown Hook
const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState(targetDate.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = targetDate.getTime() - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isExpired: timeLeft <= 0,
  };
};

// Countdown display component
const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  return (
    <View style={styles.countdownContainer}>
      <View style={styles.countdownUnit}>
        <Text style={styles.countdownNumber}>{days}</Text>
        <Text style={styles.countdownLabel}>Days</Text>
      </View>
      <Text style={styles.countdownSeparator}>:</Text>
      <View style={styles.countdownUnit}>
        <Text style={styles.countdownNumber}>{hours}</Text>
        <Text style={styles.countdownLabel}>Hrs</Text>
      </View>
      <Text style={styles.countdownSeparator}>:</Text>
      <View style={styles.countdownUnit}>
        <Text style={styles.countdownNumber}>{minutes}</Text>
        <Text style={styles.countdownLabel}>Min</Text>
      </View>
      <Text style={styles.countdownSeparator}>:</Text>
      <View style={styles.countdownUnit}>
        <Text style={styles.countdownNumber}>{seconds}</Text>
        <Text style={styles.countdownLabel}>Sec</Text>
      </View>
    </View>
  );
};

const UpcomingDrops = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [notifiedItems, setNotifiedItems] = useState<{ [key: string]: boolean }>({});

  const toggleNotification = (id: string) => {
    setNotifiedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Mock Target Dates for ticking timer
  const upcomingDrops = [
    {
      id: "1",
      title: "Indorerwamo Collection",
      image: require("@/assets/images/drop1.jpg"),
      dateText: "May 25, 2026 • 8:00 PM",
      targetDate: new Date("2026-06-25T20:00:00"),
    },
  ];

  const pastCollections = [
    {
      id: "1",
      name: "Indorerwamo Collection",
      price: "30",
      image: require("@/assets/images/products/product1.jpg"),
      artistName: "Kenny K Shot",
      description: "This is the jacket i wore during the opening night of my Eras Tour in Los Angeles. It has so many crystals",
      date: "April 20, 2026",
      status: "Sold Out",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      

      {/* Content */}
     <ScrollView
  style={styles.scrollContent}
  contentContainerStyle={styles.scrollContainer}
  showsVerticalScrollIndicator={false}
>
  {upcomingDrops.map((drop) => {
    const isNotified = notifiedItems[drop.id];

    return (
      <View key={drop.id} style={styles.cardWrapper}>
        <ImageBackground
          source={drop.image}
          style={styles.cardBackground}
          imageStyle={styles.cardImageStyle}
        >
          <View style={styles.cardOverlay} />

          <View style={styles.badgeRow}>
            <View style={styles.newDropBadge}>
              <Text style={styles.newDropBadgeText}>New Drop</Text>
            </View>
          </View>

          <Text style={styles.cardTitle}>{drop.title}</Text>

          <CountdownTimer targetDate={drop.targetDate} />

          <Text style={styles.cardDate}>{drop.dateText}</Text>

          <TouchableOpacity
            style={[
              styles.notifyButton,
              isNotified && styles.notifiedButton,
            ]}
            onPress={() => toggleNotification(drop.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.notifyButtonText}>
              {isNotified ? "Notified ✓" : "Notify Me"}
            </Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  })}
</ScrollView>
    </View>
  );
};

export default UpcomingDrops;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.05,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 5,
    marginHorizontal: width * 0.06,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  activeToggleButton: {
    backgroundColor: "#7126D0",
  },
  toggleText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#777",
  },
  activeToggleText: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: height * 0.04,
     paddingTop: height * 0.014,
  },
  cardWrapper: {
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  cardBackground: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardImageStyle: {
    resizeMode: "cover",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  badgeRow: {
    alignSelf: "flex-start",
    zIndex: 1,
  },
  newDropBadge: {
    backgroundColor: "#7126D0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 5,
  },
  newDropBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    zIndex: 1,
    marginTop: 8,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
    marginVertical: 4,
  },
  countdownUnit: {
    alignItems: "center",
    minWidth: 45,
  },
  countdownNumber: {
    color: "#fff",
    fontSize: 20,
    fontFamily: "Poppins-Bold",
  },
  countdownLabel: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  countdownSeparator: {
    color: "#fff",
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    marginHorizontal: 6,
    paddingBottom: 22,
  },
  cardDate: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    zIndex: 1,
    marginBottom: 16,
  },
  notifyButton: {
    backgroundColor: "#7126D0",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
    zIndex: 1,
    maxWidth: 220,
  },
  notifiedButton: {
    backgroundColor: "#4CAF50",
  },
  notifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  pastCard: {
    width: (width - width * 0.12 - 16) / 2,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pastCardImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  pastBadgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 1,
  },
  pastStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSoldOut: {
    backgroundColor: "#DC2626",
  },
  badgeEnded: {
    backgroundColor: "#666",
  },
  pastStatusText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins-Bold",
  },
  pastCardInfo: {
    padding: 10,
  },
  pastCardName: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
  pastCardArtist: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginTop: 2,
  },
  pastCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  pastCardPrice: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#7126D0",
  },
  pastCardDate: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#999",
  },
  tabBarContainer: {
    position: "absolute",
    bottom: height * 0.03,
    left: width * 0.06,
    right: width * 0.06,
  },
});
