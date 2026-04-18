import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FocusCard() {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Shimmer sweep
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    ).start();

    // Subtle pulse on the card
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.015,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow intensity oscillation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim, pulseAnim, glowAnim]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <Animated.View style={[styles.outerGlow, { transform: [{ scale: pulseAnim }], opacity: glowAnim }]}>
      <Animated.View style={[styles.shadowContainer, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient
          colors={[Colors.theme.accent, Colors.theme.accentSecondary]}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glow ring behind icon */}
          <View style={styles.iconGlow}>
            <View style={styles.iconContainer}>
              <Clock size={26} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.label}>UP NEXT</Text>
            <Text style={styles.title}>Physics Class in 20 mins</Text>
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <AlertTriangle size={12} color={Colors.theme.warning} />
                <Text style={styles.chipText}>Low Attendance</Text>
              </View>
              <View style={[styles.chip, styles.chipGreen]}>
                <CheckCircle size={12} color={Colors.theme.success} />
                <Text style={[styles.chipText, { color: Colors.theme.success }]}>Notes Ready</Text>
              </View>
            </View>
          </View>

          {/* Shimmer overlay */}
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerTranslateX }] },
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerGlow: {
    marginBottom: 24,
    borderRadius: 24,
    // The outer glow layer
    shadowColor: Colors.theme.accentSecondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 0,
  },
  shadowContainer: {
    shadowColor: Colors.theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    overflow: 'hidden',
  },
  iconGlow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  chipGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  chipText: {
    color: Colors.theme.warning,
    fontSize: 11,
    fontWeight: '600',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: '60%',
  },
});
