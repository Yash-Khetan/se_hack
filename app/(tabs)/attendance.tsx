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
import Colors from '@/constants/Colors';
import { useAttendance, Subject } from '@/context/AttendanceContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TARGET_PERCENTAGE = 75;

// --- Combined Attendance Components from Analytics ---

function AttendanceRing({ percentage }: { percentage: number }) {
  const size = 110;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? Colors.theme.success : percentage >= 65 ? Colors.theme.warning : Colors.theme.danger;

  return (
    <View style={styles.ringWrapper}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={[styles.ringPercent, { color }]}>{percentage}%</Text>
        <Text style={styles.ringLabel}>Total</Text>
      </View>
    </View>
  );
}



// --- Main Screen ---

export default function AttendanceScreen() {
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
          <ActivityIndicator size="large" color={Colors.theme.accent} />
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Lumina Dashboard</Text>
            <Text style={styles.subtitle}>Unified Student Analytics</Text>
          </View>
          <TouchableOpacity style={styles.uploadBtn} onPress={handlePickTimetable} disabled={isExtracting}>
            {isExtracting ? <ActivityIndicator size="small" color="#fff" /> : <Upload size={20} color="#fff" />}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Overview Bar */}
          <View style={styles.overviewCard}>
            <AttendanceRing percentage={aggregatePct} />
            <View style={styles.overviewMeta}>
              <Text style={styles.overviewTitle}>Global Attendance</Text>
              <Text style={styles.overviewSub}>Across {subjects.length} subjects</Text>
              <View style={[styles.statusBadge, aggregatePct >= 75 ? styles.badgeSuccess : styles.badgeWarning]}>
                <Text style={styles.badgeText}>{aggregatePct >= 75 ? 'On Track' : 'Near Limit'}</Text>
              </View>
            </View>
          </View>



          {/* Subjects Section */}
          <Text style={styles.sectionTitle}>Academic Breakdown</Text>
          {subjects.length === 0 ? (
            <TouchableOpacity style={styles.emptyCard} onPress={handlePickTimetable}>
              <Calendar size={32} color={Colors.theme.textMuted} />
              <Text style={styles.emptyTitle}>No Timetable</Text>
              <Text style={styles.emptyText}>Tap to scan and start tracking</Text>
            </TouchableOpacity>
          ) : (
            <>
              {subjects.map((subject) => {
                const percentage = subject.total > 0 ? (subject.attended / subject.total) * 100 : 0;
                const advice = calculateBunkAdvice(subject);
                const isSafe = advice.status === 'safe';

                return (
                  <View key={subject.id} style={styles.subjectCard}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subjectName} numberOfLines={1}>{subject.name}</Text>
                        <Text style={styles.subjectMeta}>{subject.credits} Credits · {subject.lab ? 'Lab' : 'Lecture'}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeSubject(subject.id)}><Trash2 size={16} color="rgba(255,255,255,0.15)" /></TouchableOpacity>
                    </View>

                    <View style={styles.statsRow}>
                      <Text style={[styles.percentageText, { color: isSafe ? Colors.theme.success : Colors.theme.danger }]}>{percentage.toFixed(0)}%</Text>
                      <View style={styles.controls}>
                        <TouchableOpacity style={styles.controlBtn} onPress={() => updateAttendance(subject.id, Math.max(0, subject.attended - 1))}><Minus size={14} color={Colors.theme.text} /></TouchableOpacity>
                        <Text style={styles.countText}>{subject.attended}/{subject.total}</Text>
                        <TouchableOpacity style={styles.controlBtn} onPress={() => updateAttendance(subject.id, subject.attended + 1)}><Plus size={14} color={Colors.theme.text} /></TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, percentage)}%`, backgroundColor: isSafe ? Colors.theme.success : Colors.theme.danger }]} />
                    </View>

                    <Text style={[styles.adviceText, { color: isSafe ? Colors.theme.success : Colors.theme.danger }]}>{advice.text}</Text>
                  </View>
                );
              })}
              <TouchableOpacity style={styles.resetBtn} onPress={clearAttendance}><Text style={styles.resetText}>Reset Data</Text></TouchableOpacity>
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
  title: { color: Colors.theme.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: Colors.theme.accent, fontSize: 13, fontWeight: '600' },
  uploadBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.theme.accent, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionTitle: { color: Colors.theme.text, fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 15 },
  // Overview
  overviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.theme.cardSolid, padding: 15, borderRadius: 24, borderWidth: 1, borderColor: Colors.theme.border },
  ringWrapper: { position: 'relative', width: 110, height: 110, marginRight: 20 },
  ringCenter: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  ringPercent: { fontSize: 24, fontWeight: 'bold' },
  ringLabel: { color: Colors.theme.textMuted, fontSize: 10 },
  overviewMeta: { flex: 1 },
  overviewTitle: { color: Colors.theme.text, fontSize: 16, fontWeight: '700' },
  overviewSub: { color: Colors.theme.textMuted, fontSize: 12, marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10, borderWidth: 1 },
  badgeSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' },
  badgeWarning: { backgroundColor: 'rgba(245,166,35,0.1)', borderColor: 'rgba(245,166,35,0.2)' },
  badgeText: { fontSize: 10, color: Colors.theme.text, fontWeight: '600' },

  // Empty
  emptyCard: { alignItems: 'center', padding: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.theme.border, borderRadius: 24 },
  emptyTitle: { color: Colors.theme.text, fontSize: 16, fontWeight: '600', marginTop: 15 },
  emptyText: { color: Colors.theme.textMuted, fontSize: 12, marginTop: 5 },
  // Subjects
  subjectCard: { backgroundColor: Colors.theme.cardSolid, padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: Colors.theme.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectName: { color: Colors.theme.text, fontSize: 16, fontWeight: '700' },
  subjectMeta: { color: Colors.theme.textMuted, fontSize: 11, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  percentageText: { fontSize: 22, fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  controlBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  countText: { color: Colors.theme.text, fontSize: 14, fontWeight: '700', minWidth: 40, textAlign: 'center' },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, marginVertical: 12 },
  progressFill: { height: 4, borderRadius: 2 },
  adviceText: { fontSize: 11, fontWeight: '600' },
  resetBtn: { alignSelf: 'center', marginTop: 20, padding: 10 },
  resetText: { color: Colors.theme.textMuted, fontSize: 12, textDecorationLine: 'underline' },
});
