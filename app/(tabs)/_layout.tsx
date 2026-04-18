import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BarChart2, Brain, Users, Focus } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // We force dark mode palette as per requirements
  const activeColor = Colors.theme.accent;
  const inactiveColor = Colors.theme.textMuted;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: useClientOnlyValue(false, false), // Custom headers per screen
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
          <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
        ),
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        }
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
          title: 'Analytics',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
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
        name="context"
        options={{
          title: 'Context',
          tabBarIcon: ({ color }) => <Focus size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
