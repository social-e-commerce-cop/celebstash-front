import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import EmojiSelector from 'react-native-emoji-selector';
import { ReplyReference, MessageAction } from '@/types/chatTypes';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

interface MessageInputProps {
  text: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onAddImage: (uri: string) => void;
  onRecordVoice?: () => void;
  onOpenGif?: () => void;
  replyTo?: ReplyReference | null;
  onCancelReply?: () => void;
  editMode?: boolean;
  onCancelEdit?: () => void;
  onShowAttachmentMenu?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  text,
  onChangeText,
  onSend,
  onAddImage,
  onRecordVoice,
  onOpenGif,
  replyTo,
  onCancelReply,
  editMode = false,
  onCancelEdit,
  onShowAttachmentMenu,
}) => {
  const showSend = text.trim().length > 0;
  const [showEmojis, setShowEmojis] = useState(false);

  const insertEmoji = (emoji: string) => {
    onChangeText(text + emoji);
  };

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      onAddImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Full standard emoji panel */}
      {showEmojis && (
        <View style={styles.emojiPanel}>
          <EmojiSelector
            onEmojiSelected={insertEmoji}
            showSearchBar={false}
            columns={8}
            theme={PURPLE}
          />
        </View>
      )}

      {/* Edit Mode Strip */}
      {editMode && (
        <View style={styles.replyStrip}>
          <View style={styles.replyStripLine} />
          <View style={styles.replyStripIconWrap}>
            <Ionicons name="pencil" size={14} color={PURPLE} />
          </View>
          <View style={styles.replyStripContent}>
            <Text style={styles.replyStripName}>Edit Message</Text>
            <Text style={styles.replyStripText} numberOfLines={1}>{text}</Text>
          </View>
          <TouchableOpacity onPress={onCancelEdit} style={styles.replyClose}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Reply quote strip */}
      {replyTo && !editMode && (
        <View style={styles.replyStrip}>
          <View style={styles.replyStripLine} />
          <View style={styles.replyStripIconWrap}>
            <Ionicons name="arrow-undo" size={14} color={PURPLE} />
          </View>
          <View style={styles.replyStripContent}>
            <Text style={styles.replyStripName}>{replyTo.sender}</Text>
            <Text style={styles.replyStripText} numberOfLines={1}>{replyTo.text}</Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        {/* Attachment button */}
        <TouchableOpacity style={styles.attachBtn} onPress={onShowAttachmentMenu}>
          <Ionicons name="add" size={24} color={PURPLE} />
        </TouchableOpacity>

        {/* Text input container */}
        <View style={styles.inputBox}>
          <TextInput
            value={text}
            onChangeText={onChangeText}
            placeholder={editMode ? 'Edit message…' : 'Type a message…'}
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity style={styles.insideInputBtn} onPress={() => setShowEmojis(s => !s)}>
            <Ionicons name={showEmojis ? 'close-circle' : 'happy-outline'} size={22} color={showEmojis ? PURPLE : '#9CA3AF'} />
          </TouchableOpacity>
        </View>

        {/* Right actions */}
        {!showSend && !editMode ? (
          <View style={styles.rightActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
              <Ionicons name="camera-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={onRecordVoice}>
              <Ionicons name="mic-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.sendBtn} onPress={onSend} activeOpacity={0.8}>
            <Ionicons name={editMode ? 'checkmark' : 'send'} size={18} color="#fff" style={!editMode ? { marginLeft: 2 } : {}} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  // Emoji panel
  emojiPanel: {
    height: 300,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  // Reply / Edit strip
  replyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EDE9FE',
  },
  replyStripLine: {
    width: 3,
    height: '100%',
    minHeight: 30,
    backgroundColor: PURPLE,
    borderRadius: 2,
    marginRight: 8,
  },
  replyStripIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  replyStripContent: { flex: 1 },
  replyStripName: { fontSize: 11, fontFamily: 'Poppins-Bold', color: PURPLE },
  replyStripText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  replyClose: { padding: 4 },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 1,
  },
  iconBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 2,
    minHeight: 42,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    padding: 0,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 20,
  },
  insideInputBtn: {
    padding: 6,
    marginBottom: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default MessageInput;
