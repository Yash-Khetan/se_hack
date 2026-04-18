import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Calendar, TrendingDown, AlertTriangle, CheckCircle, Upload } from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import TouchableScale from '@/components/Shared/TouchableScale';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Attendance Ring ---
function AttendanceRing({ percentage }: { percentage: number }) {
  const size = 140;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? Colors.theme.success : percentage >= 65 ? Colors.theme.warning : Colors.theme.danger;

  return (
    <View style={styles.ringWrapper}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringPercent, { color }]}>{percentage}%</Text>
        <Text style={styles.ringLabel}>Attendance</Text>
      </View>
    </View>
  );
}

// --- Subject Row ---
function SubjectRow({ name, attended, total, color }: { name: string; attended: number; total: number; color: string }) {
  const pct = Math.round((attended / total) * 100);
  const barWidth = (attended / total) * 100;
  return (
    <View style={styles.subjectRow}>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{name}</Text>
        <Text style={styles.subjectStats}>{attended}/{total} classes · {pct}%</Text>
      </View>
      <View style={styles.subjectBarTrack}>
        <View style={[styles.subjectBarFill, { width: `${barWidth}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

// --- Heatmap with dates ---
// 4 weeks x 7 days, ending on the current week
const heatmapStress = [
  [0, 1, 2, 1, 3, 0, 0],
  [1, 2, 1, 0, 2, 3, 0],
  [0, 1, 3, 2, 1, 1, 0],
  [2, 0, 1, 3, 2, 1, 1],
];

// Generate last 4 weeks of dates ending on the current week's Sunday
function generateDates() {
  const today = new Date();
  // Find this week's Monday
  const dayOfWeek = today.getDay(); // 0=Sun,1=Mon...6=Sat
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + diffToMonday);

  // Start from 3 weeks before this Monday
  const start = new Date(thisMonday);
  start.setDate(thisMonday.getDate() - 21);

  const weeks: { date: number; month: string }[][] = [];
  for (let w = 0; w < 4; w++) {
    const week: { date: number; month: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + w * 7 + d);
      week.push({
        date: cur.getDate(),
        month: cur.toLocaleString('default', { month: 'short' }),
      });
    }
    weeks.push(week);
  }
  return weeks;
}

function StressHeatmap() {
  const weeks = generateDates();

  const getColor = (val: number) => {
    if (val === 0) return 'rgba(255,255,255,0.04)';
    if (val === 1) return 'rgba(16, 185, 129, 0.5)';
    if (val === 2) return 'rgba(245, 166, 35, 0.6)';
    return 'rgba(239, 68, 68, 0.7)';
  };

  // Get month label for each week (use first day's month)
  return (
    <View style={styles.heatmapContainer}>
      <View style={styles.heatmapHeader}>
        <Text style={styles.sectionTitle}>📅 Stress Heatmap</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(16,185,129,0.5)' }]} /><Text style={styles.legendText}>Low</Text>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(245,166,35,0.6)' }]} /><Text style={styles.legendText}>Med</Text>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(239,68,68,0.7)' }]} /><Text style={styles.legendText}>High</Text>
        </View>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.heatmapDayHeaders}>
        <View style={styles.heatmapWeekLabelPlaceholder} />
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
          <Text key={i} style={styles.heatmapDayLabel}>{d}</Text>
        ))}
      </View>

      {/* Rows with week label (start date) + cells */}
      <View style={styles.heatmapGrid}>
        {heatmapStress.map((week, wi) => {
          const firstDay = weeks[wi][0];
          const lastDay = weeks[wi][6];
          // Show month banner if this is first week or month changes
          const prevFirstDay = wi > 0 ? weeks[wi - 1][0] : null;
          const showMonthBanner = wi === 0 || firstDay.month !== prevFirstDay?.month;
          // Week label: "Mar 28" or "Mar 28 – Apr 3" if crosses months
          const weekLabel = firstDay.month === lastDay.month
            ? `${firstDay.month} ${firstDay.date}`
            : `${firstDay.month} ${firstDay.date}`;

          return (
            <View key={wi}>
              {showMonthBanner && (
                <Text style={styles.heatmapMonthBanner}>{firstDay.month} 2026</Text>
              )}
              <View style={styles.heatmapRow}>
                <Text style={styles.heatmapWeekLabel}>{weekLabel}</Text>
                {week.map((val, di) => (
                  <View key={di} style={styles.heatmapCellWrapper}>
                    <View style={[styles.heatmapCell, { backgroundColor: getColor(val) }]} />
                    <Text style={styles.heatmapDateNum}>{weeks[wi][di].date}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const totalAttended = 68;
  const totalClasses = 80;
  const currentPct = Math.round((totalAttended / totalClasses) * 100);
  // Bunk threshold: how many more can be missed to stay >= 75%
  // (totalAttended) / (totalClasses + x) >= 0.75  =>  x <= (totalAttended / 0.75) - totalClasses
  const maxBunkable = Math.max(0, Math.floor(totalAttended / 0.75 - totalClasses));

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Analytics</Text>

          {/* Attendance Overview */}
          <View style={styles.card}>
            <View style={styles.attendanceTop}>
              <AttendanceRing percentage={currentPct} />
              <View style={styles.attendanceMeta}>
                <View style={styles.metaRow}>
                  <CheckCircle size={16} color={Colors.theme.success} />
                  <Text style={styles.metaText}>Attended: {totalAttended}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Calendar size={16} color={Colors.theme.textMuted} />
                  <Text style={styles.metaText}>Total: {totalClasses}</Text>
                </View>
                <View style={[styles.bunkBadge, maxBunkable <= 2 && { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }]}>
                  <AlertTriangle size={14} color={maxBunkable <= 2 ? Colors.theme.danger : Colors.theme.warning} />
                  <Text style={[styles.bunkText, maxBunkable <= 2 && { color: Colors.theme.danger }]}>
                    {maxBunkable} bunks left
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Upload Timetable CTA */}
          <TouchableScale style={styles.uploadCard}>
            <Upload size={20} color={Colors.theme.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.uploadTitle}>Scan Timetable</Text>
              <Text style={styles.uploadSub}>Upload PDF or image — Lumina auto-parses it</Text>
            </View>
          </TouchableScale>

          {/* Subject Breakdown */}
          <Text style={styles.sectionTitle}>Subject Breakdown</Text>
          <View style={styles.card}>
            <SubjectRow name="Physics" attended={18} total={20} color={Colors.theme.success} />
            <SubjectRow name="DSA" attended={15} total={20} color={Colors.theme.accent} />
            <SubjectRow name="Math" attended={17} total={20} color={Colors.theme.success} />
            <SubjectRow name="Electronics" attended={18} total={20} color={Colors.theme.success} />
          </View>

          {/* Stress Heatmap */}
          <StressHeatmap />


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
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.theme.border,
  },
  // Attendance
  attendanceTop: { flexDirection: 'row', alignItems: 'center' },
  ringWrapper: { position: 'relative', width: 140, height: 140, marginRight: 20 },
  ringCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  ringPercent: { fontSize: 28, fontWeight: 'bold' },
  ringLabel: { color: Colors.theme.textMuted, fontSize: 12, marginTop: 2 },
  attendanceMeta: { flex: 1, gap: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: Colors.theme.text, fontSize: 14 },
  bunkBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,166,35,0.15)', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)', marginTop: 4,
  },
  bunkText: { color: Colors.theme.warning, fontSize: 14, fontWeight: '600' },
  // Upload
  uploadCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: 16, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  uploadTitle: { color: Colors.theme.text, fontSize: 15, fontWeight: '600' },
  uploadSub: { color: Colors.theme.textMuted, fontSize: 12, marginTop: 2 },
  // Subject
  subjectRow: { marginBottom: 14 },
  subjectInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  subjectName: { color: Colors.theme.text, fontSize: 14, fontWeight: '600' },
  subjectStats: { color: Colors.theme.textMuted, fontSize: 12 },
  subjectBarTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)' },
  subjectBarFill: { height: 6, borderRadius: 3 },
  // Heatmap
  heatmapContainer: { marginBottom: 20 },
  heatmapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.theme.textMuted, fontSize: 10, marginRight: 6 },
  heatmapDayHeaders: { flexDirection: 'row', marginBottom: 4 },
  heatmapWeekLabelPlaceholder: { width: 48 },
  heatmapDayLabel: { color: Colors.theme.textMuted, fontSize: 9, textAlign: 'center', flex: 1 },
  heatmapGrid: { gap: 6 },
  heatmapMonthBanner: {
    color: Colors.theme.accent,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    paddingLeft: 48,
    letterSpacing: 0.5,
  },
  heatmapRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heatmapWeekLabel: { color: Colors.theme.textMuted, fontSize: 9, width: 48, fontWeight: '500' },
  heatmapCellWrapper: { flex: 1, alignItems: 'center', gap: 2 },
  heatmapCell: { width: '100%', aspectRatio: 1, borderRadius: 5 },
  heatmapDateNum: { color: Colors.theme.textMuted, fontSize: 8, textAlign: 'center' },
});
