import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import Colors from '@/constants/Colors';
import TouchableScale from '@/components/Shared/TouchableScale';

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const getDotColor = (status: string) => {
    switch (status) {
      case 'safe': return Colors.theme.success;
      case 'warning': return Colors.theme.warning;
      case 'critical': return Colors.theme.danger;
      default: return Colors.theme.textMuted;
    }
  };

  const handleDatePress = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const selectedDate = selectedIndex !== null ? dummyDates[selectedIndex] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dummyDates.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <TouchableScale
              key={index}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              scaleValue={0.9}
              onPress={() => handleDatePress(index)}
            >
              <Text style={styles.dayText}>{item.day}</Text>
              <Text style={[styles.dateText, isSelected && { color: Colors.theme.accent }]}>{item.date}</Text>
              <View style={[styles.dot, { backgroundColor: getDotColor(item.status) }]} />
            </TouchableScale>
          );
        })}
      </ScrollView>

      {/* Expandable Detail Panel */}
      {selectedDate && (
        <View style={styles.detailPanel}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📚 Classes</Text>
            <Text style={styles.detailValue}>
              {selectedDate.classes.length > 0 ? selectedDate.classes.join(', ') : 'No classes'}
            </Text>
          </View>
          {selectedDate.deadlines.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>⚠️ Deadlines</Text>
              <Text style={[styles.detailValue, { color: Colors.theme.warning }]}>
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
    color: Colors.theme.text,
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
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  dateCardSelected: {
    borderColor: Colors.theme.accent,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  dayText: {
    color: Colors.theme.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateText: {
    color: Colors.theme.text,
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
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailLabel: {
    color: Colors.theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    color: Colors.theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
});
