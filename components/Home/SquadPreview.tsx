import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

export default function SquadPreview() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Squad Activity</Text>
      <View style={styles.card}>
        <View style={styles.avatarsContainer}>
          {/* Mock Avatars */}
          <View style={[styles.avatar, { zIndex: 3 }]}><Text style={styles.avatarText}>A</Text></View>
          <View style={[styles.avatar, { zIndex: 2, marginLeft: -12 }]}><Text style={styles.avatarText}>R</Text></View>
          <View style={[styles.avatar, { zIndex: 1, marginLeft: -12 }]}><Text style={styles.avatarText}>S</Text></View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>3 members online</Text>
          <Text style={styles.subtitle}>Discussing Physics Notes</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.theme.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0A00',
  },
  avatarText: {
    color: Colors.theme.text,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.theme.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.theme.textMuted,
    fontSize: 12,
  },
  joinButton: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  joinButtonText: {
    color: Colors.theme.accent,
    fontWeight: '600',
  },
});
