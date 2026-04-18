import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';
import Colors from '@/constants/Colors';

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
      <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
        <User size={24} color={Colors.theme.accent} />
      </TouchableOpacity>
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
