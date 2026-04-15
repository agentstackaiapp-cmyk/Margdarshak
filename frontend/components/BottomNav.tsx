import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

interface BottomNavProps {
  activeTab: 'home' | 'ask' | 'history' | 'profile';
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const router = useRouter();

  const tabs = [
    { id: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/home' },
    { id: 'ask', label: 'Ask', icon: 'help-circle-outline', activeIcon: 'help-circle', route: '/ask' },
    {
      id: 'history',
      label: 'History',
      icon: 'time-outline',
      activeIcon: 'time',
      route: '/history',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
      route: '/profile',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
            testID={`bottom-nav-${tab.id}`}
          >
            <Ionicons
              name={(isActive ? tab.activeIcon : tab.icon) as any}
              size={24}
              color={isActive ? colors.saffron : colors.textLight}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingBottom: 20,
    paddingTop: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: colors.textLight,
  },
  activeLabel: {
    color: colors.saffron,
    fontWeight: '600',
  },
});
