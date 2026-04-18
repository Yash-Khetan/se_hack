import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Dimensions, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  FadeInDown, FadeOut, Layout,
  useSharedValue, useAnimatedProps, withTiming,
} from 'react-native-reanimated';
import {
  Brain, Play, Square, Activity, AlertTriangle,
  Clock, History, TrendingUp, Zap, ChevronDown, ChevronUp,
} from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import { useFocus, FocusSessionData, ExitEvent } from '@/context/FocusContext';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatSessionTime(ts?: number) {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

function scoreColor(score: number, colors: any) {
  if (score >= 70) return colors.success;
  if (score >= 40) return colors.warning;
  return colors.danger;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const {
    isActive, startSession, endSession,
    elapsedSeconds, timesDrifted, minutesAway, activeSession,
    summarySessions, clearSummary,
  } = useFocus();

  const [view, setView] = useState<'active' | 'history'>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Force "active" view during or just after a session
  useEffect(() => {
    if (isActive) setView('active');
  }, [isActive]);

  // SVG Ring
  const size = SCREEN_WIDTH * 0.72;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (isActive && activeSession) {
      const prog = Math.min(elapsedSeconds / activeSession.target_duration, 1);
      animatedProgress.value = withTiming(prog, { duration: 1000 });
    } else if (!isActive) {
      animatedProgress.value = withTiming(0, { duration: 600 });
    }
  }, [elapsedSeconds, isActive]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - animatedProgress.value * circumference,
  }));

  const handleStart = () => startSession(25);
  const handleEnd = async () => { await endSession(); setView('history'); };

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const totalSessions = summarySessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(summarySessions.reduce((s, x) => s + x.score, 0) / totalSessions)
    : 0;
  const totalFocusSeconds = summarySessions.reduce((s, x) => s + (x.active_time || 0), 0);
  const totalAwaySeconds = summarySessions.reduce((s, x) => s + (x.inactive_time || 0), 0);

  // ── Renders ────────────────────────────────────────────────────────────────
  const renderTabToggle = () => (
    <View style={[styles.tabToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
      <TouchableOpacity
        style={[styles.tabBtn, view === 'active' && { backgroundColor: colors.accent }]}
        onPress={() => setView('active')}
      >
        <Zap size={14} color={view === 'active' ? '#fff' : colors.textMuted} />
        <Text style={[styles.tabBtnText, { color: view === 'active' ? '#fff' : colors.textMuted }]}>Active</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabBtn, view === 'history' && { backgroundColor: colors.accent }]}
        onPress={() => setView('history')}
      >
        <History size={14} color={view === 'history' ? '#fff' : colors.textMuted} />
        <Text style={[styles.tabBtnText, { color: view === 'history' ? '#fff' : colors.textMuted }]}>History</Text>
        {totalSessions > 0 && (
          <View style={[styles.badge, { backgroundColor: view === 'history' ? 'rgba(255,255,255,0.3)' : colors.accent }]}>
            <Text style={styles.badgeText}>{totalSessions}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderActiveView = () => (
    <>
      {!isActive && (
        <Animated.View entering={FadeInDown} exiting={FadeOut} style={styles.readyContainer}>
          <Brain size={64} color={colors.accent} strokeWidth={1} style={{ marginBottom: 24 }} />
          <Text style={[styles.readyTitle, { color: colors.text }]}>Ready to focus?</Text>
          <Text style={[styles.readyDesc, { color: colors.textMuted }]}>
            We track your exits in real time. Every drift is recorded with an exact timestamp.
          </Text>
        </Animated.View>
      )}

      {isActive && (
        <Animated.View entering={FadeInDown.springify()} layout={Layout.springify()} style={styles.ringContainer}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2} cy={size / 2} r={radius}
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              strokeWidth={strokeWidth} fill="none"
            />
            <AnimatedCircle
              cx={size / 2} cy={size / 2} r={radius}
              stroke={colors.accent} strokeWidth={strokeWidth} fill="none"
              strokeDasharray={circumference} strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.ringInner}>
            <Text style={[styles.timerText, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
            <Text style={[styles.timerLabel, { color: colors.textMuted }]}>Session elapsed</Text>
          </View>
        </Animated.View>
      )}

      {isActive && (
        <Animated.View entering={FadeInDown.delay(100)} layout={Layout.springify()} style={styles.metricsWrapper}>
          {[
            { icon: <Clock size={18} color={colors.accent} />, value: formatTime(elapsedSeconds), label: 'Focused' },
            { icon: <Activity size={18} color={colors.warning} />, value: `${timesDrifted}`, label: 'App Exits' },
            { icon: <AlertTriangle size={18} color={colors.danger} />, value: `${minutesAway}m`, label: 'Away' },
          ].map((m, i) => (
            <View key={i} style={[styles.metricCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
              {m.icon}
              <Text style={[styles.metricValue, { color: colors.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{m.label}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      <TouchableOpacity
        style={[
          styles.mainBtn,
          {
            backgroundColor: isActive ? 'rgba(239,68,68,0.1)' : colors.accent,
            borderColor: isActive ? colors.danger : 'transparent',
          },
        ]}
        onPress={isActive ? handleEnd : handleStart}
      >
        {isActive
          ? <Square size={20} color={colors.danger} />
          : <Play size={20} fill="#fff" color="#fff" />
        }
        <Text style={[styles.mainBtnText, { color: isActive ? colors.danger : '#fff' }]}>
          {isActive ? 'End Session' : 'Start Session'}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderExitEvents = (events: ExitEvent[]) => {
    if (!events || events.length === 0) {
      return (
        <View style={styles.exitRow}>
          <Text style={[styles.exitLabel, { color: colors.success }]}>✓ Zero exits — clean session</Text>
        </View>
      );
    }
    return events.map((ev, i) => (
      <View key={i} style={[styles.exitRow, { borderLeftColor: colors.warning }]}>
        <Text style={[styles.exitLabel, { color: colors.textMuted }]}>{ev.label}</Text>
      </View>
    ));
  };

  const renderSessionCard = (session: FocusSessionData, index: number) => {
    const sc = scoreColor(session.score, colors);
    const isExpanded = expandedId === session.id;

    return (
      <Animated.View
        key={session.id || index}
        entering={FadeInDown.delay(index * 80)}
        layout={Layout.springify()}
        style={[styles.sessionCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}
      >
        {/* Card header */}
        <TouchableOpacity
          style={styles.sessionCardHeader}
          onPress={() => setExpandedId(isExpanded ? null : (session.id || String(index)))}
          activeOpacity={0.8}
        >
          <View style={[styles.scorePill, { backgroundColor: sc + '22', borderColor: sc }]}>
            <Text style={[styles.scorePillText, { color: sc }]}>{session.score}</Text>
          </View>
          <View style={styles.sessionMeta}>
            <Text style={[styles.sessionTitle, { color: colors.text }]}>
              Focus Session {summarySessions.length - index}
            </Text>
            <Text style={[styles.sessionTime, { color: colors.textMuted }]}>
              {formatSessionTime(session.completed_at)} · {formatTime(session.active_time || 0)} active
            </Text>
          </View>
          {isExpanded
            ? <ChevronUp size={18} color={colors.textMuted} />
            : <ChevronDown size={18} color={colors.textMuted} />
          }
        </TouchableOpacity>

        {/* Expanded detail */}
        {isExpanded && (
          <Animated.View entering={FadeInDown} style={styles.sessionDetail}>
            {/* Stats row */}
            <View style={styles.detailStatsRow}>
              {[
                { label: 'Active', value: formatTime(session.active_time || 0) },
                { label: 'Away', value: formatTime(session.inactive_time || 0) },
                { label: 'Exits', value: `${session.context_switch_count}` },
                { label: 'Score', value: `${session.score}` },
              ].map((s, i) => (
                <View key={i} style={styles.detailStat}>
                  <Text style={[styles.detailStatNum, { color: colors.text }]}>{s.value}</Text>
                  <Text style={[styles.detailStatLabel, { color: colors.textMuted }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Insight */}
            <View style={[styles.insightBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
              <Text style={[styles.insightText, { color: colors.text }]}>"{session.insight}"</Text>
            </View>

            {/* Exit timeline */}
            <Text style={[styles.timelineTitle, { color: colors.textMuted }]}>EXIT TIMELINE</Text>
            {renderExitEvents(session.exit_events || [])}
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const renderHistoryView = () => (
    <>
      {/* Aggregate header */}
      {totalSessions > 0 && (
        <Animated.View
          entering={FadeInDown}
          style={[styles.aggregateCard, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '55' }]}
        >
          <View style={styles.aggregateRow}>
            <TrendingUp size={20} color={colors.accent} />
            <Text style={[styles.aggregateTitle, { color: colors.text }]}>Today's Focus Summary</Text>
          </View>
          <View style={styles.aggregateStats}>
            {[
              { label: 'Sessions', value: `${totalSessions}` },
              { label: 'Avg Score', value: `${avgScore}` },
              { label: 'Focus Time', value: formatTime(totalFocusSeconds) },
              { label: 'Away Time', value: formatTime(totalAwaySeconds) },
            ].map((s, i) => (
              <View key={i} style={styles.aggStat}>
                <Text style={[styles.aggStatNum, { color: colors.accent }]}>{s.value}</Text>
                <Text style={[styles.aggStatLabel, { color: colors.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Session cards */}
      {summarySessions.length === 0 ? (
        <View style={styles.emptyHistory}>
          <History size={48} color={colors.textMuted} strokeWidth={1} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No sessions yet today</Text>
          <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>Complete a focus session to see your history here</Text>
        </View>
      ) : (
        summarySessions.map((s, i) => renderSessionCard(s, i))
      )}

      {/* Start new session button */}
      <TouchableOpacity
        style={[styles.mainBtn, { backgroundColor: colors.accent, marginTop: 8 }]}
        onPress={() => { setView('active'); }}
      >
        <Play size={18} fill="#fff" color="#fff" />
        <Text style={[styles.mainBtnText, { color: '#fff' }]}>Start New Session</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Cognitive Focus</Text>
        </View>

        {renderTabToggle()}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {view === 'active' ? renderActiveView() : renderHistoryView()}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },

  // Tab toggle
  tabToggle: { flexDirection: 'row', marginHorizontal: 20, borderRadius: 16, padding: 4, marginBottom: 4 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 13, gap: 6 },
  tabBtnText: { fontSize: 13, fontWeight: '600' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, flexGrow: 1 },

  // Active view
  readyContainer: { alignItems: 'center', marginTop: 40, marginBottom: 40, paddingHorizontal: 20 },
  readyTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  readyDesc: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

  ringContainer: { position: 'relative', justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 32 },
  ringInner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 52, fontWeight: '800', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerLabel: { fontSize: 13, fontWeight: '500', marginTop: 4 },

  metricsWrapper: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10, marginBottom: 32 },
  metricCard: { flex: 1, alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 1 },
  metricValue: { fontSize: 18, fontWeight: '700', marginTop: 10, marginBottom: 4 },
  metricLabel: { fontSize: 11, fontWeight: '600' },

  mainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', paddingVertical: 18, borderRadius: 22, gap: 10,
    borderWidth: 1, borderColor: 'transparent', marginTop: 8,
  },
  mainBtnText: { fontSize: 17, fontWeight: '700' },

  // History view
  aggregateCard: { borderRadius: 22, borderWidth: 1, padding: 20, marginTop: 16, marginBottom: 20 },
  aggregateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  aggregateTitle: { fontSize: 16, fontWeight: '700' },
  aggregateStats: { flexDirection: 'row', justifyContent: 'space-between' },
  aggStat: { alignItems: 'center', flex: 1 },
  aggStatNum: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  aggStatLabel: { fontSize: 11, fontWeight: '600' },

  emptyHistory: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { fontSize: 14, textAlign: 'center' },

  // Session cards
  sessionCard: { borderRadius: 20, borderWidth: 1, marginBottom: 14, overflow: 'hidden' },
  sessionCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  scorePill: { width: 52, height: 52, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  scorePillText: { fontSize: 18, fontWeight: '800' },
  sessionMeta: { flex: 1 },
  sessionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  sessionTime: { fontSize: 12, fontWeight: '500' },

  sessionDetail: { paddingHorizontal: 16, paddingBottom: 20 },
  detailStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  detailStat: { alignItems: 'center', flex: 1 },
  detailStatNum: { fontSize: 17, fontWeight: '700', marginBottom: 2 },
  detailStatLabel: { fontSize: 11, fontWeight: '500' },

  insightBox: { borderRadius: 14, padding: 14, marginBottom: 14 },
  insightText: { fontSize: 13, fontStyle: 'italic', lineHeight: 20, textAlign: 'center' },

  timelineTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  exitRow: { paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: '#F59E0B', marginBottom: 8 },
  exitLabel: { fontSize: 13, fontWeight: '500' },
});
