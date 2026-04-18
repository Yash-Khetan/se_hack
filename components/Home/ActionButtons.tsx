import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { QrCode, Plus, Brain, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const actions = [
  { id: 'scan', icon: QrCode, label: 'Scan' },
  { id: 'task', icon: Plus, label: 'Task' },
  { id: 'brain', icon: Brain, label: 'Ask AI' },
  { id: 'squad', icon: Users, label: 'Squad' },
];

export default function ActionButtons() {
  return (
    <View style={styles.container}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <TouchableOpacity key={action.id} style={styles.actionItem}>
            <View style={styles.iconButton}>
              <Icon size={24} color={Colors.theme.accent} />
            </View>
            <Text style={styles.label}>{action.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.theme.cardSolid,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  label: {
    color: Colors.theme.text,
    fontSize: 12,
    fontWeight: '500',
  },
});
