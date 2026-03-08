import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: '点餐',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🍽️</Text>,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: '好友',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👥</Text>,
        }}
      />
    </Tabs>
  );
}
