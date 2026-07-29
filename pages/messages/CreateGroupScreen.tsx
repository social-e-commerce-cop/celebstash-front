import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { MOCK_USERS } from '@/data/mockChatData';
import MemberListItem from '@/components/messages/MemberListItem';

const PURPLE = '#7126D0';
const { width } = Dimensions.get('window');

export default function CreateGroupScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');

  const filteredUsers = MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedUserIds.length > 0) {
      setStep(2);
    } else if (step === 2 && groupName.trim()) {
      // In a real app, you would create the group here and get the new conversation ID.
      // For now, we just navigate back to messages or to a mock chat.
      navigation.navigate('MessagesScreen'); // Or navigate to the new chat screen directly
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === 1 ? 'Add Members' : 'New Group'}</Text>
        <TouchableOpacity 
          style={styles.iconBtn} 
          onPress={handleNext}
          disabled={(step === 1 && selectedUserIds.length === 0) || (step === 2 && !groupName.trim())}
        >
          <Text style={[styles.headerAction, ((step === 1 && selectedUserIds.length > 0) || (step === 2 && groupName.trim())) && styles.headerActionActive]}>
            {step === 1 ? 'Next' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {step === 1 ? (
        // ── Step 1: Select Members ──
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {selectedUserIds.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll} contentContainerStyle={styles.selectedContent}>
              {selectedUserIds.map(id => {
                const user = MOCK_USERS.find(u => u.id === id);
                if (!user) return null;
                return (
                  <View key={id} style={styles.selectedAvatarWrap}>
                    <Image source={user.avatar} style={styles.selectedAvatar} />
                    <TouchableOpacity style={styles.removeSelectedBtn} onPress={() => toggleUser(id)}>
                      <Ionicons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.selectedName} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <FlatList
            data={filteredUsers}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <MemberListItem
                user={item}
                showSelection
                isSelected={selectedUserIds.includes(item.id)}
                onPress={() => toggleUser(item.id)}
              />
            )}
          />
        </>
      ) : (
        // ── Step 2: Group Info ──
        <View style={styles.step2Container}>
          <TouchableOpacity style={styles.groupAvatarBtn}>
            <View style={styles.groupAvatarPlaceholder}>
              <Ionicons name="camera" size={32} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Group Subject"
            value={groupName}
            onChangeText={setGroupName}
            maxLength={25}
          />
          <Text style={styles.charCount}>{groupName.length}/25</Text>
          <Text style={styles.memberCountLabel}>Members: {selectedUserIds.length}</Text>
          <View style={styles.memberGrid}>
             {selectedUserIds.slice(0, 8).map(id => {
                const user = MOCK_USERS.find(u => u.id === id);
                if (!user) return null;
                return (
                  <View key={id} style={{ alignItems: 'center', width: (width - 40) / 4, marginBottom: 12 }}>
                    <Image source={user.avatar} style={{ width: 44, height: 44, borderRadius: 22, marginBottom: 4 }} />
                    <Text style={{ fontSize: 11, fontFamily: 'Poppins-Regular', color: '#6B7280' }} numberOfLines={1}>{user.name.split(' ')[0]}</Text>
                  </View>
                );
              })}
              {selectedUserIds.length > 8 && (
                 <View style={{ alignItems: 'center', width: (width - 40) / 4, marginBottom: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontFamily: 'Poppins-Bold', color: '#9CA3AF' }}>+{selectedUserIds.length - 8}</Text>
                    </View>
                 </View>
              )}
          </View>
        </View>
      )}
    </View>
  );
}

// Need to import ScrollView for Step 1
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#111' },
  headerAction: { fontSize: 15, fontFamily: 'Poppins-Bold', color: '#9CA3AF' },
  headerActionActive: { color: PURPLE },

  // Step 1
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', margin: 16, borderRadius: 10, paddingHorizontal: 12, height: 40, gap: 8 },
  searchInput: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#111' },
  selectedScroll: { maxHeight: 90, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  selectedContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 16, alignItems: 'flex-start' },
  selectedAvatarWrap: { position: 'relative', alignItems: 'center', width: 56 },
  selectedAvatar: { width: 48, height: 48, borderRadius: 24 },
  removeSelectedBtn: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  selectedName: { fontSize: 11, fontFamily: 'Poppins-Medium', color: '#374151', marginTop: 4, textAlign: 'center' },

  // Step 2
  step2Container: { alignItems: 'center', paddingTop: 30, paddingHorizontal: 20 },
  groupAvatarBtn: { marginBottom: 24 },
  groupAvatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  groupNameInput: { width: '100%', borderBottomWidth: 1, borderBottomColor: PURPLE, fontSize: 16, fontFamily: 'Poppins-Medium', color: '#111', paddingVertical: 8, textAlign: 'center' },
  charCount: { alignSelf: 'flex-end', fontSize: 11, fontFamily: 'Poppins-Regular', color: '#9CA3AF', marginTop: 4 },
  memberCountLabel: { alignSelf: 'flex-start', fontSize: 13, fontFamily: 'Poppins-Bold', color: '#374151', marginTop: 24, marginBottom: 12 },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
