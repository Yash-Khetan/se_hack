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
  // Blue & Light Blue Theme
  theme: {
    backgroundGradient: ['#040B16', '#020617'] as const, // Deep midnight blue
    cardGradient: ['rgba(14, 30, 50, 0.6)', 'rgba(8, 20, 35, 0.8)'] as const, // Glassy blue tint
    accent: '#38BDF8', // Light sky blue / Cyan
    accentMuted: '#0284C7', // Darker blue
    accentSecondary: '#3B82F6', // Royal/Vibrant blue
    text: '#FFFFFF',
    textMuted: '#94A3B8', // Slate gray-blue
    success: '#10B981', // Crisp green
    warning: '#F5A623', // Bright yellow-amber
    danger: '#EF4444', // Bright red
    border: 'rgba(56, 189, 248, 0.15)', // Light blue border tint
    cardSolid: '#0F172A', // Slate 800/900 for solid cards
  }
};
