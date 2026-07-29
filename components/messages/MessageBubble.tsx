import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message, Reaction } from '@/types/chatTypes';
import ProductCard from './ProductCard';
import LinkPreview from './LinkPreview';
import SharedPostBubble from './SharedPostBubble';

const { width } = Dimensions.get('window');
const PURPLE = '#7126D0';
const PURPLE_LIGHT = '#F3EAFF';
const INCOMING_BG = '#F3F4F6';
const OUTGOING_BG = PURPLE;

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
  showDate?: boolean;
  showSenderName?: boolean;
  previousType?: 'incoming' | 'outgoing';
  onImagePress?: () => void;
  onReply?: () => void;
  onLongPress?: () => void;
  onProductPress?: () => void;
  onLinkPress?: () => void;
  avatarSource?: any;
}

// ── Helpers ──
const formatDate = (time: string) => {
  const d = new Date(time);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

const formatTime = (time: string) =>
  new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const EMOJI_OPTIONS = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar = true,
  showDate = false,
  showSenderName = false,
  previousType,
  onImagePress,
  onReply,
  onLongPress,
  onProductPress,
  onLinkPress,
  avatarSource,
}) => {
  const isOutgoing = message.senderId === 'me';
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState<Reaction[]>(message.reactions);

  const addReaction = (emoji: string) => {
    setLocalReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji);
      if (existing) {
        return prev.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, reactedByMe: true } : r);
      }
      return [...prev, { emoji, count: 1, reactedByMe: true }];
    });
    setShowEmojiPicker(false);
  };

  // ── System message ──
  if (message.type === 'system') {
    const sysText = message.systemText ?? message.text ?? '';
    const isVideoCall = sysText.toLowerCase().includes('video call');
    const isVoiceCall = sysText.toLowerCase().includes('voice call') || sysText.toLowerCase().includes('call');
    const iconName = isVideoCall ? 'videocam-outline' : isVoiceCall ? 'call-outline' : 'information-circle-outline';

    return (
      <View style={styles.systemRow}>
        <View style={styles.systemBubble}>
          <Ionicons name={iconName} size={14} color={isVoiceCall || isVideoCall ? PURPLE : '#9CA3AF'} />
          <Text style={[styles.systemText, (isVoiceCall || isVideoCall) && { color: '#374151', fontFamily: 'Poppins-Medium' }]}>{sysText}</Text>
        </View>
      </View>
    );
  }

  // ── Deleted message ──
  if (message.isDeleted) {
    return (
      <View style={[styles.row, isOutgoing ? styles.rowOut : styles.rowIn, previousType && previousType !== (isOutgoing ? 'outgoing' : 'incoming') ? { marginTop: 16 } : {}]}>
        {!isOutgoing && <View style={styles.avatarSlot} />}
        <View style={[styles.deletedBubble, isOutgoing ? styles.deletedOut : styles.deletedIn]}>
          <Ionicons name="ban-outline" size={14} color="#9CA3AF" />
          <Text style={styles.deletedText}>This message was deleted</Text>
        </View>
      </View>
    );
  }

  const direction: 'incoming' | 'outgoing' = isOutgoing ? 'outgoing' : 'incoming';

  // ── Render content ──
  const renderContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <TouchableOpacity onPress={onImagePress} activeOpacity={0.9}>
            <Image
              source={message.imageUri ?? require('../../assets/images/feed6.jpg')}
              style={styles.imagePreview}
            />
            {/* Time overlay on image */}
            <View style={styles.imageTimeOverlay}>
              {message.isPinned && <Ionicons name="pin" size={10} color="#fff" style={{ marginRight: 3 }} />}
              {message.isStarred && <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 3 }} />}
              <Text style={styles.imageTimeText}>{formatTime(message.timestamp)}</Text>
            </View>
          </TouchableOpacity>
        );

      case 'voice':
        return (
          <View style={styles.voiceRow}>
            <TouchableOpacity style={[styles.playBtn, isOutgoing && styles.playBtnOut]}>
              <Ionicons name="play" size={16} color={isOutgoing ? PURPLE : '#fff'} />
            </TouchableOpacity>
            <View style={styles.waveformWrap}>
              <View style={styles.waveform}>
                {[4, 8, 14, 10, 6, 12, 8, 5, 11, 7, 9, 13, 6, 10, 8, 5, 12, 7, 10, 6].map((h, i) => (
                  <View
                    key={i}
                    style={[styles.waveBar, {
                      height: h,
                      backgroundColor: isOutgoing ? 'rgba(255,255,255,0.6)' : PURPLE,
                    }]}
                  />
                ))}
              </View>
              <Text style={[styles.voiceDuration, isOutgoing && { color: 'rgba(255,255,255,0.7)' }]}>
                {message.voiceDuration ? `${Math.floor(message.voiceDuration / 60)}:${(message.voiceDuration % 60).toString().padStart(2, '0')}` : '0:12'}
              </Text>
            </View>
          </View>
        );

      case 'document':
        return (
          <View style={styles.documentRow}>
            <View style={[styles.docIcon, isOutgoing && styles.docIconOut]}>
              <Ionicons name="document-text" size={20} color={isOutgoing ? '#fff' : PURPLE} />
            </View>
            <View style={styles.docInfo}>
              <Text style={[styles.docName, isOutgoing && styles.textOut]} numberOfLines={1}>
                {message.document?.name ?? 'Document'}
              </Text>
              <Text style={[styles.docSize, isOutgoing && { color: 'rgba(255,255,255,0.6)' }]}>
                {message.document?.size ?? ''} • {(message.document?.type ?? 'pdf').toUpperCase()}
              </Text>
            </View>
          </View>
        );

      case 'product':
        return message.product ? (
          <ProductCard product={message.product} isOutgoing={isOutgoing} onPress={onProductPress} />
        ) : null;

      case 'post':
        return message.sharedPost ? (
          <SharedPostBubble post={message.sharedPost} isOutgoing={isOutgoing} onPress={onProductPress} />
        ) : null;

      case 'link':
        return message.linkPreview ? (
          <View>
            <LinkPreview data={message.linkPreview} isOutgoing={isOutgoing} onPress={onLinkPress} />
            {message.text && (
              <Text style={[styles.text, isOutgoing ? styles.textOut : styles.textIn, { marginTop: 6 }]}>
                {renderMentionText(message.text, isOutgoing)}
              </Text>
            )}
          </View>
        ) : null;

      default:
        return (
          <Text style={[styles.text, isOutgoing ? styles.textOut : styles.textIn]}>
            {renderMentionText(message.text ?? '', isOutgoing)}
          </Text>
        );
    }
  };

  // ── @mention highlighting ──
  const renderMentionText = (text: string, isOut: boolean) => {
    const mentionRegex = /@\w+/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <Text key={match.index} style={[styles.mention, isOut && styles.mentionOut]}>
          {match[0]}
        </Text>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.substring(lastIndex));
    return parts.length > 0 ? parts : text;
  };

  // ── Read status text (Instagram style) ──
  const getReadStatusText = () => {
    if (!isOutgoing) return null;
    switch (message.readStatus) {
      case 'sending': return 'Sending';
      case 'sent': return 'Sent';
      case 'delivered': return 'Delivered';
      case 'read': return 'Seen';
      default: return null;
    }
  };

  const needsSpecialBubble = message.type === 'product' || message.type === 'image' || message.type === 'post';
  const isImageOrProduct = message.type === 'image' || message.type === 'product' || message.type === 'post';

  return (
    <View>
      {/* Date separator */}
      {showDate && (
        <View style={styles.dateSep}>
          <View style={styles.dateLine} />
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{formatDate(message.timestamp)}</Text>
          </View>
          <View style={styles.dateLine} />
        </View>
      )}

      <View style={[
        styles.row,
        isOutgoing ? styles.rowOut : styles.rowIn,
        previousType && previousType !== direction ? { marginTop: 12 } : {},
      ]}>
        {/* Incoming avatar */}
        {!isOutgoing && (
          <View style={styles.avatarSlot}>
            {showAvatar ? (
              <Image
                source={avatarSource ?? require('../../assets/images/feed6.jpg')}
                style={styles.avatar}
              />
            ) : null}
          </View>
        )}

        <View style={[styles.bubbleCol, isOutgoing ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
          {/* Sender name (groups) */}
          {showSenderName && !isOutgoing && message.senderName && (
            <Text style={styles.senderNameText}>{message.senderName}</Text>
          )}

          {/* Reply quote */}
          {message.replyTo && (
            <View style={[styles.replyQuote, isOutgoing && styles.replyQuoteOut]}>
              <View style={[styles.replyBar, isOutgoing && styles.replyBarOut]} />
              <View style={styles.replyContent}>
                <Text style={[styles.replyName, isOutgoing && styles.replyNameOut]}>{message.replyTo.sender}</Text>
                <Text style={[styles.replyText, isOutgoing && styles.replyTextOut]} numberOfLines={1}>{message.replyTo.text}</Text>
              </View>
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
              needsSpecialBubble && styles.specialBubble,
              // Tail-like radius adjustment
              !isOutgoing && showAvatar && styles.bubbleInTail,
              isOutgoing && styles.bubbleOutTail,
            ]}
          >
            {renderContent()}

            {/* Inline meta for text messages (time inside bubble, no ticks) */}
            {!isImageOrProduct && (
              <View style={styles.inlineMeta}>
                {message.isEdited && <Text style={[styles.editedText, isOutgoing && styles.editedTextOut]}>edited</Text>}
                {message.isPinned && <Ionicons name="pin" size={10} color={isOutgoing ? 'rgba(255,255,255,0.5)' : '#9CA3AF'} style={{ marginRight: 2 }} />}
                {message.isStarred && <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 2 }} />}
                <Text style={[styles.timeText, isOutgoing && styles.timeTextOut]}>{formatTime(message.timestamp)}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* External meta for image/product (already has overlay) */}
          {isImageOrProduct && message.type !== 'image' && (
            <View style={styles.metaRow}>
              {message.isPinned && <Ionicons name="pin" size={10} color="#9CA3AF" style={{ marginRight: 3 }} />}
              {message.isStarred && <Ionicons name="star" size={10} color="#F59E0B" style={{ marginRight: 3 }} />}
              {message.isEdited && <Text style={styles.editedText}>edited · </Text>}
              <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
            </View>
          )}

          {/* Instagram-style read status below outgoing bubbles */}
          {isOutgoing && getReadStatusText() && (
            <Text style={[
              styles.readStatusText,
              message.readStatus === 'read' && styles.readStatusSeen,
            ]}>
              {getReadStatusText()}
            </Text>
          )}

          {/* Reactions */}
          {localReactions.length > 0 && (
            <View style={[styles.reactionsRow, isOutgoing && { justifyContent: 'flex-end' }]}>
              {localReactions.map((r, i) => (
                <TouchableOpacity key={i} style={[styles.reactionChip, r.reactedByMe && styles.reactionChipActive]} onPress={() => addReaction(r.emoji)}>
                  <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                  {r.count > 1 && <Text style={styles.reactionCount}>{r.count}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Reply hint (incoming) */}
        {!isOutgoing && (
          <TouchableOpacity style={styles.replyBtn} onPress={onReply}>
            <Ionicons name="arrow-undo-outline" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Emoji picker modal */}
      <Modal visible={showEmojiPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.emojiOverlay} activeOpacity={1} onPress={() => setShowEmojiPicker(false)}>
          <View style={styles.emojiPicker}>
            {EMOJI_OPTIONS.map((emoji, i) => (
              <TouchableOpacity key={i} style={styles.emojiOption} onPress={() => addReaction(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.emojiDivider} />
            <TouchableOpacity style={styles.emojiPlusBtn} onPress={() => setShowEmojiPicker(false)}>
              <Ionicons name="add" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // ── Layout ──
  row: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 1.5, paddingHorizontal: 2 },
  rowIn: { justifyContent: 'flex-start' },
  rowOut: { justifyContent: 'flex-end' },
  avatarSlot: { width: 32, marginRight: 6, alignItems: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#EDE9FE' },
  bubbleCol: { flexDirection: 'column', maxWidth: '78%' },

  // ── Sender name ──
  senderNameText: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: PURPLE,
    marginBottom: 2,
    marginLeft: 6,
  },

  // ── Bubble ──
  bubble: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, borderRadius: 18 },
  bubbleIn: { backgroundColor: INCOMING_BG },
  bubbleOut: { backgroundColor: OUTGOING_BG },
  bubbleInTail: { borderBottomLeftRadius: 4 },
  bubbleOutTail: { borderBottomRightRadius: 4 },
  specialBubble: { padding: 0, overflow: 'hidden', paddingBottom: 0, paddingHorizontal: 0, paddingTop: 0 },

  // ── Text ──
  text: { fontSize: 14.5, fontFamily: 'Poppins-Regular', lineHeight: 21 },
  textIn: { color: '#1F2937' },
  textOut: { color: '#fff' },
  mention: { fontFamily: 'Poppins-Bold', color: PURPLE },
  mentionOut: { color: '#C4B5FD' },

  // ── Inline Meta (inside bubble) ──
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    gap: 2,
  },

  // ── Image ──
  imagePreview: { width: width * 0.62, height: 200, borderRadius: 18 },
  imageTimeOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  imageTimeText: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#fff' },

  // ── Voice ──
  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2, minWidth: 180 },
  playBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center',
  },
  playBtnOut: { backgroundColor: 'rgba(255,255,255,0.25)' },
  waveformWrap: { flex: 1 },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 1.5 },
  waveBar: { width: 2.5, borderRadius: 2, opacity: 0.85 },
  voiceDuration: { fontSize: 10, fontFamily: 'Poppins-Medium', color: '#6B7280', marginTop: 3 },

  // ── Document ──
  documentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 180 },
  docIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center',
  },
  docIconOut: { backgroundColor: 'rgba(255,255,255,0.2)' },
  docInfo: { flex: 1 },
  docName: { fontSize: 12, fontFamily: 'Poppins-Bold', color: '#111' },
  docSize: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },

  // ── Reply quote ──
  replyQuote: {
    flexDirection: 'row',
    marginBottom: 3,
    backgroundColor: '#ECEBEF',
    borderRadius: 10,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  replyQuoteOut: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  replyBar: {
    width: 4,
    backgroundColor: PURPLE,
  },
  replyBarOut: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  replyContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  replyName: { fontSize: 11, fontFamily: 'Poppins-Bold', color: PURPLE },
  replyNameOut: { color: '#C4B5FD' },
  replyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#6B7280' },
  replyTextOut: { color: 'rgba(255,255,255,0.7)' },

  // ── Meta ──
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, paddingHorizontal: 4 },
  timeText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  timeTextOut: { color: 'rgba(255,255,255,0.55)' },
  tickText: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontFamily: 'Poppins-Bold' },
  editedText: { fontSize: 9, fontFamily: 'Poppins-Regular', color: '#9CA3AF', fontStyle: 'italic', marginRight: 3 },
  editedTextOut: { color: 'rgba(255,255,255,0.5)' },

  // ── Instagram-style read status ──
  readStatusText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: '#9CA3AF',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  readStatusSeen: {
    color: '#7126D0',
    fontFamily: 'Poppins-Bold',
  },

  // ── Reactions ──
  reactionsRow: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  reactionChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: '#E5E7EB', gap: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1,
  },
  reactionChipActive: { borderColor: PURPLE, backgroundColor: '#F8F5FF' },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontSize: 11, fontFamily: 'Poppins-Bold', color: '#6B7280' },

  // ── Reply button ──
  replyBtn: { marginLeft: 4, padding: 4, opacity: 0.5, alignSelf: 'center' },

  // ── Date separator ──
  dateSep: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, paddingHorizontal: 16, gap: 10 },
  dateLine: { flex: 1, height: 0.5, backgroundColor: '#E5E7EB' },
  datePill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  dateText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#9CA3AF' },

  // ── Emoji picker ──
  emojiOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
  emojiPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  emojiOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 26 },
  emojiDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  emojiPlusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── System message ──
  systemRow: { alignItems: 'center', marginVertical: 10 },
  systemBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F3F4F6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6,
  },
  systemText: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#9CA3AF' },

  // ── Deleted message ──
  deletedBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 11, borderRadius: 18, opacity: 0.7,
  },
  deletedIn: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  deletedOut: { backgroundColor: '#E5E7EB', borderBottomRightRadius: 4 },
  deletedText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#9CA3AF', fontStyle: 'italic' },
});
