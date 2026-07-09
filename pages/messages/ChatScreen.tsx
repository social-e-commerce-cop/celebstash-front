import React, { useRef, useState, useCallback } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
  Text,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';

const PURPLE = '#7126D0';

type ReadStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface Message {
  id: string;
  type: 'incoming' | 'outgoing';
  text?: string;
  image?: boolean;
  uri?: string;
  time: string;
  readStatus?: ReadStatus;
  replyTo?: { text: string; sender: string };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    type: 'incoming',
    text: 'Hey! Saw your post about the drop ðŸ”¥',
    time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'outgoing',
    text: 'Yes! It goes live at midnight ðŸš€',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    readStatus: 'read',
  },
  {
    id: '3',
    type: 'incoming',
    text: "Can't wait. Are you collaborating with anyone for this one?",
    time: new Date(Date.now() - 5 * 60 * 60 * 1000 + 60000).toISOString(),
  },
  {
    id: '4',
    type: 'outgoing',
    text: 'Yeah, Kenny K Shot is on the track ðŸŽ¤',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    readStatus: 'read',
    replyTo: { text: "Can't wait. Are you collaborating with anyone for this one?", sender: 'Ange' },
  },
  {
    id: '5',
    type: 'incoming',
    image: true,
    time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'incoming',
    text: 'This is my favourite ðŸ˜',
    time: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'outgoing',
    text: 'â¤ï¸',
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    readStatus: 'delivered',
  },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [text, setText] = useState('');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [replyTo, setReplyTo] = useState<{ text: string; sender: string } | null>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<Message>>(null);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: String(Date.now()),
      type: 'outgoing',
      text: text.trim(),
      time: new Date().toISOString(),
      readStatus: 'sending',
      replyTo: replyTo ?? undefined,
    };
    setMessages(prev => [...prev, newMsg]);
    setText('');
    setReplyTo(null);
    setTimeout(() => scrollToBottom(), 100);

    // Simulate delivery progression
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, readStatus: 'sent' } : m));
    }, 800);
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, readStatus: 'delivered' } : m));
    }, 2000);
  };

  const handleScroll = (e: any) => {
    const offsetFromBottom =
      e.nativeEvent.contentSize.height -
      e.nativeEvent.contentOffset.y -
      e.nativeEvent.layoutMeasurement.height;
    setShowScrollFab(offsetFromBottom > 200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ChatHeader scrollY={scrollY} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            onScroll={handleScroll}
            scrollEventThrottle={50}
            renderItem={({ item, index }) => {
              const previous = messages[index - 1];
              const next = messages[index + 1];
              const showDate = !previous ||
                new Date(item.time).getTime() - new Date(previous.time).getTime() >= 5 * 60 * 60 * 1000;
              const showAvatar = item.type === 'incoming' && (!next || next.type !== 'incoming');

              return (
                <MessageBubble
                  type={item.type}
                  text={item.text}
                  image={item.image}
                  uri={item.uri}
                  time={item.time}
                  showDate={showDate}
                  showAvatar={showAvatar}
                  onImagePress={() => setImageModalVisible(true)}
                  previousType={previous?.type}
                  readStatus={item.readStatus}
                  replyTo={item.replyTo}
                  onReply={() =>
                    setReplyTo({
                      text: item.text ?? (item.image ? 'ðŸ“· Photo' : 'ðŸŽ¤ Voice'),
                      sender: item.type === 'incoming' ? 'Ange' : 'You',
                    })
                  }
                />
              );
            }}
            contentContainerStyle={{ paddingTop: 240, paddingHorizontal: 12, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            onContentSizeChange={() => scrollToBottom()}
          />

          {/* Scroll-to-bottom FAB */}
          {showScrollFab && (
            <TouchableOpacity style={styles.scrollFab} onPress={scrollToBottom} activeOpacity={0.85}>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          <MessageInput
            text={text}
            onChangeText={setText}
            onSend={sendMessage}
            onAddImage={() => {
              setMessages(prev => [
                ...prev,
                { id: String(Date.now()), type: 'outgoing', image: true, time: new Date().toISOString(), readStatus: 'sending' },
              ]);
              setTimeout(scrollToBottom, 100);
            }}
            onOpenGif={() => {}}
            onRecordVoice={() => {
              setMessages(prev => [
                ...prev,
                { id: String(Date.now()), type: 'outgoing', uri: 'voice', time: new Date().toISOString(), readStatus: 'sending' },
              ]);
              setTimeout(scrollToBottom, 100);
            }}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Image full-screen modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Image
            source={require('../../assets/images/feed6.jpg')}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity style={styles.modalClose} onPress={() => setImageModalVisible(false)}>
            <View style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: { width: '100%', height: '80%' },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollFab: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
