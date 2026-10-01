/**
 * ChatScreen.tsx — Individual conversation view.
 * - Loads real messages from the API (paginated)
 * - Connects WebSocket for real-time incoming messages
 * - All send/edit/delete/pin/star actions call the API
 * - No mock fallback: failures surface as an error state
 */
import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import {
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
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInput } from '@/components/messages/MessageInput';
import MessageActionSheet from '@/components/messages/MessageActionSheet';
import VoiceRecorder from '@/components/messages/VoiceRecorder';
import PinnedMessageBanner from '@/components/messages/PinnedMessageBanner';
import { Message, ReplyReference, MessageAction, Conversation } from '@/types/chatTypes';
import {
  getConversationAvatar, getConversationName, toLocalConversation, toLocalMessage, ME,
} from '@/lib/chatMappers';
import { chatService, MessageDto } from '@/lib/chatService';
import { useChatSocket } from '@/lib/chatSocket';
import { getSessionToken, getSessionUser } from '@/lib/session';

const PURPLE = '#7126D0';

export default function ChatScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  // No 'c1' default: a missing id is a navigation bug, not a cue to open a sample conversation.
  const conversationId = route.params?.conversationId ?? null;
  const numericConvId = conversationId == null || isNaN(Number(conversationId))
    ? null
    : Number(conversationId);

  const myId = getSessionUser()?.id ?? 0;

  // The inbox passes the conversation through so the header paints immediately; arriving any
  // other way (a fresh group, a deep link) it is fetched instead. Never a fixture contact.
  const [conv, setConv] = useState<Conversation | null>(route.params?.conversation ?? null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
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
  // useMemo, not useRef().current: reading a ref during render is what react-hooks/refs flags,
  // and an Animated.Value only needs to be created once per mount.
  const scrollY = useMemo(() => new Animated.Value(0), []);
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
      setLoadError(null);
      const paged = await chatService.getMessages(numericConvId, pageNum);
      const local = paged.content.map(d => toLocalMessage(d, myId));
      setMessages(prev => pageNum === 0 ? local : [...local, ...prev]);
      setHasMore(!paged.last);
      setPage(pageNum);
    } catch (e: any) {
      console.warn('[ChatScreen] Failed to load messages:', e);
      setLoadError(e?.message || 'Could not load this conversation.');
    } finally {
      setLoading(false);
    }
  }, [numericConvId, isAuthenticated]);

  // Scheduled rather than called in the effect body: the loaders set their loading/error state
  // immediately, and a state update during an effect breaks React's purity rules.
  useEffect(() => {
    if (!numericConvId || !isAuthenticated) return;
    const id = setTimeout(() => loadMessages(0), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericConvId]);

  // Fetch the conversation itself when it was not handed over by the inbox, and refresh it on
  // focus so membership changes made on the info screen show up here.
  const loadConversation = useCallback(async () => {
    if (!numericConvId || !isAuthenticated) return;
    try {
      setConv(toLocalConversation(await chatService.getConversation(numericConvId), myId));
    } catch (e) {
      console.warn('[ChatScreen] Failed to load conversation:', e);
    }
  }, [numericConvId, isAuthenticated, myId]);

  useEffect(() => {
    const id = setTimeout(loadConversation, 0);
    return () => clearTimeout(id);
  }, [loadConversation]);

  // Declared ahead of the socket handlers that call it, so it is never referenced before its
  // own initialisation.
  const scrollToBottom = () => { flatListRef.current?.scrollToEnd({ animated: true }); };

  // ── WebSocket real-time incoming messages ────────────────────────────────
  const handleIncomingMessage = useCallback((dto: MessageDto) => {
    const local = toLocalMessage(dto, myId);
    setMessages(prev => {
      // Avoid duplicates (our own messages are added optimistically)
      if (prev.some(m => m.id === local.id)) return prev;
      return [...prev, local];
    });
    setTimeout(() => scrollToBottom(), 100);
  }, []);

  // The socket also drives typing indicators, presence and the reconnecting banner. Remote
  // edits/deletes/reactions are applied here so the thread stays correct without a refetch.
  const { connectionState, typingUsers, onlineUsers, sendTyping } = useChatSocket(numericConvId, {
    onMessage: handleIncomingMessage,
    onEvent: (evt) => {
      if (evt.type === 'message.updated' || evt.type === 'message.reaction') {
        const updated = toLocalMessage(evt.payload as MessageDto, myId);
        setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));
      } else if (evt.type === 'message.deleted') {
        const { messageId } = evt.payload as { messageId: number };
        setMessages(prev => prev.map(m =>
          m.id === String(messageId) ? { ...m, isDeleted: true, text: undefined } : m));
      } else if (evt.type === 'message.delivered') {
        // Ticks only ever move forward: a late delivered event must not pull a message that is
        // already read back down to one tick.
        const { messageId } = evt.payload as { messageId: number };
        setMessages(prev => prev.map(m =>
          m.id === String(messageId) && m.readStatus !== 'read'
            ? { ...m, readStatus: 'delivered' }
            : m));
      } else if (evt.type === 'message.read') {
        const { lastReadMessageId } = evt.payload as { userId: number; lastReadMessageId: number };
        setMessages(prev => prev.map(m =>
          m.senderId === ME && Number(m.id) <= lastReadMessageId
            ? { ...m, readStatus: 'read' }
            : m));
      } else if (evt.type === 'group.member.added' || evt.type === 'group.member.removed') {
        // Membership changed under us — refetch rather than patching a guessed participant list.
        loadConversation();
      }
    },
  });

  // Call logs used to be injected here from the call screens as client-only messages that were
  // never persisted and vanished on refresh. Calling is not implemented, so nothing produces
  // them; when a real provider is added its call log should be posted as a SYSTEM message
  // through chatService so every participant sees it.

  const handleScroll = (e: any) => {
    const offsetFromBottom = e.nativeEvent.contentSize.height - e.nativeEvent.contentOffset.y - e.nativeEvent.layoutMeasurement.height;
    setShowScrollFab(offsetFromBottom > 200);
  };

  // ── Send Logic ────────────────────────────────────────────────────────────
  /**
   * Swaps an optimistic message for the saved one, dropping any copy the socket already
   * delivered.
   *
   * The server echoes every new message back over the socket, including to its own sender. When
   * that echo wins the race against the POST response, the thread ends up holding the real
   * message twice — once from the socket and once where the temp row was replaced — which React
   * reports as two children with the same key. Re-reading the conversation made it look fixed
   * because the duplicate only ever existed in local state.
   */
  const replaceOptimistic = useCallback((tempId: string, saved: MessageDto) => {
    const local = toLocalMessage(saved, myId);
    setMessages(prev => {
      const withoutEcho = prev.filter(m => m.id !== local.id || m.id === tempId);
      return withoutEcho.map(m => (m.id === tempId ? local : m));
    });
  }, [myId]);

  /** Marks an optimistic message as failed instead of pretending it was sent. */
  const markFailed = useCallback((tempId: string) => {
    setMessages(prev => prev.map(m => (m.id === tempId ? { ...m, readStatus: 'failed' } : m)));
  }, []);

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
        replaceOptimistic(tempId, saved);
      } catch (e) {
        console.warn('[Chat] Send failed:', e);
        markFailed(tempId);
      }
    } else {
      // Nothing was sent, so the message is not "sent". Faking a delivery timeline here used to
      // show ticks for a message that never left the device.
      markFailed(tempId);
    }
  };

  /**
   * Shared path for every attachment: show it optimistically, upload the file, then post the
   * message referencing the stored URL. The upload must come first — a media message whose
   * mediaUrl is null renders as an empty bubble with nothing to open.
   */
  const sendAttachment = async (
    opts: {
      uri: string;
      type: 'IMAGE' | 'VIDEO' | 'VOICE' | 'DOCUMENT';
      mimeType: string;
      fileName: string;
      voiceDuration?: number;
      documentName?: string;
      documentSize?: string;
    },
  ) => {
    const tempId = String(Date.now());
    const local: Message = {
      id: tempId,
      conversationId: String(conversationId),
      senderId: ME,
      type: opts.type.toLowerCase() as Message['type'],
      imageUri: opts.type === 'IMAGE' ? { uri: opts.uri } : undefined,
      videoUri: opts.type === 'VIDEO' ? opts.uri : undefined,
      voiceUri: opts.type === 'VOICE' ? opts.uri : undefined,
      voiceDuration: opts.voiceDuration,
      document: opts.type === 'DOCUMENT'
        ? { name: opts.documentName ?? opts.fileName, size: opts.documentSize ?? '', type: 'pdf', uri: opts.uri }
        : undefined,
      timestamp: new Date().toISOString(),
      readStatus: 'sending',
      reactions: [],
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      isStarred: false,
    };

    setMessages(prev => [...prev, local]);
    setShowAttachmentMenu(false);
    setTimeout(() => scrollToBottom(), 100);

    if (!numericConvId || !isAuthenticated) {
      markFailed(tempId);
      return;
    }

    try {
      const uploadedUrl = await chatService.uploadFile(opts.uri, opts.mimeType, opts.fileName);
      const saved = await chatService.sendMessage(numericConvId, {
        type: opts.type,
        mediaUrl: uploadedUrl,
        voiceDuration: opts.voiceDuration,
        documentName: opts.documentName,
        documentSize: opts.documentSize,
      });
      replaceOptimistic(tempId, saved);
    } catch (e) {
      console.warn(`[Chat] ${opts.type} send failed:`, e);
      markFailed(tempId);
    }
  };

  const sendVoice = async (uri: string | null, duration: number) => {
    setIsRecording(false);
    if (!uri) {
      // Nothing was captured, so there is no voice note to send.
      Alert.alert('Nothing recorded', 'The voice message was empty and was not sent.');
      return;
    }
    const ext = uri.split('.').pop()?.toLowerCase() || 'm4a';
    await sendAttachment({
      uri,
      type: 'VOICE',
      mimeType: ext === 'wav' ? 'audio/wav' : 'audio/m4a',
      fileName: `voice_${Date.now()}.${ext}`,
      voiceDuration: duration,
    });
  };

  const sendImage = async (uri: string) => {
    const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
    const isVideo = ext === 'mp4' || ext === 'mov';
    await sendAttachment({
      uri,
      type: isVideo ? 'VIDEO' : 'IMAGE',
      mimeType: isVideo
        ? (ext === 'mov' ? 'video/quicktime' : 'video/mp4')
        : (ext === 'png' ? 'image/png' : 'image/jpeg'),
      fileName: `media_${Date.now()}.${ext || 'jpg'}`,
    });
  };

  // ── Attachment pickers ────────────────────────────────────────────────────
  // Every tile in the attachment sheet used to be onPress={() => {}}, so none of them did
  // anything. These open the real pickers and feed the shared upload path above.

  const pickFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo access to share images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) await sendImage(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) await sendImage(result.assets[0].uri);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.[0]) return;
    const doc = result.assets[0];
    await sendAttachment({
      uri: doc.uri,
      type: 'DOCUMENT',
      mimeType: doc.mimeType || 'application/octet-stream',
      fileName: doc.name,
      documentName: doc.name,
      documentSize: doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : undefined,
    });
  };

  // ── Message Actions ───────────────────────────────────────────────────────
  const handleMessageAction = async (action: MessageAction) => {
    const msg = actionSheetParams.message;
    if (!msg) return;

    setActionSheetParams({ visible: false, message: null });

    switch (action) {
      case 'reply':
        setReplyTo({ messageId: msg.id, text: msg.text ?? (msg.type === 'image' ? 'Photo' : 'Voice Message'), sender: msg.senderName ?? (msg.senderId === 'me' ? 'You' : (conv ? getConversationName(conv) : 'Chat')) });
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
    const sender = conv?.participants.find(p => p.id === item.senderId);
    const avatarSrc = sender?.avatar ?? (conv ? getConversationAvatar(conv) : undefined);

    return (
      <MessageBubble
        message={item}
        showDate={showDate}
        showAvatar={showAvatar}
        showSenderName={conv?.type === 'group' && (!previous || previous.senderId !== item.senderId)}
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

  // The header needs a conversation to render. Rather than invent placeholder details, say
  // plainly that it could not be opened — this is reachable if the screen is entered without
  // the conversation (e.g. a deep link) or the id is not a real one.
  if (!conv) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.centeredState}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color={PURPLE} />
          <Text style={styles.centeredTitle}>Conversation unavailable</Text>
          <Text style={styles.centeredSubtitle}>
            {loadError ?? 'Open this chat from your messages list.'}
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.centeredBtn}>
            <Text style={styles.centeredBtnText}>Back to messages</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            senderName={pinnedMsg.senderName ?? (pinnedMsg.senderId === 'me' ? 'You' : (conv ? getConversationName(conv) : 'Chat'))}
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
              <AttachItem icon="images" color="#3B82F6" label="Gallery" onPress={pickFromGallery} />
              <AttachItem icon="camera" color="#EF4444" label="Camera" onPress={pickFromCamera} />
              <AttachItem icon="document-text" color="#8B5CF6" label="Document" onPress={pickDocument} />
              {/* Location and Contact have no backend message type and nothing behind them, and
                  the shop has no "pick a product to share" mode yet. They are shown as
                  unavailable rather than as buttons that silently do nothing. Products and posts
                  are shared today from their own share sheet, which posts into a conversation. */}
              <AttachItem icon="location" color="#10B981" label="Location" disabled />
              <AttachItem icon="person" color="#F59E0B" label="Contact" disabled />
              <AttachItem icon="bag-handle" color={PURPLE} label="Product" disabled />
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

const AttachItem = ({ icon, color, label, onPress, disabled }: any) => (
  <TouchableOpacity
    style={[styles.attachItem, disabled && styles.attachItemDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[styles.attachIconWrap, { backgroundColor: disabled ? '#D1D5DB' : color }]}>
      <Ionicons name={icon} size={24} color="#fff" />
    </View>
    <Text style={styles.attachLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFBFC' },
  centeredState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  centeredTitle: { marginTop: 14, fontSize: 17, fontFamily: 'Poppins-Bold', color: '#111827' },
  centeredSubtitle: { marginTop: 6, fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF', textAlign: 'center' },
  centeredBtn: { marginTop: 18, backgroundColor: PURPLE, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
  centeredBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins-Bold' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollFab: { position: 'absolute', bottom: 70, right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  attachmentSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 20 },
  attachGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, justifyContent: 'space-between', gap: 16 },
  attachItem: { alignItems: 'center', width: '30%', marginBottom: 16 },
  attachItemDisabled: { opacity: 0.45 },
  attachIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  attachLabel: { fontSize: 13, fontFamily: 'Poppins-Medium', color: '#374151' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '80%' },
  modalClose: { position: 'absolute', top: 50, right: 20 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
