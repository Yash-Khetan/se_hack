import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { TrendingUp, Brain, Target } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

const insights = [
  { icon: TrendingUp, text: '📈 Productivity up 12% from last week', color: Colors.theme.success },
  { icon: Brain, text: '🧠 Revise Trees — last opened yesterday', color: Colors.theme.accentSecondary },
  { icon: Target, text: '🎯 3 classes left before bunk threshold', color: Colors.theme.warning },
];

export default function DailyInsightBar() {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out + slide up
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
        slideAnim.setValue(10);
        // Fade in + slide down
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [fadeAnim, slideAnim]);

  const current = insights[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
      <View style={[styles.accentLine, { backgroundColor: current.color }]} />
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.text, { color: colors.text }]}>{current.text}</Text>
      </Animated.View>
      <View style={styles.dots}>
        {insights.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot, 
              i === currentIndex && { backgroundColor: colors.accent },
              !isDark && { backgroundColor: i === currentIndex ? colors.accent : 'rgba(0,0,0,0.1)' }
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentLine: {
    width: 3,
    height: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
