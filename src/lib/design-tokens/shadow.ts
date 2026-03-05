/**
 * 22Club Design Tokens — Shadows & Elevation
 */

import { colors } from './colors'

export const shadow = {
  soft: '0 2px 12px rgba(0, 0, 0, 0.25)',
  glow: `0 0 12px rgba(2, 179, 191, 0.5)`,
  'glow-lg': `0 0 40px rgba(2, 179, 191, 0.4)`,
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
} as const

// For use in JS (e.g. boxShadow style) with primary teal
export function glowShadow(hex: string = colors.primary.DEFAULT, opacity = 0.4): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `0 0 40px rgba(${r},${g},${b},${opacity})`
}
