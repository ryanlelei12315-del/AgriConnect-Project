/**
 * AgriConnect Mobile design system.
 * Matches the web brand palette (rich forest green on calming sage) sized for touch.
 */
export const colors = {
  emeraldDark: '#164226',
  emerald: '#1e5631',
  emeraldLight: '#2d7a46',
  gold: '#2e7d47',
  goldGlow: '#529d68',
  cream: '#edf2eb',
  linen: '#e4ebe3',
  stone: '#dce5dd',
  ink: '#19241b',
  inkMid: '#38473b',
  inkSoft: '#66786c',
  white: '#ffffff',
  danger: '#c0392b',
  dangerBg: '#fdecea',
  success: '#1e5631',
  successBg: '#e8f5e9',
  warning: '#8a5b13',
  warningBg: '#fdf3e3',
  infoBg: '#e8f0fe',
  overlay: 'rgba(18, 38, 25, 0.45)',
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
  xl: 24,
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
    shadowColor: '#102e1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};
