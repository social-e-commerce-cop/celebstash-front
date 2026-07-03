import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AddConversation } from "@/assets/icons/Settings";
import SearchBar from "@/components/messages/SearchBar";
import TabBar from "@/components/messages/TabBar";
import ConversationItem from "@/components/messages/Conversations";

const { width, height } = Dimensions.get("window");

const conversations = [
  {
    id: "1",
    name: "Emelyne💖",
    lastMessage: "Hello I saw your review...",
    unreadCount: 3,
    hasStory: true,
    groupMembers: [{ avatar: require("../../assets/images/feed6.jpg") }],
  },
  {
    id: "2",
    name: "Emelyne",
    lastMessage: "Hello i saw your review on Kivumbi Post and i....",
    unreadCount: 6,
    hasStory: false,
    groupMembers: [{ avatar: require("../../assets/images/feed6.jpg") }],
  },
  {
    id: "3",
    name: "Study Group",
    lastMessage: "Hello i saw your review on Kivumbi Post and i...",
    unreadCount: 12,
    isGroup: true,
    groupMembers: [
      { avatar: require("../../assets/images/feed6.jpg") },
      { avatar: require("../../assets/images/feed6.jpg") },
      { avatar: require("../../assets/images/feed6.jpg") },
    ],
  },
  {
    id: "4",
    name: "Emelyne",
    lastMessage: "Did you finish the task?",
    unreadCount: 1,
    hasStory: false,
    groupMembers: [{ avatar: require("../../assets/images/feed6.jpg") }],
  },
  {
    id: "5",
    name: "Study Group",
    lastMessage: "Hello i saw your review on Kivumbi Post and i...",
    unreadCount: 0,
    isGroup: true,
    groupMembers: [
      { avatar: require("../../assets/images/feed6.jpg") },
      { avatar: require("../../assets/images/feed6.jpg") },
      { avatar: require("../../assets/images/feed6.jpg") },
    ],
  },
  {
    id: "6",
    name: "Emelyne",
    lastMessage: "Hello i saw your review on Kivumbi Post and i....",
    unreadCount: 0,
    hasStory: true,
    groupMembers: [{ avatar: require("../../assets/images/feed6.jpg") }],
  },
  {
    id: "7",
    name: "Emelyne",
    lastMessage: "Hello i saw your review on Kivumbi Post and i....",
    unreadCount: 0,
    hasStory: false,
    groupMembers: [{ avatar: require("../../assets/images/feed6.jpg") }],
  },
  
];

const MessagesScreen = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ChatScreen", {
          name: item.name,
          groupMembers: item.groupMembers,
          isGroup: item.isGroup,
        })
      }
    >
      <ConversationItem
        name={item.name}
        lastMessage={item.lastMessage}
        unreadCount={item.unreadCount}
        isGroup={item.isGroup}
        groupMembers={item.groupMembers}
        hasStory={item.hasStory}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#000" />

      {/* Fixed Header, SearchBar, Tabs */}
      <View style={styles.fixedTop}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>
            Messages
          </Text>

          <TouchableOpacity style={styles.iconButton}>{AddConversation}</TouchableOpacity>
        </View>

        <SearchBar
          onSearch={setSearchQuery}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TabBar />
      </View>

      {/* Scrollable FlatList */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: height * 0.01,
        }}
        style={{ marginTop: 0 }}
        ListEmptyComponent={
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#999', fontFamily: 'Poppins-Medium' }}>
              No conversations found for "{searchQuery}"
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.06
  },
  fixedTop: {
    paddingTop: height * 0.04,
    paddingBottom: height * 0.01,
    backgroundColor: "#fff",
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
  iconButton: {},
});

export default MessagesScreen;
