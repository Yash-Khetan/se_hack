import React, { createContext, useContext, useState, useEffect } from 'react';

// For persistence, we'd normally use AsyncStorage. 
// If it's not installed, we'll use memory with a warning.
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

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjectsState] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from storage
  useEffect(() => {
    const loadData = async () => {
      if (AsyncStorage) {
        try {
          const saved = await AsyncStorage.getItem('miti_attendance_data');
          if (saved) setSubjectsState(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load attendance data', e);
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const setSubjects = async (newSubjects: Subject[]) => {
    setSubjectsState(newSubjects);
    if (AsyncStorage) {
      await AsyncStorage.setItem('miti_attendance_data', JSON.stringify(newSubjects));
    }
  };

  const updateAttendance = async (id: string, attended: number) => {
    const up = subjects.map(s => s.id === id ? { ...s, attended } : s);
    setSubjectsState(up);
    if (AsyncStorage) {
      await AsyncStorage.setItem('miti_attendance_data', JSON.stringify(up));
    }
  };

  const removeSubject = async (id: string) => {
    const filtered = subjects.filter(s => s.id !== id);
    setSubjectsState(filtered);
    if (AsyncStorage) {
      await AsyncStorage.setItem('miti_attendance_data', JSON.stringify(filtered));
    }
  };

  const clearAttendance = async () => {
    setSubjectsState([]);
    if (AsyncStorage) {
      await AsyncStorage.removeItem('miti_attendance_data');
    }
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
