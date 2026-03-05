/**
 * 22Club Design Tokens - Unified System
 * Re-exports from lib/design-tokens; tokenToCSS for programmatic use.
 */

import { tokens } from '@/lib/design-tokens'

export { tokens }

/**
 * Utility per convertire token in CSS variables
 */
export const tokenToCSS = {
  color: (token: string): string => {
    if (token.startsWith('#')) return token
    const colorMap: Record<string, string> = {
      'background.DEFAULT': tokens.colors.background.DEFAULT,
      'background.elevated': tokens.colors.background.elevated,
      'primary.DEFAULT': tokens.colors.primary.DEFAULT,
      'text.primary': tokens.colors.text.primary,
    }
    return colorMap[token] ?? token
  },
  spacing: (token: keyof typeof tokens.spacing): string => {
    const v = tokens.spacing[token as keyof typeof tokens.spacing]
    return typeof v === 'string' ? v : String(v)
  },
  radius: (token: keyof typeof tokens.radius): string => {
    return tokens.radius[token]
  },
}

export type ColorToken = keyof typeof tokens.colors
export type SpacingToken = keyof typeof tokens.spacing
export type RadiusToken = keyof typeof tokens.radius

export default tokens
