import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';

type ReadStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface Reaction {
  emoji: string;
  count: number;
}

interface ReplyQuote {
  text: string;
  sender: string;
}

interface MessageBubbleProps {
  type: 'incoming' | 'outgoing';
  text?: string;
  image?: boolean;
  uri?: string;
  time: string;
  showAvatar?: boolean;
  showDate?: boolean;
  onImagePress?: () => void;
  previousType?: 'incoming' | 'outgoing';
  readStatus?: ReadStatus;
  reactions?: Reaction[];
  replyTo?: ReplyQuote;
  onLongPress?: () => void;
  onReply?: () => void;
}

const formatDate = (time: string) => {
  const d = new Date(time);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const formatTime = (time: string) =>
  new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const ReadIcon: React.FC<{ status: ReadStatus; isOutgoing: boolean }> = ({ status, isOutgoing }) => {
  if (!isOutgoing) return null;
  if (status === 'sending') return <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />;
  if (status === 'sent') return <Text style={styles.tickText}>✓</Text>;
  if (status === 'delivered') return <Text style={styles.tickText}>✓✓</Text>;
  return <Text style={[styles.tickText, { color: '#93C5FD' }]}>✓✓</Text>;
};

const EMOJI_OPTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  type,
  text,
  image,
  uri,
  time,
  showAvatar = true,
  showDate = false,
  onImagePress,
  previousType,
  readStatus = 'read',
  reactions,
  replyTo,
  onLongPress,
  onReply,
}) => {
  const isOutgoing = type === 'outgoing';
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState<Reaction[]>(reactions ?? []);

  const addReaction = (emoji: string) => {
    setLocalReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (existing) {
        return prev.map(r => r.emoji === emoji ? { ...r, count: r.count + 1 } : r);
      }
      return [...prev, { emoji, count: 1 }];
    });
    setShowEmojiPicker(false);
  };

  return (
    <View>
      {/* Date separator */}
      {showDate && (
        <View style={styles.dateSep}>
          <View style={styles.dateLine} />
          <Text style={styles.dateText}>{formatDate(time)} · {formatTime(time)}</Text>
          <View style={styles.dateLine} />
        </View>
      )}

      <View style={[
        styles.row,
        isOutgoing ? styles.rowOut : styles.rowIn,
        previousType && previousType !== type ? { marginTop: 16 } : {},
      ]}>
        {/* Incoming avatar */}
        {!isOutgoing && (
          <View style={styles.avatarSlot}>
            {showAvatar ? (
              <Image source={require('../../assets/images/feed6.jpg')} style={styles.avatar} />
            ) : null}
          </View>
        )}

        <View style={[styles.bubbleCol, isOutgoing ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
          {/* Reply quote */}
          {replyTo && (
            <View style={[styles.replyQuote, isOutgoing && styles.replyQuoteOut]}>
              <Text style={styles.replyName}>{replyTo.sender}</Text>
              <Text style={styles.replyText} numberOfLines={1}>{replyTo.text}</Text>
            </View>
          )}

          {/* Bubble */}
          <TouchableOpacity
            onLongPress={() => {
              setShowEmojiPicker(true);
              onLongPress?.();
            }}
            activeOpacity={0.85}
            style={[
              styles.bubble,
              isOutgoing ? styles.bubbleOut : styles.bubbleIn,
              image && styles.imageBubble,
              uri && styles.voiceBubble,
            ]}
          >
            {image ? (
              <TouchableOpacity onPress={onImagePress} activeOpacity={0.9}>
                <Image
                  source={require('../../assets/images/feed6.jpg')}
                  style={styles.imagePreview}
                />
              </TouchableOpacity>
            ) : uri ? (
              <View style={styles.voiceRow}>
                <Ionicons name="play" size={20} color={isOutgoing ? '#fff' : PURPLE} />
                <View style={styles.waveform}>
                  {[4, 8, 14, 10, 6, 12, 8, 5, 11, 7].map((h, i) => (
                    <View
                      key={i}
                      style={[styles.waveBar, {
                        height: h,
                        backgroundColor: isOutgoing ? 'rgba(255,255,255,0.7)' : PURPLE,
                      }]}
                    />
                  ))}
                </View>
                <Text style={[styles.voiceDuration, isOutgoing && { color: 'rgba(255,255,255,0.8)' }]}>
                  0:12
                </Text>
              </View>
            ) : (
              <Text style={[styles.text, isOutgoing ? styles.textOut : styles.textIn]}>
                {text}
              </Text>
            )}
          </TouchableOpacity>

          {/* Time + read status */}
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>{formatTime(time)}</Text>
            {isOutgoing && (
              <View style={{ marginLeft: 4 }}>
                <ReadIcon status={readStatus} isOutgoing={isOutgoing} />
              </View>
            )}
          </View>

          {/* Reactions */}
          {localReactions.length > 0 && (
            <View style={[styles.reactionsRow, isOutgoing && { justifyContent: 'flex-end' }]}>
              {localReactions.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.reactionChip}
                  onPress={() => addReaction(r.emoji)}
                >
                  <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                  {r.count > 1 && <Text style={styles.reactionCount}>{r.count}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Swipe-to-reply hint button */}
        {!isOutgoing && (
          <TouchableOpacity style={styles.replyBtn} onPress={onReply}>
            <Ionicons name="arrow-undo-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Emoji picker modal */}
      <Modal visible={showEmojiPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.emojiOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}
        >
          <View style={styles.emojiPicker}>
            {EMOJI_OPTIONS.map((emoji, i) => (
              <TouchableOpacity
                key={i}
                style={styles.emojiOption}
                onPress={() => addReaction(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 2 },
  rowIn: { justifyContent: 'flex-start' },
  rowOut: { justifyContent: 'flex-end' },
  avatarSlot: { width: 36, marginRight: 8, alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  bubbleCol: { flexDirection: 'column', maxWidth: '75%' },

  bubble: { padding: 11, borderRadius: 16 },
  bubbleIn: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
  },
  bubbleOut: {
    backgroundColor: PURPLE,
    borderTopRightRadius: 4,
  },
  imageBubble: { padding: 0, overflow: 'hidden' },
  voiceBubble: { minWidth: 160 },
  imagePreview: { width: width * 0.62, height: 180, borderRadius: 14 },

  text: { fontSize: 14, fontFamily: 'Poppins-Regular', lineHeight: 20 },
  textIn: { color: '#111' },
  textOut: { color: '#fff' },

  // Voice note
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  waveBar: { width: 2.5, borderRadius: 2, opacity: 0.85 },
  voiceDuration: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },

  // Reply quote
  replyQuote: {
    borderLeftWidth: 3,
    borderLeftColor: '#D1D5DB',
    paddingLeft: 8,
    marginBottom: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingVertical: 4,
    paddingRight: 8,
  },
  replyQuoteOut: {
    borderLeftColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  replyName: { fontSize: 11, fontFamily: 'Poppins-Bold', color: PURPLE },
  replyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280' },

  // Meta
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, paddingHorizontal: 2 },
  timeText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  tickText: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins-Regular' },

  // Reactions
  reactionsRow: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 3,
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 11, fontFamily: 'Poppins-Bold', color: '#6B7280' },

  // Reply button
  replyBtn: {
    marginLeft: 4,
    padding: 4,
    opacity: 0.6,
    alignSelf: 'center',
  },

  // Date separator
  dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#F3F4F6' },
  dateText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#9CA3AF' },

  // Emoji picker
  emojiOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  emojiPicker: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  emojiOption: { padding: 6 },
  emojiText: { fontSize: 26 },
});
