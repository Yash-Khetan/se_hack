import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function FocusCard() {
  return (
    <View style={styles.shadowContainer}>
      <LinearGradient
        colors={[Colors.theme.accentSecondary, Colors.theme.accent]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.iconContainer}>
          <Clock size={24} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>Up Next</Text>
          <Text style={styles.title}>Physics Class in 20 mins</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    shadowColor: Colors.theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    color: Colors.theme.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: Colors.theme.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
