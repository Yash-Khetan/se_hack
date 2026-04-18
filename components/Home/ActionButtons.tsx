import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { QrCode, Plus, Brain, Users } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import TouchableScale from '@/components/Shared/TouchableScale';
import { useTheme } from '@/context/ThemeContext';

const actions = [
  { id: 'scan', icon: QrCode, label: 'Scan' },
  { id: 'task', icon: Plus, label: 'Task' },
  { id: 'brain', icon: Brain, label: 'Ask AI' },
  { id: 'squad', icon: Users, label: 'Squad' },
];

interface Props {
  onActionPress?: (actionId: string) => void;
}

export default function ActionButtons({ onActionPress }: Props) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <TouchableScale 
            key={action.id} 
            style={styles.actionItem}
            onPress={() => onActionPress?.(action.id)}
          >
            <View style={[styles.iconButton, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
              <Icon size={24} color={colors.accent} />
            </View>
            <Text style={[styles.label, { color: colors.text }]}>{action.label}</Text>
          </TouchableScale>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
