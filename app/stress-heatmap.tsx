import React, { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Dimensions, Modal, SafeAreaView, ActivityIndicator, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, Calendar, Mail, TrendingUp, MessageSquare,
  Zap, BookOpen, FileText, RefreshCw, Link, X, AlertCircle, CheckCircle, Layers, Info, PartyPopper,
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStress, DayStress, StressEvent } from '@/context/StressContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SCREEN_WIDTH - 48) / 7);

type TabId = 'heatmap' | 'timeline' | 'gmail' | 'insights';

const TAB_CONFIG: { id: TabId; label: string; icon: any }[] = [
  { id: 'heatmap', label: 'Heatmap', icon: Calendar },
  { id: 'timeline', label: 'Timeline', icon: TrendingUp },
  { id: 'insights', label: 'Insights', icon: MessageSquare },
];

const LEVEL_GRADIENTS: Record<string, readonly [string, string]> = {
  low: ['#059669', '#10B981'],
  medium: ['#D97706', '#F59E0B'],
  high: ['#B91C1C', '#EF4444'],
};

const EVENT_ICONS: Record<string, any> = { exam: Zap, assignment: FileText, class: BookOpen, event: Calendar };
const EVENT_COLORS: Record<string, string> = { exam: '#EF4444', assignment: '#F59E0B', class: '#3B82F6', event: '#8B5CF6' };

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function dayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.getDate().toString();
}
function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split('T')[0];
}

