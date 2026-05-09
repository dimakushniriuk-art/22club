/**
 * 22Club Design Tokens — Typography
 * Scale, font families, weights; align with Tailwind fontSize/fontFamily.
 */

export const typography = {
  fontFamily: {
    sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    /** Fluid — richiede variabili in src/styles/design-tokens.css */
    'fluid-display': ['var(--text-fluid-display)', { lineHeight: '1.15' }],
    'fluid-shell-title': ['var(--text-fluid-shell-title)', { lineHeight: '1.2' }],
    'fluid-section': ['var(--text-fluid-section)', { lineHeight: '1.35' }],
    'fluid-card-title': ['var(--text-fluid-card-title)', { lineHeight: '1.35' }],
    'fluid-lead': ['var(--text-fluid-lead)', { lineHeight: '1.5' }],
    'fluid-page-header': ['var(--text-fluid-page-header)', { lineHeight: '1.3' }],
    'fluid-page-header-embed': ['var(--text-fluid-page-header-embed)', { lineHeight: '1.3' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Text colors (reference to colors.text)
  textColor: {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    muted: 'text-text-tertiary',
    disabled: 'text-text-disabled',
  },
} as const
