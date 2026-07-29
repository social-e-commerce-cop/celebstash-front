import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageAction } from '@/types/chatTypes';

const PURPLE = '#7126D0';

interface ActionItem {
  action: MessageAction;
  icon: any;
  label: string;
  danger?: boolean;
}

interface MessageActionSheetProps {
  visible: boolean;
  onClose: () => void;
  onAction: (action: MessageAction) => void;
  isOwnMessage: boolean;
  isRecent?: boolean; // within 15 min → can delete for everyone
  isPinned?: boolean;
  isStarred?: boolean;
}

const MessageActionSheet: React.FC<MessageActionSheetProps> = ({
  visible,
  onClose,
  onAction,
  isOwnMessage,
  isRecent = false,
  isPinned = false,
  isStarred = false,
}) => {
  const actions: ActionItem[] = [
    { action: 'reply', icon: 'arrow-undo-outline', label: 'Reply' },
    { action: 'forward', icon: 'arrow-redo-outline', label: 'Forward' },
    { action: 'copy', icon: 'copy-outline', label: 'Copy' },
    ...(isOwnMessage ? [{ action: 'edit' as MessageAction, icon: 'create-outline', label: 'Edit' }] : []),
    { action: 'pin', icon: isPinned ? 'pin' : 'pin-outline', label: isPinned ? 'Unpin' : 'Pin' },
    { action: 'star', icon: isStarred ? 'star' : 'star-outline', label: isStarred ? 'Unstar' : 'Star' },
    { action: 'react', icon: 'happy-outline', label: 'React' },
    { action: 'delete_for_me', icon: 'trash-outline', label: 'Delete for Me', danger: true },
    ...(isOwnMessage && isRecent
      ? [{ action: 'delete_for_everyone' as MessageAction, icon: 'trash-outline', label: 'Delete for Everyone', danger: true }]
      : []),
    ...(!isOwnMessage ? [{ action: 'report' as MessageAction, icon: 'flag-outline', label: 'Report', danger: true }] : []),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {actions.map((item, i) => (
            <React.Fragment key={item.action}>
              {item.danger && i > 0 && !actions[i - 1].danger && (
                <View style={styles.divider} />
              )}
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => onAction(item.action)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.danger ? '#EF4444' : '#374151'}
                />
                <Text style={[styles.actionLabel, item.danger && styles.dangerText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: 14,
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: '#374151',
  },
  dangerText: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
});

export default MessageActionSheet;
