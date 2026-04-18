import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { User } from 'lucide-react-native';
import TouchableScale from '@/components/Shared/TouchableScale';
import { useTheme } from '@/context/ThemeContext';

interface Props {
  title: string;
  subtitle: string;
  onProfilePress?: () => void;
}

export default function Header({ title, subtitle, onProfilePress }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      <TouchableScale onPress={onProfilePress} style={[styles.profileButton, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
        <User size={24} color={colors.accent} />
      </TouchableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 4 },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
