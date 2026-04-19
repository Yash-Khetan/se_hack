import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStress } from './StressContext';

export interface Profile {
  name: string;
  email: string;
  dateOfBirth: string;
  course: string;
  college: string;
  year: string;
}

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  icon: any;
  color: string;
}

const DEFAULT_PROFILE: Profile = {
  name: 'Miti',
  email: 'miti@student.edu',
  dateOfBirth: '2004-01-15',
  course: 'B.Tech CSE',
  college: 'MIT',
  year: '3rd Year',
};

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  notifications: true,
};

// We will store string names for icons to avoid serializing react components,
// but for now passing the direct reference will work for run-time context.
const INITIAL_EXPENSES: Expense[] = [
  { id: '1', amount: 150, category: 'food', note: 'Late night cravings', date: 'Today, 2:30 AM', icon: null, color: '#10B981' },
];

interface UserContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  totalSpend: number;
  budget: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [expenses, setExpensesState] = useState<Expense[]>(INITIAL_EXPENSES);
  const { profileName, profileEmail } = useStress();

  useEffect(() => {
    if (profileName || profileEmail) {
      setProfile(prev => ({
        ...prev,
        name: profileName || prev.name,
        email: profileEmail || prev.email,
      }));
    }
  }, [profileName, profileEmail]);

  // Hackathon shortcut: using email as unique ID
  const userId = profile?.email || 'user-miti-001';
  const SERVER_URL = 'http://10.10.72.244:3005';
  const STORAGE_KEY = '@lumina_expenses';

  useEffect(() => {
    loadExpenses();
  }, [userId]);

  const loadExpenses = async () => {
    try {
      // Opt 1: Load from server
      const res = await fetch(`${SERVER_URL}/api/expenses/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.expenses && data.expenses.length > 0) {
          setExpensesState(data.expenses);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.expenses));
          return;
        }
      }
    } catch (e) {
      console.warn('Expenses backend fetch failed, falling back to local storage', e);
    }
    
    // Opt 2: Fallback local cache
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setExpensesState(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to load Expenses', e);
    }
  };

  const saveExpenses = async (newExpenses: Expense[]) => {
    setExpensesState(newExpenses);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newExpenses));
      // Background sync to SQL
      await fetch(`${SERVER_URL}/api/expenses/${userId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: newExpenses }),
      });
    } catch (e) {
      console.warn('Failed to save Expenses to server', e);
    }
  };

  const addExpense = (newExpense: Expense) => {
    saveExpenses([newExpense, ...expenses]);
  };

  const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budget = 2500;

  return (
    <UserContext.Provider value={{
      profile, setProfile,
      settings, setSettings,
      expenses, addExpense,
      totalSpend, budget,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
