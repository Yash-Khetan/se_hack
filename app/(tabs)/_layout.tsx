import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BarChart2, Brain, Users, Focus, Activity } from 'lucide-react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: useClientOnlyValue(false, false),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView tint={isDark ? 'dark' : 'light'} intensity={80} style={StyleSheet.absoluteFill} />
        ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="second-brain"
        options={{
          title: 'Second Brain',
          tabBarIcon: ({ color }) => <Brain size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          title: 'Squad',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <Focus size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
