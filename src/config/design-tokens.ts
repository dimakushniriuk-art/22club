/**
 * 🎨 22Club Design Tokens - Unified System
 * =========================================
 *
 * Sistema unificato di design tokens per 22Club.
 * Questo file centralizza tutti i token di design per garantire coerenza.
 *
 * @example
 * import { tokens } from '@/config/design-tokens'
 *
 * <div style={{ backgroundColor: tokens.colors.background.DEFAULT }}>
 *   <button style={{ color: tokens.colors.primary.DEFAULT }}>
 *     Clicca
 *   </button>
 * </div>
 */

import { designSystem } from './design-system'

/**
 * Design Tokens - Valori raw per uso programmatico
 */
export const tokens = {
  colors: {
    background: {
      DEFAULT: designSystem.colors.background.DEFAULT,
      elevated: designSystem.colors.background.elevated,
      subtle: designSystem.colors.background.subtle,
      secondary: designSystem.colors.surface[200],
      tertiary: designSystem.colors.surface[300],
    },
    text: {
      primary: designSystem.colors.text.primary,
      secondary: designSystem.colors.text.secondary,
      muted: designSystem.colors.text.muted,
    },
    primary: {
      DEFAULT: designSystem.colors.primary.DEFAULT,
      hover: designSystem.colors.primary.hover,
      active: designSystem.colors.primary.active,
    },
    accent: {
      gold: designSystem.colors.accent.gold,
      glow: designSystem.colors.accent.glow,
    },
    state: {
      success: designSystem.colors.success,
      warning: designSystem.colors.warning,
      error: designSystem.colors.error,
    },
    surface: {
      100: designSystem.colors.surface[100],
      200: designSystem.colors.surface[200],
      300: designSystem.colors.surface[300],
    },
  },
  spacing: {
    xs: designSystem.spacing.xs,
    sm: designSystem.spacing.sm,
    md: designSystem.spacing.md,
    lg: designSystem.spacing.lg,
    xl: designSystem.spacing.xl,
    '2xl': designSystem.spacing['2xl'],
  },
  radius: {
    none: designSystem.radius.none,
    sm: designSystem.radius.sm,
    md: designSystem.radius.md,
    lg: designSystem.radius.lg,
    xl: designSystem.radius.xl,
    '2xl': designSystem.radius['2xl'],
    full: '9999px',
  },
  shadows: {
    soft: designSystem.shadows.soft,
    glow: designSystem.shadows.glow,
  },
  gradients: {
    'brand-teal-gold': designSystem.gradients['brand-teal-gold'],
  },
  fontFamily: {
    sans: designSystem.fontFamily.sans,
  },
} as const

/**
 * Utility per convertire token in CSS variables
 */
export const tokenToCSS = {
  /**
   * Converte un colore token in CSS variable
   */
  color: (token: string): string => {
    // Se è già un valore hex, ritorna direttamente
    if (token.startsWith('#')) return token

    // Altrimenti cerca nel mapping
    const colorMap: Record<string, string> = {
      'background.DEFAULT': tokens.colors.background.DEFAULT,
      'background.elevated': tokens.colors.background.elevated,
      'primary.DEFAULT': tokens.colors.primary.DEFAULT,
      'text.primary': tokens.colors.text.primary,
      // Aggiungi altri mapping se necessario
    }

    return colorMap[token] || token
  },

  /**
   * Converte uno spacing token in valore CSS
   */
  spacing: (token: keyof typeof tokens.spacing): string => {
    return tokens.spacing[token]
  },

  /**
   * Converte un radius token in valore CSS
   */
  radius: (token: keyof typeof tokens.radius): string => {
    return tokens.radius[token]
  },
}

/**
 * Type exports
 */
export type ColorToken = keyof typeof tokens.colors
export type SpacingToken = keyof typeof tokens.spacing
export type RadiusToken = keyof typeof tokens.radius

export default tokens
