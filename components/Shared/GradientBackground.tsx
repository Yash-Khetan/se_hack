import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import AmbientBackground from './AmbientBackground';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={Colors.theme.backgroundGradient}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
