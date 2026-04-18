import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface Props {
  onPress?: () => void;
}

export default function FloatingAIButton({ onPress }: Props) {
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.8, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
      ])
    ).start();

    // Subtle pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [glowAnim, scaleAnim]);

  return (
    <View style={styles.wrapper}>
      {/* Outer glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          { opacity: glowAnim, transform: [{ scale: scaleAnim }] },
        ]}
      />
      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
        <Sparkles size={24} color="#FFFFFF" />
        <Text style={styles.label}>Ask Lumina</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.theme.accent,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.theme.accent,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    shadowColor: Colors.theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
