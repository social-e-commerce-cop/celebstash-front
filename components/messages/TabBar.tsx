import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChatFilterTab } from '@/types/chatTypes';

const PURPLE = '#7126D0';

interface FilterTabBarProps {
  tabs: ChatFilterTab[];
  activeTab: ChatFilterTab;
  onTabChange: (tab: ChatFilterTab) => void;
  badgeCounts?: Partial<Record<ChatFilterTab, number>>;
}

const FilterTabBar: React.FC<FilterTabBarProps> = ({ tabs, activeTab, onTabChange, badgeCounts = {} }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {tabs.map(tab => {
      const isActive = tab === activeTab;
      const badge = badgeCounts[tab];
      return (
        <TouchableOpacity
          key={tab}
          style={[styles.chip, isActive && styles.chipActive]}
          onPress={() => onTabChange(tab)}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{tab}</Text>
          {badge != null && badge > 0 && (
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                {badge > 99 ? '99+' : badge}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  chipActive: {
    backgroundColor: PURPLE,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  badge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#6B7280',
  },
  badgeTextActive: {
    color: '#fff',
  },
});

export default FilterTabBar;
