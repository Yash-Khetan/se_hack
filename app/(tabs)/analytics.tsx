import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Zap, Activity, AlertCircle, ShieldCheck, History, Info } from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';
import { useFocus, FocusEvent } from '@/context/FocusContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DebtGauge({ score }: { score: number }) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Color interpolates from success (low debt) to danger (high debt)
  const color = score > 60 ? Colors.theme.danger : score > 30 ? Colors.theme.warning : Colors.theme.success;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} fill="none" />
        <Circle 
          cx={size / 2} cy={size / 2} r={radius} 
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={[styles.gaugeValue, { color }]}>{score}</Text>
        <Text style={styles.gaugeLabel}>Cognitive Debt</Text>
      </View>
    </View>
  );
}

function TimelineItem({ event, isLast }: { event: FocusEvent, isLast: boolean }) {
  const isFocus = event.type === 'focus';
  
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIndicator}>
        <View style={[styles.timelineDot, { backgroundColor: isFocus ? Colors.theme.success : Colors.theme.danger }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineApp}>{event.app}</Text>
          <Text style={styles.timelineTime}>{event.timeLabel}</Text>
        </View>
        <Text style={styles.timelineDesc}>{event.description}</Text>
      </View>
    </View>
  );
}

export default function FocusScreen() {
  const { cognitiveDebt, focusEvents, isMonitoring, toggleMonitoring } = useFocus();

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Lumina Focus</Text>
            <View style={[styles.statusPill, isMonitoring ? styles.statusActive : styles.statusPaused]}>
              <View style={[styles.statusDot, isMonitoring && styles.statusDotPulse]} />
              <Text style={styles.statusText}>{isMonitoring ? 'Monitoring' : 'Paused'}</Text>
            </View>
          </View>

          {/* Core Sassy Header */}
          <View style={styles.heroCard}>
            <Text style={styles.heroQuote}>"You said you were studying. Your phone disagrees."</Text>
            <DebtGauge score={cognitiveDebt} />
            <View style={styles.impactBox}>
              <AlertCircle size={16} color={Colors.theme.warning} />
              <Text style={styles.impactText}>
                Your task-switching behavior has increased cognitive load by {Math.round(cognitiveDebt * 0.8)}% this hour.
              </Text>
            </View>
          </View>

          {/* System Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <History size={20} color={Colors.theme.accent} />
              <Text style={styles.infoTitle}>Context Switch Engine</Text>
            </View>
            <Text style={styles.infoText}>
              Lumina monitors foreground app changes and screen events to build a real-time task-switching timeline. 
              It calculates a <Text style={{fontWeight:'700', color: Colors.theme.accent}}>Cognitive Debt Score</Text> using an exponential decay model, penalizing rapid context switches during deep work sessions.
            </Text>
          </View>

          {/* Timeline */}
          <Text style={styles.sectionTitle}>Switching Timeline</Text>
          <View style={styles.timelineCard}>
            {focusEvents.map((event, idx) => (
              <TimelineItem 
                key={event.id} 
                event={event} 
                isLast={idx === focusEvents.length - 1} 
              />
            ))}
          </View>

          <TouchableOpacity style={styles.settingsBtn} onPress={toggleMonitoring}>
            <Text style={styles.settingsBtnText}>
              {isMonitoring ? 'Disable Lumina Monitor' : 'Enable Lumina Monitor'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { color: Colors.theme.text, fontSize: 24, fontWeight: '700' },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 8 },
  statusActive: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  statusPaused: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.theme.textMuted },
  statusDotPulse: { backgroundColor: Colors.theme.success },
  statusText: { color: Colors.theme.text, fontSize: 11, fontWeight: '700' },
  // Hero
  heroCard: { backgroundColor: Colors.theme.cardSolid, borderRadius: 32, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: Colors.theme.border, marginBottom: 20 },
  heroQuote: { color: Colors.theme.text, fontSize: 18, fontWeight: '600', textAlign: 'center', fontStyle: 'italic', marginBottom: 25, lineHeight: 26 },
  gaugeContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center' },
  gaugeCenter: { position: 'absolute', alignItems: 'center' },
  gaugeValue: { fontSize: 48, fontWeight: '800' },
  gaugeLabel: { color: Colors.theme.textMuted, fontSize: 11, fontWeight: '600', marginTop: -4 },
  impactBox: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(245,166,35,0.08)', padding: 15, borderRadius: 16, marginTop: 25, borderWidth: 1, borderColor: 'rgba(245,166,35,0.15)' },
  impactText: { flex: 1, color: Colors.theme.warning, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  // Info
  infoCard: { backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: 24, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.1)' },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  infoTitle: { color: Colors.theme.text, fontSize: 16, fontWeight: '700' },
  infoText: { color: Colors.theme.textMuted, fontSize: 13, lineHeight: 21 },
  // Timeline
  sectionTitle: { color: Colors.theme.text, fontSize: 18, fontWeight: '700', marginBottom: 15 },
  timelineCard: { backgroundColor: Colors.theme.cardSolid, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.theme.border },
  timelineRow: { flexDirection: 'row', gap: 15 },
  timelineIndicator: { alignItems: 'center', width: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
  timelineLine: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 25 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timelineApp: { color: Colors.theme.text, fontSize: 15, fontWeight: '700' },
  timelineTime: { color: Colors.theme.textMuted, fontSize: 11 },
  timelineDesc: { color: Colors.theme.textMuted, fontSize: 12, lineHeight: 18 },
  // Btn
  settingsBtn: { alignSelf: 'center', marginTop: 10, padding: 15 },
  settingsBtnText: { color: Colors.theme.danger, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' },
});
