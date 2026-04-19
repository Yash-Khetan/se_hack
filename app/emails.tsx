import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, AlertCircle } from 'lucide-react-native';
import { useStress } from '@/context/StressContext';
import { useTheme } from '@/context/ThemeContext';

export default function EmailsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { gmailSignals, profileEmail } = useStress();

  return (
    <LinearGradient colors={['#0B1220', '#0F172A']} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <ArrowLeft size={24} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Mail size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Academic Inbox</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileBox}>
          <Text style={styles.connectedText}>Connected Account</Text>
          <Text style={styles.emailText}>{profileEmail || 'Not configured'}</Text>
        </View>

        {/* Mails List */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {gmailSignals.length === 0 ? (
            <View style={styles.emptyBox}>
              <AlertCircle size={40} color="#64748B" />
              <Text style={styles.emptyText}>No critical academic signals found recently.</Text>
            </View>
          ) : (
            gmailSignals.map((signal, index) => (
              <View key={index} style={[styles.mailCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
                <View style={styles.mailTopRow}>
                  <Text style={styles.fromText} numberOfLines={1}>{signal.from}</Text>
                  <Text style={styles.dateText}>{signal.date}</Text>
                </View>
                <Text style={styles.subjectText}>{signal.subject}</Text>
                <View style={[styles.tagBadge, { backgroundColor: `${signal.tagColor}20`, borderColor: `${signal.tagColor}40` }]}>
                  <Text style={[styles.tagText, { color: signal.tagColor }]}>{signal.tag}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '700',
  },
  profileBox: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  connectedText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  emailText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  mailCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  mailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fromText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
  },
  subjectText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
