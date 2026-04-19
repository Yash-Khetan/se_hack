import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar, Upload, ChevronRight, CheckCircle2,
  AlertCircle, Trash2, Plus, Minus, Info, ChevronLeft
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Circle } from 'react-native-svg';
import GradientBackground from '@/components/Shared/GradientBackground';
import { useAttendance, Subject } from '@/context/AttendanceContext';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TARGET_PERCENTAGE = 75;

// --- Combined Attendance Components from Analytics ---

function AttendanceRing({ percentage }: { percentage: number }) {
  const { colors, isDark } = useTheme();
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? colors.success : percentage >= 65 ? colors.warning : colors.danger;

  return (
    <View style={styles.ringWrapper}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringPercent, { color: colors.text }]}>{percentage}%</Text>
        <Text style={[styles.ringLabel, { color: colors.textMuted }]}>Total</Text>
      </View>
    </View>
  );
}



// --- Main Screen ---

export default function AttendanceScreen() {
  const { colors, isDark } = useTheme();
  const { subjects, loading, setSubjects, updateAttendance, removeSubject, clearAttendance } = useAttendance();
  const [isExtracting, setIsExtracting] = useState(false);

  const aggregatePct = useMemo(() => {
    if (subjects.length === 0) return 0;
    const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
    const totalPossible = subjects.reduce((acc, s) => acc + s.total, 0);
    return totalPossible > 0 ? Math.round((totalAttended / totalPossible) * 100) : 0;
  }, [subjects]);

  const handlePickTimetable = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      setIsExtracting(true);

      const blob = await (await fetch(asset.uri)).blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        if (!base64) { setIsExtracting(false); return; }

        try {
          const SERVER_URL = 'http://10.10.72.244:3005'; 
          const response = await fetch(`${SERVER_URL}/api/extract-timetable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64, mimeType: asset.mimeType || 'image/jpeg' }),
          });

          const data = await response.json();
          if (data.status === 'success' && data.subjects) {
            const formattedSubjects: Subject[] = data.subjects.map((s: any, idx: number) => ({
              ...s,
              id: `${Date.now()}-${idx}`,
            }));
            setSubjects(formattedSubjects);
            Alert.alert('Success', `Extracted ${formattedSubjects.length} subjects.`);
          } else {
            Alert.alert('Extraction Failed', data.error || 'Check server logs.');
          }
        } catch (err: any) {
          Alert.alert('Connection Error', `Check server: ${err.message}`);
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      setIsExtracting(false);
    }
  };

  const calculateBunkAdvice = (subject: Subject) => {
    const { attended, total } = subject;
    if (total === 0) return { canBunk: 0, status: 'stable', text: 'N/A' };
    const currentPercentage = (attended / total) * 100;
    const targetDec = TARGET_PERCENTAGE / 100;
    
    if (currentPercentage < TARGET_PERCENTAGE) {
      const needed = Math.ceil((targetDec * total - attended) / (1 - targetDec));
      return { 
        needed, status: 'danger', 
        text: `Attend next ${needed} classes to reach ${TARGET_PERCENTAGE}%` 
      };
    } else {
      const canBunk = Math.floor((attended / targetDec) - total);
      return { 
        canBunk: Math.max(0, canBunk), status: 'safe', 
        text: canBunk > 0 ? `Can safely bunk ${canBunk} classes.` : `On the edge! Don't skip.`
      };
    }
  };

  if (loading) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Lumina Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.accent }]}>Unified Student Analytics</Text>
          </View>
          <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: colors.accent }]} onPress={handlePickTimetable} disabled={isExtracting}>
            {isExtracting ? <ActivityIndicator size="small" color="#fff" /> : <Upload size={20} color="#fff" />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Overview Bar */}
          <View style={[styles.overviewCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
            <AttendanceRing percentage={aggregatePct} />
            <View style={styles.overviewMeta}>
              <Text style={[styles.overviewTitle, { color: colors.text }]}>Global Attendance</Text>
              <Text style={[styles.overviewSub, { color: colors.textMuted }]}>Across {subjects.length} subjects</Text>
              <View style={[styles.statusBadge, aggregatePct >= 75 ? styles.badgeSuccess : styles.badgeWarning]}>
                <Text style={[styles.badgeText, { color: colors.text }]}>{aggregatePct >= 75 ? 'On Track' : 'Near Limit'}</Text>
              </View>
            </View>
          </View>



          {/* Subjects Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Academic Breakdown</Text>
          {subjects.length === 0 ? (
            <TouchableOpacity style={[styles.emptyCard, { borderColor: colors.border }]} onPress={handlePickTimetable}>
              <Calendar size={32} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Timetable</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Tap to scan and start tracking</Text>
            </TouchableOpacity>
          ) : (
            <>
              {subjects.map((subject) => {
                const percentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 0;
                const advice = calculateBunkAdvice(subject);
                const isSafe = advice.status === 'safe';

                return (
                  <View key={subject.id} style={[styles.subjectCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subjectName, { color: colors.text }]} numberOfLines={1}>{subject.name}</Text>
                        <Text style={[styles.subjectMeta, { color: colors.textMuted }]}>{subject.credits} Credits · {subject.lab ? 'Lab' : 'Lecture'}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeSubject(subject.id)}><Trash2 size={16} color={colors.textMuted} /></TouchableOpacity>
                    </View>

                    <View style={styles.statsRow}>
                      <Text style={[styles.percentageText, { color: isSafe ? colors.success : colors.danger }]}>{percentage.toFixed(0)}%</Text>
                      <View style={styles.controls}>
                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} onPress={() => updateAttendance(subject.id, Math.max(0, subject.attended - 1))}><Minus size={14} color={colors.text} /></TouchableOpacity>
                        <Text style={[styles.countText, { color: colors.text }]}>{subject.attended}/{subject.total}</Text>
                        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} onPress={() => updateAttendance(subject.id, subject.attended + 1)}><Plus size={14} color={colors.text} /></TouchableOpacity>
                      </View>
                    </View>

                    <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, percentage)}%`, backgroundColor: isSafe ? colors.success : colors.danger }]} />
                    </View>

                    <Text style={[styles.adviceText, { color: isSafe ? colors.success : colors.danger }]}>{advice.text}</Text>
                  </View>
                );
              })}
              <TouchableOpacity style={styles.resetBtn} onPress={clearAttendance}><Text style={[styles.resetText, { color: colors.textMuted }]}>Reset Data</Text></TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 13, fontWeight: '600' },
  uploadBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 15 },
  // Overview
  overviewCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 24, borderWidth: 1 },
  ringWrapper: { position: 'relative', width: 110, height: 110, marginRight: 20 },
  ringCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  ringPercent: { fontSize: 24, fontWeight: 'bold' },
  ringLabel: { fontSize: 10 },
  overviewMeta: { flex: 1 },
  overviewTitle: { fontSize: 16, fontWeight: '700' },
  overviewSub: { fontSize: 12, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10, borderWidth: 1 },
  badgeSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' },
  badgeWarning: { backgroundColor: 'rgba(245,166,35,0.1)', borderColor: 'rgba(245,166,35,0.2)' },
  badgeText: { fontSize: 10, fontWeight: '600' },

  // Empty
  emptyCard: { alignItems: 'center', padding: 40, borderStyle: 'dashed', borderWidth: 1, borderRadius: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginTop: 15 },
  emptyText: { fontSize: 12, marginTop: 5 },
  // Subjects
  subjectCard: { padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectName: { fontSize: 16, fontWeight: '700' },
  subjectMeta: { fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  percentageText: { fontSize: 22, fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  countText: { fontSize: 14, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  progressTrack: { height: 4, borderRadius: 2, marginVertical: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  adviceText: { fontSize: 11, fontWeight: '600' },
  resetBtn: { alignSelf: 'center', marginTop: 20, padding: 10 },
  resetText: { fontSize: 12, textDecorationLine: 'underline' },
});
