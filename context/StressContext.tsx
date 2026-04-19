/**
 * StressContext — Academic Stress Engine
 *
 * OAuth NOTE: expo-auth-session requires `expo-crypto` (native module)
 * which is NOT available in Expo Go. This context uses mock data by default.
 * To use real Google Calendar + Gmail data, provide an access token manually.
 *
 * For a production/dev build you can swap in expo-auth-session safely.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import Constants from 'expo-constants';

// Resolve backend IP dynamically. (localhost fails on physical devices / Android emulators)
const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? '10.0.2.2';
const API = `http://${host}:3005/api/stress`;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StressEvent {
  title: string;
  type: 'exam' | 'assignment' | 'class' | 'event';
  weight: number;
  source: 'calendar' | 'gmail' | 'mock';
  time?: string;
}

export interface DayStress {
  date: string;
  score: number;
  level: 'low' | 'medium' | 'high';
  color: string;
  events: StressEvent[];
}

export interface GmailSignal {
  subject: string;
  from: string;
  date: string;
  type: string;
  tag: string;
  tagColor: string;
}

export interface StressInsight {
  message: string;
  icon: string;
  level: 'info' | 'warning' | 'danger' | 'good';
}

interface StressContextType {
  isConnected: boolean;
  isLoading: boolean;
  connectGoogle: () => void;
  disconnectGoogle: () => void;
  heatmap: DayStress[];
  insights: StressInsight[];
  gmailSignals: GmailSignal[];
  todayStress: DayStress | null;
  refreshData: () => Promise<void>;
  profileName: string | null;
  profileEmail: string | null;
}

const StressContext = createContext<StressContextType | undefined>(undefined);

// ─── Safe AsyncStorage ────────────────────────────────────────────────────────
let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch (_) {}

async function saveAuthData(token: string, name: string | null, email: string | null) {
  if (AsyncStorage) {
    if (token) await AsyncStorage.setItem('google_stress_token', token).catch(() => {});
    if (name) await AsyncStorage.setItem('google_stress_name', name).catch(() => {});
    if (email) await AsyncStorage.setItem('google_stress_email', email).catch(() => {});
  }
}
async function loadAuthData() {
  if (!AsyncStorage) return { token: null, name: null, email: null };
  try {
    const token = await AsyncStorage.getItem('google_stress_token');
    const name = await AsyncStorage.getItem('google_stress_name');
    const email = await AsyncStorage.getItem('google_stress_email');
    return { token, name, email };
  } catch { return { token: null, name: null, email: null }; }
}
async function clearAuthData() {
  if (AsyncStorage) {
    await AsyncStorage.removeItem('google_stress_token').catch(() => {});
    await AsyncStorage.removeItem('google_stress_name').catch(() => {});
    await AsyncStorage.removeItem('google_stress_email').catch(() => {});
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function StressProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [heatmap, setHeatmap] = useState<DayStress[]>([]);
  const [insights, setInsights] = useState<StressInsight[]>([]);
  const [gmailSignals, setGmailSignals] = useState<GmailSignal[]>([]);
  const cacheRef = useRef<{ expires: number } | null>(null);

  // Load persisted auth data on mount
  useEffect(() => {
    loadAuthData().then(data => {
      if (data.token) setAccessToken(data.token);
      if (data.name) setProfileName(data.name);
      if (data.email) setProfileEmail(data.email);
    });
  }, []);

  // Fetch data whenever token changes or on initial mount
  useEffect(() => {
    refreshData();
  }, [accessToken]);

  const connectGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      // 1. Get the OAuth URL + sessionKey from server
      const res = await fetch(`${API}/auth-url`);
      const { url, sessionKey } = await res.json();

      // 2. Copy to clipboard and instruct user
      await Clipboard.setStringAsync(url);
      
      Alert.alert(
        'Link Copied!',
        'Because Google blocks mobile IP redirect testing, you MUST open this link in your computer browser.\n\nPlease paste this copied link on your laptop/PC browser to sign in.',
        [{ text: 'OK' }]
      );

      // 3. Poll server until user finishes OR timeout (5 mins)
      const maxAttempts = 150; // 150 * 2s = 5 mins
      let attempts = 0;
      
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > maxAttempts) {
          clearInterval(poll);
          setIsLoading(false);
          Alert.alert('Timeout', 'Google sign-in took too long. Please try again.');
          return;
        }

        try {
          const pollRes = await fetch(`${API}/check-auth?session=${sessionKey}`);
          const pollData = await pollRes.json();
          
          if (pollData.status === 'done') {
            clearInterval(poll);
            setAccessToken(pollData.token);
            if (pollData.name) setProfileName(pollData.name);
            if (pollData.email) setProfileEmail(pollData.email);
            saveAuthData(pollData.token, pollData.name, pollData.email);
            // Invalidate cache immediately so useEffect fetches REAL data
            cacheRef.current = null; 
            setIsLoading(false);
          } else if (pollData.status === 'expired' || pollData.status === 'not_found') {
            clearInterval(poll);
            setIsLoading(false);
            Alert.alert('Error', 'Authentication session expired or failed.');
          }
        } catch (e) {
          // keep polling, might be transient network issue
        }
      }, 2000); // Poll every 2 seconds

    } catch (e: any) {
      setIsLoading(false);
      Alert.alert('Error connecting', e.message);
    }
  }, []);

  const disconnectGoogle = useCallback(() => {
    setAccessToken(null);
    setProfileName(null);
    setProfileEmail(null);
    clearAuthData();
    cacheRef.current = null;
    refreshData();
  }, [refreshData]);

  const refreshData = useCallback(async () => {
    // Check cache

    if (cacheRef.current && Date.now() < cacheRef.current.expires) return;

    setIsLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const [hmRes, inRes, gmRes] = await Promise.all([
        fetch(`${API}/heatmap`, { headers }),
        fetch(`${API}/insights`, { headers }),
        fetch(`${API}/gmail-signals`, { headers }),
      ]);

      if (hmRes.ok) setHeatmap(await hmRes.json());
      if (inRes.ok) setInsights(await inRes.json());
      if (gmRes.ok) setGmailSignals(await gmRes.json());

      cacheRef.current = { expires: Date.now() + CACHE_TTL_MS };
    } catch (e) {
      // Server unreachable — use embedded client-side mock
      console.warn('[StressContext] Server unreachable, using embedded mock data.');
      const { mockHeatmap, mockInsights, mockSignals } = generateMockData();
      setHeatmap(mockHeatmap);
      setInsights(mockInsights);
      setGmailSignals(mockSignals);
      cacheRef.current = { expires: Date.now() + CACHE_TTL_MS };
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  const today = new Date().toISOString().split('T')[0];
  const todayStress = heatmap.find(d => d.date === today) ?? null;

  return (
    <StressContext.Provider value={{
      isConnected: !!accessToken,
      isLoading,
      connectGoogle,
      disconnectGoogle,
      heatmap,
      insights,
      gmailSignals,
      todayStress,
      refreshData,
      profileName,
      profileEmail,
    }}>
      {children}
    </StressContext.Provider>
  );
}

export function useStress() {
  const ctx = useContext(StressContext);
  if (!ctx) throw new Error('useStress must be used within StressProvider');
  return ctx;
}

// ─── Embedded client-side mock data ──────────────────────────────────────────
function generateMockData() {
  const today = new Date();
  const mockHeatmap: DayStress[] = [];

  const eventPool = [
    { title: 'Data Structures Assignment Due', type: 'assignment' as const, weight: 3, source: 'gmail' as const },
    { title: 'OS Mid-term Exam', type: 'exam' as const, weight: 5, source: 'calendar' as const },
    { title: 'DBMS Lab Submission', type: 'assignment' as const, weight: 3, source: 'gmail' as const },
    { title: 'Python Quiz – Unit 3', type: 'exam' as const, weight: 5, source: 'gmail' as const },
    { title: 'Software Engg Project Demo', type: 'assignment' as const, weight: 3, source: 'calendar' as const },
    { title: 'Algorithms Viva', type: 'exam' as const, weight: 5, source: 'calendar' as const },
    { title: 'Math Lecture', type: 'class' as const, weight: 1, source: 'calendar' as const },
    { title: 'Networks Theory', type: 'class' as const, weight: 1, source: 'calendar' as const },
    { title: 'Compiler Design Submission', type: 'assignment' as const, weight: 3, source: 'gmail' as const },
    { title: 'End Semester Exam – Physics', type: 'exam' as const, weight: 5, source: 'calendar' as const },
  ];

  for (let i = -7; i <= 21; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay();

    // Weekends: no events
    if (dow === 0 || dow === 6) {
      mockHeatmap.push({ date: dateStr, score: 0, level: 'low', color: '#10B981', events: [] });
      continue;
    }

    const seed = (d.getDate() * 7 + d.getMonth() * 3) % 10;
    const n = seed < 3 ? 0 : seed < 5 ? 1 : seed < 7 ? 2 : 3;
    const events: StressEvent[] = Array.from({ length: n }, (_, j) => eventPool[(seed + j) % eventPool.length]);

    let score = events.reduce((s, e) => s + e.weight, 0);
    if (events.length >= 3) score += 2;
    score = Math.min(score, 10);

    let level: 'low' | 'medium' | 'high';
    let color: string;
    if (score <= 2) { level = 'low'; color = '#10B981'; }
    else if (score <= 5) { level = 'medium'; color = '#F59E0B'; }
    else { level = 'high'; color = '#EF4444'; }

    mockHeatmap.push({ date: dateStr, score, level, color, events });
  }

  const mockInsights: StressInsight[] = [
    { message: 'Deadlines are clustering mid-week. Plan your evenings carefully.', icon: '⚠️', level: 'warning' },
    { message: 'You have 2 exams and 1 submission in the next 5 days.', icon: '🔴', level: 'danger' },
    { message: 'Weekend is light — great time to get ahead on projects.', icon: '✅', level: 'good' },
    { message: 'Your academic load peaks on Thursday this week.', icon: '📈', level: 'info' },
    { message: 'Back-to-back submissions detected — redistribute your workload.', icon: '📌', level: 'warning' },
  ];

  const mockSignals: GmailSignal[] = [
    { subject: 'Assignment 3 – Data Structures Due Friday', from: 'prof.sharma@college.edu', date: 'Today', type: 'assignment', tag: 'Assignment Due Friday', tagColor: '#F59E0B' },
    { subject: 'Mid-term Timetable Released', from: 'exam.cell@college.edu', date: 'Yesterday', type: 'exam', tag: 'Exam Scheduled', tagColor: '#EF4444' },
    { subject: 'Project Submission Deadline Extended', from: 'se.faculty@college.edu', date: '2 days ago', type: 'assignment', tag: 'Deadline Approaching', tagColor: '#F59E0B' },
    { subject: 'Quiz 2 – Algorithms Next Week', from: 'dr.mehta@college.edu', date: '3 days ago', type: 'exam', tag: 'Quiz Upcoming', tagColor: '#8B5CF6' },
    { subject: 'DBMS Lab Report Submission', from: 'lab.coordinator@college.edu', date: '4 days ago', type: 'assignment', tag: 'Lab Due', tagColor: '#3B82F6' },
    { subject: 'End Semester Exam Schedule Posted', from: 'controller@college.edu', date: 'Last week', type: 'exam', tag: 'Exam Scheduled', tagColor: '#EF4444' },
  ];

  return { mockHeatmap, mockInsights, mockSignals };
}
