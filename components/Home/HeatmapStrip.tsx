import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

const dummyDates = [
  { day: 'Mon', date: '12', status: 'safe' },
  { day: 'Tue', date: '13', status: 'safe' },
  { day: 'Wed', date: '14', status: 'warning' },
  { day: 'Thu', date: '15', status: 'critical' },
  { day: 'Fri', date: '16', status: 'safe' },
  { day: 'Sat', date: '17', status: 'safe' },
  { day: 'Sun', date: '18', status: 'warning' },
];

export default function HeatmapStrip() {
  const getDotColor = (status: string) => {
    switch (status) {
      case 'safe': return Colors.theme.success;
      case 'warning': return Colors.theme.warning;
      case 'critical': return Colors.theme.danger;
      default: return Colors.theme.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>This Week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {dummyDates.map((item, index) => (
          <TouchableOpacity key={index} style={styles.dateCard}>
            <Text style={styles.dayText}>{item.day}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
            <View style={[styles.dot, { backgroundColor: getDotColor(item.status) }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    gap: 12,
  },
  dateCard: {
    width: 60,
    height: 80,
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  dayText: {
    color: Colors.theme.textMuted,
    fontSize: 12,
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
});
