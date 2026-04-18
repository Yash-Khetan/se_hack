import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { Calendar, TrendingDown, AlertTriangle, CheckCircle, Upload, ChevronLeft, ChevronRight } from 'lucide-react-native';
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

// ── Stress level per day-of-month (1-indexed). 28 entries = full 28-day month mock.
// In a real app this would come from an API keyed by month/year.
function getMockStressForMonth(year: number, month: number): Record<number, number> {
  // Deterministic pseudo-random based on year+month so each month looks different
  const seed = year * 12 + month;
  const data: Record<number, number> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const v = ((seed * 31 + d * 17) % 7);
    data[d] = v < 2 ? 0 : v < 4 ? 1 : v < 6 ? 2 : 3;
  }
  // Sprinkle some zeroes on weekends for realism
  return data;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function StressHeatmap() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  const getColor = (val: number) => {
    if (val === 0) return 'rgba(255,255,255,0.06)';
    if (val === 1) return 'rgba(16,185,129,0.55)';
    if (val === 2) return 'rgba(245,166,35,0.65)';
    return 'rgba(239,68,68,0.75)';
  };

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goForward = () => {
    const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return; // don't go into the future
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // Build calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // JS getDay(): 0=Sun…6=Sat. Convert to Mon-first: Mon=0…Sun=6
  const firstDayJS = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const firstDayMon = firstDayJS === 0 ? 6 : firstDayJS - 1;   // shift so Mon=0

  const stressData = getMockStressForMonth(viewYear, viewMonth);

  // Build a flat array of cells: nulls for leading empty slots, then 1..daysInMonth
  const cells: (number | null)[] = [
    ...Array(firstDayMon).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full 7-column rows
  while (cells.length % 7 !== 0) cells.push(null);

  // Split into week rows
  const weekRows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weekRows.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.heatmapContainer}>
      {/* Header: title + legend */}
      <View style={styles.heatmapHeader}>
        <Text style={styles.sectionTitle}>📅 Stress Heatmap</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(16,185,129,0.55)' }]} />
          <Text style={styles.legendText}>Low</Text>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(245,166,35,0.65)' }]} />
          <Text style={styles.legendText}>Med</Text>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(239,68,68,0.75)' }]} />
          <Text style={styles.legendText}>High</Text>
        </View>
      </View>

      {/* Month navigator */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={styles.monthNavBtn} onPress={goBack} activeOpacity={0.7}>
          <ChevronLeft size={18} color={Colors.theme.accent} />
        </TouchableOpacity>
        <Text style={styles.monthNavTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <TouchableOpacity
          style={[styles.monthNavBtn, isCurrentMonth && styles.monthNavBtnDisabled]}
          onPress={goForward}
          activeOpacity={isCurrentMonth ? 1 : 0.7}
        >
          <ChevronRight size={18} color={isCurrentMonth ? Colors.theme.textMuted : Colors.theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week column headers */}
      <View style={styles.heatmapDayHeaders}>
        {DAY_LABELS.map((d) => (
          <Text key={d} style={styles.heatmapDayLabel}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.heatmapGrid}>
        {weekRows.map((row, wi) => (
          <View key={wi} style={styles.heatmapRow}>
            {row.map((day, di) => (
              <View key={di} style={styles.heatmapCellWrapper}>
                {day !== null ? (
                  <>
                    <View style={[
                      styles.heatmapCell,
                      { backgroundColor: getColor(stressData[day] ?? 0) },
                      day === now.getDate() && isCurrentMonth && styles.heatmapCellToday,
                    ]} />
                    <Text style={[
                      styles.heatmapDateNum,
                      day === now.getDate() && isCurrentMonth && styles.heatmapDateToday,
                    ]}>{day}</Text>
                  </>
                ) : (
                  <View style={styles.heatmapCellEmpty} />
                )}
              </View>
            ))}
          </View>
        ))}
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
  heatmapHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.theme.textMuted, fontSize: 10, marginRight: 4 },
  // Month navigator
  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)',
  },
  monthNavBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  monthNavTitle: {
    color: Colors.theme.text,
    fontSize: 15, fontWeight: '700', letterSpacing: 0.3,
  },
  // Day-of-week headers (7 equal columns, no week-label offset)
  heatmapDayHeaders: {
    flexDirection: 'row', marginBottom: 6,
  },
  heatmapDayLabel: {
    flex: 1, color: Colors.theme.textMuted,
    fontSize: 9, textAlign: 'center', fontWeight: '600',
  },
  heatmapGrid: { gap: 4 },
  heatmapRow: { flexDirection: 'row', gap: 3 },
  heatmapCellWrapper: { flex: 1, alignItems: 'center', gap: 2 },
  heatmapCell: { width: '100%', aspectRatio: 1, borderRadius: 5 },
  heatmapCellToday: {
    borderWidth: 1.5, borderColor: Colors.theme.accent,
  },
  heatmapCellEmpty: { width: '100%', aspectRatio: 1 },
  heatmapDateNum: { color: Colors.theme.textMuted, fontSize: 8, textAlign: 'center' },
  heatmapDateToday: { color: Colors.theme.accent, fontWeight: '700' },
});
