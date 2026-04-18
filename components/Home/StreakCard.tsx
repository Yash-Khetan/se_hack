import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Flame } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function StreakCard() {
  const flameAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [flameAnim]);

  const streakDays = 7;
  const weekData = [true, true, true, true, true, true, true]; // last 7 days completed

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🔥 Streak</Text>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <Animated.View style={[styles.flameCircle, { transform: [{ scale: flameAnim }] }]}>
            <Flame size={28} color="#FF6B2B" />
          </Animated.View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{streakDays} days</Text>
            <Text style={styles.streakSub}>All tasks completed daily</Text>
          </View>
        </View>

        {/* Week dots */}
        <View style={styles.weekRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={styles.dayCol}>
              <View style={[
                styles.dayDot,
                weekData[i] ? styles.dayDotDone : styles.dayDotMissed,
              ]} />
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.motivationText}>
          Keep going! You're on your longest streak yet. 💪
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.theme.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  flameCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 107, 43, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    color: '#FF6B2B',
    fontSize: 24,
    fontWeight: 'bold',
  },
  streakSub: {
    color: Colors.theme.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dayDotDone: {
    backgroundColor: 'rgba(255, 107, 43, 0.25)',
    borderWidth: 2,
    borderColor: '#FF6B2B',
  },
  dayDotMissed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dayLabel: {
    color: Colors.theme.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  motivationText: {
    color: Colors.theme.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
