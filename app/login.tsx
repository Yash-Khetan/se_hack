import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Calendar as CalendarIcon, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useStress } from '@/context/StressContext';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isConnected, isLoading, connectGoogle } = useStress();

  useEffect(() => {
    // If successfully authenticated, route to Home
    if (isConnected) {
      router.replace('/(tabs)');
    }
  }, [isConnected]);

  return (
    <LinearGradient colors={colors.backgroundGradient} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              style={styles.logoBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Mail size={32} color="#fff" />
            </LinearGradient>
            <View style={[styles.logoBadge, styles.logoBadgeOverlap]}>
              <CalendarIcon size={32} color="#fff" />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Lumina Sync</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Connect your academic workspace to unlock AI-driven stress management and intelligent insights.
          </Text>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>Awaiting authorization...</Text>
            </View>
          ) : (
            <TouchableOpacity style={[styles.connectBtn, { backgroundColor: colors.accent }]} onPress={connectGoogle} activeOpacity={0.8}>
              <Text style={styles.connectBtnText}>Continue with Google</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>
          )}

          <View style={styles.secureBox}>
            <Text style={[styles.secureText, { color: colors.textMuted }]}>Read-only access to Calendar & Gmail.</Text>
            <Text style={[styles.secureText, { color: colors.textMuted }]}>Your data never leaves your device unencrypted.</Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoBadgeOverlap: {
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(128,128,128,0.2)',
    marginLeft: -20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 48,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secureBox: {
    marginTop: 32,
    alignItems: 'center',
  },
  secureText: {
    fontSize: 12,
    lineHeight: 18,
  },
  loadingBox: {
    alignItems: 'center',
    padding: 30,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
