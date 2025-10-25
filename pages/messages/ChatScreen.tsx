import { ChatHeader } from "@/components/messages/ChatHeader";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { MessageInput } from "@/components/messages/MessageInput";
import React, { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface Message {
  id: string;
  type: "incoming" | "outgoing";
  text?: string;
  time: string;
  image?: boolean;
}

const initialMessages: Message[] = [
  {
    id: "1",
    type: "incoming",
    text: "Hello i saw your review on Kivumbi",
    time: "2025-01-02T08:00:00",
  },
  {
    id: "2",
    type: "incoming",
    text: "Hello i saw your review on Kivumbi Post and i...",
    time: "2025-01-02T12:30:00",
  },
  {
    id: "3",
    type: "incoming",
    image: true, // incoming image
    time: "2025-01-02T12:45:00",
  },
  {
    id: "4",
    type: "outgoing",
    text: "Hello i saw your review on Kivumbi",
    time: "2025-01-02T13:00:00",
  },
  {
    id: "5",
    type: "outgoing",
    image: true, // outgoing image
    time: "2025-01-02T13:05:00",
  },
];


export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<Message>>(null);

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      type: "outgoing",
      text: text.trim(),
      time: new Date().toISOString(),
    };
    setMessages([...messages, newMsg]);
    setText("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addFakeImage = () => {
    const newMsg: Message = {
      id: String(Date.now()),
      type: "outgoing",
      text: "Image",
      time: new Date().toISOString(),
      image: true,
    };
    setMessages([...messages, newMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ChatHeader scrollY={scrollY} />
<KeyboardAvoidingView
  behavior={Platform.OS === "ios" ? "padding" : "height"}
  style={{ flex: 1 }}
  keyboardVerticalOffset={0}
>
  <View style={{ flex: 1 }}>
    <Animated.FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const previous = messages[index - 1];
        const next = messages[index + 1];
        let showDate = true;
        if (previous) {
          const prevTime = new Date(previous.time).getTime();
          const currTime = new Date(item.time).getTime();
          showDate = currTime - prevTime >= 5 * 60 * 60 * 1000;
        }
        const showAvatar = item.type === "incoming" && (!next || next.type !== "incoming");

        return (
          <MessageBubble
            type={item.type}
            text={item.text}
            image={item.image}
            time={item.time}
            showDate={showDate}
            showAvatar={showAvatar}
            onImagePress={() => setImageModalVisible(true)}
            previousType={messages[index - 1]?.type}
          />
        );
      }}
      contentContainerStyle={{ paddingTop: 240, paddingHorizontal: 16 }}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    />

    {/* Input at bottom */}
    <MessageInput
      text={text}
      onChangeText={setText}
      onSend={sendMessage}
      onAddImage={(uri) => {
        const newMsg: Message = {
          id: String(Date.now()),
          type: "outgoing",
          image: true,
          text: undefined,
          time: new Date().toISOString(),
        };
        setMessages([...messages, newMsg]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }}
      onOpenGif={() => alert("Open GIF picker")}
    />
  </View>
</KeyboardAvoidingView>


      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={require("../../assets/images/feed6.jpg")}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.modalClose} onPress={() => setImageModalVisible(false)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
  modalImage: { width: "90%", height: "70%" },
  modalClose: { position: "absolute", top: 40, right: 20 },
});
