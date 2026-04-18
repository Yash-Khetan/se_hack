import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

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

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
      <View style={[styles.card, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
        <View style={styles.ringsRow}>
          <ProgressRing
            progress={85}
            size={72}
            strokeWidth={6}
            color={Colors.theme.success}
            label="Attendance"
            value="85%"
          />
          <ProgressRing
            progress={80}
            size={72}
            strokeWidth={6}
            color={Colors.theme.accent}
            label="Tasks"
            value="4/5"
          />
          <ProgressRing
            progress={56}
            size={72}
            strokeWidth={6}
            color={Colors.theme.accentSecondary}
            label="Study"
            value="2h15"
          />
        </View>

        {/* Mini bar graph */}
        <View style={[styles.barSection, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
          <Text style={[styles.barTitle, { color: colors.textMuted }]}>Weekly Study Hours</Text>
          <View style={styles.barRow}>
            {[40, 70, 55, 85, 60, 30, 50].map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)' }]}>
                  <View style={[styles.barFill, { height: `${val}%`, backgroundColor: i === 4 ? colors.accent : (isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.5)') }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.textMuted }]}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
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
