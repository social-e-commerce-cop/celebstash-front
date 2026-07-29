import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MOCK_CONVERSATIONS } from '@/data/mockChatData';
import MemberListItem from '@/components/messages/MemberListItem';
import { ChatUser } from '@/types/chatTypes';

const PURPLE = '#7126D0';
const { width } = Dimensions.get('window');

export default function GroupSettingsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const conversationId = route.params?.conversationId ?? 'c3';
  const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId && c.type === 'group');

  if (!conv || !conv.groupInfo) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text>Group not found</Text>
      </View>
    );
  }

  const [groupName, setGroupName] = useState(conv.groupInfo.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);

  const isAdmin = (userId: string) => conv.groupInfo!.adminIds.includes(userId);
  const amIAdmin = isAdmin('me');

  const handleMemberLongPress = (user: ChatUser) => {
    if (user.id === 'me' || !amIAdmin) return;
    setSelectedUser(user);
    setActionMenuVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.topSection}>
      <TouchableOpacity style={styles.avatarBtn}>
        <Image source={conv.groupInfo!.avatar} style={styles.groupAvatar} />
        {amIAdmin && (
          <View style={styles.editAvatarBadge}>
            <Ionicons name="camera" size={14} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
      
      {isEditingName ? (
        <View style={styles.editNameRow}>
          <TextInput
            style={styles.nameInput}
            value={groupName}
            onChangeText={setGroupName}
            autoFocus
            maxLength={25}
          />
          <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.saveNameBtn}>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.nameRow}>
          <Text style={styles.groupName}>{groupName}</Text>
          {amIAdmin && (
            <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.editNameIcon}>
              <Ionicons name="pencil" size={16} color={PURPLE} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <Text style={styles.groupMeta}>Created by {conv.groupInfo!.createdBy === 'me' ? 'You' : 'Admin'}, {new Date(conv.groupInfo!.createdAt).toLocaleDateString()}</Text>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{conv.participants.length} Members</Text>
        {amIAdmin && (
          <TouchableOpacity style={styles.addMemberBtn}>
            <Ionicons name="person-add" size={14} color={PURPLE} />
            <Text style={styles.addMemberText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Settings</Text>
        <View style={styles.iconBtn} />
      </View>

      <FlatList
        data={conv.participants}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <MemberListItem
            user={item}
            isAdmin={isAdmin(item.id)}
            onLongPress={() => handleMemberLongPress(item)}
          />
        )}
      />

      <Modal visible={actionMenuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setActionMenuVisible(false)}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{selectedUser?.name}</Text>
            
            <TouchableOpacity style={styles.actionRow} onPress={() => setActionMenuVisible(false)}>
              <Ionicons name="chatbubble-outline" size={20} color="#374151" />
              <Text style={styles.actionText}>Message {selectedUser?.name.split(' ')[0]}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={() => setActionMenuVisible(false)}>
              <Ionicons name={isAdmin(selectedUser?.id ?? '') ? "arrow-down" : "arrow-up"} size={20} color="#374151" />
              <Text style={styles.actionText}>
                {isAdmin(selectedUser?.id ?? '') ? 'Dismiss as Admin' : 'Make Group Admin'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow} onPress={() => {
              setActionMenuVisible(false);
              Alert.alert('Remove', `Remove ${selectedUser?.name} from group?`);
            }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Remove from Group</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },

  topSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 12 },
  avatarBtn: { position: 'relative', marginBottom: 16 },
  groupAvatar: { width: 100, height: 100, borderRadius: 50 },
  editAvatarBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 32, height: 32,
    borderRadius: 16, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  groupName: { fontSize: 20, fontFamily: 'Poppins-Bold', color: '#111' },
  editNameIcon: { marginLeft: 8, padding: 4 },
  editNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingHorizontal: 20 },
  nameInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: PURPLE, fontSize: 20, fontFamily: 'Poppins-Bold', color: '#111', paddingVertical: 4, textAlign: 'center' },
  saveNameBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  groupMeta: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginBottom: 24 },
  
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, marginBottom: 8, backgroundColor: '#F9FAFB', paddingVertical: 8 },
  sectionTitle: { fontSize: 13, fontFamily: 'Poppins-Bold', color: '#6B7280', textTransform: 'uppercase' },
  addMemberBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addMemberText: { fontSize: 13, fontFamily: 'Poppins-Bold', color: PURPLE },

  // Action Menu
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40, paddingTop: 12, paddingHorizontal: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#111', marginBottom: 16, textAlign: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  actionText: { fontSize: 15, fontFamily: 'Poppins-Medium', color: '#374151' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});
