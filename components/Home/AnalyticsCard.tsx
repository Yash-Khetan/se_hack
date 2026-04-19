import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useAttendance } from '@/context/AttendanceContext';
import { useKanban } from '@/context/KanbanContext';
import { useFocus } from '@/context/FocusContext';

interface ProgressRingProps {
  progress: number; // 0-100
  size: number;
  strokeWidth: number;
  color: string;
  label: string;
  value: string;
}

function ProgressRing({ progress, size, strokeWidth, color, label, value }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.ringContainer}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeOpacity={0.15}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={[styles.ringValueContainer, { width: size, height: size }]}>
          <Text style={[styles.ringValue, { color }]}>{value}</Text>
        </View>
      </View>
      <Text style={[styles.ringLabel, { color: color }]}>{label}</Text>
    </View>
  );
}

export default function AnalyticsCard() {
  const { colors, isDark } = useTheme();

  // 1. Attendance Sync
  const { subjects } = useAttendance();
  const aggregatePct = React.useMemo(() => {
    if (!subjects || subjects.length === 0) return 0;
    const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
    const totalPossible = subjects.reduce((acc, s) => acc + s.total, 0);
    return totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 100) : 0;
  }, [subjects]);

  // 2. Kanban Tasks Sync
  const { tasks } = useKanban();
  const tasksCompleted = tasks.filter(t => t.status === 'done').length;
  const tasksTotal = tasks.length;
  const taskProgress = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  // 3. Focus / Study Sync
  const { summarySessions } = useFocus();
  
  const todayActiveSeconds = React.useMemo(() => {
    const now = new Date();
    const todayMsStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return summarySessions
      .filter(s => s.completed_at && s.completed_at >= todayMsStart)
      .reduce((acc, s) => acc + s.active_time, 0);
  }, [summarySessions]);

  const studyHrs = Math.floor(todayActiveSeconds / 3600);
  const studyTotalMins = Math.floor(todayActiveSeconds / 60);
  const studyProgress = Math.min((todayActiveSeconds / 14400) * 100, 100); // 4 hours max

  // Weekly Bar Sync
  const weeklySync = React.useMemo(() => {
    const data = Array(7).fill(0);
    const labels = Array(7).fill('');
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    for (let i = 0; i < 7; i++) {
       const dayStart = startOfToday - ((6 - i) * 86400000);
       const dayEnd = dayStart + 86400000;
       
       let seconds = 0;
       summarySessions.forEach(s => {
          if (s.completed_at && s.completed_at >= dayStart && s.completed_at < dayEnd) {
            seconds += s.active_time;
          }
       });
       
       data[i] = Math.min((seconds / 14400) * 100, 100);
       labels[i] = new Date(dayStart).toLocaleDateString('en-US', { weekday: 'narrow' });
    }
    return { data, labels };
  }, [summarySessions]);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
      <View style={[styles.card, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
        <View style={styles.ringsRow}>
          <ProgressRing
            progress={aggregatePct}
            size={72}
            strokeWidth={6}
            color={Colors.theme.success}
            label="Attendance"
            value={`${aggregatePct}%`}
          />
          <ProgressRing
            progress={taskProgress}
            size={72}
            strokeWidth={6}
            color={Colors.theme.accent}
            label="Tasks"
            value={`${tasksCompleted}/${tasksTotal}`}
          />
          <ProgressRing
            progress={studyProgress}
            size={72}
            strokeWidth={6}
            color={Colors.theme.accentSecondary}
            label="Study"
            value={`${studyTotalMins}m`}
          />
        </View>

        {/* Mini bar graph */}
        <View style={[styles.barSection, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <Text style={[styles.barTitle, { color: colors.textMuted }]}>Weekly Study Hours</Text>
          <View style={styles.barRow}>
            {weeklySync.data.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)' }]}>
                  <View style={[styles.barFill, { height: `${val}%`, backgroundColor: i === 6 ? colors.accent : (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.5)') }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.textMuted }]}>{weeklySync.labels[i]}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  ringContainer: {
    alignItems: 'center',
  },
  ringValueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ringLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  barSection: {
    borderTopWidth: 1,
    paddingTop: 16,
  },
  barTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 8,
    height: 50,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    marginTop: 6,
  },
});
