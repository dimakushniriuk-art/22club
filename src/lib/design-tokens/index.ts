/**
 * 22Club Design Tokens — Single source of truth
 * Re-export all token modules for use in Tailwind theme and app.
 */

export { colors } from './colors'
export type { AthleteAccentKey } from './colors'
export { typography } from './typography'
export { spacing, touchTarget, spacingPx } from './spacing'
export { radius, radiusPartial, radiusPx } from './radius'
export { shadow, glowShadow } from './shadow'
export { motion } from './motion'
export { focus } from './focus'
export { gradients } from './gradients'
export { roleThemes } from './themes'
export type { RoleTheme, RoleKey } from './themes'
export { designColorato } from './design-colorato'
export type { DesignColoratoPaletteKey } from './design-colorato'

import { colors } from './colors'
import { typography } from './typography'
import { spacing, touchTarget } from './spacing'
import { radius } from './radius'
import { shadow } from './shadow'
import { motion } from './motion'
import { focus } from './focus'
import { gradients } from './gradients'
import { roleThemes } from './themes'
import { designColorato } from './design-colorato'

export const tokens = {
  colors,
  typography,
  spacing: { ...spacing, touchTarget },
  radius,
  shadow,
  motion,
  focus,
  gradients,
  roleThemes,
  designColorato,
} as const

export type Tokens = typeof tokens
