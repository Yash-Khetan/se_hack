import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useTheme, LightColors } from '@/context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({ children, style }: Props) {
  const { isDark } = useTheme();

  const gradient = isDark
    ? Colors.theme.backgroundGradient
    : LightColors.backgroundGradient;

  return (
    <LinearGradient colors={gradient} style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
