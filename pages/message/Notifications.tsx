import React from 'react';
import { View, Text, StyleSheet, SectionList , Dimensions, TouchableOpacity} from 'react-native';
import NotificationItem from '@/components/messages/NotificationItem';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

// Define Notification type inline
interface Notification {
  id: string;
  time: string;
  user: string;
  action: string;
  comment?: string;
  photos?: (string | number)[]; // allow both require() and URLs
  date: string; // ISO date string
}

const Notifications: React.FC = () => {
  const notifications: Notification[] = [
    {
      id: '1',
      time: '3hrs ago',
      user: 'Ange Nadette',
      action: 'Liked 3 Photos',
      photos: [
        require('../../assets/images/feed6.jpg'),
        require('../../assets/images/feed5.png'),
        require('../../assets/images/feed4.png'),
      ],
      date: '2025-09-18T23:00:00Z',
    },
    {
      id: '2',
      time: '5hrs ago',
      user: 'Ange Nadette',
      action: 'Commented on your Post',
      comment: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus, molestias consequuntur, voluptatem aperiam consequatur, ita...',
      date: '2025-09-18T21:00:00Z',
    },
    {
      id: '4',
      time: '1day ago',
      user: 'Ange Nadette',
      action: 'Commented on your Post',
      comment: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Unde obcaecati ducimus, molestias consequuntur, voluptatem aperiam consequatur, ita...',
      date: '2025-09-17T14:00:00Z',
    },
    {
      id: '3',
      time: '2days ago',
      user: 'Ange Nadette',
      action: 'Liked 3 Photos',
      photos: [
        require('../../assets/images/feed6.jpg'),
        require('../../assets/images/feed5.png'),
        require('../../assets/images/feed4.png'),
      ],
      date: '2025-09-16T10:00:00Z',
    },
    {
      id: '5',
      time: '10hrs ago',
      user: 'Ange Nadette',
      action: 'Liked 1 Photo',
      photos: [require('../../assets/images/feed4.png')],
      date: '2025-09-19T01:00:00Z',
    },
  ];

  // Group notifications by category
  const groupNotifications = (notifications: Notification[]) => {
    
    const now = new Date('2025-09-19T02:45:00+02:00');
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    const groups: Record<string, Notification[]> = {
      'This week': [],
      'Yesterday': [],
      'Others': [],
    };

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.date);
      if (notificationDate >= yesterday && notificationDate < now) {
        groups['Yesterday'].push(notification);
      } else if (notificationDate >= thisWeekStart && notificationDate < now) {
        groups['This week'].push(notification);
      } else {
        groups['Others'].push(notification);
      }
    });

    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([title, data]) => ({ title, data }));
  };

  const groupedNotifications = groupNotifications(notifications);

   const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem {...item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionText}>{title}</Text>
        )}
        ListHeaderComponent={
         <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Notifications</Text>

        <View style={styles.iconButton} />
      </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true} // keep section titles sticky
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
    color: '#000',
  },
  headerOverlay: {
    height: height * 0.07,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: height * 0.01,
  },
  headerTitle: {
    color: "#000",
    fontWeight: "bold",
  },
  iconButton: {
    padding: width * 0.015,
  },
});

export default Notifications;
