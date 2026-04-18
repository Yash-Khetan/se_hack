import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const addExpense = (newExpense: Expense) => {
    setExpensesState(prev => [newExpense, ...prev]);
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
