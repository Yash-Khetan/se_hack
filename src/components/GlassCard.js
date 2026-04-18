import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius } from '../theme/colors';

export default function GlassCard({ children, style, gradient, borderColor, ...props }) {
  return (
    <View style={[styles.outer, style]} {...props}>
      <LinearGradient
        colors={gradient || Colors.gradientGlass}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: borderColor || Colors.glassBorder }]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 16,
  },
});
