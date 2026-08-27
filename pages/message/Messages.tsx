/**
 * pages/message/Messages.tsx
 * This file is the route registered in the bottom tab navigator as "Messages".
 * It immediately redirects to MessagesScreen which is the real conversations list.
 */
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';

const Messages = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  useEffect(() => {
    // Replace so back button doesn't loop back here
    navigation.replace('MessagesScreen');
  }, [navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#7126D0" />
    </View>
  );
};

export default Messages;