export default function StressHeatmapScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    heatmap, insights, gmailSignals, isLoading,
    isConnected, connectGoogle, refreshData,
  } = useStress();

  const [activeTab, setActiveTab] = useState<TabId>('heatmap');
  const [selectedDay, setSelectedDay] = useState<DayStress | null>(null);

  const bg = isDark ? '#0E0F1A' : '#F0F2FF';
  const card = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textCol = isDark ? '#F0F0FF' : '#1A1A2E';
  const mutedCol = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  // ── Heatmap Grid ────────────────────────────────────────────────────────────
  const renderHeatmapGrid = () => {
    const weeks: DayStress[][] = [];
    for (let i = 0; i < heatmap.length; i += 7) weeks.push(heatmap.slice(i, i + 7));

    return (
      <Animated.View entering={FadeInDown} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textCol }]}>28-Day Academic Load</Text>
        <View style={[styles.legendRow]}>
          {['Free', 'Moderate', 'Heavy'].map((label, i) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: ['#10B981', '#F59E0B', '#EF4444'][i] }]} />
              <Text style={[styles.legendLabel, { color: mutedCol }]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.gridContainer, { backgroundColor: card, borderColor: border }]}>
          {/* Day headers */}
          <View style={styles.gridRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <View key={i} style={[styles.cell]}>
                <Text style={[styles.dayHeader, { color: mutedCol }]}>{d}</Text>
              </View>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={styles.gridRow}>
              {week.map((day, di) => {
                const today = isToday(day.date);
                const empty = day.events.length === 0 && !today;
                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: empty ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)') : day.color + '30',
                        borderColor: today ? day.color : 'transparent',
                        borderWidth: today ? 2 : 0,
                      }
                    ]}
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cellDate, { color: today ? day.color : mutedCol, fontWeight: today ? '800' : '400' }]}>
                      {dayLabel(day.date)}
                    </Text>
                    {day.events.length > 0 && (
                      <View style={[styles.cellDot, { backgroundColor: day.color }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Tap hint */}
        <Text style={[styles.tapHint, { color: mutedCol }]}>Tap any day to see details</Text>
      </Animated.View>
    );
  };

  // ── Stress Timeline ─────────────────────────────────────────────────────────
  const renderTimeline = () => {
    const upcomingDays = heatmap.slice(7, 7 + 14); // Next 14 days
    const maxScore = Math.max(...upcomingDays.map(d => d.score), 1);

    return (
      <Animated.View entering={FadeInDown} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textCol }]}>Stress Timeline — Next 2 Weeks</Text>
        <View style={[styles.timelineCard, { backgroundColor: card, borderColor: border }]}>
          {upcomingDays.map((day, i) => {
            const barWidth = Math.max((day.score / maxScore) * (SCREEN_WIDTH - 120), 4);
            const d = new Date(day.date + 'T12:00:00');
            const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            return (
              <TouchableOpacity key={day.date} onPress={() => setSelectedDay(day)} style={styles.timelineRow} activeOpacity={0.8}>
                <Text style={[styles.timelineLabel, { color: mutedCol }]}>{label}</Text>
                <View style={styles.timelineBarBg}>
                  <Animated.View
                    entering={FadeIn.delay(i * 40)}
                    style={[styles.timelineBarFill, { width: barWidth, backgroundColor: day.color }]}
                  />
                </View>
                <Text style={[styles.timelineScore, { color: day.color }]}>{day.score}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  // ── Gmail Signals (Removed) ────────────────────────────────────────────────

  // ── Insights ────────────────────────────────────────────────────────────────
  const renderInsights = () => {
    const insightColors: Record<string, { bg: string; border: string; text: string }> = {
      danger: { bg: '#EF444415', border: '#EF444445', text: '#EF4444' },
      warning: { bg: '#F59E0B15', border: '#F59E0B45', text: '#F59E0B' },
      good: { bg: '#10B98115', border: '#10B98145', text: '#10B981' },
      info: { bg: '#3B82F615', border: '#3B82F645', text: '#3B82F6' },
    };

    return (
      <Animated.View entering={FadeInDown} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textCol }]}>Emotional Intelligence Insights</Text>
        {insights.map((ins, i) => {
          const ic = insightColors[ins.level] || insightColors.info;
          let InsightIcon = Info;
          if (ins.icon === 'alert-circle') InsightIcon = AlertCircle;
          else if (ins.icon === 'zap') InsightIcon = Zap;
          else if (ins.icon === 'check-circle') InsightIcon = CheckCircle;
          else if (ins.icon === 'trending-up') InsightIcon = TrendingUp;
          else if (ins.icon === 'layers') InsightIcon = Layers;

          return (
            <Animated.View key={i} entering={FadeInDown.delay(i * 80)}
              style={[styles.insightCard, { backgroundColor: ic.bg, borderColor: ic.border }]}>
              <View style={styles.insightIconWrapper}>
                <InsightIcon size={20} color={ic.text} />
              </View>
              <Text style={[styles.insightMessage, { color: ic.text }]}>{ins.message}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    );
  };

  // ── Day Detail Modal ────────────────────────────────────────────────────────
  const renderDayModal = () => {
    if (!selectedDay) return null;
    return (
      <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedDay(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#0E0F1A' : '#fff' }]}>
            {/* Sheet handle */}
            <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }]} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textCol }]}>{formatDate(selectedDay.date)}</Text>
              <TouchableOpacity onPress={() => setSelectedDay(null)}>
                <X size={22} color={mutedCol} />
              </TouchableOpacity>
            </View>

            {/* Score pill */}
            <View style={[styles.scorePill, { backgroundColor: selectedDay.color + '20', borderColor: selectedDay.color + '60' }]}>
              <Text style={[styles.scorePillText, { color: selectedDay.color }]}>
                Stress Score: {selectedDay.score}/10 · {selectedDay.level.toUpperCase()}
              </Text>
            </View>

            {selectedDay.events.length === 0 ? (
              <View style={styles.emptyDay}>
                <PartyPopper size={48} color={selectedDay.color} style={{ marginBottom: 16 }} />
                <Text style={[styles.emptyDayText, { color: mutedCol }]}>No academic events — free day!</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
                {selectedDay.events.map((ev, i) => {
                  const EvIcon = EVENT_ICONS[ev.type] || Calendar;
                  const evColor = EVENT_COLORS[ev.type] || '#6B7280';
                  return (
                    <View key={i} style={[styles.eventRow, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                      <View style={[styles.eventIcon, { backgroundColor: evColor + '20' }]}>
                        <EvIcon size={16} color={evColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.eventTitle, { color: textCol }]}>{ev.title}</Text>
                        <Text style={[styles.eventMeta, { color: mutedCol }]}>
                          {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)} · Weight: {ev.weight} · {ev.source}
                        </Text>
                      </View>
                      <View style={[styles.weightPill, { backgroundColor: evColor + '20' }]}>
                        <Text style={[styles.weightText, { color: evColor }]}>+{ev.weight}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1A1A3E', '#0E0F1A'] : ['#6C63FF22', '#F0F2FF']}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerInner}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={16}>
              <ArrowLeft size={22} color={textCol} />
            </TouchableOpacity>
            
            <View style={styles.headerTextWrapper}>
              <Text style={[styles.headerTitle, { color: textCol }]}>Academic Stress Map</Text>
              <Text style={[styles.headerSubtitle, { color: mutedCol }]}>
                {isConnected ? '🟢 Connected to Google' : '⚪ Demo Mode'}
              </Text>
            </View>

            <TouchableOpacity onPress={refreshData} style={styles.refreshBtn} hitSlop={12}>
              {isLoading
                ? <ActivityIndicator size="small" color={textCol} />
                : <RefreshCw size={18} color={textCol} />
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderColor: border }]}>
        {TAB_CONFIG.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, active && [styles.tabItemActive, { backgroundColor: colors.accent }]]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Icon size={14} color={active ? '#fff' : mutedCol} />
              <Text style={[styles.tabLabel, { color: active ? '#fff' : mutedCol }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'heatmap' && renderHeatmapGrid()}
        {activeTab === 'timeline' && renderTimeline()}
        {activeTab === 'insights' && renderInsights()}
      </ScrollView>

      {renderDayModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 16 },
  headerInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6, minHeight: 44 },
  headerTextWrapper: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  backBtn: { width: 32, alignItems: 'flex-start' },
  refreshBtn: { width: 32, alignItems: 'flex-end' },

  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, borderRadius: 16, padding: 4,
    borderWidth: 1, marginBottom: 4,
  },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 13, gap: 5 },
  tabItemActive: {},
  tabLabel: { fontSize: 12, fontWeight: '600' },

  scrollContent: { padding: 16, paddingBottom: 60 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },

  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, fontWeight: '500' },
  tapHint: { fontSize: 12, textAlign: 'center', marginTop: 8 },

  // Grid
  gridContainer: { borderRadius: 18, borderWidth: 1, padding: 8 },
  gridRow: { flexDirection: 'row' },
  cell: { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center', borderRadius: 8, margin: 1 },
  dayHeader: { fontSize: 11, fontWeight: '700' },
  cellDate: { fontSize: 12 },
  cellDot: { width: 4, height: 4, borderRadius: 2, marginTop: 2 },

  // Timeline
  timelineCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineLabel: { width: 56, fontSize: 11, fontWeight: '500' },
  timelineBarBg: { flex: 1, height: 10, backgroundColor: 'rgba(100,100,100,0.15)', borderRadius: 5, overflow: 'hidden' },
  timelineBarFill: { height: '100%', borderRadius: 5 },
  timelineScore: { width: 20, fontSize: 12, fontWeight: '700', textAlign: 'right' },

  // Gmail
  connectBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  connectBadgeText: { fontSize: 12, fontWeight: '600' },
  mockBanner: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  mockBannerText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  gmailCard: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10 },
  gmailTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  gmailSubject: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  gmailMeta: { fontSize: 12, fontWeight: '400' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, flexShrink: 0 },
  tagText: { fontSize: 11, fontWeight: '700' },

  // Insights
  insightCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightIconWrapper: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  insightMessage: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '70%' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  scorePill: { borderRadius: 12, borderWidth: 1, padding: 10, alignItems: 'center', marginBottom: 16 },
  scorePillText: { fontSize: 14, fontWeight: '700' },
  emptyDay: { alignItems: 'center', padding: 32, gap: 8 },
  emptyDayText: { fontSize: 15, fontWeight: '500' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  eventIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  eventTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  eventMeta: { fontSize: 12 },
  weightPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  weightText: { fontSize: 13, fontWeight: '700' },
});
