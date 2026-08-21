/**
 * AgriConnect Mobile design system.
 * Matches the web brand palette (emerald + gold on cream) but sized for touch.
 */
export const colors = {
  emeraldDark: '#0f3b21',
  emerald: '#1b4a2e',
  emeraldLight: '#2c6e45',
  gold: '#b38234',
  goldGlow: '#cfa153',
  cream: '#fdfbf7',
  linen: '#f5f2ea',
  stone: '#e8e4d9',
  ink: '#1a1f1b',
  inkMid: '#38423a',
  inkSoft: '#636b65',
  white: '#ffffff',
  danger: '#c0392b',
  dangerBg: '#fdecea',
  success: '#2e7d32',
  successBg: '#e8f5e9',
  warning: '#b38234',
  warningBg: '#fdf3e3',
  infoBg: '#e8f0fe',
  overlay: 'rgba(15, 59, 33, 0.45)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, color: colors.emeraldDark },
  h1: { fontSize: 22, fontWeight: '700' as const, color: colors.ink },
  h2: { fontSize: 18, fontWeight: '600' as const, color: colors.ink },
  body: { fontSize: 15, color: colors.inkMid },
  small: { fontSize: 13, color: colors.inkSoft },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.inkMid },
  button: { fontSize: 16, fontWeight: '600' as const, color: colors.white },
};

export const shadows = {
  card: {
    shadowColor: '#0f3b21',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const theme = { colors, spacing, radius, typography, shadows };
export default theme;
