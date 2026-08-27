/**
 * ChatScreen.tsx — Individual conversation view.
 * - Loads real messages from the API (paginated)
 * - Connects WebSocket for real-time incoming messages
 * - All send/edit/delete/pin/star actions call the API
 * - Falls back to mock data if backend is unavailable
 */
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';
import MessageActionSheet from '@/components/messages/MessageActionSheet';
import VoiceRecorder from '@/components/messages/VoiceRecorder';
import PinnedMessageBanner from '@/components/messages/PinnedMessageBanner';
import { Message, ReplyReference, MessageAction } from '@/types/chatTypes';
import { MOCK_MESSAGES, MOCK_CONVERSATIONS, getConversationAvatar, getConversationName } from '@/data/mockChatData';
import { chatService, MessageDto } from '@/lib/chatService';
import { useChatSocket } from '@/lib/chatSocket';
import { getSessionToken } from '@/lib/session';

const PURPLE = '#7126D0';

// ── Map backend MessageDto → local Message type ───────────────────────────────
function toLocalMessage(dto: MessageDto): Message {
  return {
    id: String(dto.id),
    conversationId: String(dto.conversationId),
    senderId: String(dto.senderId),
    senderName: dto.senderName,
    type: (dto.type?.toLowerCase() as any) ?? 'text',
    text: dto.content ?? undefined,
    imageUri: dto.mediaUrl && (dto.type === 'IMAGE') ? { uri: dto.mediaUrl } : undefined,
    videoUri: dto.mediaUrl && dto.type === 'VIDEO' ? dto.mediaUrl : undefined,
    voiceUri: dto.mediaUrl && dto.type === 'VOICE' ? dto.mediaUrl : undefined,
    voiceDuration: dto.voiceDuration ?? undefined,
    document: dto.documentName ? { name: dto.documentName, size: dto.documentSize ?? '', type: 'pdf' } : undefined,
    systemText: dto.systemText ?? undefined,
    timestamp: dto.sentAt,
    readStatus: (dto.readStatus?.toLowerCase() as any) ?? 'sent',
    replyTo: dto.replyTo
      ? { messageId: String(dto.replyTo.messageId), text: dto.replyTo.text, sender: dto.replyTo.senderName }
      : undefined,
    reactions: dto.reactions.map(r => ({ emoji: r.emoji, count: r.count, reactedByMe: r.reactedByMe })),
    isEdited: dto.isEdited,
    isDeleted: dto.isDeleted,
    isPinned: dto.isPinned,
    isStarred: dto.isStarred,
  };
}

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId ?? 'c1';
  const numericConvId = isNaN(Number(conversationId)) ? null : Number(conversationId);

  // Fall back to mock data for string IDs (mock) or when backend is unavailable
  const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId) ?? MOCK_CONVERSATIONS[0];
  const initialMessages = MOCK_MESSAGES[conversationId] ?? [];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyReference | null>(null);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<any>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<Message>>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [actionSheetParams, setActionSheetParams] = useState<{ visible: boolean; message: Message | null }>({ visible: false, message: null });

  const isAuthenticated = !!getSessionToken();

  // ── Load messages from API ────────────────────────────────────────────────
  const loadMessages = useCallback(async (pageNum: number = 0) => {
    if (!numericConvId || !isAuthenticated) return;
    try {
      setLoading(true);
      const paged = await chatService.getMessages(numericConvId, pageNum);
      const local = paged.content.map(toLocalMessage);
      setMessages(prev => pageNum === 0 ? local : [...local, ...prev]);
      setHasMore(!paged.last);
      setPage(pageNum);
    } catch (e) {
      console.warn('[ChatScreen] Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  }, [numericConvId, isAuthenticated]);

  useEffect(() => {
    if (numericConvId && isAuthenticated) {
      loadMessages(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericConvId]);

  // ── WebSocket real-time incoming messages ────────────────────────────────
  const handleIncomingMessage = useCallback((dto: MessageDto) => {
    const local = toLocalMessage(dto);
    setMessages(prev => {
      // Avoid duplicates (our own messages are added optimistically)
      if (prev.some(m => m.id === local.id)) return prev;
      return [...prev, local];
    });
    setTimeout(() => scrollToBottom(), 100);
  }, []);

  useChatSocket(numericConvId, handleIncomingMessage);

  // ── Handle incoming call logs (unchanged) ─────────────────────────────────
  useEffect(() => {
    if (route.params?.newCallMessage) {
      setMessages(prev => [...prev, route.params.newCallMessage]);
      navigation.setParams({ newCallMessage: undefined });
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [route.params?.newCallMessage]);

  const scrollToBottom = () => { flatListRef.current?.scrollToEnd({ animated: true }); };

  const handleScroll = (e: any) => {
    const offsetFromBottom = e.nativeEvent.contentSize.height - e.nativeEvent.contentOffset.y - e.nativeEvent.layoutMeasurement.height;
    setShowScrollFab(offsetFromBottom > 200);
  };

  // ── Send Logic ────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!text.trim()) return;

    if (editMessageId) {
      // Edit existing message
      setMessages(prev => prev.map(m => m.id === editMessageId ? { ...m, text: text.trim(), isEdited: true } : m));
      setEditMessageId(null);
      setText('');
      if (numericConvId && isAuthenticated) {
        try { await chatService.editMessage(Number(editMessageId), text.trim()); }
        catch (e) { console.warn('[Chat] Edit failed:', e); }
      }
      return;
    }

    // Optimistic message
    const tempId = String(Date.now());
    const newMsg: Message = {
      id: tempId,
      conversationId: String(conversationId),
      senderId: 'me',
      type: 'text',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      readStatus: 'sending',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isStarred: false,
      replyTo: replyTo ?? undefined,
    };

    setMessages(prev => [...prev, newMsg]);
    setText('');
    setReplyTo(null);
    setTimeout(() => scrollToBottom(), 100);

    if (numericConvId && isAuthenticated) {
      try {
        const saved = await chatService.sendMessage(numericConvId, {
          type: 'TEXT',
          content: newMsg.text,
          replyToId: replyTo ? Number(replyTo.messageId) : undefined,
        });
        // Replace temp message with real one from server
        setMessages(prev => prev.map(m => m.id === tempId ? toLocalMessage(saved) : m));
      } catch (e) {
        console.warn('[Chat] Send failed:', e);
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, readStatus: 'sent' } : m));
      }
    } else {
      // Mock delivery simulation
      setTimeout(() => setMessages(prev => prev.map(m => m.id === tempId ? { ...m, readStatus: 'sent' } : m)), 800);
      setTimeout(() => setMessages(prev => prev.map(m => m.id === tempId ? { ...m, readStatus: 'delivered' } : m)), 2000);
    }
  };

  const sendVoice = async (duration: number) => {
    setIsRecording(false);
    const tempId = String(Date.now());
    const newMsg: Message = {
      id: tempId,
      conversationId: String(conversationId),
      senderId: 'me',
      type: 'voice',
      voiceUri: 'mock_voice',
      voiceDuration: duration,
      timestamp: new Date().toISOString(),
      readStatus: 'sending',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isStarred: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setTimeout(() => scrollToBottom(), 100);

    if (numericConvId && isAuthenticated) {
      try {
        const saved = await chatService.sendMessage(numericConvId, {
          type: 'VOICE',
          voiceDuration: duration,
        });
        setMessages(prev => prev.map(m => m.id === tempId ? toLocalMessage(saved) : m));
      } catch (e) { console.warn('[Chat] Voice send failed:', e); }
    }
  };

  const sendImage = async (uri: string) => {
    const tempId = String(Date.now());
    const newMsg: Message = {
      id: tempId,
      conversationId: String(conversationId),
      senderId: 'me',
      type: 'image',
      imageUri: { uri },
      timestamp: new Date().toISOString(),
      readStatus: 'sending',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isStarred: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setShowAttachmentMenu(false);
    setTimeout(() => scrollToBottom(), 100);

    if (numericConvId && isAuthenticated) {
      try {
        // Upload file first, then send message with mediaUrl
        const uploadedUrl = await chatService.uploadFile(uri, 'image/jpeg', `img_${tempId}.jpg`);
        const saved = await chatService.sendMessage(numericConvId, {
          type: 'IMAGE',
          mediaUrl: uploadedUrl,
        });
        setMessages(prev => prev.map(m => m.id === tempId ? toLocalMessage(saved) : m));
      } catch (e) {
        console.warn('[Chat] Image send failed:', e);
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, readStatus: 'sent' } : m));
      }
    }
  };

  // ── Message Actions ───────────────────────────────────────────────────────
  const handleMessageAction = async (action: MessageAction) => {
    const msg = actionSheetParams.message;
    if (!msg) return;

    setActionSheetParams({ visible: false, message: null });

    switch (action) {
      case 'reply':
        setReplyTo({ messageId: msg.id, text: msg.text ?? (msg.type === 'image' ? 'Photo' : 'Voice Message'), sender: msg.senderName ?? (msg.senderId === 'me' ? 'You' : getConversationName(conv)) });
        break;
      case 'edit':
        if (msg.type === 'text' && msg.text) { setText(msg.text); setEditMessageId(msg.id); }
        break;
      case 'delete_for_me':
        setMessages(prev => prev.filter(m => m.id !== msg.id));
        if (numericConvId && isAuthenticated) {
          try { await chatService.deleteMessage(Number(msg.id), false); } catch {}
        }
        break;
      case 'delete_for_everyone':
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isDeleted: true, text: undefined, imageUri: undefined } : m));
        if (numericConvId && isAuthenticated) {
          try { await chatService.deleteMessage(Number(msg.id), true); } catch {}
        }
        break;
      case 'pin':
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isPinned: !m.isPinned } : m));
        if (numericConvId && isAuthenticated) {
          try { await chatService.toggleMessagePin(Number(msg.id)); } catch {}
        }
        break;
      case 'star':
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: !m.isStarred } : m));
        if (numericConvId && isAuthenticated) {
          try { await chatService.toggleMessageStar(Number(msg.id)); } catch {}
        }
        break;
    }
  };

  // ── Render Items ──────────────────────────────────────────────────────────
  const filteredMessages = useMemo(() => {
    if (!isSearching || !searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m => m.text?.toLowerCase().includes(q) || m.systemText?.toLowerCase().includes(q));
  }, [messages, isSearching, searchQuery]);

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const previous = filteredMessages[index - 1];
    const next = filteredMessages[index + 1];
    const showDate = !previous || new Date(item.timestamp).getTime() - new Date(previous.timestamp).getTime() >= 5 * 60 * 60 * 1000;
    const showAvatar = item.senderId !== 'me' && (!next || next.senderId !== item.senderId);
    const sender = conv.participants.find(p => p.id === item.senderId);
    const avatarSrc = sender?.avatar ?? getConversationAvatar(conv);

    return (
      <MessageBubble
        message={item}
        showDate={showDate}
        showAvatar={showAvatar}
        showSenderName={conv.type === 'group' && (!previous || previous.senderId !== item.senderId)}
        previousType={previous ? (previous.senderId === 'me' ? 'outgoing' : 'incoming') : undefined}
        avatarSource={avatarSrc}
        onImagePress={() => { if (item.imageUri) { setSelectedImageUri(item.imageUri); setImageModalVisible(true); } }}
        onLongPress={() => setActionSheetParams({ visible: true, message: item })}
        onReply={() => handleMessageAction('reply')}
        onProductPress={() => {
          if (item.product) {
            navigation.navigate('ProductDetails', { name: item.product.name, price: item.product.price, image: item.product.image, artistName: item.product.artistName, verified: item.product.verified });
          }
        }}
      />
    );
  };

  const pinnedMsg = useMemo(() => messages.find(m => m.isPinned), [messages]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ChatHeader
        scrollY={scrollY}
        conversation={conv}
        onSearchToggle={setIsSearching}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClearChat={() => setMessages([])}
      />

      {pinnedMsg && !isSearching && (
        <View style={{ position: 'absolute', top: 102, left: 0, right: 0, zIndex: 5 }}>
          <PinnedMessageBanner
            text={pinnedMsg.text ?? (pinnedMsg.type === 'image' ? '📷 Photo' : 'Pinned Message')}
            senderName={pinnedMsg.senderName ?? (pinnedMsg.senderId === 'me' ? 'You' : getConversationName(conv))}
            onDismiss={() => setMessages(prev => prev.map(m => m.id === pinnedMsg.id ? { ...m, isPinned: false } : m))}
          />
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {loading && messages.length === 0 ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={PURPLE} />
            </View>
          ) : (
            <Animated.FlatList
              style={{ flex: 1 }}
              ref={flatListRef}
              data={filteredMessages}
              keyExtractor={item => item.id}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: false,
                listener: handleScroll,
              })}
              scrollEventThrottle={16}
              renderItem={renderItem}
              contentContainerStyle={{ paddingTop: isSearching ? 100 : (pinnedMsg ? 160 : 110), paddingHorizontal: 8, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollToBottom()}
              onLayout={() => scrollToBottom()}
            />
          )}

          {showScrollFab && (
            <TouchableOpacity style={styles.scrollFab} onPress={scrollToBottom} activeOpacity={0.85}>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {!isRecording ? (
            <MessageInput
              text={text}
              onChangeText={setText}
              onSend={sendMessage}
              onAddImage={sendImage}
              onRecordVoice={() => setIsRecording(true)}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editMode={!!editMessageId}
              onCancelEdit={() => { setEditMessageId(null); setText(''); }}
              onShowAttachmentMenu={() => setShowAttachmentMenu(true)}
            />
          ) : (
            <VoiceRecorder isRecording={isRecording} onSend={sendVoice} onCancel={() => setIsRecording(false)} />
          )}
        </View>
      </KeyboardAvoidingView>

      <MessageActionSheet
        visible={actionSheetParams.visible}
        onClose={() => setActionSheetParams({ visible: false, message: null })}
        onAction={handleMessageAction}
        isOwnMessage={actionSheetParams.message?.senderId === 'me'}
        isRecent={true}
        isPinned={actionSheetParams.message?.isPinned}
        isStarred={actionSheetParams.message?.isStarred}
      />

      {/* Attachment Menu */}
      <Modal visible={showAttachmentMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowAttachmentMenu(false)}>
          <View style={styles.attachmentSheet}>
            <View style={styles.handle} />
            <View style={styles.attachGrid}>
              <AttachItem icon="images" color="#3B82F6" label="Gallery" onPress={() => {}} />
              <AttachItem icon="camera" color="#EF4444" label="Camera" onPress={() => {}} />
              <AttachItem icon="document-text" color="#8B5CF6" label="Document" onPress={() => {}} />
              <AttachItem icon="location" color="#10B981" label="Location" onPress={() => {}} />
              <AttachItem icon="person" color="#F59E0B" label="Contact" onPress={() => {}} />
              <AttachItem icon="bag-handle" color={PURPLE} label="Product" onPress={() => {}} />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Full Screen */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {selectedImageUri && <Image source={selectedImageUri} style={styles.modalImage} resizeMode="contain" />}
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

const AttachItem = ({ icon, color, label, onPress }: any) => (
  <TouchableOpacity style={styles.attachItem} onPress={onPress}>
    <View style={[styles.attachIconWrap, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.attachLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFBFC' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollFab: { position: 'absolute', bottom: 70, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  attachmentSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20 },
  attachGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between', gap: 16 },
  attachItem: { alignItems: 'center', width: '30%', marginBottom: 16 },
  attachIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  attachLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#374151' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '80%' },
  modalClose: { position: 'absolute', top: 50, right: 20 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
