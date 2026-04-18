import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import Colors from '@/constants/Colors';
import TouchableScale from '@/components/Shared/TouchableScale';

function PulsingAvatar({ letter, color }: { letter: string; color: string }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 1500, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, [pulseAnim, opacityAnim]);

  return (
    <View style={styles.avatarWrapper}>
      {/* Pulsing ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            borderColor: color,
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={[styles.avatar, { borderColor: color }]}>
        <Text style={styles.avatarText}>{letter}</Text>
      </View>
      <View style={[styles.onlineDot, { backgroundColor: Colors.theme.success }]} />
    </View>
  );
}

export default function SquadPreview() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Squad Activity</Text>
      <View style={styles.card}>
        <View style={styles.avatarsContainer}>
          <PulsingAvatar letter="A" color={Colors.theme.accent} />
          <PulsingAvatar letter="R" color={Colors.theme.accentSecondary} />
          <PulsingAvatar letter="S" color={Colors.theme.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>3 members online</Text>
          <Text style={styles.subtitle}>Discussing Physics Notes</Text>
        </View>
        <TouchableScale style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableScale>
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginRight: 12,
    gap: 4,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.theme.cardSolid,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    color: Colors.theme.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.theme.cardSolid,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.theme.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  joinButtonText: {
    color: Colors.theme.accent,
    fontWeight: '600',
    fontSize: 14,
  },
});
