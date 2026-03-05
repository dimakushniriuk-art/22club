/**
 * 22Club Design System — Central Tokens (thin layer)
 * Re-exports from lib/design-tokens for backward compatibility.
 */

import { colors, radius, spacing, shadow, gradients, typography } from '@/lib/design-tokens'

export const designSystem = {
  colors: {
    background: {
      DEFAULT: colors.background.DEFAULT,
      elevated: colors.background.elevated,
      subtle: colors.background.subtle,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      muted: colors.text.muted,
    },
    primary: {
      DEFAULT: colors.primary.DEFAULT,
      hover: colors.primary.hover,
      active: colors.primary.active,
    },
    accent: {
      gold: colors.accent.gold,
      glow: colors.accent.glow,
    },
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    surface: {
      100: colors.surface[100],
      200: colors.surface[200],
      300: colors.surface[300],
    },
  },
  fontFamily: typography.fontFamily,
  radius: {
    none: radius.none,
    sm: radius.sm,
    md: radius.md,
    lg: radius.lg,
    xl: radius.xl,
    '2xl': radius['2xl'],
  },
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl'],
  },
  shadows: {
    soft: shadow.soft,
    glow: shadow.glow,
  },
  gradients: {
    'brand-teal-gold': gradients['brand-teal-gold'],
  },
}
