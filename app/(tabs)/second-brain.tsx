import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

export default function SecondBrainScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Second Brain</Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterText}>Physics</Text>
          </View>
        </View>

        <View style={styles.chatArea}>
          <View style={styles.botBubble}>
            <Text style={styles.botText}>How can I help you study today?</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask something..."
            placeholderTextColor={Colors.theme.textMuted}
          />
          <View style={styles.sendButton}>
            <Send size={20} color={Colors.theme.backgroundGradient[0]} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.theme.text,
  },
  filterBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.theme.accent,
  },
  filterText: {
    color: Colors.theme.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  botBubble: {
    backgroundColor: Colors.theme.cardSolid,
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '80%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  botText: {
    color: Colors.theme.text,
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: Colors.theme.text,
    fontSize: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    backgroundColor: Colors.theme.accent,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
