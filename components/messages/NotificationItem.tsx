import React from "react";
import { View, Text, StyleSheet, Image, FlatList, Dimensions } from "react-native";

export type NotificationItemProps = {
  id: string;
  time: string; // Relative time e.g., "3 hrs ago"
  user: string;
  action: string;
  comment?: string;
  photos?: (string | number)[];
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  time,
  user,
  action,
  comment,
  photos,
}) => {
  const { width } = Dimensions.get("window");
  const photoSize = width > 600 ? 80 : 60;

  return (
    <View style={styles.container}>
      {/* Profile + action + time */}
      <View style={styles.userRow}>
        <View style={styles.userContainer}>
          <Image
            source={require('../../assets/images/feed6.jpg')}
            style={styles.avatar}
          />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.userName}>{user}</Text>
            <Text style={styles.action}>{action}</Text>
            {comment && <Text style={styles.comment}>{comment}</Text>}
          </View>
        </View>

        {/* Time on right */}
        <Text style={styles.time}>{time}</Text>
      </View>

     <View style={{ paddingLeft: 60, paddingRight: 5 }}>
         {/* Photos, only if exist */}
      {photos && photos.length > 0 && (
        <FlatList
          horizontal
          data={photos}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <Image
              source={typeof item === "string" ? { uri: item } : item}
              style={[styles.photo, { width: photoSize, height: photoSize }]}
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ marginTop: 8 }}
        />
      )}
     </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 10
  },
  userName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1c2526",
    marginBottom: 2,
  },
  action: {
    fontSize: 14,
    color: "#8F959E",
    marginBottom: 10,
    fontWeight: '600'
  },
  comment: {
    fontSize: 14,
    color: "#8F959E",
    marginBottom: 6,
    flexShrink: 1,
    fontWeight: '500'
  },
  photo: {
    borderRadius: 8,
    marginRight: 8,
  },
  time: {
    fontSize: 14,
    color: "#8F959E",
    marginLeft: 6,
    textAlign: "right",
  },
});

export default NotificationItem;
