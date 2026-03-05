// Utility hooks per utilizzare i design tokens in modo type-safe

export const useSpacing = () => ({
  xs: 'var(--spacing-1)',
  sm: 'var(--spacing-2)',
  md: 'var(--spacing-4)',
  lg: 'var(--spacing-6)',
  xl: 'var(--spacing-8)',
  '2xl': 'var(--spacing-12)',
})

export const useRadius = () => ({
  none: 'var(--radius-none)',
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  full: 'var(--radius-full)',
})

export const useShadow = () => ({
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
  xl: 'var(--shadow-xl)',
  glow: 'var(--shadow-glow)',
})

// Utility classes CSS-in-JS per design tokens
export const designTokens = {
  spacing: {
    xs: 'var(--spacing-1)',
    sm: 'var(--spacing-2)',
    md: 'var(--spacing-4)',
    lg: 'var(--spacing-6)',
    xl: 'var(--spacing-8)',
    '2xl': 'var(--spacing-12)',
  },
  radius: {
    none: 'var(--radius-none)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)',
  },
  shadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
    glow: 'var(--shadow-glow)',
  },
  transition: {
    fast: 'var(--transition-fast)',
    normal: 'var(--transition-normal)',
    slow: 'var(--transition-slow)',
  },
  zIndex: {
    base: 'var(--z-base)',
    dropdown: 'var(--z-dropdown)',
    sticky: 'var(--z-sticky)',
    fixed: 'var(--z-fixed)',
    modal: 'var(--z-modal)',
    popover: 'var(--z-popover)',
    tooltip: 'var(--z-tooltip)',
    toast: 'var(--z-toast)',
  },
} as const
