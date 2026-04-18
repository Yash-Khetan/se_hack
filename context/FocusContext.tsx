import React, { createContext, useContext, useState, useEffect } from 'react';

// For persistence
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // AsyncStorage might not be available
}

export interface FocusEvent {
  id: string;
  type: 'focus' | 'distraction';
  app: string;
  description: string;
  timeLabel: string;
  timestamp: number;
}

interface FocusContextType {
  cognitiveDebt: number; // 0-100
  focusEvents: FocusEvent[];
  isMonitoring: boolean;
  toggleMonitoring: () => void;
  resetFocus: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const [cognitiveDebt, setCognitiveDebt] = useState(42); // Start with some debt
  const [focusEvents, setFocusEvents] = useState<FocusEvent[]>([
    {
      id: '1',
      type: 'distraction',
      app: 'Instagram',
      description: 'Quick check turned into a 15m scroll.',
      timeLabel: '2:15 PM',
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      type: 'focus',
      app: 'Visual Studio Code',
      description: 'Solid progress on the attendance module.',
      timeLabel: '1:30 PM',
      timestamp: Date.now() - 7200000,
    },
    {
      id: '3',
      type: 'distraction',
      app: 'TikTok',
      description: 'Rapid context switch detected.',
      timeLabel: '1:10 PM',
      timestamp: Date.now() - 8400000,
    },
  ]);
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Persistence (Optional)
  useEffect(() => {
    const load = async () => {
      if (AsyncStorage) {
        const saved = await AsyncStorage.getItem('miti_focus_data');
        if (saved) {
          const { debt, events } = JSON.parse(saved);
          setCognitiveDebt(debt);
          setFocusEvents(events);
        }
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (AsyncStorage) {
      AsyncStorage.setItem('miti_focus_data', JSON.stringify({ debt: cognitiveDebt, events: focusEvents }));
    }
  }, [cognitiveDebt, focusEvents]);

  const toggleMonitoring = () => setIsMonitoring(!isMonitoring);

  const resetFocus = () => {
    setCognitiveDebt(0);
    setFocusEvents([]);
  };

  return (
    <FocusContext.Provider value={{
      cognitiveDebt,
      focusEvents,
      isMonitoring,
      toggleMonitoring,
      resetFocus,
    }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
