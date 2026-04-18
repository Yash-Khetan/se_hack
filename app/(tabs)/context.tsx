import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Smartphone, BookOpen, Image, Globe, MessageCircle, Zap, AlertTriangle, TrendingDown } from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Mock timeline data ---
const timeline = [
  { app: 'Notes App', icon: BookOpen, duration: '25 min', type: 'focus', time: '2:00 PM' },
  { app: 'Instagram', icon: Image, duration: '8 min', type: 'distraction', time: '2:25 PM' },
  { app: 'Chrome', icon: Globe, duration: '12 min', type: 'focus', time: '2:33 PM' },
  { app: 'Messages', icon: MessageCircle, duration: '3 min', type: 'distraction', time: '2:45 PM' },
  { app: 'Notes App', icon: BookOpen, duration: '40 min', type: 'focus', time: '2:48 PM' },
  { app: 'Instagram', icon: Image, duration: '5 min', type: 'distraction', time: '3:28 PM' },
];

// --- Squad members flow ---
const squadFlow = [
  { name: 'Aarav', focusScore: 87, color: Colors.theme.success },
  { name: 'Renee', focusScore: 72, color: Colors.theme.accent },
  { name: 'Sanjay', focusScore: 45, color: Colors.theme.danger },
  { name: 'Priya', focusScore: 91, color: Colors.theme.success },
];

// --- Cognitive Debt Ring ---
function CognitiveDebtRing({ score }: { score: number }) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? Colors.theme.success : score >= 40 ? Colors.theme.warning : Colors.theme.danger;

  return (
    <View style={styles.debtRingWrapper}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={styles.debtCenter}>
        <Text style={[styles.debtScore, { color }]}>{score}</Text>
        <Text style={styles.debtLabel}>Focus</Text>
      </View>
    </View>
  );
}

