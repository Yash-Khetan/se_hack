import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage not found. Attendance data will not persist across restarts.');
}

export interface Subject {
  id: string;
  name: string;
  credits: number;
  lab: boolean;
  attended: number;
  total: number;
  schedule: { [key: string]: number }; // e.g. { Mon: 1, Wed: 1 }
}

interface AttendanceContextType {
  subjects: Subject[];
  loading: boolean;
  setSubjects: (subjects: Subject[]) => void;
  updateAttendance: (id: string, attended: number) => void;
  removeSubject: (id: string) => void;
  clearAttendance: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);
const STORAGE_KEY = 'miti_attendance_data';

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjectsState] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUser();

  const userId = profile?.email || 'user-miti-001';
  const SERVER_URL = 'http://10.10.72.244:3005';

  // Load from storage or server
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      const res = await fetch(`${SERVER_URL}/api/attendance/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.subjects && data.subjects.length > 0) {
          setSubjectsState(data.subjects);
          if (AsyncStorage) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.subjects));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Attendance backend fetch failed, falling back to local storage', e);
    }
    
    // Fallback local cache
    if (AsyncStorage) {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setSubjectsState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load attendance data', e);
      }
    }
    setLoading(false);
  };

  const saveSubjects = async (newSubjects: Subject[]) => {
    setSubjectsState(newSubjects);
    try {
      if (AsyncStorage) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSubjects));
      // Background sync to SQL
      await fetch(`${SERVER_URL}/api/attendance/${userId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: newSubjects }),
      });
    } catch (e) {
      console.warn('Failed to save Attendance to server', e);
    }
  };

  const setSubjects = (newSubjects: Subject[]) => {
    saveSubjects(newSubjects);
  };

  const updateAttendance = (id: string, attended: number) => {
    const up = subjects.map(s => s.id === id ? { ...s, attended } : s);
    saveSubjects(up);
  };

  const removeSubject = (id: string) => {
    const filtered = subjects.filter(s => s.id !== id);
    saveSubjects(filtered);
  };

  const clearAttendance = () => {
    saveSubjects([]);
  };

  return (
    <AttendanceContext.Provider value={{
      subjects,
      loading,
      setSubjects,
      updateAttendance,
      removeSubject,
      clearAttendance,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
