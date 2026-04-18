import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

export default function AnalyticsScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>Attendance: 85%</Text>
          <Text style={styles.placeholderSubtext}>Safe zone. Bunk threshold: 3 classes left.</Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.theme.text,
    marginBottom: 20,
  },
  placeholderCard: {
    backgroundColor: Colors.theme.cardSolid,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  placeholderText: {
    color: Colors.theme.success,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: Colors.theme.textMuted,
    fontSize: 14,
  },
});
