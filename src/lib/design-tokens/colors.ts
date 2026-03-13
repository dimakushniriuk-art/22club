/**
 * 22Club Design Tokens — Colors
 * Single source of truth for color values (hex).
 */

export const colors = {
  // Neutral / Background
  background: {
    DEFAULT: '#0d0d0d',
    elevated: '#16161A',
    subtle: '#1C1C20',
    secondary: '#1A1A1E',
    tertiary: '#222228',
  },
  surface: {
    100: '#141418',
    200: '#1A1A1E',
    300: '#222228',
  },
  text: {
    primary: '#EAF0F2',
    secondary: '#A5AFB4',
    muted: '#6C757D',
    disabled: '#4B5563',
  },
  // Primary (brand)
  primary: {
    DEFAULT: '#02B3BF',
    hover: '#03C9D5',
    active: '#019AA6',
  },
  accent: {
    gold: '#C9A227',
    glow: '#E0B23E',
  },
  // Semantic / State
  success: '#00C781',
  warning: '#FFC107',
  error: '#FF3B30',
  info: '#3498DB',
  // Border & Input
  border: {
    DEFAULT: '#222228',
    light: '#16161A',
    strong: '#4A4F54',
  },
  input: {
    DEFAULT: '#1A1A1E',
    focus: '#222228',
    error: '#FF3B30',
  },
  // Athlete role accents (for home blocks, card bar) — unica fonte per design system e app
  // iconBg unificato su primary #02b3bf (stesso colore della sezione Colori)
  athleteAccents: {
    teal: {
      DEFAULT: '#02A1AC',
      border: 'rgba(2,161,172,0.45)',
      bar: '#02A1AC',
      bg: 'rgba(2,161,172,0.1)',
      iconBg: 'rgba(2,179,191,0.25)',
      glow: 'rgba(2,161,172,0.15)',
      gradientStart: 'rgba(2,161,172,0.14)',
    },
    cyan: {
      DEFAULT: '#02919B',
      border: 'rgba(2,145,155,0.4)',
      bar: '#02919B',
      bg: 'rgba(2,145,155,0.1)',
      iconBg: 'rgba(2,179,191,0.25)',
      glow: 'rgba(2,145,155,0.12)',
      gradientStart: 'rgba(2,145,155,0.14)',
    },
    green: {
      DEFAULT: '#01828B',
      border: 'rgba(1,130,139,0.4)',
      bar: '#01828B',
      bg: 'rgba(1,130,139,0.1)',
      iconBg: 'rgba(2,179,191,0.25)',
      glow: 'rgba(1,130,139,0.12)',
      gradientStart: 'rgba(1,130,139,0.14)',
    },
    emerald: {
      DEFAULT: '#01757D',
      border: 'rgba(1,117,125,0.4)',
      bar: '#01757D',
      bg: 'rgba(1,117,125,0.1)',
      iconBg: 'rgba(2,179,191,0.25)',
      glow: 'rgba(1,117,125,0.12)',
      gradientStart: 'rgba(1,117,125,0.14)',
    },
    amber: {
      DEFAULT: '#016A71',
      border: 'rgba(1,106,113,0.4)',
      bar: '#016A71',
      bg: 'rgba(1,106,113,0.1)',
      iconBg: 'rgba(2,179,191,0.25)',
      glow: 'rgba(1,106,113,0.12)',
      gradientStart: 'rgba(1,106,113,0.14)',
    },
  },
  // Brand scale (for Tailwind extend)
  brand: {
    50: '#E6F9FA',
    100: '#CCF3F5',
    200: '#99E7EB',
    300: '#66DBE1',
    400: '#33CFD7',
    500: '#02B3BF',
    600: '#019AA6',
    700: '#016B73',
    800: '#01474D',
    900: '#002326',
  },
  destructive: {
    hover: '#E74C3C',
  },
  successHover: '#229954',
  warningHover: '#F1C40F',
} as const

export type AthleteAccentKey = keyof typeof colors.athleteAccents
