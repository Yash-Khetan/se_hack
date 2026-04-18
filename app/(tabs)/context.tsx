import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

export default function ContextScreen() {
  const [isStudying, setIsStudying] = useState(false);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Context</Text>
          <Text style={styles.subtitle}>
            {isStudying ? "You are currently in study mode. Notifications are muted." : "Ready to focus? Toggle study mode."}
          </Text>
          
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>I'm Studying</Text>
            <Switch
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.theme.accent }}
              thumbColor={isStudying ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setIsStudying}
              value={isStudying}
            />
          </View>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.theme.textMuted,
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.theme.cardSolid,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  toggleLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.theme.text,
    marginRight: 16,
  },
});
