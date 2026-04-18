import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { User } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import TouchableScale from '@/components/Shared/TouchableScale';

interface Props {
  title: string;
  subtitle: string;
  onProfilePress?: () => void;
}

export default function Header({ title, subtitle, onProfilePress }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <TouchableScale onPress={onProfilePress} style={styles.profileButton}>
        <User size={24} color={Colors.theme.accent} />
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
  title: {
    color: Colors.theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: Colors.theme.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.theme.cardSolid,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
});