export default function ContextScreen() {
  const [isStudying, setIsStudying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isStudying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(glowOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [isStudying, pulseAnim, glowOpacity]);

  const cognitiveScore = 72; // Mocked

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Context Switch</Text>

          {/* Study Mode Toggle */}
          <Animated.View style={[styles.toggleCard, isStudying && styles.toggleCardActive, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.toggleLeft}>
              <Animated.View style={[styles.studyGlow, { opacity: glowOpacity }]} />
              <Smartphone size={28} color={isStudying ? Colors.theme.success : Colors.theme.textMuted} />
            </View>
            <View style={styles.toggleMid}>
              <Text style={styles.toggleTitle}>{isStudying ? "You're Studying" : "Start Study Mode"}</Text>
              <Text style={styles.toggleSub}>
                {isStudying ? "Context tracking active · Notifications muted" : "Toggle to begin tracking your focus"}
              </Text>
            </View>
            <Switch
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(16,185,129,0.3)' }}
              thumbColor={isStudying ? Colors.theme.success : '#f4f3f4'}
              onValueChange={setIsStudying}
              value={isStudying}
            />
          </Animated.View>

          {/* Cognitive Debt Score + Stats */}
          <View style={styles.statsRow}>
            <CognitiveDebtRing score={cognitiveScore} />
            <View style={styles.statsRight}>
              <View style={styles.statItem}>
                <Zap size={16} color={Colors.theme.accentSecondary} />
                <View>
                  <Text style={styles.statValue}>6 switches</Text>
                  <Text style={styles.statLabel}>Context changes</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <TrendingDown size={16} color={Colors.theme.danger} />
                <View>
                  <Text style={styles.statValue}>16 min lost</Text>
                  <Text style={styles.statLabel}>Cognitive debt</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <AlertTriangle size={16} color={Colors.theme.warning} />
                <View>
                  <Text style={styles.statValue}>2 deep breaks</Text>
                  <Text style={styles.statLabel}>Flow interrupted</Text>
                </View>
              </View>
            </View>
          </View>

          {/* App Timeline */}
          <Text style={styles.sectionTitle}>📱 Activity Timeline</Text>
          <View style={styles.timelineContainer}>
            {timeline.map((item, index) => {
              const Icon = item.icon;
              const isDistraction = item.type === 'distraction';
              return (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLine}>
                    <View style={[styles.timelineDot, { backgroundColor: isDistraction ? Colors.theme.danger : Colors.theme.success }]} />
                    {index < timeline.length - 1 && <View style={styles.timelineConnector} />}
                  </View>
                  <View style={[styles.timelineCard, isDistraction && styles.timelineCardDistraction]}>
                    <View style={styles.timelineCardHeader}>
                      <Icon size={16} color={isDistraction ? Colors.theme.danger : Colors.theme.success} />
                      <Text style={styles.timelineApp}>{item.app}</Text>
                      <Text style={styles.timelineTime}>{item.time}</Text>
                    </View>
                    <View style={styles.timelineCardFooter}>
                      <Text style={[styles.timelineDuration, { color: isDistraction ? Colors.theme.danger : Colors.theme.textMuted }]}>
                        {item.duration}
                      </Text>
                      {isDistraction && (
                        <View style={styles.distractionBadge}>
                          <Text style={styles.distractionText}>Distraction</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Study Squad Focus Board */}
          <Text style={styles.sectionTitle}>🏆 Squad Focus Board</Text>
          <View style={styles.card}>
            {squadFlow.map((member, i) => (
              <View key={i} style={styles.squadRow}>
                <Text style={styles.squadName}>{member.name}</Text>
                <View style={styles.squadBarTrack}>
                  <View style={[styles.squadBarFill, { width: `${member.focusScore}%`, backgroundColor: member.color }]} />
                </View>
                <Text style={[styles.squadScore, { color: member.color }]}>{member.focusScore}%</Text>
              </View>
            ))}
            <Text style={styles.squadHint}>Anonymized flow graphs · Social accountability</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 100 },
  pageTitle: { color: Colors.theme.text, fontSize: 28, fontWeight: '700', marginBottom: 20 },
  sectionTitle: { color: Colors.theme.text, fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  card: {
    backgroundColor: Colors.theme.cardSolid, borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.theme.border,
  },
  // Toggle
  toggleCard: {
    backgroundColor: Colors.theme.cardSolid, borderRadius: 20, padding: 20, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.theme.border,
  },
  toggleCardActive: { borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.05)' },
  toggleLeft: { marginRight: 16, position: 'relative' },
  studyGlow: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(16,185,129,0.2)',
    top: -11, left: -11,
  },
  toggleMid: { flex: 1 },
  toggleTitle: { color: Colors.theme.text, fontSize: 16, fontWeight: '700', marginBottom: 4 },
  toggleSub: { color: Colors.theme.textMuted, fontSize: 12, lineHeight: 18 },
  // Stats
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.theme.cardSolid, borderRadius: 20, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: Colors.theme.border, alignItems: 'center',
  },
  debtRingWrapper: { width: 120, height: 120, marginRight: 20 },
  debtCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  debtScore: { fontSize: 28, fontWeight: 'bold' },
  debtLabel: { color: Colors.theme.textMuted, fontSize: 11, marginTop: 2 },
  statsRight: { flex: 1, gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statValue: { color: Colors.theme.text, fontSize: 14, fontWeight: '600' },
  statLabel: { color: Colors.theme.textMuted, fontSize: 11 },
  // Timeline
  timelineContainer: { marginBottom: 20 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLine: { width: 24, alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 14 },
  timelineConnector: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  timelineCard: {
    flex: 1, backgroundColor: Colors.theme.cardSolid, borderRadius: 14, padding: 12,
    marginLeft: 8, marginBottom: 8, borderWidth: 1, borderColor: Colors.theme.border,
  },
  timelineCardDistraction: { borderColor: 'rgba(239,68,68,0.2)', backgroundColor: 'rgba(239,68,68,0.04)' },
  timelineCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  timelineApp: { color: Colors.theme.text, fontSize: 14, fontWeight: '600', flex: 1 },
  timelineTime: { color: Colors.theme.textMuted, fontSize: 11 },
  timelineCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineDuration: { fontSize: 13, fontWeight: '500' },
  distractionBadge: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  distractionText: { color: Colors.theme.danger, fontSize: 10, fontWeight: '700' },
  // Squad Focus
  squadRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  squadName: { color: Colors.theme.text, fontSize: 14, fontWeight: '500', width: 60 },
  squadBarTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
  squadBarFill: { height: 8, borderRadius: 4 },
  squadScore: { fontSize: 13, fontWeight: '700', width: 40, textAlign: 'right' },
  squadHint: { color: Colors.theme.textMuted, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
});
