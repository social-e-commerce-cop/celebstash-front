import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatUser } from '@/types/chatTypes';

const PURPLE = '#7126D0';

interface MemberListItemProps {
  user: ChatUser;
  isAdmin?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
  showSelection?: boolean;
  isSelected?: boolean;
}

const MemberListItem: React.FC<MemberListItemProps> = ({
  user,
  isAdmin,
  onLongPress,
  onPress,
  showSelection,
  isSelected,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      disabled={!onPress && !onLongPress}
    >
      <View style={styles.avatarWrap}>
        <Image source={user.avatar} style={styles.avatar} />
        {user.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
        <Text style={styles.status} numberOfLines={1}>
          {user.bio ?? (user.isOnline ? 'Online' : 'Offline')}
        </Text>
      </View>
      
      {isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>Admin</Text>
        </View>
      )}

      {showSelection && (
        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
          {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  avatarWrap: { position: 'relative', marginRight: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0, width: 12, height: 12,
    borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#fff',
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#111' },
  status: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF' },
  adminBadge: { backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 },
  adminText: { fontSize: 10, fontFamily: 'Poppins-Bold', color: PURPLE },
  checkbox: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: PURPLE, borderColor: PURPLE },
});

export default MemberListItem;
