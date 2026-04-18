import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

import Constants from 'expo-constants';

const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? '10.0.2.2';
const API_URL = `http://${host}:3005/api/focus`;

// ─── Safe optional imports ───────────────────────────────────────────────────
let AsyncStorage: any;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch (_) {}

let Notifications: any;
try { Notifications = require('expo-notifications'); } catch (_) {}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ExitEvent {
  exitAt: number;        // unix ms
  returnAt: number | null;
  durationSeconds: number;
  label: string;         // e.g. "Left at 3:04 PM for 42s"
}

export interface FocusSessionData {
  id: string;
  target_duration: number;
  active_time: number;
  inactive_time: number;
  context_switch_count: number;
  score: number;
  insight: string;
  status: 'active' | 'completed';
  exit_events: ExitEvent[];
  completed_at?: number; // unix ms
}

interface FocusContextType {
  isActive: boolean;
  activeSession: FocusSessionData | null;
  startSession: (durationMinutes: number) => Promise<void>;
  endSession: () => Promise<FocusSessionData | null>;
  elapsedSeconds: number;
  timesDrifted: number;
  minutesAway: number;
  summarySessions: FocusSessionData[];
  clearSummary: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatExitLabel(exitMs: number, durationSec: number): string {
  const d = new Date(exitMs);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const timeStr = `${hour12}:${m} ${period}`;

  if (durationSec < 60) return `Left at ${timeStr} — ${durationSec}s away`;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  return secs > 0
    ? `Left at ${timeStr} — ${mins}m ${secs}s away`
    : `Left at ${timeStr} — ${mins}m away`;
}

async function setupNotifications() {
  if (!Notifications) return;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('focus_alerts', {
        name: 'Focus Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('Notification setup failed:', e);
    return false;
  }
}

async function sendExitNotification() {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧠 Focus Session Active',
        body: 'You left during a focus session. Come back and stay locked in!',
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch (e) {}
}

async function cancelAllNotifications() {
  if (!Notifications) return;
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch (e) {}
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [activeSession, setActiveSession] = useState<FocusSessionData | null>(null);
  const [summarySessions, setSummarySessions] = useState<FocusSessionData[]>([]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timesDrifted, setTimesDrifted] = useState(0);
  const [secondsAway, setSecondsAway] = useState(0);

  const appState = useRef(AppState.currentState);
  const lastBackgroundTime = useRef<number | null>(null);
  const exitEventsRef = useRef<ExitEvent[]>([]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setupNotifications();
    loadSessions();
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  // ── AppState — exit/return tracking + notifications ───────────────────────
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (!isActive) return;

      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        // App went background
        lastBackgroundTime.current = Date.now();
        setTimesDrifted(prev => prev + 1);
        sendExitNotification();
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App returned
        cancelAllNotifications();
        if (lastBackgroundTime.current) {
          const exitMs = lastBackgroundTime.current;
          const durationSec = Math.floor((Date.now() - exitMs) / 1000);
          setSecondsAway(prev => prev + durationSec);

          const event: ExitEvent = {
            exitAt: exitMs,
            returnAt: Date.now(),
            durationSeconds: durationSec,
            label: formatExitLabel(exitMs, durationSec),
          };
          exitEventsRef.current = [...exitEventsRef.current, event];
          lastBackgroundTime.current = null;
        }
      }
      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [isActive]);

  // ── Storage ───────────────────────────────────────────────────────────────
  const loadSessions = async () => {
    if (!AsyncStorage) return;
    try {
      const stored = await AsyncStorage.getItem('miti_focus_sessions_v3');
      if (stored) {
        const { sessions, expiry } = JSON.parse(stored);
        if (Date.now() < expiry) {
          setSummarySessions(sessions || []);
        } else {
          await AsyncStorage.removeItem('miti_focus_sessions_v3');
        }
      }
    } catch (e) { console.warn('Load sessions failed:', e); }
  };

  const persistSessions = (sessions: FocusSessionData[]) => {
    if (!AsyncStorage) return;
    AsyncStorage.setItem('miti_focus_sessions_v3', JSON.stringify({
      sessions,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    })).catch(() => {});
  };

  const addSession = (newSession: FocusSessionData) => {
    setSummarySessions(prev => {
      const updated = [newSession, ...prev];
      persistSessions(updated);
      return updated;
    });
  };

  // ── Score calculation ─────────────────────────────────────────────────────
  function computeScore(activeSeconds: number, totalSeconds: number, switches: number): number {
    if (totalSeconds === 0) return 100;
    const activeRatio = activeSeconds / totalSeconds;
    const k = 0.15;
    return Math.max(0, Math.round(100 * activeRatio * Math.exp(-k * switches)));
  }

  function computeInsight(score: number, switches: number): string {
    if (score >= 85) {
      return switches === 0
        ? 'Clinical Insight: Absolute deep focus. Zero fragmentation detected.'
        : `Clinical Insight: Highly sustained attention. Minimal context drift. (Score: ${score})`;
    } else if (score >= 60) {
      return `Clinical Insight: Moderate contextual drift. Attention fragmented ${switches} time(s), but recovered. (Score: ${score})`;
    } else if (score >= 35) {
      return `Clinical Insight: High cognitive load penalty. Task switching caused significant focus decay. (Score: ${score})`;
    }
    return `Clinical Insight: Severe cognitive switching pattern. Sustained attention compromised. Try shorter sessions. (Score: ${score})`;
  }

  // ── startSession ──────────────────────────────────────────────────────────
  const startSession = async (durationMinutes: number) => {
    setElapsedSeconds(0);
    setTimesDrifted(0);
    setSecondsAway(0);
    exitEventsRef.current = [];
    lastBackgroundTime.current = null;
    appState.current = AppState.currentState;

    try {
      const targetDuration = durationMinutes * 60;
      const res = await fetch(`${API_URL}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'miti_user', duration: targetDuration }),
      });
      const data = await res.json();
      if (data.session) {
        setActiveSession({ ...data.session, exit_events: [] });
        setIsActive(true);
        return;
      }
    } catch (e) {
      console.warn('Focus Start (Fallback):', e);
    }

    // Fallback local
    setActiveSession({
      id: `local_${Date.now()}`,
      target_duration: durationMinutes * 60,
      active_time: 0, inactive_time: 0, context_switch_count: 0,
      score: 100, insight: '', status: 'active', exit_events: [],
    });
    setIsActive(true);
  };

  // ── endSession ────────────────────────────────────────────────────────────
  const endSession = async (): Promise<FocusSessionData | null> => {
    if (!activeSession || !isActive) return null;
    cancelAllNotifications();

    // Flush any live background time
    let finalSecondsAway = secondsAway;
    if (lastBackgroundTime.current) {
      const extra = Math.floor((Date.now() - lastBackgroundTime.current) / 1000);
      finalSecondsAway += extra;
      const exitMs = lastBackgroundTime.current;
      const event: ExitEvent = {
        exitAt: exitMs,
        returnAt: Date.now(),
        durationSeconds: extra,
        label: formatExitLabel(exitMs, extra),
      };
      exitEventsRef.current = [...exitEventsRef.current, event];
      lastBackgroundTime.current = null;
    }

    const totalElapsed = elapsedSeconds;
    const activeSeconds = Math.max(0, totalElapsed - finalSecondsAway);
    const exitEvents = exitEventsRef.current;

    try {
      const res = await fetch(`${API_URL}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.id,
          active_time: activeSeconds,
          inactive_time: finalSecondsAway,
          context_switch_count: timesDrifted,
          exit_events: exitEvents,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.session) throw new Error('bad response');

      const completed: FocusSessionData = {
        ...data.session,
        exit_events: exitEvents,
        completed_at: Date.now(),
      };
      addSession(completed);
      setIsActive(false);
      return completed;
    } catch (e) {
      console.warn('Focus End (Fallback):', e);
      const score = computeScore(activeSeconds, totalElapsed, timesDrifted);
      const fallback: FocusSessionData = {
        ...activeSession,
        active_time: activeSeconds,
        inactive_time: finalSecondsAway,
        context_switch_count: timesDrifted,
        score,
        insight: computeInsight(score, timesDrifted),
        status: 'completed',
        exit_events: exitEvents,
        completed_at: Date.now(),
      };
      addSession(fallback);
      setIsActive(false);
      return fallback;
    }
  };

  // ── clearSummary ──────────────────────────────────────────────────────────
  const clearSummary = () => {
    setSummarySessions([]);
    if (AsyncStorage) AsyncStorage.removeItem('miti_focus_sessions_v3').catch(() => {});
  };

  return (
    <FocusContext.Provider value={{
      isActive, activeSession, startSession, endSession,
      elapsedSeconds, timesDrifted,
      minutesAway: Math.floor(secondsAway / 60),
      summarySessions, clearSummary,
    }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const ctx = useContext(FocusContext);
  if (!ctx) throw new Error('useFocus must be used within FocusProvider');
  return ctx;
}
