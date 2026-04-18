import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../theme/colors';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating orb animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 4000, useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 4000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Entrance animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 800, delay: 200, useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0, duration: 700, delay: 300, useNativeDriver: true,
      }),
    ]).start();

    // Pulse for logo glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orb1Translate = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });
  const orb2Translate = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });

  return (
    <LinearGradient colors={Colors.gradientLanding} style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Floating Orbs */}
      <Animated.View style={[styles.orb, styles.orb1, {
        transform: [{ translateY: orb1Translate }, { translateX: orb1Translate }],
      }]} />
      <Animated.View style={[styles.orb, styles.orb2, {
        transform: [{ translateY: orb2Translate }],
      }]} />
      <Animated.View style={[styles.orb, styles.orb3]} />

      {/* Logo Section */}
      <Animated.View style={[styles.logoSection, { transform: [{ scale: logoScale }] }]}>
        <Animated.View style={[styles.logoGlow, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={Colors.gradientPrimary}
            style={styles.logoCircle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="planet" size={40} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.logoText}>SyncSpace</Text>
        <Text style={styles.tagline}>Real-Time Student Collaboration Hub</Text>
      </Animated.View>

      {/* Feature Pills */}
      <Animated.View style={[styles.featuresRow, { opacity: fadeAnim }]}>
        {[
          { icon: 'videocam', label: 'HD Video' },
          { icon: 'chatbubbles', label: 'Live Chat' },
          { icon: 'brush', label: 'Whiteboard' },
          { icon: 'code-slash', label: 'Code Share' },
        ].map((f, i) => (
          <View key={i} style={styles.featurePill}>
            <Ionicons name={f.icon} size={14} color={Colors.primaryLight} />
            <Text style={styles.featureText}>{f.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.actions, {
        opacity: fadeAnim,
        transform: [{ translateY: slideUp }],
      }]}>
        {/* Create Room Button */}
        <TouchableOpacity
          style={styles.btnOuter}
          onPress={() => navigation.navigate('CreateRoom')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnPrimary}
          >
            <View style={styles.btnIconWrap}>
              <Ionicons name="add-circle" size={22} color="#fff" />
            </View>
            <View style={styles.btnTextWrap}>
              <Text style={styles.btnTitle}>Create Room</Text>
              <Text style={styles.btnSub}>Start a new collaboration session</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Join Room Button */}
        <TouchableOpacity
          style={styles.btnOuter}
          onPress={() => navigation.navigate('JoinRoom')}
          activeOpacity={0.85}
        >
          <View style={styles.btnSecondary}>
            <View style={styles.btnIconWrap2}>
              <Ionicons name="enter" size={22} color={Colors.primaryLight} />
            </View>
            <View style={styles.btnTextWrap}>
              <Text style={styles.btnTitle}>Join Room</Text>
              <Text style={styles.btnSub2}>Enter with room code & password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Decoration */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <View style={styles.divider} />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>12K+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>5K+</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>99%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
        </View>
        <Text style={styles.version}>v2.0 · Built for Hackathons 🚀</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  // Floating orbs
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 200, height: 200,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    top: -40, right: -60,
  },
  orb2: {
    width: 150, height: 150,
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
    bottom: 100, left: -50,
  },
  orb3: {
    width: 100, height: 100,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    top: height * 0.35, right: -20,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoGlow: {
    marginBottom: 16,
    ...Shadows.glow,
  },
  logoCircle: {
    width: 80, height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...Typography.hero,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Feature pills
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 36,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
    gap: 5,
  },
  featureText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },

  // Action buttons
  actions: {
    width: '100%',
    gap: 14,
    marginBottom: 32,
  },
  btnOuter: {
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.xl,
    gap: 14,
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 14,
  },
  btnIconWrap: {
    width: 42, height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconWrap2: {
    width: 42, height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextWrap: {
    flex: 1,
  },
  btnTitle: {
    ...Typography.button,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  btnSub: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
  },
  btnSub2: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  // Bottom
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(108, 92, 231, 0.3)',
    marginBottom: 20,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    ...Typography.h3,
    color: Colors.primaryLight,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  statDot: {
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
  },
  version: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
