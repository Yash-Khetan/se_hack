import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';

export default function AnalyticsCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.card}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Attendance</Text>
          <Text style={styles.statValue}>85%</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Tasks Done</Text>
          <Text style={styles.statValue}>4/5</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Study Time</Text>
          <Text style={styles.statValue}>2h 15m</Text>
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
    color: Colors.theme.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    color: Colors.theme.textMuted,
    fontSize: 16,
  },
  statValue: {
    color: Colors.theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
});
