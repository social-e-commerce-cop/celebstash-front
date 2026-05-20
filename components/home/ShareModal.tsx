import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TouchableOpacity, Image,
  FlatList, TextInput, Dimensions, Share, Alert, ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const contacts = [
  { id: 1, name: 'Ange N...', image: require('../../assets/images/story1.png') },
  { id: 2, name: 'Ange', image: require('../../assets/images/storyItem.jpg') },
  { id: 3, name: 'Biizziyu', image: require('../../assets/images/story2.png') },
  { id: 4, name: 'Kshot', image: require('../../assets/images/story3.png') },
  { id: 5, name: 'Ange N...', image: require('../../assets/images/story4.png') },
  { id: 6, name: 'Ange', image: require('../../assets/images/storyItem.jpg') },
  { id: 7, name: 'Biizziyu', image: require('../../assets/images/story1.png') },
  { id: 8, name: 'Kshot', image: require('../../assets/images/story2.png') },
  { id: 9, name: 'Ange N...', image: require('../../assets/images/story3.png') },
  { id: 10, name: 'Ange', image: require('../../assets/images/story4.png') },
  { id: 11, name: 'Biizziyu', image: require('../../assets/images/storyItem.jpg') },
  { id: 12, name: 'Kshot', image: require('../../assets/images/story1.png') },
];

const WhatsAppIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="#25D366">
    <Path d="M12.004 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.89 5.83L2.06 22l4.31-1.83C7.94 21.3 9.9 22 12.004 22c5.52 0 10-4.48 10-10S17.524 2 12.004 2zm0 18c-1.87 0-3.61-.59-5.06-1.59l-.36-.25-2.56 1.09 1.11-2.5-.27-.39c-1.12-1.63-1.72-3.56-1.72-5.55 0-4.96 4.04-9 9-9 4.96 0 9 4.04 9 9s-4.04 9-9 9z M16.27 13.91c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a7.56 7.56 0 01-3.23-2.02c-.85-.75-1.42-1.68-1.59-1.96-.16-.28-.02-.43.1-.55.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.4-.41-.54-.42H7.2a1.03 1.03 0 00-.74.34c-.26.28-1 1-1 2.44s1.04 2.84 1.18 3.04c.14.2 2.06 3.14 4.98 4.4.7.3 1.24.48 1.66.62.7.22 1.34.19 1.84.11.56-.08 1.7-.7 1.94-1.38.24-.68.24-1.26.16-1.38-.08-.12-.28-.2-.52-.32z"/>
  </Svg>
);

const CopyIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
    <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="#1877F2">
    <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);

const InstagramIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C13584" strokeWidth="2">
    <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <Path d="M17.5 6.5h.01" strokeLinecap="round" />
  </Svg>
);

const TikTokIcon = () => (
  <Svg width="26" height="26" viewBox="0 0 24 24" fill="#000">
    <Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.02-.04z" />
  </Svg>
);

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  postText: string;
  onPostShared?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, postText, onPostShared }) => {
  const [search, setSearch] = useState('');
  const [sentTo, setSentTo] = useState<number[]>([]);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSendTo = (id: number) => {
    setSentTo(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSendAction = () => {
    if (sentTo.length === 0) return;
    setSentTo([]);
    onPostShared?.();
    onClose();
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(`https://celebstash.app/post?text=${encodeURIComponent(postText)}`);
    onPostShared?.();
    onClose();
  };

  const handleNativeShare = async (platform: string) => {
    try {
      const result = await Share.share({
        message: `Check this out on CelebStash: ${postText}`,
        title: 'CelebStash Post',
      });
      if (result.action === Share.sharedAction) {
        onPostShared?.();
        onClose();
      }
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const socialOptions = [
    { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, action: () => handleNativeShare('whatsapp') },
    { id: 'copy', label: 'copy Link', Icon: CopyIcon, action: handleCopyLink },
    { id: 'facebook', label: 'Facebook', Icon: FacebookIcon, action: () => handleNativeShare('facebook') },
    { id: 'instagram', label: 'Instagram', Icon: InstagramIcon, action: () => handleNativeShare('instagram') },
    { id: 'tiktok', label: 'TikTok', Icon: TikTokIcon, action: () => handleNativeShare('tiktok') },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Share to</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
            <Circle cx="11" cy="11" r="8" />
            <Path d="m21 21-4.3-4.3" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#333"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Contacts grid */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          numColumns={4}
          style={styles.contactGrid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const selected = sentTo.includes(item.id);
            return (
              <TouchableOpacity style={styles.contactItem} onPress={() => handleSendTo(item.id)} activeOpacity={0.8}>
                <View style={styles.avatarContainer}>
                  <Image source={item.image} style={styles.contactAvatar} />
                  {selected && (
                    <View style={styles.tickBadge}>
                      <Svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                        <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                  )}
                </View>
                <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Send Button */}
        {sentTo.length > 0 && (
          <TouchableOpacity style={styles.sendButton} onPress={handleSendAction} activeOpacity={0.8}>
            <Text style={styles.sendButtonText}>Send to ({sentTo.length})</Text>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Social platform row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.socialRow}>
          {socialOptions.map(opt => (
            <TouchableOpacity key={opt.id} style={styles.socialItem} onPress={opt.action} activeOpacity={0.75}>
              <View style={styles.socialIconBox}>
                <opt.Icon />
              </View>
              <Text style={styles.socialLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default ShareModal;

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.78,
    paddingBottom: 24,
  },
  handle: {
    width: 50, height: 4, backgroundColor: '#ccc', borderRadius: 2,
    alignSelf: 'center', marginVertical: 16,
  },
  title: {
    textAlign: 'center', fontSize: 16, fontFamily: 'Poppins-Bold', color: '#000',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f3f3f3', borderRadius: 5,
    marginHorizontal: 16, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 14,
  },
  searchInput: {
    flex: 1, marginLeft: 8, fontSize: 16,
    fontFamily: 'Poppins-Regular', color: '#000', padding: 0,
  },
  contactGrid: { paddingHorizontal: 8, maxHeight: height * 0.35 },
  contactItem: { flex: 1, alignItems: 'center', marginBottom: 14, maxWidth: width / 4 },
  avatarContainer: { position: 'relative' },
  contactAvatar: { width: 52, height: 52, borderRadius: 26 },
  tickBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8A3FFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  contactName: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#333', marginTop: 5, textAlign: 'center' },
  sendButton: {
    backgroundColor: '#8A3FFC',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 16, marginVertical: 10 },
  socialRow: { paddingHorizontal: 12, gap: 8 },
  socialItem: { alignItems: 'center', width: 72 },
  socialIconBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  socialLabel: { fontSize: 14, fontFamily: 'Poppins-Medium', color: '#333', textAlign: 'center' },
});
