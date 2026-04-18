import React, { createContext, useContext, useState, ReactNode } from 'react';

// ── Dark palette (default) ──────────────────────────────────────────────────
export const DarkPalette = {
  backgroundGradient: ['#020409', '#0A1224'] as const,
  cardGradient: ['rgba(18,26,43,0.8)', 'rgba(15,23,42,0.9)'] as const,
  accent: '#3B82F6',
  accentMuted: '#1D4ED8',
  accentSecondary: '#22D3EE',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',
  success: '#10B981',
  warning: '#F5A623',
  danger: '#EF4444',
  border: 'rgba(59,130,246,0.15)',
  borderStrong: 'rgba(59,130,246,0.3)',
  cardSolid: '#121A2B',
  cardOverlay: 'rgba(18,26,43,0.85)',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.1)',
  tabBar: '#0B1220',
  statusBar: 'light' as const,
};

// ── Light palette ────────────────────────────────────────────────────────────
export const LightPalette = {
  backgroundGradient: ['#EFF6FF', '#DBEAFE'] as const,
  cardGradient: ['rgba(255,255,255,0.9)', 'rgba(239,246,255,0.95)'] as const,
  accent: '#2563EB',
  accentMuted: '#1D4ED8',
  accentSecondary: '#0EA5E9',
  text: '#0F172A',
  textMuted: '#475569',
  textSubtle: '#94A3B8',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',
  border: 'rgba(37,99,235,0.15)',
  borderStrong: 'rgba(37,99,235,0.3)',
  cardSolid: '#FFFFFF',
  cardOverlay: 'rgba(255,255,255,0.9)',
  inputBg: 'rgba(0,0,0,0.04)',
  inputBorder: 'rgba(0,0,0,0.1)',
  tabBar: '#FFFFFF',
  statusBar: 'dark' as const,
};

export type AppPalette = typeof DarkPalette;

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: AppPalette;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: DarkPalette,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);
  const colors = isDark ? DarkPalette : LightPalette;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Backwards-compat alias
export const LightColors = LightPalette;
