const tintColorLight = '#2f95dc';
const tintColorDark = '#F59E0B'; // Amber/Muted Orange

export default {
  light: {
    text: '#1F2937',
    background: '#F3F4F6',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F3F4F6',
    background: '#0F0A00', // Deep brown/black
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    cardBackground: 'rgba(30, 20, 10, 0.7)',
    cardBorder: 'rgba(245, 158, 11, 0.2)',
    success: '#10B981', // Soft green
    warning: '#F59E0B', // Amber
    danger: '#EF4444', // Red
  },
  // Premium Blue & Cyan Theme
  theme: {
    backgroundGradient: ['#020409', '#0A1224'] as const,
    cardGradient: ['rgba(18, 26, 43, 0.8)', 'rgba(15, 23, 42, 0.9)'] as const,
    accent: '#3B82F6',
    accentMuted: '#1D4ED8',
    accentSecondary: '#22D3EE',
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    success: '#10B981',
    warning: '#F5A623',
    danger: '#EF4444',
    border: 'rgba(59, 130, 246, 0.15)',
    cardSolid: '#121A2B',
  }
};
