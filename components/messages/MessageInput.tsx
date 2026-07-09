import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

const QUICK_EMOJIS = ['😂', '❤️', '👍', '🔥', '😮', '🙏'];

interface MessageInputProps {
  text: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onAddImage: (uri: string) => void;
  onRecordVoice?: () => void;
  onOpenGif?: () => void;
  replyTo?: { text: string; sender: string } | null;
  onCancelReply?: () => void;
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
}) => {
  const showSend = text.trim().length > 0;
  const [showEmojis, setShowEmojis] = useState(false);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { alert('Permission to access gallery is required!'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      onAddImage(result.assets[0].uri);
    }
  };

  const insertEmoji = (emoji: string) => {
    onChangeText(text + emoji);
    setShowEmojis(false);
  };

  return (
    <View style={styles.wrapper}>
      {/* Quick emoji row */}
      {showEmojis && (
        <View style={styles.emojiRow}>
          {QUICK_EMOJIS.map((e, i) => (
            <TouchableOpacity key={i} onPress={() => insertEmoji(e)} style={styles.emojiBtn}>
              <Text style={styles.emojiChar}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Reply quote strip */}
      {replyTo && (
        <View style={styles.replyStrip}>
          <View style={styles.replyStripLine} />
          <View style={styles.replyStripContent}>
            <Text style={styles.replyStripName}>{replyTo.sender}</Text>
            <Text style={styles.replyStripText} numberOfLines={1}>{replyTo.text}</Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={styles.replyClose}>
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        {/* Left: emoji toggle + image */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setShowEmojis(s => !s)}
        >
          <Ionicons
            name={showEmojis ? 'close-circle' : 'happy-outline'}
            size={24}
            color={showEmojis ? PURPLE : '#9CA3AF'}
          />
        </TouchableOpacity>

        {/* Text input */}
        <View style={styles.inputBox}>
          <TextInput
            value={text}
            onChangeText={onChangeText}
            placeholder="Message…"
            placeholderTextColor="#9CA3AF"
            style={styles.textInput}
            multiline
            maxLength={2000}
          />
        </View>

        {/* Right actions */}
        <View style={styles.rightActions}>
          {!showSend && (
            <>
              <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={22} color="#9CA3AF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onOpenGif}>
                <Text style={styles.gifText}>GIF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={onRecordVoice}>
                <Ionicons name="mic-outline" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.sendBtn, !showSend && styles.sendBtnHidden]}
            onPress={onSend}
            disabled={!showSend}
          >
            <Ionicons name="send" size={17} color="#fff" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
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
  // Emoji quick-pick
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  emojiBtn: { padding: 4 },
  emojiChar: { fontSize: 24 },

  // Reply strip
  replyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    paddingHorizontal: 14,
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
    marginRight: 10,
  },
  replyStripContent: { flex: 1 },
  replyStripName: { fontSize: 11, fontFamily: 'Poppins-Bold', color: PURPLE },
  replyStripText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  replyClose: { padding: 4 },

  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120,
  },
  textInput: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#111',
    padding: 0,
    lineHeight: 20,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  gifText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: '#9CA3AF',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnHidden: {
    opacity: 0,
    width: 0,
    overflow: 'hidden',
  },
});
