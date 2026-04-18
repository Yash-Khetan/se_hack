import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, ArrowRight, Link, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useStress } from '@/context/StressContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LEVEL_CONFIG = {
  low:    { label: 'LOW', emoji: '🟢', gradient: ['#059669', '#10B981'] as const, glow: '#10B981', dot: '#10B981' },
  medium: { label: 'MODERATE', emoji: '🟡', gradient: ['#D97706', '#F59E0B'] as const, glow: '#F59E0B', dot: '#F59E0B' },
  high:   { label: 'HIGH', emoji: '🔴', gradient: ['#B91C1C', '#EF4444'] as const, glow: '#EF4444', dot: '#EF4444' },
};

export default function StressMeterCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { todayStress, isConnected, isLoading, connectGoogle, insights, refreshData } = useStress();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const dotAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  const level = todayStress?.level ?? 'low';
  const cfg = LEVEL_CONFIG[level];
  const isHigh = level === 'high';

  useEffect(() => {
    // Shared pulse
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: isHigh ? 1.02 : 1.01, duration: 1800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
    ])).start();

    // Glow breathe
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: isHigh ? 0.8 : 0.5, duration: 2000, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.2, duration: 2000, useNativeDriver: true }),
    ])).start();

    // Status dot blink (high only)
    if (isHigh) {
      Animated.loop(Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])).start();
    } else {
      dotAnim.setValue(1);
    }

    // Shimmer sweep
    Animated.loop(Animated.timing(shimmerAnim, { toValue: 1, duration: 2800, useNativeDriver: true })).start();
  }, [level]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  const firstInsight = insights[0]?.message ?? 'Analyzing your academic schedule…';

  if (isLoading) {
    return (
      <View style={[styles.loadingCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Analyzing your schedule…</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.outerGlow, { shadowColor: cfg.glow, opacity: glowAnim }]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LinearGradient colors={cfg.gradient} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>

          {/* Shimmer */}
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslateX }] }]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Top row */}
          <View style={styles.topRow}>
            <View style={styles.iconWrap}>
              <Brain size={22} color="#fff" />
            </View>
            <View style={styles.labelBlock}>
              <Text style={styles.cardLabel}>STRESS METER</Text>
              <View style={styles.levelRow}>
                <Animated.View style={[styles.dot, { backgroundColor: cfg.dot, opacity: dotAnim }]} />
                <Text style={styles.levelText}>{cfg.emoji} {cfg.label}</Text>
              </View>
            </View>
            {!isConnected && (
              <TouchableOpacity style={styles.connectBtn} onPress={connectGoogle}>
                <Link size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.connectText}>Connect</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Score bar */}
          <View style={styles.scoreBarBg}>
            <View style={[styles.scoreBarFill, { width: `${((todayStress?.score ?? 0) / 10) * 100}%` }]} />
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreText}>Score: {todayStress?.score ?? 0}/10</Text>
            <Text style={styles.scoreText}>{todayStress?.events?.length ?? 0} event(s) today</Text>
          </View>

          {/* Insight */}
          <Text style={styles.insightText} numberOfLines={2}>{firstInsight}</Text>

          {/* CTA */}
          <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/stress-heatmap' as any)}>
            <Text style={styles.ctaText}>View Details</Text>
            <ArrowRight size={16} color="rgba(255,255,255,0.95)" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1,
    flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center',
  },
  loadingText: { fontSize: 15, fontWeight: '500' },
  outerGlow: {
    marginBottom: 24, borderRadius: 24,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 28, elevation: 0,
  },
  card: {
    borderRadius: 24, padding: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  shimmer: { ...StyleSheet.absoluteFillObject, width: '60%' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  labelBlock: { flex: 1 },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  levelText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  connectText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  scoreBarBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 3 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  scoreText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  insightText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 20, fontWeight: '500', marginBottom: 16 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 14, paddingVertical: 12, gap: 6,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
