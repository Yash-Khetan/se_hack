// ═══════════════════════════════════════════════
//  SYNCSPACE — Premium Color Theme
//  Soft gradients, glassmorphism, futuristic palette
// ═══════════════════════════════════════════════

export const Colors = {
  // Core backgrounds
  bg: '#0B0D1B',
  bgSecondary: '#111328',
  bgTertiary: '#181A30',
  surface: '#1E2040',
  surfaceLight: '#252848',

  // Gradient pairs
  gradientPrimary: ['#6C5CE7', '#A855F7'],
  gradientSecondary: ['#3B82F6', '#6C5CE7'],
  gradientAccent: ['#EC4899', '#A855F7'],
  gradientSuccess: ['#10B981', '#34D399'],
  gradientDanger: ['#EF4444', '#F97316'],
  gradientDark: ['#1E2040', '#111328'],
  gradientGlass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  gradientLanding: ['#080A18', '#0F1129', '#1A1040'],

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textAccent: '#A78BFA',

  // Accents
  primary: '#6C5CE7',
  primaryLight: '#A78BFA',
  secondary: '#3B82F6',
  accent: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',

  // Glass
  glass: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassLight: 'rgba(255, 255, 255, 0.10)',
  glassMedium: 'rgba(255, 255, 255, 0.15)',

  // Status
  online: '#10B981',
  away: '#F59E0B',
  offline: '#64748B',

  // Video
  videoCardBg: 'rgba(15, 17, 41, 0.85)',
  videoOverlay: 'rgba(0, 0, 0, 0.4)',
};

export const Shadows = {
  small: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
};

export const Typography = {
  hero: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  bodySm: { fontSize: 13, fontWeight: '400' },
  caption: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
  button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  code: { fontSize: 13, fontFamily: 'monospace' },
};
