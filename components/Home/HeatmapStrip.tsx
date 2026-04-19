import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { BookOpen, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import TouchableScale from '@/components/Shared/TouchableScale';
import { useTheme } from '@/context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const dummyDates = [
  { day: 'Mon', date: '14', status: 'safe', classes: ['Physics 9AM', 'Math 11AM'], deadlines: [] },
  { day: 'Tue', date: '15', status: 'safe', classes: ['DSA 10AM'], deadlines: ['Lab Report'] },
  { day: 'Wed', date: '16', status: 'warning', classes: ['Physics 9AM'], deadlines: ['Assignment 3'] },
  { day: 'Thu', date: '17', status: 'critical', classes: ['Math 11AM', 'DSA 2PM'], deadlines: ['Project Review'] },
  { day: 'Fri', date: '18', status: 'safe', classes: ['Physics 9AM'], deadlines: [] },
  { day: 'Sat', date: '19', status: 'safe', classes: [], deadlines: [] },
  { day: 'Sun', date: '20', status: 'warning', classes: [], deadlines: ['Quiz Prep'] },
];

export default function HeatmapStrip() {
  const { colors, isDark } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getDotColor = (status: string) => {
    switch (status) {
      case 'safe': return colors.success;
      case 'warning': return colors.warning;
      case 'critical': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const handleDatePress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const selectedDate = selectedIndex !== null ? dummyDates[selectedIndex] : null;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dummyDates.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableScale
              key={index}
              style={[
                styles.dateCard,
                { backgroundColor: colors.cardSolid, borderColor: colors.border },
                isSelected && { borderColor: colors.accent, backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' }
              ]}
              scaleValue={0.9}
              onPress={() => handleDatePress(index)}
            >
              <Text style={[styles.dayText, { color: colors.textMuted }]}>{item.day}</Text>
              <Text style={[styles.dateText, { color: isSelected ? colors.accent : colors.text }]}>{item.date}</Text>
              <View style={[styles.dot, { backgroundColor: getDotColor(item.status) }]} />
            </TouchableScale>
          );
        })}
      </ScrollView>

      {/* Expandable Detail Panel */}
      {selectedDate && (
        <View style={[styles.detailPanel, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <BookOpen size={14} color={colors.textMuted} />
              <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Classes</Text>
            </View>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {selectedDate.classes.length > 0 ? selectedDate.classes.join(', ') : 'No classes'}
            </Text>
          </View>
          {selectedDate.deadlines.length > 0 && (
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <AlertCircle size={14} color={colors.warning} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Deadlines</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.warning }]}>
                {selectedDate.deadlines.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}
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
  scrollContent: {
    gap: 10,
  },
  dateCard: {
    width: 56,
    height: 78,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  detailPanel: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
